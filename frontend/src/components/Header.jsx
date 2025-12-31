/**
 * Header Component
 * Minimalist header with geometric tech logo and duotone icons
 */
import { useState, useEffect } from 'react';
import { weatherService } from '../services/api';

// Geometric Tech Logo - Hexagonal Circuit Design
const TechLogo = () => (
    <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none">
        {/* Hexagon Background */}
        <path
            d="M20 2L36.5 11V29L20 38L3.5 29V11L20 2Z"
            fill="url(#logoGradient)"
            opacity="0.15"
        />
        {/* Hexagon Border */}
        <path
            d="M20 2L36.5 11V29L20 38L3.5 29V11L20 2Z"
            stroke="url(#logoGradient)"
            strokeWidth="1.5"
            fill="none"
        />
        {/* Inner Circuit Lines */}
        <path
            d="M20 10V20M20 20L28 15M20 20L28 25M20 20L12 15M20 20L12 25"
            stroke="url(#logoGradient)"
            strokeWidth="1.5"
            strokeLinecap="round"
        />
        {/* Center Node */}
        <circle cx="20" cy="20" r="3" fill="url(#logoGradient)" />
        {/* Corner Nodes */}
        <circle cx="20" cy="10" r="2" fill="#007BFF" />
        <circle cx="28" cy="15" r="1.5" fill="#32FF00" opacity="0.8" />
        <circle cx="28" cy="25" r="1.5" fill="#32FF00" opacity="0.8" />
        <circle cx="12" cy="15" r="1.5" fill="#007BFF" opacity="0.6" />
        <circle cx="12" cy="25" r="1.5" fill="#007BFF" opacity="0.6" />

        <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#007BFF" />
                <stop offset="100%" stopColor="#32FF00" />
            </linearGradient>
        </defs>
    </svg>
);

// Duotone Globe Icon
const GlobeIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" fill="currentColor" opacity="0.15" />
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <ellipse cx="12" cy="12" rx="4" ry="9" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 12H21" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 3C12 3 16 7.5 16 12C16 16.5 12 21 12 21" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
    </svg>
);

// Duotone Signal Icon for Status
const SignalIcon = ({ isOnline }) => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="16" width="4" height="6" rx="1" fill="currentColor" opacity={isOnline ? 1 : 0.3} />
        <rect x="8" y="12" width="4" height="10" rx="1" fill="currentColor" opacity={isOnline ? 1 : 0.3} />
        <rect x="14" y="8" width="4" height="14" rx="1" fill="currentColor" opacity={isOnline ? 0.7 : 0.2} />
        <rect x="20" y="4" width="4" height="18" rx="1" fill="currentColor" opacity={isOnline ? 0.4 : 0.1} />
    </svg>
);

export default function Header() {
    const [status, setStatus] = useState('checking');
    const [datasetInfo, setDatasetInfo] = useState(null);

    useEffect(() => {
        checkHealth();
    }, []);

    const checkHealth = async () => {
        try {
            const health = await weatherService.healthCheck();
            setStatus(health.service_available ? 'online' : 'offline');

            if (health.service_available) {
                const info = await weatherService.getDatasetInfo();
                setDatasetInfo(info);
            }
        } catch (error) {
            console.error('Health check failed:', error);
            setStatus('offline');
        }
    };

    return (
        <header className="px-4 md:px-6 lg:px-8 py-4">
            <div className="max-w-[1440px] mx-auto">
                <div className="flex items-center justify-between">
                    {/* Logo and Title */}
                    <div className="flex items-center gap-3">
                        <TechLogo />
                        <div>
                            <h1 className="text-base font-semibold text-gray-100 tracking-tight">
                                ERA5 Climate
                            </h1>
                            <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                <GlobeIcon />
                                <span>Indian Subcontinent</span>
                            </p>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="flex items-center gap-4">
                        {/* Dataset Info - Desktop Only */}
                        {datasetInfo && (
                            <div className="hidden md:flex items-center gap-2 text-xs">
                                <span className="text-gray-500">Source:</span>
                                <span className="text-mono text-gray-400">{datasetInfo.file || 'ERA5'}</span>
                            </div>
                        )}

                        {/* Status Indicator */}
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg glass-subtle ${status === 'online' ? 'text-lime-500' :
                                status === 'offline' ? 'text-red-400' :
                                    'text-gray-500'
                            }`}>
                            <SignalIcon isOnline={status === 'online'} />
                            <span className="text-xs font-medium">
                                {status === 'online' ? 'Live' :
                                    status === 'offline' ? 'Offline' :
                                        'Connecting'}
                            </span>
                            {status === 'online' && (
                                <span className="status-dot status-online" />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
