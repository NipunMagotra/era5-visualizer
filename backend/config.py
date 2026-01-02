import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    _DB_DIR = os.path.join(os.path.dirname(__file__), 'data')
    if not os.path.exists(_DB_DIR):
        os.makedirs(_DB_DIR, exist_ok=True)
    
    _DATABASE_URL = os.getenv(
        'DATABASE_URL',
        'sqlite:///' + os.path.join(_DB_DIR, 'era5.db')
    )
    if _DATABASE_URL.startswith('postgres://'):
        _DATABASE_URL = _DATABASE_URL.replace('postgres://', 'postgresql://', 1)
    
    SQLALCHEMY_DATABASE_URI = _DATABASE_URL
    
    CDS_API_KEY = os.getenv('CDS_API_KEY', '')
    CDS_API_URL = os.getenv('CDS_API_URL', 'https://cds.climate.copernicus.eu/api/v2')
    
    DATA_DIR = _DB_DIR
    NETCDF_FILE = os.path.join(DATA_DIR, 'india_era5.nc')
    
    INDIA_BOUNDS = [35.5, 68.1, 6.0, 97.4]
    
    ERA5_VARIABLES = [
        '2m_temperature',
        'total_precipitation',
        'surface_pressure',
        '10m_u_component_of_wind',
        '10m_v_component_of_wind'
    ]


class DevelopmentConfig(Config):
    DEBUG = True
    FLASK_ENV = 'development'


class ProductionConfig(Config):
    DEBUG = False
    FLASK_ENV = 'production'


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
