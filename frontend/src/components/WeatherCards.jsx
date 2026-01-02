const WEATHER_CARDS = [
    {
        id: 'temperature',
        label: 'Temperature',
        icon: '🌡️',
        unit: '°C',
        getValue: (data) => data?.temperature?.celsius?.toFixed(1),
        color: 'from-red-600 to-orange-500',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        description: '2m air temperature',
    },
    {
        id: 'precipitation',
        label: 'Precipitation',
        icon: '🌧️',
        unit: 'mm',
        getValue: (data) => data?.precipitation?.millimeters?.toFixed(2),
        color: 'from-blue-600 to-cyan-500',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
        description: 'Total precipitation',
    },
    {
        id: 'pressure',
        label: 'Pressure',
        icon: '📊',
        unit: 'hPa',
        getValue: (data) => data?.pressure?.hectopascal?.toFixed(0),
        color: 'from-purple-600 to-pink-500',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/30',
        description: 'Surface pressure',
    },
    {
        id: 'windSpeed',
        label: 'Wind Speed',
        icon: '💨',
        unit: 'm/s',
        getValue: (data) => data?.wind?.speed?.toFixed(1),
        color: 'from-green-600 to-emerald-500',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30',
        description: 'Combined wind speed',
    },
    {
        id: 'windDirection',
        label: 'Wind Direction',
        icon: '🧭',
        unit: '°',
        getValue: (data) => data?.wind?.direction?.toFixed(0),
        color: 'from-teal-600 to-cyan-500',
        bgColor: 'bg-teal-500/10',
        borderColor: 'border-teal-500/30',
        description: 'Wind direction',
    },
];

function WeatherCard({ config, weatherData, isLoading }) {
    const value = weatherData ? config.getValue(weatherData) : '--';

    return (
        <div
            className={`
        weather-card glass-card p-5 rounded-xl border
        ${config.bgColor} ${config.borderColor}
        ${isLoading ? 'opacity-50' : ''}
      `}
        >
            <div className="flex items-start justify-between mb-3">
                <div className={`text-3xl p-2 rounded-lg bg-gradient-to-br ${config.color} bg-opacity-20`}>
                    {config.icon}
                </div>
                {weatherData && (
                    <div className="text-xs text-gray-500 bg-dark-700 px-2 py-1 rounded-full">
                        ERA5
                    </div>
                )}
            </div>

            <div className="space-y-1">
                <p className="text-sm text-gray-400 font-medium">{config.label}</p>
                <div className="flex items-baseline gap-1">
                    <span className={`text-3xl font-bold bg-gradient-to-r ${config.color} bg-clip-text text-transparent`}>
                        {isLoading ? (
                            <span className="inline-block w-16 h-8 bg-dark-600 rounded animate-pulse" />
                        ) : (
                            value
                        )}
                    </span>
                    <span className="text-sm text-gray-500">{config.unit}</span>
                </div>
                <p className="text-xs text-gray-600 mt-2">{config.description}</p>
            </div>
        </div>
    );
}

export default function WeatherCards({ weatherData, isLoading }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {WEATHER_CARDS.map((card) => (
                <WeatherCard
                    key={card.id}
                    config={card}
                    weatherData={weatherData}
                    isLoading={isLoading}
                />
            ))}
        </div>
    );
}
