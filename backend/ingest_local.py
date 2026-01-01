"""
Merge and ingest ERA5 data from extracted ZIP files.
Standalone script that creates its own Flask app.
"""
import os
import sys
import numpy as np
from datetime import datetime

# Setup path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import xarray as xr
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

# Database path
db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'data', 'era5_timeseries.db'))
print(f"Using database: {db_path}")

# Create minimal Flask app
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


# Define models inline
class WeatherTimestamp(db.Model):
    __tablename__ = 'weather_timestamps'
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, nullable=False, unique=True, index=True)
    ingested_at = db.Column(db.DateTime, default=datetime.utcnow)
    source_file = db.Column(db.String(255))


class WeatherData(db.Model):
    __tablename__ = 'weather_data'
    id = db.Column(db.Integer, primary_key=True)
    timestamp_id = db.Column(db.Integer, db.ForeignKey('weather_timestamps.id'), nullable=False, index=True)
    latitude = db.Column(db.Float, nullable=False, index=True)
    longitude = db.Column(db.Float, nullable=False, index=True)
    temperature_k = db.Column(db.Float)
    precipitation_m = db.Column(db.Float)
    pressure_pa = db.Column(db.Float)
    wind_u = db.Column(db.Float)
    wind_v = db.Column(db.Float)


def merge_and_ingest(downsample: int = 8):
    """Merge ERA5 files and ingest into database."""
    data_dir = os.path.join(os.path.dirname(__file__), 'data')
    
    # Load instant data (temperature, pressure, wind)
    instant_file = os.path.join(data_dir, 'data_stream-oper_stepType-instant.nc')
    accum_file = os.path.join(data_dir, 'data_stream-oper_stepType-accum.nc')
    
    print(f"Loading instant data: {instant_file}")
    ds_instant = xr.open_dataset(instant_file)
    print(f"  Variables: {list(ds_instant.data_vars)}")
    print(f"  Coords: {list(ds_instant.coords)}")
    
    # Find time coordinate
    time_coord = 'valid_time' if 'valid_time' in ds_instant.coords else 'time'
    print(f"  Time coordinate: {time_coord}")
    
    times = ds_instant[time_coord].values
    print(f"  Time steps: {len(times)}")
    
    # Load precipitation if available
    ds_accum = None
    if os.path.exists(accum_file):
        print(f"\nLoading accumulated data: {accum_file}")
        ds_accum = xr.open_dataset(accum_file)
        print(f"  Variables: {list(ds_accum.data_vars)}")
    
    # Get coordinate arrays
    lats = ds_instant.latitude.values[::downsample]
    lons = ds_instant.longitude.values[::downsample]
    
    print(f"\nGrid: {len(lats)} x {len(lons)} = {len(lats) * len(lons)} points")
    print(f"Time range: {times[0]} to {times[-1]}")
    
    total_records = 0
    
    with app.app_context():
        db.create_all()
        
        for idx, time_val in enumerate(times):
            # Convert to datetime
            if isinstance(time_val, np.datetime64):
                # Convert to pandas Timestamp then to datetime
                import pandas as pd
                timestamp = pd.Timestamp(time_val).to_pydatetime()
            else:
                timestamp = datetime.fromisoformat(str(time_val))
            
            # Check if exists
            existing = WeatherTimestamp.query.filter_by(timestamp=timestamp).first()
            if existing:
                print(f"[{idx+1}/{len(times)}] {timestamp} - EXISTS, skipping")
                continue
            
            print(f"[{idx+1}/{len(times)}] {timestamp} - Processing...")
            
            # Create timestamp record
            ts_record = WeatherTimestamp(
                timestamp=timestamp,
                source_file='era5_20251221_20251227.nc'
            )
            db.session.add(ts_record)
            db.session.flush()
            
            # Get data for this time
            time_data = ds_instant.sel(**{time_coord: time_val})
            time_data = time_data.isel(
                latitude=slice(None, None, downsample),
                longitude=slice(None, None, downsample)
            )
            
            # Get precipitation if available
            tp_data = None
            if ds_accum is not None and 'tp' in ds_accum:
                try:
                    accum_time_coord = 'valid_time' if 'valid_time' in ds_accum.coords else 'time'
                    tp_time = ds_accum.sel(**{accum_time_coord: time_val}, method='nearest')
                    tp_time = tp_time.isel(
                        latitude=slice(None, None, downsample),
                        longitude=slice(None, None, downsample)
                    )
                    tp_data = tp_time['tp'].values
                except Exception as e:
                    print(f"    Warning: Could not get precipitation data: {e}")
            
            # Extract arrays
            t2m = time_data['t2m'].values if 't2m' in time_data else None
            sp = time_data['sp'].values if 'sp' in time_data else None
            u10 = time_data['u10'].values if 'u10' in time_data else None
            v10 = time_data['v10'].values if 'v10' in time_data else None
            
            # Create records
            records = []
            for i, lat in enumerate(lats):
                for j, lon in enumerate(lons):
                    record = WeatherData(
                        timestamp_id=ts_record.id,
                        latitude=float(lat),
                        longitude=float(lon),
                        temperature_k=float(t2m[i, j]) if t2m is not None and not np.isnan(t2m[i, j]) else None,
                        precipitation_m=float(tp_data[i, j]) if tp_data is not None and not np.isnan(tp_data[i, j]) else None,
                        pressure_pa=float(sp[i, j]) if sp is not None and not np.isnan(sp[i, j]) else None,
                        wind_u=float(u10[i, j]) if u10 is not None and not np.isnan(u10[i, j]) else None,
                        wind_v=float(v10[i, j]) if v10 is not None and not np.isnan(v10[i, j]) else None
                    )
                    records.append(record)
            
            db.session.bulk_save_objects(records)
            db.session.commit()
            total_records += len(records)
            print(f"         Inserted {len(records)} records")
        
        ds_instant.close()
        if ds_accum:
            ds_accum.close()
    
    print(f"\n✅ Total records ingested: {total_records}")
    return total_records


if __name__ == '__main__':
    merge_and_ingest(downsample=8)
