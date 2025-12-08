import React, { useState, useRef, useEffect } from 'react';
import { searchLocations, Location } from '../constants/MalawiLocations';

interface LocationInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    className?: string;
}

const LocationInput: React.FC<LocationInputProps> = ({
    value,
    onChange,
    placeholder = "Type to search locations...",
    label,
    className = ""
}) => {
    const [suggestions, setSuggestions] = useState<Location[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);

    // Handle input change
    const handleInputChange = (inputValue: string) => {
        onChange(inputValue);
        if (inputValue.trim().length > 0) {
            const results = searchLocations(inputValue, 8);
            setSuggestions(results);
            setShowDropdown(true);
            setSelectedIndex(-1);
        } else {
            setSuggestions([]);
            setShowDropdown(false);
        }
    };

    // Select location from dropdown
    const selectLocation = (location: Location) => {
        onChange(location.name);
        setShowDropdown(false);
        setSuggestions([]);
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showDropdown || suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0) {
                    selectLocation(suggestions[selectedIndex]);
                }
                break;
            case 'Escape':
                setShowDropdown(false);
                break;
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
        <div ref={containerRef} className={`relative ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-400 mb-2">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (value.trim() && suggestions.length > 0) {
                            setShowDropdown(true);
                        }
                    }}
                    className="w-full px-4 py-3 bg-[#1E1E1E] border border-[#333] rounded-xl text-white placeholder-gray-500 focus:border-[#FACC15] focus:outline-none transition-colors"
                    placeholder={placeholder}
                />
                {value && (
                    <button
                        onClick={() => {
                            onChange('');
                            setSuggestions([]);
                            setShowDropdown(false);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                        type="button"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Dropdown */}
            {showDropdown && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-[#1E1E1E] border border-[#333] rounded-xl shadow-2xl max-h-64 overflow-y-auto">
                    {suggestions.map((location, index) => (
                        <div
                            key={`${location.name}-${location.district}`}
                            onClick={() => selectLocation(location)}
                            className={`px-4 py-3 cursor-pointer transition-colors border-b border-[#2A2A2A] last:border-b-0 ${index === selectedIndex
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
    );
};

export default LocationInput;
