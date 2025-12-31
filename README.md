# ERA5 Weather Visualizer

A full-stack web application to visualize ERA5 climate reanalysis data for the Indian Subcontinent. Built with React, Flask, and Chart.js.

## 🌟 Features

- **Interactive Map**: Click anywhere on the Indian Subcontinent to get weather data
- **5 Key Variables**: Temperature (2m), Total Precipitation, Surface Pressure, Wind U/V Components
- **Beautiful Visualizations**: Bar charts and wind direction gauges
- **Dark Theme**: Modern Electric Blue & Cyber Lime UI
- **Real-time Data Lookup**: Instant weather data at any grid point

## 🛠️ Tech Stack

### Backend
- **Flask** - Python web framework
- **xarray + NetCDF4** - Climate data processing
- **SQLAlchemy** - ORM for database
- **Flask-CORS** - Cross-origin resource sharing

### Frontend
- **React + Vite** - Fast, modern frontend
- **Tailwind CSS** - Utility-first styling
- **Leaflet + react-leaflet** - Interactive maps
- **Chart.js + react-chartjs-2** - Data visualizations

## 📦 Project Structure

```
era5-visualizer/
├── backend/
│   ├── app.py              # Flask application
│   ├── config.py           # Configuration
│   ├── models.py           # SQLAlchemy models
│   ├── weather_service.py  # NetCDF data processing
│   ├── data_fetcher.py     # CDS API integration
│   ├── requirements.txt    # Python dependencies
│   └── data/               # NetCDF files
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   ├── App.jsx         # Main application
│   │   └── index.css       # Tailwind styles
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+

### Backend Setup

1. **Create virtual environment**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Generate sample data** (or use real ERA5 data):
   ```bash
   python data_fetcher.py
   ```

4. **Run the backend**:
   ```bash
   python app.py
   ```
   Backend runs at http://localhost:5000

### Frontend Setup

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. **Access at** http://localhost:5173

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/weather` | GET | Get weather at point (lat, lon) |
| `/api/weather/grid` | GET | Get gridded data for variable |
| `/api/dataset` | GET | Dataset information |

### Example API Call

```bash
curl "http://localhost:5000/api/weather?lat=28.6139&lon=77.2090"
```

Response:
```json
{
  "temperature": {
    "celsius": 25.5,
    "kelvin": 298.65,
    "unit": "°C"
  },
  "precipitation": {
    "millimeters": 0.05,
    "unit": "mm"
  },
  "pressure": {
    "hectopascal": 1013.25,
    "unit": "hPa"
  },
  "wind": {
    "speed": 3.2,
    "direction": 225.0
  }
}
```

## 🌍 ERA5 Data

### Getting Real ERA5 Data

1. **Register at [Copernicus CDS](https://cds.climate.copernicus.eu/)**

2. **Get your API key** from your profile page

3. **Set up credentials**:
   ```bash
   # Create ~/.cdsapirc
   url: https://cds.climate.copernicus.eu/api/v2
   key: <your-api-key>
   ```

4. **Fetch data**:
   ```python
   from data_fetcher import ERA5DataFetcher
   
   fetcher = ERA5DataFetcher()
   fetcher.fetch_single_time(
       year='2023',
       month='01',
       day='15',
       time='12:00'
   )
   ```

### Variables Included

| Variable | Description | Units |
|----------|-------------|-------|
| `t2m` | 2 metre temperature | Kelvin |
| `tp` | Total precipitation | metres |
| `sp` | Surface pressure | Pascal |
| `u10` | 10m U wind component | m/s |
| `v10` | 10m V wind component | m/s |

### Coverage Area

- **North**: 35.5°N
- **South**: 6.0°N  
- **West**: 68.1°E
- **East**: 97.4°E

## ☁️ Deployment

### Backend (Render/Railway)

1. Connect your GitHub repo
2. Set build command: `pip install -r requirements.txt`
3. Set start command: `gunicorn app:app`

### Frontend (Vercel/Netlify)

1. Connect your repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variable:
   - `VITE_API_URL` = your backend URL

## 📝 License

MIT License - feel free to use this project for learning and building.

## 🙏 Acknowledgments

- **ECMWF** for ERA5 reanalysis data
- **Copernicus Climate Data Store** for data access
- **OpenStreetMap** and **CARTO** for map tiles

---

Built with ❤️ for climate data visualization
