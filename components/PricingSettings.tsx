
import React, { useState, useEffect, useRef } from 'react';
import { MapIcon, TagIcon, PlusIcon, ExpandIcon, CloseIcon } from './Icons';
import { ApiService, PricingZone } from '../services/api';

// Placeholder for Mapbox Token - User must replace this with a valid token
const MAPBOX_TOKEN: string = 'pk.eyJ1IjoicGF0cmljay0xIiwiYSI6ImNtaTh0cGR2ajBmbmUybnNlZTk1dGV1NGEifQ.UCC5FLCAdiDj0EL93gnekg';

declare global {
    interface Window {
        mapboxgl: any;
    }
}

export const PricingSettings: React.FC = () => {
    const [baseFare, setBaseFare] = useState(5.00);
    const [perKm, setPerKm] = useState(1.50);
    const [perMin, setPerMin] = useState(0.50);
    const [isExpanded, setIsExpanded] = useState(false);
    const [mapError, setMapError] = useState<string | null>(null);

    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<any>(null);

    const [zones, setZones] = useState<PricingZone[]>([]);

    // Fetch pricing zones from backend
    useEffect(() => {
        const fetchZones = async () => {
            const data = await ApiService.getPricingZones();
            setZones(data);
        };
        fetchZones();
    }, []);

    const [newZoneName, setNewZoneName] = useState('');

    // Function to add zone logic - defined here to be accessible
    const addZoneToMap = (zone: PricingZone) => {
        if (!map.current) return;

        // Check if source exists to avoid duplicates
        if (map.current.getSource(`route-${zone.id}`)) return;

        // Add the route line
        try {
            map.current.addSource(`route-${zone.id}`, {
                'type': 'geojson',
                'data': {
                    'type': 'Feature',
                    'properties': {},
                    'geometry': {
                        'type': 'LineString',
                        'coordinates': zone.coordinates
                    }
                }
            });

            map.current.addLayer({
                'id': `route-${zone.id}`,
                'type': 'line',
                'source': `route-${zone.id}`,
                'layout': {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                'paint': {
                    'line-color': zone.color,
                    'line-width': 8,
                    'line-opacity': 0.8
                }
            });

            // Add markers for start and end
            new window.mapboxgl.Marker({ color: zone.color })
                .setLngLat(zone.coordinates[0])
                .addTo(map.current);

            new window.mapboxgl.Marker({ color: zone.color })
                .setLngLat(zone.coordinates[zone.coordinates.length - 1])
                .addTo(map.current);
        } catch (e) { console.warn("Failed to add zone layer", e); }
    };

    useEffect(() => {
        if (!window.mapboxgl) return;
        if (map.current) return; // initialize map only once

        // Prevent initialization with placeholder token to avoid crashes/errors
        if (MAPBOX_TOKEN === 'YOUR_MAPBOX_ACCESS_TOKEN_HERE' || !MAPBOX_TOKEN) {
            setMapError("Mapbox Token not set");
            return;
        }

        window.mapboxgl.accessToken = MAPBOX_TOKEN;

        const initMap = () => {
            try {
                map.current = new window.mapboxgl.Map({
                    container: mapContainer.current,
                    style: 'mapbox://styles/mapbox/dark-v11',
                    center: [-73.935242, 40.730610], // Center on NYC
                    zoom: 12,
                    pitch: 60, // Enable 3D pitch
                    bearing: -17.6,
                    antialias: true // create the gl context with MSAA antialiasing
                });

                map.current.on('load', () => {
                    // Insert the layer beneath any symbol layer.
                    const layers = map.current.getStyle().layers;
                    const labelLayerId = layers.find(
                        (layer: any) => layer.type === 'symbol' && layer.layout['text-field']
                    )?.id;

                    if (labelLayerId) {
                        try {
                            // 3D Buildings Layer
                            map.current.addLayer(
                                {
                                    'id': '3d-buildings',
                                    'source': 'composite',
                                    'source-layer': 'building',
                                    'filter': ['==', 'extrude', 'true'],
                                    'type': 'fill-extrusion',
                                    'minzoom': 15,
                                    'paint': {
                                        'fill-extrusion-color': '#aaa',
                                        'fill-extrusion-height': [
                                            'interpolate',
                                            ['linear'],
                                            ['zoom'],
                                            15,
                                            0,
                                            15.05,
                                            ['get', 'height']
                                        ],
                                        'fill-extrusion-base': [
                                            'interpolate',
                                            ['linear'],
                                            ['zoom'],
                                            15,
                                            0,
                                            15.05,
                                            ['get', 'min_height']
                                        ],
                                        'fill-extrusion-opacity': 0.6
                                    }
                                },
                                labelLayerId
                            );
                        } catch (e) { console.warn("Building layer error", e); }
                    }

                    // Draw zones on map
                    zones.forEach(zone => {
                        addZoneToMap(zone);
                    });
                });

                map.current.on('error', (e: any) => {
                    // Suppress specific errors in preview environments
                    if (e.error?.message?.includes('Blocked a frame') || e.error?.message?.includes('Location')) return;
                    console.warn("Mapbox runtime warning:", e);
                });

            } catch (error) {
                console.error("Error initializing Mapbox:", error);
                setMapError("Failed to load map");
            }
        };

        const timer = setTimeout(initMap, 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Update map layers if zones change
        if (!map.current || !map.current.isStyleLoaded()) return;

        zones.forEach(zone => {
            if (!map.current.getSource(`route-${zone.id}`)) {
                addZoneToMap(zone);
            }
        });
    }, [zones]);

    // Handle resize when expanded state changes
    useEffect(() => {
        if (map.current) {
            // Slight delay to allow container transition to start
            setTimeout(() => {
                map.current.resize();
            }, 300);
        }
    }, [isExpanded]);

    const handleAddZone = () => {
        if (newZoneName) {
            const newId = Date.now();
            const newZone = {
                id: newId,
                name: newZoneName,
                multiplier: 1.2,
                color: '#3b82f6',
                coordinates: [
                    [-73.9, 40.7], // Placeholder coords
                    [-73.95, 40.75]
                ]
            };
            setZones([...zones, newZone]);
            setNewZoneName('');
        }
    };

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="space-y-6">
            {/* Backdrop for expanded view */}
            {isExpanded && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity duration-300"
                    onClick={toggleExpand}
                />
            )}

            <div className="flex flex-col md:flex-row gap-6">
                {/* Standard Pricing Card */}
                <div className="flex-1 bg-white dark:bg-dark-800 p-6 rounded-xl border border-gray-300 dark:border-dark-700 shadow-sm">
                    <div className="flex items-center mb-6">
                        <div className="p-2 bg-primary-100 dark:bg-primary-500/20 rounded-lg mr-4">
                            <TagIcon className="h-6 w-6 text-primary-600 dark:text-primary-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Base Pricing</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Set standard rates for rides</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Base Fare (MWK)</label>
                            <input
                                type="number"
                                value={baseFare}
                                onChange={(e) => setBaseFare(parseFloat(e.target.value))}
                                className="w-full bg-gray-50 dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rate per km (MWK)</label>
                            <input
                                type="number"
                                value={perKm}
                                onChange={(e) => setPerKm(parseFloat(e.target.value))}
                                className="w-full bg-gray-50 dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rate per min (MWK)</label>
                            <input
                                type="number"
                                value={perMin}
                                onChange={(e) => setPerMin(parseFloat(e.target.value))}
                                className="w-full bg-gray-50 dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                        <button className="w-full mt-4 bg-primary-500 hover:bg-primary-600 text-black font-bold py-2 rounded-lg transition-colors">
                            Update Rates
                        </button>
                    </div>
                </div>

                {/* Surge Zones List */}
                <div className="flex-1 bg-white dark:bg-dark-800 p-6 rounded-xl border border-gray-300 dark:border-dark-700 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg mr-4">
                                <MapIcon className="h-6 w-6 text-blue-600 dark:text-blue-500" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Surge Routes</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Manage dynamic pricing routes</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 mb-4 h-48 md:h-auto no-scrollbar">
                        {zones.map(zone => (
                            <div key={zone.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg border border-gray-200 dark:border-dark-600">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: zone.color }}></div>
                                    <span className="font-medium text-gray-900 dark:text-white text-sm">{zone.name}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">Multiplier:</span>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={zone.multiplier}
                                        className="w-16 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-500 rounded px-2 py-1 text-sm text-center text-gray-900 dark:text-white font-bold"
                                        readOnly
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-200 dark:border-dark-600">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Route Name"
                                value={newZoneName}
                                onChange={(e) => setNewZoneName(e.target.value)}
                                className="flex-1 bg-gray-50 dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <button
                                onClick={handleAddZone}
                                className="bg-dark-700 dark:bg-dark-600 hover:bg-dark-600 dark:hover:bg-dark-500 text-white p-2 rounded-lg"
                            >
                                <PlusIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mapbox Map Container */}
            <div
                className={`bg-white dark:bg-dark-800 rounded-xl border border-gray-300 dark:border-dark-700 shadow-sm overflow-hidden transition-all duration-500 ease-in-out flex flex-col ${isExpanded
                        ? 'fixed inset-4 z-50 h-auto shadow-2xl border-2 border-primary-500/50'
                        : 'relative h-96 w-full'
                    }`}
            >
                <div className="p-4 border-b border-gray-200 dark:border-dark-700 flex justify-between items-center bg-gray-50 dark:bg-dark-700/50 shrink-0">
                    <div className="flex items-center space-x-4">
                        <span className="font-semibold text-gray-700 dark:text-gray-200 flex items-center">
                            Live Surge Map
                            {isExpanded && !mapError && <span className="ml-2 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-500 px-2 py-0.5 rounded-full">3D View Active</span>}
                        </span>
                        <div className="hidden sm:flex space-x-2">
                            <span className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">High Surge (2.5x)</span>
                            <span className="px-3 py-1 rounded-full text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800">Med Surge (1.8x)</span>
                        </div>
                    </div>

                    <button
                        onClick={toggleExpand}
                        className={`p-2 rounded-lg transition-colors ${isExpanded ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30' : 'hover:bg-gray-200 dark:hover:bg-dark-600 text-gray-500 dark:text-gray-400'}`}
                        title={isExpanded ? "Close Fullscreen" : "Expand Map"}
                    >
                        {isExpanded ? <CloseIcon className="h-5 w-5" /> : <ExpandIcon className="h-5 w-5" />}
                    </button>
                </div>
                <div className="relative flex-1 bg-gray-100 dark:bg-dark-900 w-full h-full group">
                    {/* Map Container */}
                    {mapError ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-gray-500 dark:text-gray-400">
                            <MapIcon className="h-12 w-12 mb-3 opacity-20" />
                            <p className="font-medium">Map Unavailable</p>
                            <p className="text-xs mt-1 max-w-xs opacity-70">Add a valid Mapbox Access Token to the code to enable the live map view.</p>
                        </div>
                    ) : (
                        <div ref={mapContainer} className="absolute inset-0" />
                    )}

                    {/* Overlay to hint at clickability when not expanded. Use z-30. 
                        Updated to be always clickable if not expanded, regardless of error status */}
                    {!isExpanded && (
                        <div
                            className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 cursor-pointer transition-all z-30"
                            onClick={toggleExpand}
                        >
                            <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-black/80 text-white px-5 py-3 rounded-full flex items-center shadow-lg backdrop-blur-sm border border-white/10">
                                <ExpandIcon className="h-5 w-5 mr-2" />
                                <span className="font-semibold">Click to View Full Map</span>
                            </div>
                        </div>
                    )}

                    {/* Fallback Message if token is missing/invalid (visual aid only) */}
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded z-10 pointer-events-none">
                        Powered by Mapbox
                    </div>
                </div>
            </div>
        </div>
    );
};
