import { useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const COLORS = {
    temp: { bg: 'rgba(255, 107, 53, 0.8)', border: 'rgb(255, 107, 53)' },
    rain: { bg: 'rgba(0, 123, 255, 0.8)', border: 'rgb(0, 123, 255)' },
    pressure: { bg: 'rgba(157, 78, 221, 0.8)', border: 'rgb(157, 78, 221)' },
    wind: { bg: 'rgba(50, 255, 0, 0.8)', border: 'rgb(50, 255, 0)' },
    windV: { bg: 'rgba(0, 200, 150, 0.8)', border: 'rgb(0, 200, 150)' },
};

const baseChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: 'rgba(10, 10, 10, 0.95)',
            titleColor: '#fafafa',
            bodyColor: '#a3a3a3',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            cornerRadius: 8,
            padding: 12,
            titleFont: { family: 'Inter', size: 12, weight: 600 },
            bodyFont: { family: 'Inter', size: 11 },
        },
    },
};

const ChartIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" opacity="0.15" />
        <rect x="6" y="10" width="3" height="8" rx="1" fill="currentColor" />
        <rect x="10.5" y="6" width="3" height="12" rx="1" fill="currentColor" opacity="0.7" />
        <rect x="15" y="8" width="3" height="10" rx="1" fill="currentColor" />
    </svg>
);

const LocationIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
        <path d="M12 21C12 21 19 14.5 19 9C19 5.13401 15.866 2 12 2C8.13401 2 5 5.13401 5 9C5 14.5 12 21 12 21Z"
            fill="currentColor" opacity="0.15" />
        <path d="M12 21C12 21 19 14.5 19 9C19 5.13401 15.866 2 12 2C8.13401 2 5 5.13401 5 9C5 14.5 12 21 12 21Z"
            stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="9" r="3" fill="currentColor" />
    </svg>
);

const WindDetailIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.1" />
        <path d="M12 2V12L18 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
);

function VariablesChart({ weatherData }) {
    const data = useMemo(() => ({
        labels: ['Temp', 'Precip', 'Wind U', 'Wind V'],
        datasets: [{
            data: [
                weatherData.temperature?.celsius || 0,
                (weatherData.precipitation?.millimeters || 0) * 10,
                weatherData.wind?.u_component || 0,
                weatherData.wind?.v_component || 0,
            ],
            backgroundColor: [
                COLORS.temp.bg,
                COLORS.rain.bg,
                COLORS.wind.bg,
                COLORS.windV.bg,
            ],
            borderColor: [
                COLORS.temp.border,
                COLORS.rain.border,
                COLORS.wind.border,
                COLORS.windV.border,
            ],
            borderWidth: 1,
            borderRadius: 6,
            barThickness: 20,
        }],
    }), [weatherData]);

    const options = {
        ...baseChartOptions,
        indexAxis: 'y',
        scales: {
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                    drawBorder: false,
                },
                ticks: {
                    color: '#525252',
                    font: { family: 'Inter', size: 10 },
                },
            },
            y: {
                grid: { display: false },
                ticks: {
                    color: '#a3a3a3',
                    font: { family: 'Inter', size: 11 },
                },
            },
        },
    };

    return (
        <div className="chart-container">
            <div className="flex items-center gap-2 mb-3">
                <span className="text-electric-500"><ChartIcon /></span>
                <h4 className="text-caption">Weather Variables</h4>
            </div>
            <div className="h-[130px]">
                <Bar data={data} options={options} />
            </div>
        </div>
    );
}

function WindGauge({ weatherData }) {
    const windSpeed = weatherData.wind?.speed || 0;
    const windDirection = weatherData.wind?.direction || 0;
    const maxSpeed = 20;

    const data = useMemo(() => ({
        datasets: [{
            data: [Math.min(windSpeed, maxSpeed), Math.max(0, maxSpeed - windSpeed)],
            backgroundColor: ['rgba(50, 255, 0, 0.9)', 'rgba(26, 26, 26, 0.5)'],
            borderColor: ['rgb(50, 255, 0)', 'transparent'],
            borderWidth: 2,
            circumference: 240,
            rotation: 240,
        }],
    }), [windSpeed]);

    const options = {
        ...baseChartOptions,
        cutout: '78%',
        plugins: {
            ...baseChartOptions.plugins,
            tooltip: { enabled: false },
        },
    };

    const getCardinal = (deg) => {
        const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        return directions[Math.round(deg / 45) % 8];
    };

    return (
        <div className="chart-container">
            <div className="flex items-center gap-2 mb-3">
                <span className="text-lime-500"><WindDetailIcon /></span>
                <h4 className="text-caption">Wind</h4>
            </div>
            <div className="relative h-[110px]">
                <Doughnut data={data} options={options} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-3">
                    <span className="text-2xl font-bold text-lime-500">{windSpeed.toFixed(1)}</span>
                    <span className="text-xs text-gray-500">m/s</span>
                    <span className="text-xs text-gray-400 mt-0.5">
                        {getCardinal(windDirection)} {windDirection.toFixed(0)}°
                    </span>
                </div>
            </div>
        </div>
    );
}

function WindDetail({ weatherData }) {
    const uComponent = weatherData.wind?.u_component || 0;
    const vComponent = weatherData.wind?.v_component || 0;
    const maxComponent = 15;

    return (
        <div className="chart-container">
            <h4 className="text-caption mb-3">Wind Components</h4>
            <div className="space-y-4">
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-gray-400">U (East-West)</span>
                        <span className="text-mono text-sm text-lime-500">{uComponent.toFixed(2)}</span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-bar-fill progress-bar-lime"
                            style={{ width: `${Math.min(100, (Math.abs(uComponent) / maxComponent) * 100)}%` }}
                        />
                    </div>
                </div>
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-gray-400">V (North-South)</span>
                        <span className="text-mono text-sm text-electric-500">{vComponent.toFixed(2)}</span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-bar-fill progress-bar-electric"
                            style={{ width: `${Math.min(100, (Math.abs(vComponent) / maxComponent) * 100)}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function LocationInfo({ weatherData }) {
    return (
        <div className="chart-container">
            <div className="flex items-center gap-2 mb-3">
                <span className="text-electric-500"><LocationIcon /></span>
                <h4 className="text-caption">Location Details</h4>
            </div>
            <div className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                    <span className="text-gray-500">Coordinates</span>
                    <span className="text-mono text-gray-300 text-xs">
                        {weatherData.actual?.latitude?.toFixed(4)}°N, {weatherData.actual?.longitude?.toFixed(4)}°E
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-500">Temperature</span>
                    <span className="text-mono text-gray-300 text-xs">
                        {weatherData.temperature?.fahrenheit?.toFixed(1)}°F / {weatherData.temperature?.kelvin?.toFixed(1)}K
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-500">Pressure</span>
                    <span className="text-mono text-gray-300 text-xs">
                        {weatherData.pressure?.pascal?.toLocaleString()} Pa
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-gray-500">Timestamp</span>
                    <span className="text-mono text-electric-400 text-xs">
                        {new Date(weatherData.timestamp).toLocaleTimeString()}
                    </span>
                </div>
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="card p-6 h-full flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center mb-4 glow-electric">
                <svg className="w-7 h-7 text-electric-500" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" opacity="0.15" />
                    <rect x="6" y="10" width="3" height="8" rx="1" fill="currentColor" />
                    <rect x="10.5" y="6" width="3" height="12" rx="1" fill="currentColor" opacity="0.7" />
                    <rect x="15" y="8" width="3" height="10" rx="1" fill="currentColor" />
                </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-300 mb-1">
                No Location Selected
            </h3>
            <p className="text-xs text-gray-500 max-w-[200px]">
                Select a location on the map to view detailed weather analysis
            </p>
        </div>
    );
}

function LoadingState() {
    return (
        <div className="card p-6 h-full flex flex-col items-center justify-center">
            <div className="spinner spinner-lg mb-3" />
            <p className="text-xs text-gray-500">Loading data...</p>
        </div>
    );
}

export default function AnalysisPanel({ weatherData, selectedLocation, isLoading }) {
    if (isLoading) {
        return <LoadingState />;
    }

    if (!weatherData) {
        return <EmptyState />;
    }

    return (
        <div className="space-y-3 fade-in">
            <VariablesChart weatherData={weatherData} />
            <div className="grid grid-cols-2 gap-3">
                <WindGauge weatherData={weatherData} />
                <WindDetail weatherData={weatherData} />
            </div>
            <LocationInfo weatherData={weatherData} />
        </div>
    );
}
