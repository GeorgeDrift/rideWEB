import React, { useState, useRef, useEffect } from 'react';
import { searchLocations, Location } from '../constants/MalawiLocations';

interface LocationSearchProps {
    onSearch: (pickup: string, destination: string) => void;
    isLoading?: boolean;
}

const LocationSearch: React.FC<LocationSearchProps> = ({ onSearch, isLoading = false }) => {
    const [pickupLocation, setPickupLocation] = useState('');
    const [destination, setDestination] = useState('');

    // Autocomplete state
    const [pickupSuggestions, setPickupSuggestions] = useState<Location[]>([]);
    const [destinationSuggestions, setDestinationSuggestions] = useState<Location[]>([]);
    const [showPickupDropdown, setShowPickupDropdown] = useState(false);
    const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
    const [selectedPickupIndex, setSelectedPickupIndex] = useState(-1);
    const [selectedDestinationIndex, setSelectedDestinationIndex] = useState(-1);

    const pickupRef = useRef<HTMLDivElement>(null);
    const destinationRef = useRef<HTMLDivElement>(null);

    // Handle pickup location input change
    const handlePickupChange = (value: string) => {
        setPickupLocation(value);
        if (value.trim().length > 0) {
            const results = searchLocations(value, 8);
            setPickupSuggestions(results);
            setShowPickupDropdown(true);
            setSelectedPickupIndex(-1);
        } else {
            setPickupSuggestions([]);
            setShowPickupDropdown(false);
        }
    };

    // Handle destination input change
    const handleDestinationChange = (value: string) => {
        setDestination(value);
        if (value.trim().length > 0) {
            const results = searchLocations(value, 8);
            setDestinationSuggestions(results);
            setShowDestinationDropdown(true);
            setSelectedDestinationIndex(-1);
        } else {
            setDestinationSuggestions([]);
            setShowDestinationDropdown(false);
        }
    };

    // Select pickup location from dropdown
    const selectPickupLocation = (location: Location) => {
        setPickupLocation(location.name);
        setShowPickupDropdown(false);
        setPickupSuggestions([]);
    };

    // Select destination from dropdown
    const selectDestination = (location: Location) => {
        setDestination(location.name);
        setShowDestinationDropdown(false);
        setDestinationSuggestions([]);
    };

    // Handle keyboard navigation for pickup
    const handlePickupKeyDown = (e: React.KeyboardEvent) => {
        if (!showPickupDropdown || pickupSuggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedPickupIndex(prev =>
                    prev < pickupSuggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedPickupIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedPickupIndex >= 0) {
                    selectPickupLocation(pickupSuggestions[selectedPickupIndex]);
                }
                break;
            case 'Escape':
                setShowPickupDropdown(false);
                break;
        }
    };

    // Handle keyboard navigation for destination
    const handleDestinationKeyDown = (e: React.KeyboardEvent) => {
        if (!showDestinationDropdown || destinationSuggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedDestinationIndex(prev =>
                    prev < destinationSuggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedDestinationIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedDestinationIndex >= 0) {
                    selectDestination(destinationSuggestions[selectedDestinationIndex]);
                }
                break;
            case 'Escape':
                setShowDestinationDropdown(false);
                break;
        }
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickupRef.current && !pickupRef.current.contains(event.target as Node)) {
                setShowPickupDropdown(false);
            }
            if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
                setShowDestinationDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = () => {
        if (pickupLocation && destination) {
            onSearch(pickupLocation, destination);
        }
    };

    // Get location type badge color
    const getTypeBadgeColor = (type: string) => {
        switch (type) {
            case 'City': return 'bg-purple-500/20 text-purple-300';
            case 'Town': return 'bg-blue-500/20 text-blue-300';
            case 'Boma': return 'bg-green-500/20 text-green-300';
            case 'Trading Centre': return 'bg-yellow-500/20 text-yellow-300';
            case 'Border Post': return 'bg-red-500/20 text-red-300';
            case 'Mission': return 'bg-indigo-500/20 text-indigo-300';
            default: return 'bg-gray-500/20 text-gray-300';
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
                {/* Pickup Location with Autocomplete */}
                <div ref={pickupRef} className="relative">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                        📍 Pickup Location
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={pickupLocation}
                            onChange={(e) => handlePickupChange(e.target.value)}
                            onKeyDown={handlePickupKeyDown}
                            onFocus={() => {
                                if (pickupLocation.trim() && pickupSuggestions.length > 0) {
                                    setShowPickupDropdown(true);
                                }
                            }}
                            className="w-full px-4 py-3 bg-[#1E1E1E] border border-[#333] rounded-xl text-white placeholder-gray-500 focus:border-[#FACC15] focus:outline-none transition-colors"
                            placeholder="Type to search..."
                        />
                        {pickupLocation && (
                            <button
                                onClick={() => {
                                    setPickupLocation('');
                                    setPickupSuggestions([]);
                                    setShowPickupDropdown(false);
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Pickup Dropdown */}
                    {showPickupDropdown && pickupSuggestions.length > 0 && (
                        <div className="absolute z-50 w-full mt-2 bg-[#1E1E1E] border border-[#333] rounded-xl shadow-2xl max-h-64 overflow-y-auto">
                            {pickupSuggestions.map((location, index) => (
                                <div
                                    key={`${location.name}-${location.district}`}
                                    onClick={() => selectPickupLocation(location)}
                                    className={`px-4 py-3 cursor-pointer transition-colors border-b border-[#2A2A2A] last:border-b-0 ${index === selectedPickupIndex
                                            ? 'bg-[#FACC15]/10 border-l-2 border-l-[#FACC15]'
                                            : 'hover:bg-[#252525]'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="font-medium text-white">{location.name}</div>
                                            <div className="text-xs text-gray-400 mt-0.5">
                                                {location.district} • {location.region}
                                            </div>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${getTypeBadgeColor(location.type)}`}>
                                            {location.type}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Destination with Autocomplete */}
                <div ref={destinationRef} className="relative">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                        🎯 Destination
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={destination}
                            onChange={(e) => handleDestinationChange(e.target.value)}
                            onKeyDown={handleDestinationKeyDown}
                            onFocus={() => {
                                if (destination.trim() && destinationSuggestions.length > 0) {
                                    setShowDestinationDropdown(true);
                                }
                            }}
                            className="w-full px-4 py-3 bg-[#1E1E1E] border border-[#333] rounded-xl text-white placeholder-gray-500 focus:border-[#FACC15] focus:outline-none transition-colors"
                            placeholder="Type to search..."
                        />
                        {destination && (
                            <button
                                onClick={() => {
                                    setDestination('');
                                    setDestinationSuggestions([]);
                                    setShowDestinationDropdown(false);
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Destination Dropdown */}
                    {showDestinationDropdown && destinationSuggestions.length > 0 && (
                        <div className="absolute z-50 w-full mt-2 bg-[#1E1E1E] border border-[#333] rounded-xl shadow-2xl max-h-64 overflow-y-auto">
                            {destinationSuggestions.map((location, index) => (
                                <div
                                    key={`${location.name}-${location.district}`}
                                    onClick={() => selectDestination(location)}
                                    className={`px-4 py-3 cursor-pointer transition-colors border-b border-[#2A2A2A] last:border-b-0 ${index === selectedDestinationIndex
                                            ? 'bg-[#FACC15]/10 border-l-2 border-l-[#FACC15]'
                                            : 'hover:bg-[#252525]'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="font-medium text-white">{location.name}</div>
                                            <div className="text-xs text-gray-400 mt-0.5">
                                                {location.district} • {location.region}
                                            </div>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${getTypeBadgeColor(location.type)}`}>
                                            {location.type}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Search Button */}
            <button
                onClick={handleSearch}
                disabled={!pickupLocation || !destination || isLoading}
                className="w-full bg-[#FACC15] text-black py-3 rounded-xl hover:bg-[#EAB308] transition font-bold disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                        Search Rides
                    </>
                )}
            </button>

            {/* Helper Text */}
            <p className="text-xs text-gray-500 text-center">
                💡 Start typing to see suggestions • Use ↑↓ arrow keys to navigate
            </p>
        </div>
    );
};

export default LocationSearch;
