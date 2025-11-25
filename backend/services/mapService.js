
const axios = require('axios');

const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN; 

const getDirections = async (start, end) => {
    if (!MAPBOX_TOKEN) {
        console.warn("Mapbox token missing in backend env.");
        // Return mock data if no token
        return {
            routes: [{
                geometry: { coordinates: [start, end], type: "LineString" },
                duration: 600,
                distance: 5000
            }]
        };
    }

    try {
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start.lng},${start.lat};${end.lng},${end.lat}?steps=false&geometries=geojson&access_token=${MAPBOX_TOKEN}`;
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error("MapService Error:", error.message);
        return null;
    }
};

module.exports = { getDirections };
