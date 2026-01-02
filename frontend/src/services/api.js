import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

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

export const weatherService = {
    getWeatherAtPoint: async (lat, lon, timeIdx = 0) => {
        const response = await api.get('/api/weather', {
            params: { lat, lon, time_idx: timeIdx },
        });
        return response.data;
    },

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

    getDatasetInfo: async () => {
        const response = await api.get('/api/dataset');
        return response.data;
    },

    healthCheck: async () => {
        const response = await api.get('/api/health');
        return response.data;
    },

    getQueries: async (limit = 100, offset = 0) => {
        const response = await api.get('/api/queries', {
            params: { limit, offset },
        });
        return response.data;
    },

    getStats: async () => {
        const response = await api.get('/api/stats');
        return response.data;
    },
};

export default api;
