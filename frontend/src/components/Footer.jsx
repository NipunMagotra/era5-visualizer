const ExternalLinkIcon = () => (
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
        <path d="M18 13V19C18 20.1046 17.1046 21 16 21H5C3.89543 21 3 20.1046 3 19V8C3 6.89543 3.89543 6 5 6H11"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M15 3H21V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 14L21 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const DataIcon = () => (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
        <ellipse cx="12" cy="6" rx="8" ry="3" fill="currentColor" opacity="0.15" />
        <ellipse cx="12" cy="6" rx="8" ry="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 6V18C4 19.6569 7.58172 21 12 21C16.4183 21 20 19.6569 20 18V6"
            stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
        <path d="M4 12C4 13.6569 7.58172 15 12 15C16.4183 15 20 13.6569 20 12"
            stroke="currentColor" strokeWidth="1.5" />
    </svg>
);

export default function Footer() {
    return (
        <footer className="mt-auto px-4 md:px-6 lg:px-8 py-4">
            <div className="max-w-[1440px] mx-auto">
                <div className="divider mb-4" />
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                        <span className="text-electric-500"><DataIcon /></span>
                        <span>ERA5 Climate Dashboard</span>
                        <span className="text-gray-700">·</span>
                        <span className="text-gray-600">Indian Subcontinent</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <a
                            href="https://cds.climate.copernicus.eu/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 hover:text-electric-400 transition-fast"
                        >
                            Copernicus CDS
                            <ExternalLinkIcon />
                        </a>
                        <span className="text-gray-700">·</span>
                        <a
                            href="https://www.ecmwf.int/en/forecasts/datasets/reanalysis-datasets/era5"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 hover:text-electric-400 transition-fast"
                        >
                            ERA5 Docs
                            <ExternalLinkIcon />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
