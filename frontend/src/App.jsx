import { useState, useCallback } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import WeatherMap from './components/WeatherMap';
import MetricBar from './components/MetricBar';
import AnalysisPanel from './components/AnalysisPanel';
import { weatherService } from './services/api';

function App() {
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [weatherData, setWeatherData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLocationSelect = useCallback(async (lat, lon) => {
        setIsLoading(true);
        setError(null);
        setSelectedLocation({ lat, lon });

        try {
            const data = await weatherService.getWeatherAtPoint(lat, lon);
            setWeatherData(data);
        } catch (err) {
            console.error('Failed to fetch weather data:', err);
            setError(
                err.response?.data?.message ||
                'Unable to fetch weather data. Please check your connection.'
            );
            setWeatherData(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return (
        <div className="min-h-screen bg-black">
            <Header />

            <main className="px-4 md:px-6 lg:px-8 pb-6">
                <div className="max-w-[1440px] mx-auto">
                    {error && (
                        <div className="mb-4 p-4 rounded-xl glass border border-red-500/30 fade-in">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <p className="text-sm text-red-400 flex-1">{error}</p>
                                <button
                                    onClick={() => setError(null)}
                                    className="text-red-400/60 hover:text-red-400 transition-fast"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    <section className="mb-4">
                        <MetricBar weatherData={weatherData} isLoading={isLoading} />
                    </section>

                    <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        <div className="lg:col-span-7 xl:col-span-8">
                            <div className="card p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-caption">Coverage</span>
                                        <span className="badge badge-electric">India</span>
                                    </div>
                                    {selectedLocation && (
                                        <span className="text-mono text-gray-400 text-xs">
                                            {selectedLocation.lat.toFixed(4)}°N, {selectedLocation.lon.toFixed(4)}°E
                                        </span>
                                    )}
                                </div>
                                <WeatherMap
                                    selectedLocation={selectedLocation}
                                    onLocationSelect={handleLocationSelect}
                                    weatherData={weatherData}
                                    isLoading={isLoading}
                                />
                            </div>
                        </div>

                        <div className="lg:col-span-5 xl:col-span-4">
                            <AnalysisPanel
                                weatherData={weatherData}
                                selectedLocation={selectedLocation}
                                isLoading={isLoading}
                            />
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default App;
