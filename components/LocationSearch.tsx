import React, { useState } from 'react';

interface LocationSearchProps {
    onSearch: (pickup: string, destination: string) => void;
    isLoading?: boolean;
}

const LocationSearch: React.FC<LocationSearchProps> = ({ onSearch, isLoading = false }) => {
    const [pickupLocation, setPickupLocation] = useState('');
    const [destination, setDestination] = useState('');

    // Common locations in Malawi
    const commonLocations = [
        'Lilongwe',
        'Blantyre',
        'Mzuzu',
        'Zomba',
        'Mangochi',
        'Karonga',
        'Kasungu',
        'Salima',
        'Nkhatabay',
        'Dedza'
    ];

    const handleSearch = () => {
        if (pickupLocation && destination) {
            onSearch(pickupLocation, destination);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Search Ride Share</h2>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
                {/* Pickup Location */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pickup Location
                    </label>
                    <input
                        type="text"
                        list="pickup-locations"
                        value={pickupLocation}
                        onChange={(e) => setPickupLocation(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter pickup location"
                    />
                    <datalist id="pickup-locations">
                        {commonLocations.map(loc => (
                            <option key={loc} value={loc} />
                        ))}
                    </datalist>
                </div>

                {/* Destination */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Destination
                    </label>
                    <input
                        type="text"
                        list="destinations"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter destination"
                    />
                    <datalist id="destinations">
                        {commonLocations.map(loc => (
                            <option key={loc} value={loc} />
                        ))}
                    </datalist>
                </div>
            </div>

            <button
                onClick={handleSearch}
                disabled={!pickupLocation || !destination || isLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Searching...
                    </>
                ) : (
                    <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Search Vehicles
                    </>
                )}
            </button>
        </div>
    );
};

export default LocationSearch;
