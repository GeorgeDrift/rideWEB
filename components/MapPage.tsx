
import React, { useEffect, useRef, useState } from 'react';
import { MapIcon, CarIcon, SteeringWheelIcon, CloseIcon } from './Icons';
import { ApiService, MapService } from '../services/api';

const MAPBOX_TOKEN: string = 'pk.eyJ1IjoicGF0cmljay0xIiwiYSI6ImNtaTh0cGR2ajBmbmUybnNlZTk1dGV1NGEifQ.UCC5FLCAdiDj0EL93gnekg';

declare global {
    interface Window {
        mapboxgl: any;
    }
}

export const MapPage: React.FC = () => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const [mapError, setMapError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'drivers' | 'riders'>('all');
    const [isSimulating, setIsSimulating] = useState(false);
    const [trackingId, setTrackingId] = useState('');
    const [tripStatus, setTripStatus] = useState<string | null>(null);
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        if (!window.mapboxgl) {
            setMapError("Mapbox library not loaded");
            return;
        }
        if (map.current) return;

        if (!MAPBOX_TOKEN) {
            setMapError("Mapbox Token not set");
            return;
        }

        window.mapboxgl.accessToken = MAPBOX_TOKEN;
        
        const initializeMap = () => {
            try {
                const mapInstance = new window.mapboxgl.Map({
                    container: mapContainer.current,
                    style: 'mapbox://styles/mapbox/dark-v11',
                    center: [-73.9851, 40.7589],
                    zoom: 13,
                    pitch: 45,
                    bearing: 0,
                    antialias: true,
                    attributionControl: false 
                });

                map.current = mapInstance;

                // Add Navigation Controls safely
                try {
                    mapInstance.addControl(new window.mapboxgl.NavigationControl(), 'top-right');
                } catch (e) { console.warn("Nav control error", e); }

                // Add Geolocation Control safely
                const geolocate = new window.mapboxgl.GeolocateControl({
                    positionOptions: {
                        enableHighAccuracy: true
                    },
                    trackUserLocation: true,
                    showUserHeading: true
                });
                try {
                     mapInstance.addControl(geolocate, 'top-right');
                } catch (e) { console.warn("Geolocate control error", e); }

                mapInstance.on('load', async () => {
                    // Automatically ask for location permission when map loads
                    try {
                        geolocate.trigger();
                    } catch (e) {
                        console.warn("Geolocation trigger blocked", e);
                    }

                    // Add markers from API
                    // Load vehicles from API (async)
                    try {
                        const vehicles = await ApiService.getMapVehicles();
                        (vehicles || []).forEach((v: any) => {
                        const el = document.createElement('div');
                        el.className = `w-4 h-4 rounded-full border-2 border-white dark:border-dark-800 shadow-lg cursor-pointer transition-transform hover:scale-125 ${v.type === 'driver' ? 'driver-marker' : 'rider-marker'}`;
                        el.style.backgroundColor = v.type === 'driver' ? '#FACC15' : '#3b82f6'; // Yellow for drivers, Blue for riders
                        
                        new window.mapboxgl.Marker(el)
                            .setLngLat([v.lng, v.lat])
                            .addTo(mapInstance);
                        });
                    } catch (e) {
                        console.warn('Failed to load map vehicles', e);
                    }
                });

                // Add error listener for potential async failures and specific frame blocking issues
                mapInstance.on('error', (e: any) => {
                    // Suppress "blocked frame" security errors in preview environments or iframe sandboxes
                    if (e.error && e.error.message && (e.error.message.includes('Blocked a frame') || e.error.message.includes('Location'))) {
                        console.warn("Mapbox restricted environment error caught (non-fatal).");
                        return; 
                    }
                    console.warn("Mapbox internal error:", e);
                });

            } catch (error: any) {
                console.error("Mapbox initialization failed:", error);
                
                // Handle specific initialization errors related to restricted frames
                if (error.message && (error.message.includes('Location') || error.message.includes('href'))) {
                    console.warn("Mapbox encountered a restricted iframe environment issue.");
                    // Optionally proceed or set a different error
                    setMapError("Mapbox Restricted: Please view in full browser.");
                } else {
                    setMapError("Failed to load map: " + (error.message || "Unknown error"));
                }
            }
        };

        // Initialize with a slight delay to ensure container is ready
        const timer = setTimeout(initializeMap, 50);

        return () => {
            clearTimeout(timer);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    // Filter effect (Mock implementation - in real app would toggle layers)
    useEffect(() => {
        const driverMarkers = document.querySelectorAll('.driver-marker');
        const riderMarkers = document.querySelectorAll('.rider-marker');

        if (filter === 'all') {
            driverMarkers.forEach((el: any) => el.style.display = 'block');
            riderMarkers.forEach((el: any) => el.style.display = 'block');
        } else if (filter === 'drivers') {
            driverMarkers.forEach((el: any) => el.style.display = 'block');
            riderMarkers.forEach((el: any) => el.style.display = 'none');
        } else {
            driverMarkers.forEach((el: any) => el.style.display = 'none');
            riderMarkers.forEach((el: any) => el.style.display = 'block');
        }
    }, [filter]);

    const simulateTrip = async () => {
        if (!map.current || !MAPBOX_TOKEN) return;
        
        // Clear previous animation if any
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        // Remove existing route/markers if any
        if (map.current.getSource('route')) {
            if (map.current.getLayer('route')) map.current.removeLayer('route');
            map.current.removeSource('route');
        }
        if (markerRef.current) markerRef.current.remove();

        setIsSimulating(true);
        setTripStatus("Locating Device...");

        // --- BACKEND LOGIC CALL ---
        // Call the robust trackDevice method from ApiService which simulates backend routing logic
        // or connects to a real backend if configured.
        const routeData = await MapService.trackDevice(trackingId || 'DEVICE-001', MAPBOX_TOKEN);
        // --------------------------

        if (!routeData || !routeData.routes || !routeData.routes[0]) {
            setTripStatus("Signal lost or route calculation failed.");
            setIsSimulating(false);
            return;
        }

        const routeGeoJSON = routeData.routes[0].geometry;
        const coordinates = routeGeoJSON.coordinates;
        const duration = routeData.routes[0].duration;
        const distance = routeData.routes[0].distance;

        setTripStatus(`Tracking Active • ${(distance / 1000).toFixed(1)}km • ${(duration / 60).toFixed(0)} min ETA`);

        // 1. Draw the Route Line
        map.current.addSource('route', {
            type: 'geojson',
            data: {
                type: 'Feature',
                properties: {},
                geometry: routeGeoJSON
            }
        });

        map.current.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint: {
                'line-color': '#FACC15',
                'line-width': 5,
                'line-opacity': 0.8
            }
        });

        // 2. Create Tracking Marker
        const el = document.createElement('div');
        el.className = 'w-6 h-6 bg-primary-500 rounded-full border-4 border-white dark:border-dark-900 shadow-xl flex items-center justify-center z-50';
        el.innerHTML = '<div class="w-2 h-2 bg-black rounded-full animate-pulse"></div>';
        
        markerRef.current = new window.mapboxgl.Marker(el)
            .setLngLat(coordinates[0])
            .addTo(map.current);

        // Zoom to fit route
        const bounds = new window.mapboxgl.LngLatBounds(coordinates[0], coordinates[0]);
        for (const coord of coordinates) {
            bounds.extend(coord as [number, number]);
        }
        map.current.fitBounds(bounds, { padding: 100 });

        // 3. Animate Marker along path
        // We'll skip frames to speed up the simulation
        let step = 0;
        const speedFactor = 2; 

        const animate = () => {
            if (step < coordinates.length) {
                markerRef.current.setLngLat(coordinates[step]);
                // Optional: Pan map to follow car
                // map.current.panTo(coordinates[step]); 
                step += speedFactor;
                animationRef.current = requestAnimationFrame(animate);
            } else {
                setTripStatus("Vehicle Arrived at Destination");
                setIsSimulating(false);
            }
        };

        animate();
    };

    const stopSimulation = () => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
        setIsSimulating(false);
        setTripStatus("Tracking Paused");
    };

    return (
        <div className="relative h-[calc(100vh-8rem)] rounded-xl overflow-hidden border border-gray-300 dark:border-dark-700 shadow-sm group">
            {mapError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-dark-900 text-center p-6">
                    <MapIcon className="h-16 w-16 mb-4 text-gray-400" />
                    <p className="text-lg font-medium text-gray-600 dark:text-gray-300">{mapError}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Please check your internet connection or API Key configuration.</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="mt-4 px-4 py-2 bg-primary-500 text-black font-bold rounded-lg hover:bg-primary-600 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            ) : (
                <>
                    <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
                    
                    {/* Overlay Controls */}
                    <div className="absolute top-4 left-4 z-10 flex flex-col space-y-3">
                         <div className="bg-white/90 dark:bg-dark-800/90 backdrop-blur-md p-1 rounded-lg border border-gray-200 dark:border-dark-600 shadow-lg flex space-x-1">
                            <button 
                                onClick={() => setFilter('all')}
                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${filter === 'all' ? 'bg-gray-900 text-white dark:bg-white dark:text-black' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700'}`}
                            >
                                All
                            </button>
                            <button 
                                onClick={() => setFilter('drivers')}
                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${filter === 'drivers' ? 'bg-[#FACC15] text-black' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700'}`}
                            >
                                Drivers
                            </button>
                            <button 
                                onClick={() => setFilter('riders')}
                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${filter === 'riders' ? 'bg-blue-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700'}`}
                            >
                                Riders
                            </button>
                        </div>

                        <div className="bg-white/90 dark:bg-dark-800/90 backdrop-blur-md p-4 rounded-xl border border-gray-200 dark:border-dark-600 shadow-lg w-72">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                                <SteeringWheelIcon className="w-4 h-4 mr-2 text-primary-500" />
                                Simulate Tracking
                            </h3>
                            <div className="flex space-x-2 mb-3">
                                <input 
                                    type="text" 
                                    placeholder="Device ID (e.g. TRK-001)" 
                                    value={trackingId}
                                    onChange={(e) => setTrackingId(e.target.value)}
                                    className="flex-1 bg-gray-100 dark:bg-dark-700 border-none rounded-lg px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                                <button 
                                    onClick={isSimulating ? stopSimulation : simulateTrip}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${isSimulating ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-primary-500 text-black hover:bg-primary-600'}`}
                                >
                                    {isSimulating ? 'Stop' : 'Track'}
                                </button>
                            </div>
                            {tripStatus && (
                                <div className="text-[10px] font-mono p-2 bg-gray-100 dark:bg-dark-900 rounded text-gray-600 dark:text-gray-300 border-l-2 border-primary-500">
                                    {tripStatus}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="absolute bottom-6 right-4 bg-white/90 dark:bg-dark-800/90 backdrop-blur-md p-3 rounded-lg border border-gray-200 dark:border-dark-600 shadow-lg flex flex-col gap-2">
                        <div className="flex items-center text-xs font-medium text-gray-700 dark:text-gray-300">
                            <span className="w-3 h-3 rounded-full bg-[#FACC15] border border-white dark:border-dark-900 mr-2 shadow-sm"></span>
                            Active Driver
                        </div>
                        <div className="flex items-center text-xs font-medium text-gray-700 dark:text-gray-300">
                            <span className="w-3 h-3 rounded-full bg-[#3b82f6] border border-white dark:border-dark-900 mr-2 shadow-sm"></span>
                            Rider Request
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
