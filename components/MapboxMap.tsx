import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

// Ensure you have a Mapbox access token set in your environment variables
const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN || '';

export const MapboxMap: React.FC<{ center?: [number, number]; zoom?: number }> = ({ center = [0, 0], zoom = 12 }) => {
    const mapContainer = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!MAPBOX_TOKEN) {
            console.error('Mapbox token is missing. Set REACT_APP_MAPBOX_TOKEN environment variable.');
            return;
        }
        if (mapContainer.current && !mapContainer.current?.hasChildNodes()) {
            mapboxgl.accessToken = MAPBOX_TOKEN;
            const map = new mapboxgl.Map({
                container: mapContainer.current as HTMLElement,
                style: 'mapbox://styles/mapbox/streets-v11',
                center,
                zoom,
            });
            // Add navigation controls (optional)
            map.addControl(new mapboxgl.NavigationControl());
            // Clean up on unmount
            return () => {
                map.remove();
            };
        }
    }, [center, zoom]);

    return <div ref={mapContainer} className="w-full h-full rounded-xl" />;
};
