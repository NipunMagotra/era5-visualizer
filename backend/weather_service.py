import os
import logging
import numpy as np
from typing import Dict, Optional, Any
from datetime import datetime

try:
    import xarray as xr
    XARRAY_AVAILABLE = True
except ImportError:
    XARRAY_AVAILABLE = False

from config import Config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class WeatherService:
    
    def __init__(self, netcdf_path: str = None):
        self.netcdf_path = netcdf_path or Config.NETCDF_FILE
        self.dataset = None
        self._load_dataset()
    
    def _load_dataset(self):
        if not XARRAY_AVAILABLE:
            logger.error("xarray not installed. Weather service unavailable.")
            return
        
        if not os.path.exists(self.netcdf_path):
            logger.warning(f"NetCDF file not found: {self.netcdf_path}")
            logger.info("Creating sample data...")
            from data_fetcher import create_sample_data
            create_sample_data()
        
        try:
            self.dataset = xr.open_dataset(self.netcdf_path)
            logger.info(f"Loaded dataset: {self.netcdf_path}")
            logger.info(f"Variables: {list(self.dataset.data_vars)}")
            logger.info(f"Coordinates: {list(self.dataset.coords)}")
        except Exception as e:
            logger.error(f"Failed to load dataset: {e}")
            self.dataset = None
    
    def reload_dataset(self):
        if self.dataset is not None:
            self.dataset.close()
        self._load_dataset()
    
    def is_available(self) -> bool:
        return self.dataset is not None
    
    def get_bounds(self) -> Dict[str, float]:
        if not self.is_available():
            return None
        
        return {
            'north': float(self.dataset.latitude.max()),
            'south': float(self.dataset.latitude.min()),
            'east': float(self.dataset.longitude.max()),
            'west': float(self.dataset.longitude.min())
        }
    
    def get_weather_at_point(
        self,
        lat: float,
        lon: float,
        time_idx: int = 0
    ) -> Optional[Dict[str, Any]]:
        if not self.is_available():
            return None
        
        try:
            point_data = self.dataset.sel(
                latitude=lat,
                longitude=lon,
                method='nearest'
            )
            
            if 'time' in point_data.dims:
                point_data = point_data.isel(time=time_idx)
            
            def get_value(var_name):
                if var_name in point_data:
                    val = point_data[var_name].values
                    return float(val) if np.isscalar(val) or val.ndim == 0 else float(val.item())
                return None
            
            temp_k = get_value('t2m')
            precip_m = get_value('tp')
            pressure_pa = get_value('sp')
            wind_u = get_value('u10')
            wind_v = get_value('v10')
            
            temp_c = temp_k - 273.15 if temp_k else None
            precip_mm = precip_m * 1000 if precip_m else None
            pressure_hpa = pressure_pa / 100 if pressure_pa else None
            
            wind_speed = None
            wind_direction = None
            if wind_u is not None and wind_v is not None:
                wind_speed = np.sqrt(wind_u**2 + wind_v**2)
                wind_direction = (270 - np.degrees(np.arctan2(wind_v, wind_u))) % 360
            
            actual_lat = float(point_data.latitude.values)
            actual_lon = float(point_data.longitude.values)
            
            return {
                'requested': {
                    'latitude': lat,
                    'longitude': lon
                },
                'actual': {
                    'latitude': actual_lat,
                    'longitude': actual_lon
                },
                'temperature': {
                    'kelvin': round(temp_k, 2) if temp_k else None,
                    'celsius': round(temp_c, 2) if temp_c else None,
                    'fahrenheit': round(temp_c * 9/5 + 32, 2) if temp_c else None,
                    'unit': '°C'
                },
                'precipitation': {
                    'meters': round(precip_m, 6) if precip_m else None,
                    'millimeters': round(precip_mm, 4) if precip_mm else None,
                    'unit': 'mm'
                },
                'pressure': {
                    'pascal': round(pressure_pa, 2) if pressure_pa else None,
                    'hectopascal': round(pressure_hpa, 2) if pressure_hpa else None,
                    'unit': 'hPa'
                },
                'wind': {
                    'u_component': round(wind_u, 2) if wind_u else None,
                    'v_component': round(wind_v, 2) if wind_v else None,
                    'speed': round(wind_speed, 2) if wind_speed else None,
                    'direction': round(wind_direction, 1) if wind_direction else None,
                    'speed_unit': 'm/s',
                    'direction_unit': 'degrees'
                },
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting weather at ({lat}, {lon}): {e}")
            return None
    
    def get_grid_data(
        self,
        variable: str,
        lat_range: tuple = None,
        lon_range: tuple = None,
        time_idx: int = 0,
        downsample: int = 1
    ) -> Optional[Dict[str, Any]]:
        if not self.is_available():
            return None
        
        if variable not in self.dataset.data_vars:
            logger.error(f"Variable not found: {variable}")
            return None
        
        try:
            data = self.dataset[variable]
            
            if 'time' in data.dims:
                data = data.isel(time=time_idx)
            
            if lat_range:
                data = data.sel(latitude=slice(max(lat_range), min(lat_range)))
            if lon_range:
                data = data.sel(longitude=slice(min(lon_range), max(lon_range)))
            
            if downsample > 1:
                data = data.isel(
                    latitude=slice(None, None, downsample),
                    longitude=slice(None, None, downsample)
                )
            
            values = data.values
            lats = data.latitude.values
            lons = data.longitude.values
            
            return {
                'variable': variable,
                'values': values.tolist(),
                'latitude': lats.tolist(),
                'longitude': lons.tolist(),
                'shape': list(values.shape),
                'min': float(np.nanmin(values)),
                'max': float(np.nanmax(values)),
                'mean': float(np.nanmean(values))
            }
            
        except Exception as e:
            logger.error(f"Error getting grid data for {variable}: {e}")
            return None
    
    def get_dataset_info(self) -> Optional[Dict[str, Any]]:
        if not self.is_available():
            return None
        
        return {
            'file': os.path.basename(self.netcdf_path),
            'variables': list(self.dataset.data_vars),
            'coordinates': list(self.dataset.coords),
            'dimensions': dict(self.dataset.dims),
            'bounds': self.get_bounds(),
            'attributes': dict(self.dataset.attrs)
        }


_weather_service = None


def get_weather_service() -> WeatherService:
    global _weather_service
    if _weather_service is None:
        _weather_service = WeatherService()
    return _weather_service
