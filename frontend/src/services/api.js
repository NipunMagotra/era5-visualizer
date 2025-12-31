/**
 * API Service for ERA5 Weather Visualizer
 * Handles all communication with the Flask backend
 */
import axios from 'axios';

// Configure base URL - in production, this would be the deployed backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for logging
api.interceptors.request.use(
    (config) => {
        console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        console.log(`✅ API Response: ${response.status}`);
        return response;
    },
    (error) => {
        console.error('❌ Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

/**
 * Weather API Service
 */
export const weatherService = {
    /**
     * Get weather data at a specific point
     * @param {number} lat - Latitude
     * @param {number} lon - Longitude
     * @param {number} timeIdx - Time index (default: 0)
     */
    getWeatherAtPoint: async (lat, lon, timeIdx = 0) => {
        const response = await api.get('/api/weather', {
            params: { lat, lon, time_idx: timeIdx },
        });
        return response.data;
    },

    /**
     * Get gridded weather data for visualization
     * @param {string} variable - Variable name (t2m, tp, sp, u10, v10)
     * @param {object} options - Optional bounds and downsampling
     */
    getGridData: async (variable, options = {}) => {
        const { latMin, latMax, lonMin, lonMax, downsample = 2 } = options;
        const response = await api.get('/api/weather/grid', {
            params: {
                variable,
                lat_min: latMin,
                lat_max: latMax,
                lon_min: lonMin,
                lon_max: lonMax,
                downsample,
            },
        });
        return response.data;
    },

    /**
     * Get dataset information
     */
    getDatasetInfo: async () => {
        const response = await api.get('/api/dataset');
        return response.data;
    },

    /**
     * Health check
     */
    healthCheck: async () => {
        const response = await api.get('/api/health');
        return response.data;
    },

    /**
     * Get logged queries
     */
    getQueries: async (limit = 100, offset = 0) => {
        const response = await api.get('/api/queries', {
            params: { limit, offset },
        });
        return response.data;
    },

    /**
     * Get API statistics
     */
    getStats: async () => {
        const response = await api.get('/api/stats');
        return response.data;
    },
};

export default api;
