# Backend Dockerfile
# Python Flask API for ERA5 Weather Visualizer

FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV FLASK_ENV=production

# Set work directory
WORKDIR /app

# Install system dependencies for NetCDF4
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libhdf5-dev \
    libnetcdf-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create data directory if it doesn't exist
RUN mkdir -p data

# Railway assigns PORT dynamically, expose it
ENV PORT=5000
EXPOSE $PORT

# Run the application with Railway's PORT
# Note: Railway will override $PORT at runtime
CMD gunicorn --bind 0.0.0.0:$PORT --workers 2 --threads 4 --timeout 120 app:app
