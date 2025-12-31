"""
ERA5 Data Fetcher - Downloads climate data from Copernicus Climate Data Store.
"""
import os
import logging
from datetime import datetime
from typing import List, Optional

try:
    import cdsapi
    CDS_AVAILABLE = True
except ImportError:
    CDS_AVAILABLE = False

from config import Config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ERA5DataFetcher:
    """
    Fetches ERA5 reanalysis data from the Copernicus Climate Data Store.
    
    Requires CDS API credentials. Get your API key from:
    https://cds.climate.copernicus.eu/
    """
    
    VARIABLES = [
        '2m_temperature',
        'total_precipitation', 
        'surface_pressure',
        '10m_u_component_of_wind',
        '10m_v_component_of_wind'
    ]
    
    # India bounding box [North, West, South, East]
    INDIA_BOUNDS = [35.5, 68.1, 6.0, 97.4]
    
    def __init__(self, output_dir: str = None):
        """Initialize the data fetcher."""
        self.output_dir = output_dir or Config.DATA_DIR
        os.makedirs(self.output_dir, exist_ok=True)
        
        if CDS_AVAILABLE:
            try:
                self.client = cdsapi.Client()
                self.available = True
            except Exception as e:
                logger.warning(f"CDS API client initialization failed: {e}")
                self.client = None
                self.available = False
        else:
            logger.warning("cdsapi package not installed. Data fetching disabled.")
            self.client = None
            self.available = False
    
    def fetch_single_time(
        self,
        year: str,
        month: str,
        day: str,
        time: str = '12:00',
        output_filename: str = None
    ) -> Optional[str]:
        """Fetch ERA5 data for a single time point."""
        if not self.available:
            logger.error("CDS API not available. Cannot fetch data.")
            return None
        
        if output_filename is None:
            output_filename = f"india_era5_{year}{month}{day}_{time.replace(':', '')}.nc"
        
        output_path = os.path.join(self.output_dir, output_filename)
        
        logger.info(f"Fetching ERA5 data for {year}-{month}-{day} {time}...")
        
        try:
            self.client.retrieve(
                'reanalysis-era5-single-levels',
                {
                    'product_type': 'reanalysis',
                    'format': 'netcdf',
                    'variable': self.VARIABLES,
                    'year': year,
                    'month': month,
                    'day': day,
                    'time': time,
                    'area': self.INDIA_BOUNDS,
                },
                output_path
            )
            
            logger.info(f"Successfully downloaded: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"Failed to fetch ERA5 data: {e}")
            return None


def create_sample_data():
    """
    Create sample NetCDF data for development/testing.
    This creates synthetic data that mimics ERA5 structure.
    """
    import numpy as np
    
    try:
        import xarray as xr
    except ImportError:
        logger.error("xarray not installed. Cannot create sample data.")
        return None
    
    output_dir = Config.DATA_DIR
    os.makedirs(output_dir, exist_ok=True)
    
    # Create coordinate arrays
    lat = np.arange(6.0, 36.0, 0.25)
    lon = np.arange(68.0, 98.0, 0.25)
    time = np.array(['2023-01-01T12:00:00'], dtype='datetime64[ns]')
    
    # Create meshgrid for realistic patterns
    lon_mesh, lat_mesh = np.meshgrid(lon, lat)
    
    # Generate sample data
    base_temp = 290 + 15 * np.sin(np.radians(lat_mesh - 6) * 2)
    temp_variation = 5 * np.cos(np.radians(lon_mesh - 83) * 3)
    t2m = base_temp + temp_variation + np.random.normal(0, 2, base_temp.shape)
    
    precip_base = np.exp(-((lat_mesh - 20)**2 + (lon_mesh - 85)**2) / 500)
    tp = precip_base * 0.01 + np.random.exponential(0.001, base_temp.shape)
    
    sp = 101325 - 500 * (lat_mesh - 6) + np.random.normal(0, 100, base_temp.shape)
    
    u10 = 3 * np.cos(np.radians(lat_mesh * 2)) + np.random.normal(0, 1, base_temp.shape)
    v10 = 2 * np.sin(np.radians(lon_mesh * 2)) + np.random.normal(0, 1, base_temp.shape)
    
    # Create xarray Dataset
    ds = xr.Dataset(
        {
            't2m': (['time', 'latitude', 'longitude'], t2m[np.newaxis, :, :]),
            'tp': (['time', 'latitude', 'longitude'], tp[np.newaxis, :, :]),
            'sp': (['time', 'latitude', 'longitude'], sp[np.newaxis, :, :]),
            'u10': (['time', 'latitude', 'longitude'], u10[np.newaxis, :, :]),
            'v10': (['time', 'latitude', 'longitude'], v10[np.newaxis, :, :]),
        },
        coords={
            'time': time,
            'latitude': lat,
            'longitude': lon,
        },
        attrs={
            'title': 'ERA5 Sample Data for Indian Subcontinent',
            'source': 'Synthetic data for development',
            'conventions': 'CF-1.6',
        }
    )
    
    # Add variable attributes
    ds.t2m.attrs = {'units': 'K', 'long_name': '2 metre temperature'}
    ds.tp.attrs = {'units': 'm', 'long_name': 'Total precipitation'}
    ds.sp.attrs = {'units': 'Pa', 'long_name': 'Surface pressure'}
    ds.u10.attrs = {'units': 'm s**-1', 'long_name': '10 metre U wind component'}
    ds.v10.attrs = {'units': 'm s**-1', 'long_name': '10 metre V wind component'}
    
    output_path = os.path.join(output_dir, 'india_era5.nc')
    ds.to_netcdf(output_path)
    
    logger.info(f"Created sample data: {output_path}")
    return output_path


if __name__ == '__main__':
    create_sample_data()
