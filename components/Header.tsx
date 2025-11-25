import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon, MenuIcon, SunIcon, MoonIcon, CarIcon, UsersIcon, SteeringWheelIcon, MapIcon, ChatBubbleIcon, TagIcon, DocumentIcon } from './Icons';
import { View } from '../types';
import { ApiService, SearchResult as ApiSearchResult } from '../services/api';

interface HeaderProps {
    title: string;
    onMenuClick: () => void;
    isDarkMode: boolean;
    toggleTheme: () => void;
    onNavigate: (view: View) => void;
}

interface SearchResult extends ApiSearchResult {
    icon: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, onMenuClick, isDarkMode, toggleTheme, onNavigate }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Helper to map API data to UI components (Icons)
    const getIconForView = (view: View, id: string): React.ReactNode => {
        if (view === 'dashboard') return <div className="w-4 h-4 bg-primary-500 rounded-full" />;
        if (view === 'rides') return <CarIcon className="h-4 w-4 text-gray-400" />;
        if (view === 'drivers') return <SteeringWheelIcon className="h-4 w-4 text-gray-400" />;
        if (view === 'riders') return <UsersIcon className="h-4 w-4 text-gray-400" />;
        if (view === 'map') return <MapIcon className="h-4 w-4" />;
        if (view === 'chat') return <ChatBubbleIcon className="h-4 w-4" />;
        if (view === 'pricing') return <TagIcon className="h-4 w-4" />;
        if (view === 'revenue') return <div className="text-green-500 font-bold text-xs">$</div>;
        if (view === 'for-hire' && id.startsWith('cat')) return <CarIcon className="h-4 w-4 text-purple-500" />;
        return <DocumentIcon className="h-4 w-4" />;
    };

    // Prepare Search Items
    const searchItems: SearchResult[] = ApiService.getSearchItems().map(item => ({
        ...item,
        icon: getIconForView(item.view, item.id)
    }));

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(e.target.value);

        if (query.length > 0) {
            const filtered = searchItems.filter(item => 
                item.label.toLowerCase().includes(query) ||
                item.subLabel.toLowerCase().includes(query) ||
                item.keywords?.some(k => k.toLowerCase().includes(query))
            );
            setSearchResults(filtered);
            setShowDropdown(true);
        } else {
            setSearchResults([]);
            setShowDropdown(false);
        }
    };

    const handleSelectResult = (result: SearchResult) => {
        onNavigate(result.view);
        setSearchQuery('');
        setShowDropdown(false);
    };

    return (
        <header className="bg-white dark:bg-dark-800 sticky top-0 z-20 border-b border-gray-200 dark:border-dark-700 shadow-sm transition-colors duration-300">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center">
                    <button onClick={onMenuClick} className="lg:hidden mr-4 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                        <MenuIcon className="h-6 w-6" />
                    </button>
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors">{title}</h1>
                </div>
                <div className="flex items-center space-x-4">
                    {/* Search Bar Container */}
                    <div className="relative hidden sm:block" ref={searchRef}>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <SearchIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            </span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearch}
                                onFocus={() => searchQuery.length > 0 && setShowDropdown(true)}
                                placeholder="Search for buses, drivers, features..."
                                className="w-64 lg:w-80 pl-10 pr-4 py-2 bg-gray-100 dark:bg-dark-700 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 transition-colors"
                            />
                        </div>
                        
                        {/* Search Results Dropdown */}
                        {showDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-800 rounded-lg shadow-lg border border-gray-200 dark:border-dark-700 max-h-96 overflow-y-auto no-scrollbar z-50">
                                {searchResults.length > 0 ? (
                                    <ul>
                                        {searchResults.map((result) => (
                                            <li key={result.id}>
                                                <button 
                                                    onClick={() => handleSelectResult(result)}
                                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-700 flex items-center transition-colors border-b border-gray-100 dark:border-dark-700 last:border-0"
                                                >
                                                    <div className="flex-shrink-0 mr-3 text-gray-500 dark:text-gray-400">
                                                        {result.icon}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{result.label}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">{result.subLabel}</div>
                                                    </div>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                                        No results found for "{searchQuery}"
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    <button 
                        onClick={toggleTheme}
                        className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                        aria-label="Toggle Dark Mode"
                    >
                        {isDarkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
                    </button>

                    <div className="relative">
                        <button className="flex text-sm border-2 border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition">
                            <img className="h-9 w-9 rounded-full object-cover" src="https://picsum.photos/id/1005/100/100" alt="Admin" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};