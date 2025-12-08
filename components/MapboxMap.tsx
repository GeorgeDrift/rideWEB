import React, { useRef, useEffect, useState } from 'react';
// Lazy-load mapbox-gl at runtime to avoid boot-time module errors if map functionality was removed
let mapboxgl: any = null;
import { useTheme } from '../context/ThemeContext';

// Use Vite env variable prefix `VITE_` and `import.meta.env` for browser-safe access.
const MAPBOX_TOKEN = (import.meta as any).env?.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoicGF0cmljay0xIiwiYSI6ImNtaTh0cGR2ajBmbmUybnNlZTk1dGV1NGEifQ.UCC5FLCAdiDj0EL93gnekg';

export interface LocationInfo {
    address: string;
    city: string;
    country: string;
    coordinates: [number, number];
}

interface MapboxMapProps {
    center?: [number, number];
    zoom?: number;
    trackDevice?: boolean;
    followDevice?: boolean;
    mapStyle?: 'street' | 'satellite';
    onLocationUpdate?: (location: LocationInfo) => void;
    destination?: [number, number];
    onClick?: () => void;
    driverLocation?: [number, number];
    showDriverMarker?: boolean;
}

// Reverse geocode coordinates to address
const reverseGeocode = async (lng: number, lat: number): Promise<LocationInfo | null> => {
    try {
        const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`
        );
        const data = await response.json();

        if (data.features && data.features.length > 0) {
            const feature = data.features[0];
            const context = feature.context || [];

            // Extract city and country from context
            const city = context.find((c: any) => c.id.includes('place'))?.text || '';
            const country = context.find((c: any) => c.id.includes('country'))?.text || '';

            return {
                address: feature.place_name || feature.text || 'Unknown location',
                city,
                country,
                coordinates: [lng, lat]
            };
        }
        return null;
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return null;
    }
};

export const MapboxMap: React.FC<MapboxMapProps> = ({
    center = [0, 0],
    zoom = 12,
    trackDevice = true,
    followDevice = true,
    mapStyle = 'street',
    onLocationUpdate,
    destination,
    onClick,
    driverLocation,
    showDriverMarker = true
}) => {
    const { theme } = useTheme();
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const deviceMarkerRef = useRef<mapboxgl.Marker | null>(null);
    const destinationMarkerRef = useRef<mapboxgl.Marker | null>(null);
    const watchIdRef = useRef<number | null>(null);
    const [currentStyle, setCurrentStyle] = useState<string>('');

    // Determine map style based on theme and user preference
    const getMapStyle = () => {
        if (mapStyle === 'satellite') {
            return 'mapbox://styles/mapbox/satellite-streets-v12';
        }
        return theme === 'dark'
            ? 'mapbox://styles/mapbox/dark-v11'
            : 'mapbox://styles/mapbox/light-v11';
    };

    useEffect(() => {
        let cancelled = false;

        const init = async () => {
            try {
                if (!MAPBOX_TOKEN) {
                    console.error('Mapbox token is missing. Set VITE_MAPBOX_TOKEN in your .env file.');
                    return;
                }

                // Lazy import mapbox-gl to avoid module resolution errors if map package or scripts are removed
                if (!mapboxgl) {
                    const mod = await import('mapbox-gl');
                    mapboxgl = (mod && (mod as any).default) || mod;
                }

                if (cancelled) return;

                if (mapContainer.current && !mapRef.current) {
                    mapboxgl.accessToken = MAPBOX_TOKEN;
                    const styleUrl = getMapStyle();
                    setCurrentStyle(styleUrl);

                    const map = new mapboxgl.Map({
                        container: mapContainer.current as HTMLElement,
                        style: styleUrl,
                        center,
                        zoom,
                    });
                    mapRef.current = map;

                    // Add navigation controls
                    try { map.addControl(new mapboxgl.NavigationControl(), 'top-right'); } catch (e) { /* ignore */ }

                    // Add Geolocate Control (optional for getting user's location)
                    try {
                        const geolocateControl = new mapboxgl.GeolocateControl({
                            positionOptions: { enableHighAccuracy: true },
                            trackUserLocation: false,
                            showUserHeading: false,
                            showAccuracyCircle: false
                        });
                        map.addControl(geolocateControl, 'top-right');
                    } catch (e) { /* ignore */ }
                }
            } catch (error) {
                console.error('Failed to initialize mapbox (lazy import):', error);
            }
        };

        init();

        return () => {
            cancelled = true;
            // cleanup geolocation watcher
            if (watchIdRef.current !== null && 'geolocation' in navigator) {
                try { navigator.geolocation.clearWatch(watchIdRef.current as number); } catch (e) { }
                watchIdRef.current = null;
            }

            // remove the map instance
            if (mapRef.current) {
                try { mapRef.current.remove(); } catch (e) { }
                mapRef.current = null;
            }
            deviceMarkerRef.current = null;
            destinationMarkerRef.current = null;
        };
    }, [center, zoom, trackDevice, followDevice]);

    // Handle Destination and Route
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        // Wait for style to load before adding layers/sources
        const handleStyleLoad = () => {
            if (destination) {
                // Add/Update Destination Marker
                if (!destinationMarkerRef.current) {
                    destinationMarkerRef.current = new mapboxgl.Marker({ color: '#ef4444' }) // Red color for destination
                        .setLngLat(destination)
                        .addTo(map);
                } else {
                    destinationMarkerRef.current.setLngLat(destination);
                }

                // Draw Route Line (Simple straight line for now)
                // In a real app, fetch route from Mapbox Directions API
                const routeGeoJSON: any = {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'LineString',
                        coordinates: [center, destination]
                    }
                };

                if (map.getSource('route')) {
                    (map.getSource('route') as mapboxgl.GeoJSONSource).setData(routeGeoJSON);
                } else {
                    map.addSource('route', {
                        type: 'geojson',
                        data: routeGeoJSON
                    });
                    map.addLayer({
                        id: 'route',
                        type: 'line',
                        source: 'route',
                        layout: {
                            'line-join': 'round',
                            'line-cap': 'round'
                        },
                        paint: {
                            'line-color': '#3b82f6',
                            'line-width': 4,
                            'line-opacity': 0.8
                        }
                    });
                }

                // Fit bounds to show both points
                const bounds = new mapboxgl.LngLatBounds();
                bounds.extend(center);
                bounds.extend(destination);
                map.fitBounds(bounds, { padding: 50 });

            } else {
                // Remove destination marker and route if cleared
                if (destinationMarkerRef.current) {
                    destinationMarkerRef.current.remove();
                    destinationMarkerRef.current = null;
                }
                if (map.getLayer('route')) map.removeLayer('route');
                if (map.getSource('route')) map.removeSource('route');
            }
        };

        if (map.isStyleLoaded()) {
            handleStyleLoad();
        } else {
            map.on('style.load', handleStyleLoad);
        }

        return () => {
            if (map) {
                map.off('style.load', handleStyleLoad);
            }
        };
    }, [destination, center]); // Re-run if destination or center changes

    // Update map style when theme or mapStyle changes
    useEffect(() => {
        if (mapRef.current) {
            const newStyle = getMapStyle();
            if (newStyle !== currentStyle) {
                mapRef.current.setStyle(newStyle);
                setCurrentStyle(newStyle);
                
                // Ensure layers are re-added after style change
                mapRef.current.once('style.load', () => {
                    if (destination && mapRef.current) {
                        const routeGeoJSON: any = {
                            type: 'Feature',
                            properties: {},
                            geometry: {
                                type: 'LineString',
                                coordinates: [center, destination]
                            }
                        };

                        if (!mapRef.current.getSource('route')) {
                            mapRef.current.addSource('route', {
                                type: 'geojson',
                                data: routeGeoJSON
                            });
                            mapRef.current.addLayer({
                                id: 'route',
                                type: 'line',
                                source: 'route',
                                layout: {
                                    'line-join': 'round',
                                    'line-cap': 'round'
                                },
                                paint: {
                                    'line-color': '#3b82f6',
                                    'line-width': 4,
                                    'line-opacity': 0.8
                                }
                            });
                        }
                    }
                });
            }
        }
    }, [theme, mapStyle, destination, center]);

    // Handle Driver Location Marker
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !driverLocation) return;

        const handleStyleLoad = () => {
            if (showDriverMarker && driverLocation) {
                // Add/Update driver location marker
                if (!deviceMarkerRef.current) {
                    const el = document.createElement('div');
                    el.className = 'w-8 h-8 bg-green-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center';
                    el.innerHTML = '<svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>';
                    deviceMarkerRef.current = new mapboxgl.Marker(el)
                        .setLngLat(driverLocation)
                        .addTo(map);
                } else {
                    deviceMarkerRef.current.setLngLat(driverLocation);
                }
                
                // Center map on driver if followDevice is true
                if (followDevice) {
                    map.easeTo({
                        center: driverLocation,
                        zoom: zoom,
                        duration: 1000
                    });
                }
            }
        };

        if (map.isStyleLoaded()) {
            handleStyleLoad();
        } else {
            map.on('style.load', handleStyleLoad);
        }

        return () => {
            if (map) {
                map.off('style.load', handleStyleLoad);
            }
        };
    }, [driverLocation, followDevice, zoom, showDriverMarker]);

    return (
        <div
            ref={mapContainer}
            className="w-full h-full rounded-xl cursor-pointer"
            onClick={onClick}
        />
    );
};
