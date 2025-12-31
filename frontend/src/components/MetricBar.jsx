/**
 * MetricBar Component
 * Compact summary bar with duotone icons
 */

// Duotone Temperature Icon
const TempIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <path d="M12 14V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="17" r="4" fill="currentColor" opacity="0.2" />
        <circle cx="12" cy="17" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 14V6C8 4.89543 8.89543 4 10 4H14C15.1046 4 16 4.89543 16 6V14" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="17" r="2" fill="currentColor" />
    </svg>
);

// Duotone Rain Icon
const RainIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <path d="M4 14.899A5.5 5.5 0 0 1 6.5 4.5H7a6 6 0 0 1 11.937 1A5.002 5.002 0 0 1 19 15"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8 19L7 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        <path d="M12 17L11 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 19L15 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        <path d="M12 21L11 23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    </svg>
);

// Duotone Pressure Icon (Gauge)
const PressureIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
            fill="currentColor" opacity="0.15" />
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 7V12L15 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
);

// Duotone Wind Icon
const WindIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <path d="M9.59 4.59A2 2 0 1 1 11 8H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12.59 19.41A2 2 0 1 0 14 16H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
        <path d="M17.73 7.27A2.5 2.5 0 1 1 19.5 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const METRICS = [
    {
        id: 'temperature',
        label: 'Temperature',
        getValue: (data) => data?.temperature?.celsius?.toFixed(1),
        unit: '°C',
        icon: TempIcon,
        accentColor: 'text-temp',
        bgColor: 'bg-temp',
    },
    {
        id: 'precipitation',
        label: 'Precipitation',
        getValue: (data) => data?.precipitation?.millimeters?.toFixed(2),
        unit: 'mm',
        icon: RainIcon,
        accentColor: 'text-electric',
        bgColor: 'bg-rain',
    },
    {
        id: 'pressure',
        label: 'Pressure',
        getValue: (data) => data?.pressure?.hectopascal?.toFixed(0),
        unit: 'hPa',
        icon: PressureIcon,
        accentColor: 'text-pressure',
        bgColor: 'bg-pressure',
    },
    {
        id: 'wind',
        label: 'Wind Speed',
        getValue: (data) => data?.wind?.speed?.toFixed(1),
        unit: 'm/s',
        icon: WindIcon,
        accentColor: 'text-lime',
        bgColor: 'bg-wind',
    },
];

function MetricItem({ config, weatherData, isLoading }) {
    const Icon = config.icon;
    const value = weatherData ? config.getValue(weatherData) : '--';

    return (
        <div className="metric-card flex items-center gap-3 group">
            <div className={`icon-wrapper ${config.bgColor} ${config.accentColor} transition-fast group-hover:scale-105`}>
                <Icon />
            </div>
            <div className="flex-1 min-w-0">
                <p className="metric-label">{config.label}</p>
                <div className="flex items-baseline gap-1">
                    {isLoading ? (
                        <div className="skeleton w-14 h-6" />
                    ) : (
                        <>
                            <span className="metric-value">{value}</span>
                            <span className="metric-unit">{config.unit}</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// Duotone Cursor Icon
const CursorIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <path d="M4 4L10.5 20L13 13L20 10.5L4 4Z" fill="currentColor" opacity="0.15" />
        <path d="M4 4L10.5 20L13 13L20 10.5L4 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13 13L19 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export default function MetricBar({ weatherData, isLoading }) {
    if (!weatherData && !isLoading) {
        return (
            <div className="glass rounded-xl p-4">
                <div className="flex items-center justify-center gap-3 text-gray-500">
                    <span className="text-electric-500">
                        <CursorIcon />
                    </span>
                    <span className="text-sm">Click on the map to view weather data</span>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {METRICS.map((metric) => (
                <MetricItem
                    key={metric.id}
                    config={metric}
                    weatherData={weatherData}
                    isLoading={isLoading}
                />
            ))}
        </div>
    );
}
