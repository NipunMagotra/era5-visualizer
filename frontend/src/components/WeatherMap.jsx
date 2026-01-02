import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createMarkerIcon = () => {
    return L.divIcon({
        className: 'custom-marker',
        html: `
            <div style="
                position: relative;
                width: 20px;
                height: 20px;
            ">
                <div style="
                    position: absolute;
                    inset: 0;
                    background: #007BFF;
                    border-radius: 50%;
                    box-shadow: 0 0 20px rgba(0, 123, 255, 0.6), 0 0 40px rgba(0, 123, 255, 0.3);
                    border: 2px solid rgba(255, 255, 255, 0.9);
                "></div>
                <div style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 6px;
                    height: 6px;
                    background: white;
                    border-radius: 50%;
                "></div>
            </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -10],
    });
};

const INDIA_BOUNDS = {
    north: 35.5,
    south: 6.0,
    west: 68.1,
    east: 97.4,
};

const INDIA_CENTER = [22.5, 82.5];

function MapClickHandler({ onLocationSelect, isLoading }) {
    useMapEvents({
        click(e) {
            if (isLoading) return;
            const { lat, lng } = e.latlng;

            if (
                lat >= INDIA_BOUNDS.south &&
                lat <= INDIA_BOUNDS.north &&
                lng >= INDIA_BOUNDS.west &&
                lng <= INDIA_BOUNDS.east
            ) {
                onLocationSelect(lat, lng);
            }
        },
    });
    return null;
}

function BoundsEnforcer() {
    const map = useMap();

    useEffect(() => {
        const bounds = L.latLngBounds(
            [INDIA_BOUNDS.south - 2, INDIA_BOUNDS.west - 2],
            [INDIA_BOUNDS.north + 2, INDIA_BOUNDS.east + 2]
        );
        map.setMaxBounds(bounds);
        map.setMinZoom(4);
        map.setMaxZoom(10);
    }, [map]);

    return null;
}

export default function WeatherMap({ selectedLocation, onLocationSelect, weatherData, isLoading }) {
    const markerIcon = createMarkerIcon();

    return (
        <div className="map-container relative">
            {isLoading && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-[1000] flex items-center justify-center rounded-xl">
                    <div className="text-center">
                        <div className="spinner mx-auto mb-3" />
                        <p className="text-xs text-gray-400">Fetching data...</p>
                    </div>
                </div>
            )}

            <MapContainer
                center={INDIA_CENTER}
                zoom={5}
                style={{ height: '100%', width: '100%' }}
                zoomControl={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                <BoundsEnforcer />
                <MapClickHandler onLocationSelect={onLocationSelect} isLoading={isLoading} />

                {selectedLocation && (
                    <Marker position={[selectedLocation.lat, selectedLocation.lon]} icon={markerIcon}>
                        <Popup>
                            <div className="p-3 min-w-[170px]">
                                <div className="text-xs font-medium text-gray-400 mb-1.5">
                                    Selected Location
                                </div>
                                <div className="text-sm text-gray-100 mb-2.5 font-mono">
                                    {selectedLocation.lat.toFixed(4)}°N, {selectedLocation.lon.toFixed(4)}°E
                                </div>
                                {weatherData && (
                                    <div className="space-y-1 text-xs border-t border-gray-700 pt-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Temp</span>
                                            <span className="text-orange-400 font-medium">{weatherData.temperature?.celsius?.toFixed(1)}°C</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Rain</span>
                                            <span className="text-blue-400 font-medium">{weatherData.precipitation?.millimeters?.toFixed(2)} mm</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Pressure</span>
                                            <span className="text-purple-400 font-medium">{weatherData.pressure?.hectopascal?.toFixed(0)} hPa</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Wind</span>
                                            <span className="text-lime-400 font-medium">{weatherData.wind?.speed?.toFixed(1)} m/s</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                )}
            </MapContainer>

            {!selectedLocation && !isLoading && (
                <div className="absolute bottom-3 left-3 z-[500] pointer-events-none">
                    <div className="glass-subtle inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-400">
                        <svg className="w-4 h-4 text-electric-500" viewBox="0 0 24 24" fill="none">
                            <path d="M4 4L10.5 20L13 13L20 10.5L4 4Z" fill="currentColor" opacity="0.2" />
                            <path d="M4 4L10.5 20L13 13L20 10.5L4 4Z" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M13 13L19 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        Click to select location
                    </div>
                </div>
            )}
        </div>
    );
}
