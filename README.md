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
│   ├── Dockerfile          # Backend container
│   └── data/               # NetCDF files
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   ├── App.jsx         # Main application
│   │   └── index.css       # Tailwind styles
│   ├── package.json
│   ├── Dockerfile          # Frontend container
│   └── nginx.conf          # Production web server
├── docker-compose.yml      # Container orchestration
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- Docker (optional)

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/NipunMagotra/era5-visualizer.git
cd era5-visualizer

# Copy environment file
cp .env.example .env

# Build and run
docker-compose up --build
```

Access at: http://localhost:80

### Option 2: Local Development

#### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Backend runs at http://localhost:5000

#### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at http://localhost:5173

## ☁️ Cloud Deployment

### Deploy to Render (Free)

#### Backend Web Service:
1. Create new Web Service on Render
2. Connect GitHub repository
3. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
4. Add environment variable: `SECRET_KEY`

#### Frontend Static Site:
1. Create new Static Site on Render
2. Connect same repository
3. Settings:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add environment variable: `VITE_API_URL` = your backend URL

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

## 🌍 ERA5 Data

### Getting Real ERA5 Data

1. Register at [Copernicus CDS](https://cds.climate.copernicus.eu/)
2. Get your API key from your profile
3. Create `~/.cdsapirc`:
   ```
   url: https://cds.climate.copernicus.eu/api/v2
   key: <your-api-key>
   ```
4. Run data fetcher:
   ```bash
   cd backend
   python data_fetcher.py
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

## 📝 License

MIT License - feel free to use this project for learning and building.

## 🙏 Acknowledgments

- **ECMWF** for ERA5 reanalysis data
- **Copernicus Climate Data Store** for data access
- **OpenStreetMap** and **CARTO** for map tiles

---

Built with ❤️ for climate data visualization
