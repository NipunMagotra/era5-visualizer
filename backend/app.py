import os
import logging
from flask import Flask, jsonify, request
from flask_cors import CORS

from extensions import db
from config import Config
from weather_service import get_weather_service

app = Flask(__name__)
app.config.from_object(Config)

cors_origins = os.getenv('FRONTEND_URL', '').split(',')
cors_origins = [o.strip() for o in cors_origins if o.strip()]
cors_origins.extend([
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://localhost:3000',
    'https://era5-visualizer.vercel.app'
])
unique_origins = list(set(cors_origins))
print(f"Configuring CORS for origins: {unique_origins}")

CORS(app, resources={
    r"/api/*": {
        "origins": unique_origins + ["*"],  
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

db.init_app(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from models import WeatherQuery


@app.route('/api/health', methods=['GET'])
def health_check():
    weather_service = get_weather_service()
    return jsonify({
        'status': 'healthy',
        'service_available': weather_service.is_available(),
        'bounds': weather_service.get_bounds() if weather_service.is_available() else None
    })


@app.route('/api/weather', methods=['GET'])
def get_weather():
    lat = request.args.get('lat', type=float)
    lon = request.args.get('lon', type=float)
    
    if lat is None or lon is None:
        return jsonify({'error': 'Missing lat or lon parameter'}), 400
    
    weather_service = get_weather_service()
    
    if not weather_service.is_available():
        return jsonify({'error': 'Weather service unavailable'}), 503
    
    try:
        data = weather_service.get_weather_at_point(lat, lon)
        
        if data is None:
            return jsonify({'error': 'Failed to get weather data'}), 500
        
        try:
            query = WeatherQuery(
                latitude=lat,
                longitude=lon,
                response_data=str(data)
            )
            db.session.add(query)
            db.session.commit()
        except Exception as e:
            logger.warning(f"Failed to log query: {e}")
            db.session.rollback()
        
        return jsonify(data)
        
    except Exception as e:
        logger.error(f"Error processing weather request: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/weather/grid', methods=['GET'])
def get_grid_data():
    variable = request.args.get('variable', 't2m')
    lat_min = request.args.get('lat_min', type=float)
    lat_max = request.args.get('lat_max', type=float)
    lon_min = request.args.get('lon_min', type=float)
    lon_max = request.args.get('lon_max', type=float)
    downsample = request.args.get('downsample', 4, type=int)
    
    weather_service = get_weather_service()
    
    if not weather_service.is_available():
        return jsonify({'error': 'Weather service unavailable'}), 503
    
    lat_range = (lat_min, lat_max) if lat_min and lat_max else None
    lon_range = (lon_min, lon_max) if lon_min and lon_max else None
    
    data = weather_service.get_grid_data(
        variable=variable,
        lat_range=lat_range,
        lon_range=lon_range,
        downsample=downsample
    )
    
    if data is None:
        return jsonify({'error': 'Failed to get grid data'}), 500
    
    return jsonify(data)


@app.route('/api/dataset', methods=['GET'])
def get_dataset_info():
    weather_service = get_weather_service()
    
    if not weather_service.is_available():
        return jsonify({'error': 'Weather service unavailable'}), 503
    
    return jsonify(weather_service.get_dataset_info())


@app.route('/api/queries', methods=['GET'])
def get_queries():
    limit = request.args.get('limit', 10, type=int)
    queries = WeatherQuery.query.order_by(WeatherQuery.timestamp.desc()).limit(limit).all()
    return jsonify([q.to_dict() for q in queries])


@app.route('/api/stats', methods=['GET'])
def get_stats():
    total_queries = WeatherQuery.query.count()
    return jsonify({
        'total_queries': total_queries
    })


with app.app_context():
    db.create_all()


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('FLASK_DEBUG', 'false').lower() == 'true')
