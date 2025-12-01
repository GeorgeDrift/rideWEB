
// Use Vite env variable prefix `VITE_` and `import.meta.env` for browser-safe access.
const MAPBOX_TOKEN = (import.meta as any).env?.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoicGF0cmljay0xIiwiYSI6ImNtaTh0cGR2ajBmbmUybnNlZTk1dGV1NGEifQ.UCC5FLCAdiDj0EL93gnekg';

/**
 * Geocodes an address string to coordinates [lng, lat]
 */
export const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
    try {
        const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_TOKEN}`);
        const data = await response.json();
        if (data.features && data.features.length > 0) {
            return data.features[0].center;
        }
        return null;
    } catch (error) {
        console.error("Geocoding error:", error);
        return null;
    }
};

/**
 * Calculates the distance between two coordinates in kilometers using the Haversine formula
 */
export const calculateDistance = (coord1: [number, number], coord2: [number, number]): number => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // Radius of the earth in km

    const dLat = toRad(coord2[1] - coord1[1]);
    const dLon = toRad(coord2[0] - coord1[0]);

    const lat1 = toRad(coord1[1]);
    const lat2 = toRad(coord2[1]);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return parseFloat((R * c).toFixed(1)); // Return distance with 1 decimal place
};
