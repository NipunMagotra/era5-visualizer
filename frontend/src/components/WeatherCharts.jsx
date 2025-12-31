/**
 * WeatherCharts Component
 * Displays weather data using Chart.js visualizations
 */
import { useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    RadialLinearScale,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Bar, Radar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    RadialLinearScale,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// Chart colors matching our theme
const CHART_COLORS = {
    temperature: {
        bg: 'rgba(239, 68, 68, 0.7)',
        border: 'rgb(239, 68, 68)',
    },
    precipitation: {
        bg: 'rgba(59, 130, 246, 0.7)',
        border: 'rgb(59, 130, 246)',
    },
    pressure: {
        bg: 'rgba(168, 85, 247, 0.7)',
        border: 'rgb(168, 85, 247)',
    },
    windU: {
        bg: 'rgba(34, 197, 94, 0.7)',
        border: 'rgb(34, 197, 94)',
    },
    windV: {
        bg: 'rgba(20, 184, 166, 0.7)',
        border: 'rgb(20, 184, 166)',
    },
};

// Common chart options
const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: {
                color: '#e2e8f0',
                font: {
                    family: 'Inter, sans-serif',
                },
            },
        },
    },
};

/**
 * Bar Chart for all weather variables
 */
function WeatherBarChart({ weatherData }) {
    const data = useMemo(() => ({
        labels: ['Temperature (°C)', 'Precipitation (mm×10)', 'Pressure (hPa/10)', 'Wind U (m/s)', 'Wind V (m/s)'],
        datasets: [
            {
                label: 'Weather Variables',
                data: [
                    weatherData.temperature?.celsius || 0,
                    (weatherData.precipitation?.millimeters || 0) * 10, // Scale for visibility
                    (weatherData.pressure?.hectopascal || 0) / 10, // Scale down
                    weatherData.wind?.u_component || 0,
                    weatherData.wind?.v_component || 0,
                ],
                backgroundColor: [
                    CHART_COLORS.temperature.bg,
                    CHART_COLORS.precipitation.bg,
                    CHART_COLORS.pressure.bg,
                    CHART_COLORS.windU.bg,
                    CHART_COLORS.windV.bg,
                ],
                borderColor: [
                    CHART_COLORS.temperature.border,
                    CHART_COLORS.precipitation.border,
                    CHART_COLORS.pressure.border,
                    CHART_COLORS.windU.border,
                    CHART_COLORS.windV.border,
                ],
                borderWidth: 2,
                borderRadius: 8,
            },
        ],
    }), [weatherData]);

    const options = {
        ...commonOptions,
        indexAxis: 'y',
        plugins: {
            ...commonOptions.plugins,
            title: {
                display: true,
                text: 'All Weather Variables',
                color: '#e2e8f0',
                font: {
                    size: 16,
                    weight: 'bold',
                },
            },
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                ticks: {
                    color: '#94a3b8',
                },
            },
            y: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#e2e8f0',
                },
            },
        },
    };

    return (
        <div className="chart-container h-[280px]">
            <Bar data={data} options={options} />
        </div>
    );
}

/**
 * Radar Chart for weather profile
 */
function WeatherRadarChart({ weatherData }) {
    // Normalize values to 0-100 scale for radar chart
    const normalizeTemp = (temp) => Math.min(100, Math.max(0, ((temp + 20) / 60) * 100));
    const normalizePrecip = (precip) => Math.min(100, (precip / 10) * 100);
    const normalizePressure = (pressure) => Math.min(100, ((pressure - 900) / 150) * 100);
    const normalizeWind = (wind) => Math.min(100, Math.max(0, (Math.abs(wind) / 20) * 100));

    const data = useMemo(() => ({
        labels: ['Temperature', 'Precipitation', 'Pressure', 'Wind U', 'Wind V'],
        datasets: [
            {
                label: 'Weather Profile',
                data: [
                    normalizeTemp(weatherData.temperature?.celsius || 0),
                    normalizePrecip(weatherData.precipitation?.millimeters || 0),
                    normalizePressure(weatherData.pressure?.hectopascal || 0),
                    normalizeWind(weatherData.wind?.u_component || 0),
                    normalizeWind(weatherData.wind?.v_component || 0),
                ],
                fill: true,
                backgroundColor: 'rgba(26, 143, 224, 0.2)',
                borderColor: 'rgb(26, 143, 224)',
                borderWidth: 2,
                pointBackgroundColor: 'rgb(26, 143, 224)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(26, 143, 224)',
                pointRadius: 5,
            },
        ],
    }), [weatherData]);

    const options = {
        ...commonOptions,
        plugins: {
            ...commonOptions.plugins,
            title: {
                display: true,
                text: 'Weather Profile (Normalized)',
                color: '#e2e8f0',
                font: {
                    size: 16,
                    weight: 'bold',
                },
            },
        },
        scales: {
            r: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                angleLines: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                pointLabels: {
                    color: '#e2e8f0',
                    font: {
                        size: 11,
                    },
                },
                ticks: {
                    display: false,
                },
            },
        },
    };

    return (
        <div className="chart-container h-[280px]">
            <Radar data={data} options={options} />
        </div>
    );
}

/**
 * Wind Direction Doughnut Chart
 */
function WindDirectionChart({ weatherData }) {
    const windSpeed = weatherData.wind?.speed || 0;
    const windDirection = weatherData.wind?.direction || 0;

    const data = useMemo(() => ({
        labels: ['Wind Speed', 'Remaining'],
        datasets: [
            {
                data: [Math.min(windSpeed, 20), Math.max(0, 20 - windSpeed)],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(255, 255, 255, 0.05)',
                ],
                borderColor: [
                    'rgb(34, 197, 94)',
                    'rgba(255, 255, 255, 0.1)',
                ],
                borderWidth: 2,
                circumference: 270,
                rotation: 225,
            },
        ],
    }), [windSpeed]);

    const options = {
        ...commonOptions,
        cutout: '70%',
        plugins: {
            ...commonOptions.plugins,
            title: {
                display: true,
                text: 'Wind Speed & Direction',
                color: '#e2e8f0',
                font: {
                    size: 16,
                    weight: 'bold',
                },
            },
            legend: {
                display: false,
            },
        },
    };

    return (
        <div className="chart-container h-[280px] relative">
            <Doughnut data={data} options={options} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-6">
                <span className="text-3xl font-bold text-green-400">{windSpeed.toFixed(1)}</span>
                <span className="text-sm text-gray-400">m/s</span>
                <span className="text-xs text-gray-500 mt-1">{windDirection.toFixed(0)}°</span>
            </div>
        </div>
    );
}

/**
 * Main WeatherCharts Component
 */
export default function WeatherCharts({ weatherData }) {
    if (!weatherData) {
        return (
            <div className="glass-card p-8 text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No Data Yet</h3>
                <p className="text-gray-500">
                    Click on the map to select a location and view weather charts.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 fade-in">
            {/* Location Header */}
            <div className="glass-card p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                        📍
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">
                            {weatherData.actual?.latitude?.toFixed(4)}°N, {weatherData.actual?.longitude?.toFixed(4)}°E
                        </h3>
                        <p className="text-xs text-gray-400">
                            Data timestamp: {new Date(weatherData.timestamp).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <WeatherBarChart weatherData={weatherData} />
                <WeatherRadarChart weatherData={weatherData} />
            </div>

            {/* Wind Direction Chart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <WindDirectionChart weatherData={weatherData} />

                {/* Additional Info Card */}
                <div className="chart-container flex flex-col justify-center">
                    <h4 className="text-lg font-semibold text-white mb-4">Wind Components</h4>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-400">U Component (East-West)</span>
                            <span className="text-green-400 font-mono font-bold">
                                {weatherData.wind?.u_component?.toFixed(2)} m/s
                            </span>
                        </div>
                        <div className="w-full bg-dark-600 rounded-full h-3">
                            <div
                                className="h-3 rounded-full bg-gradient-to-r from-green-600 to-green-400"
                                style={{
                                    width: `${Math.min(100, Math.abs(weatherData.wind?.u_component || 0) * 5)}%`,
                                }}
                            />
                        </div>

                        <div className="flex items-center justify-between mt-4">
                            <span className="text-gray-400">V Component (North-South)</span>
                            <span className="text-teal-400 font-mono font-bold">
                                {weatherData.wind?.v_component?.toFixed(2)} m/s
                            </span>
                        </div>
                        <div className="w-full bg-dark-600 rounded-full h-3">
                            <div
                                className="h-3 rounded-full bg-gradient-to-r from-teal-600 to-teal-400"
                                style={{
                                    width: `${Math.min(100, Math.abs(weatherData.wind?.v_component || 0) * 5)}%`,
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
