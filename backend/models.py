from datetime import datetime
from extensions import db


class WeatherQuery(db.Model):
    __tablename__ = 'weather_queries'
    
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    response_data = db.Column(db.Text)
    
    def to_dict(self):
        return {
            'id': self.id,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'latitude': self.latitude,
            'longitude': self.longitude
        }
    
    def __repr__(self):
        return f'<WeatherQuery {self.id}: ({self.latitude}, {self.longitude})>'
