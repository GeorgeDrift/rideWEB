import React, { useState, useEffect } from 'react';
import { SearchIcon, CarIcon, UserIcon, MapPinIcon, CalendarIcon, ClockIcon, StarIcon, BriefcaseIcon } from './Icons';
import { ApiService } from '../services/api';

interface Driver {
    id: string;
    name: string;
    rating: number;
    avatar?: string;
    phone?: string;
    airtelMoneyNumber?: string;
    mpambaNumber?: string;
}

interface Vehicle {
    id: string;
    name: string;
    make?: string;
    model?: string;
    plate?: string;
    seats?: number;
    imageUrl?: string;
    color?: string;
    category?: string;
    features?: string[];
}

interface RideSharePost {
    id: string;
    origin: string;
    destination: string;
    date: string;
    time: string;
    price: number;
    seats: number;
    availableSeats: number;
    description?: string;
    imageUrl?: string;
    driver: Driver;
    vehicle?: Vehicle;
}

interface HirePost {
    id: string;
    title: string;
    category: string;
    location: string;
    rate: string;
    rateAmount: number;
    rateUnit: string;
    description?: string;
    imageUrl?: string;
    driver: Driver;
    vehicle?: Vehicle;
}

interface ClientMarketplaceProps {
    onLoginClick: () => void;
}

export const ClientMarketplace: React.FC<ClientMarketplaceProps> = ({ onLoginClick }) => {
    const [rideSharePosts, setRideSharePosts] = useState<RideSharePost[]>([]);
    const [hirePosts, setHirePosts] = useState<HirePost[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'rideshare' | 'hire'>('rideshare');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFrom, setSearchFrom] = useState('');
    const [searchTo, setSearchTo] = useState('');

    useEffect(() => {
        loadMarketplace();
    }, []);

    const loadMarketplace = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/marketplace/all');
            if (!response.ok) throw new Error('Failed to load marketplace');
            const data = await response.json();
            setRideSharePosts(data.rideShare || []);
            setHirePosts(data.hire || []);
        } catch (error) {
            console.error('Error loading marketplace:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDriverWhatsAppNumber = (driver: Driver): string | null => {
        // Priority: phone → airtelMoneyNumber → mpambaNumber
        return driver.phone || driver.airtelMoneyNumber || driver.mpambaNumber || null;
    };

    const handleWhatsAppContact = (driver: Driver, vehicleInfo: string) => {
        const phoneNumber = getDriverWhatsAppNumber(driver);
        if (!phoneNumber) {
            alert('Driver contact information not available');
            return;
        }

        // Clean phone number (remove spaces, dashes, etc.)
        const cleanNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');

        // Ensure it has country code (add +265 for Malawi if missing)
        const formattedNumber = cleanNumber.startsWith('+') ? cleanNumber : `+265${cleanNumber}`;

        // Pre-filled message
        const message = encodeURIComponent(`Hi, I'm interested in your ${vehicleInfo}`);

        // Open WhatsApp
        window.open(`https://wa.me/${formattedNumber}?text=${message}`, '_blank');
    };

    const filteredRideShare = rideSharePosts.filter(post => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();

        // Handle "from to" format (e.g., "Blantyre Lilongwe" or "Blantyre to Lilongwe")
        const parts = query.split(/\s+to\s+|\s+/).filter(Boolean);

        if (parts.length >= 2) {
            const from = parts[0];
            const to = parts[parts.length - 1]; // Use last word as destination
            return post.origin.toLowerCase().includes(from) &&
                post.destination.toLowerCase().includes(to);
        }

        // Default: search in either origin or destination
        return post.origin.toLowerCase().includes(query) ||
            post.destination.toLowerCase().includes(query);
    });

    const filteredHire = hirePosts.filter(post =>
        searchQuery === '' ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
                <div className="w-full px-4 sm:px-6 lg:px-12 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">RideX Marketplace</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Find rides & vehicles instantly</p>
                            </div>
                        </div>
                        <button
                            onClick={onLoginClick}
                            className="p-2.5 bg-primary-600 text-black rounded-full hover:bg-primary-700 transition-all shadow-md hover:shadow-lg group"
                            title="Login"
                        >
                            <UserIcon className="h-6 w-6 transform group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Search Section */}
            <div className="w-full px-4 sm:px-6 lg:px-12 py-8">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
                    {activeTab === 'rideshare' ? (
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <div className="relative flex-1 w-full">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                                    <MapPinIcon className="h-5 w-5 text-green-500" />
                                    <span className="text-xs font-bold text-gray-400 uppercase">From</span>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Enter origin..."
                                    value={searchFrom}
                                    onChange={(e) => setSearchFrom(e.target.value)}
                                    className="w-full pl-24 pr-4 py-4 rounded-2xl border-2 border-transparent bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-800 transition-all text-lg font-medium"
                                />
                            </div>

                            <div className="hidden md:flex items-center justify-center -mx-2 z-10">
                                <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-black shadow-lg">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </div>
                            </div>

                            <div className="relative flex-1 w-full">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                                    <MapPinIcon className="h-5 w-5 text-red-500" />
                                    <span className="text-xs font-bold text-gray-400 uppercase">To</span>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Enter destination..."
                                    value={searchTo}
                                    onChange={(e) => setSearchTo(e.target.value)}
                                    className="w-full pl-20 pr-4 py-4 rounded-2xl border-2 border-transparent bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-800 transition-all text-lg font-medium"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="relative">
                            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by vehicle type, location or category..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-14 pr-4 py-4 rounded-2xl border-2 border-transparent bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-800 transition-all text-lg font-medium"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="w-full px-4 sm:px-6 lg:px-12">
                <div className="flex space-x-4 border-b-2 border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('rideshare')}
                        className={`px-6 py-3 font-semibold transition-all ${activeTab === 'rideshare'
                            ? 'text-primary-700 border-b-4 border-primary-600 -mb-0.5'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                    >
                        <span className="flex items-center space-x-2">
                            <CarIcon className="h-5 w-5" />
                            <span>Ride Share</span>
                            <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs">
                                {filteredRideShare.length}
                            </span>
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('hire')}
                        className={`px-6 py-3 font-semibold transition-all ${activeTab === 'hire'
                            ? 'text-primary-700 border-b-4 border-primary-600 -mb-0.5'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            }`}
                    >
                        <span className="flex items-center space-x-2">
                            <CarIcon className="h-5 w-5" />
                            <span>For Hire</span>
                            <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs">
                                {filteredHire.length}
                            </span>
                        </span>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="w-full px-4 sm:px-6 lg:px-12 py-8">
                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading marketplace...</p>
                    </div>
                ) : activeTab === 'rideshare' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {filteredRideShare.length === 0 ? (
                            <div className="col-span-full text-center py-20">
                                <CarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400 text-lg">No ride share posts available</p>
                            </div>
                        ) : (
                            filteredRideShare.map((post) => (
                                <div
                                    key={post.id}
                                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-gray-200 dark:border-gray-700 overflow-hidden group"
                                >
                                    {/* Driver Info */}
                                    <div className="p-3 sm:p-4 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-b border-gray-200 dark:border-gray-700">
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                            <div className="flex items-center space-x-3 w-full sm:w-auto">
                                                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary-600 flex items-center justify-center text-black font-bold text-base sm:text-lg overflow-hidden border-2 border-primary-400 shadow-sm">
                                                    {post.driver.avatar ? (
                                                        <img src={ApiService.getAssetUrl(post.driver.avatar)} alt={post.driver.name} className="h-full w-full object-cover" />
                                                    ) : post.driver.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{post.driver.name}</p>
                                                </div>
                                            </div>

                                            {/* Vehicle Circle Thumbnail */}
                                            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full border-2 sm:border-4 border-white dark:border-gray-700 shadow-xl overflow-hidden transform group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-900 flex items-center justify-center flex-shrink-0">
                                                {(post.imageUrl || post.vehicle?.imageUrl) ? (
                                                    <img src={ApiService.getAssetUrl(post.imageUrl || post.vehicle?.imageUrl)} alt="Vehicle" className="h-full w-full object-cover" />
                                                ) : (
                                                    <span className="text-base sm:text-lg font-black text-gray-500 dark:text-gray-400 uppercase tracking-tight">CAR</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Route Info */}
                                    <div className="p-6 space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex items-start space-x-2">
                                                <MapPinIcon className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">From</p>
                                                    <p className="font-semibold text-gray-900 dark:text-white">{post.origin}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start space-x-2">
                                                <MapPinIcon className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">To</p>
                                                    <p className="font-semibold text-gray-900 dark:text-white">{post.destination}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                                            <div className="flex items-center space-x-1">
                                                <CalendarIcon className="h-4 w-4" />
                                                <span>{post.date}</span>
                                            </div>
                                            <div className="flex items-center space-x-1 bg-primary-100 dark:bg-primary-900/30 px-2 py-0.5 rounded-md border border-primary-200 dark:border-primary-800">
                                                <ClockIcon className="h-4 w-4 text-primary-700" />
                                                <span className="font-bold text-primary-700">Departs at {post.time}</span>
                                            </div>
                                        </div>

                                        {post.vehicle && (
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                <p className="font-medium">
                                                    {post.vehicle.make || post.vehicle.model
                                                        ? `${post.vehicle.make || ''} ${post.vehicle.model || ''}`.trim()
                                                        : post.vehicle.name}
                                                </p>
                                                <p className="text-xs">{post.vehicle.plate} • {post.availableSeats} seats available</p>
                                            </div>
                                        )}

                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <div>
                                                <p className="text-xl sm:text-2xl font-bold text-primary-700">MWK {post.price.toFixed(2)}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">per person</p>
                                            </div>
                                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                                <a
                                                    href={`tel:${post.driver.phone}`}
                                                    className="flex items-center justify-center p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
                                                >
                                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
                                                    </svg>
                                                </a>
                                                <button
                                                    onClick={() => handleWhatsAppContact(post.driver, `${post.origin} to ${post.destination} ride`)}
                                                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg flex-1"
                                                >
                                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                                    </svg>
                                                    <span>WhatsApp</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {filteredHire.length === 0 ? (
                            <div className="col-span-full text-center py-20">
                                <CarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400 text-lg">No hire vehicles available</p>
                            </div>
                        ) : (
                            filteredHire.map((post) => (
                                <div
                                    key={post.id}
                                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-gray-200 dark:border-gray-700 overflow-hidden group"
                                >
                                    {/* Driver Info Header */}
                                    <div className="p-3 sm:p-4 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-b border-gray-200 dark:border-gray-700">
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                            <div className="flex items-center space-x-3 w-full sm:w-auto">
                                                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary-600 flex items-center justify-center text-black font-bold text-base sm:text-lg overflow-hidden border-2 border-primary-400 shadow-sm">
                                                    {post.driver.avatar ? (
                                                        <img src={ApiService.getAssetUrl(post.driver.avatar)} alt={post.driver.name} className="h-full w-full object-cover" />
                                                    ) : post.driver.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{post.driver.name}</p>
                                                </div>
                                            </div>

                                            {/* Vehicle Circle Thumbnail */}
                                            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full border-2 sm:border-4 border-white dark:border-gray-700 shadow-xl overflow-hidden transform group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-900 flex items-center justify-center flex-shrink-0">
                                                {(post.imageUrl || post.vehicle?.imageUrl) ? (
                                                    <img src={ApiService.getAssetUrl(post.imageUrl || post.vehicle?.imageUrl)} alt="Vehicle" className="h-full w-full object-cover" />
                                                ) : (
                                                    <span className="text-base sm:text-lg font-black text-gray-500 dark:text-gray-400 uppercase tracking-tight">CAR</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 space-y-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{post.title}</h3>
                                            <p className="text-sm text-primary-700 font-medium">{post.category}</p>
                                        </div>

                                        {post.vehicle && (
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                <p className="font-medium">
                                                    {post.vehicle.make || post.vehicle.model
                                                        ? `${post.vehicle.make || ''} ${post.vehicle.model || ''}`.trim()
                                                        : post.vehicle.name}
                                                </p>
                                                <p className="text-xs">{post.vehicle.plate}</p>
                                            </div>
                                        )}

                                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                            <MapPinIcon className="h-4 w-4" />
                                            <span>{post.location}</span>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <div>
                                                <p className="text-xl sm:text-2xl font-bold text-primary-700">MWK {post.rateAmount.toFixed(2)}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">per {post.rateUnit}</p>
                                            </div>
                                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                                <a
                                                    href={`tel:${post.driver.phone}`}
                                                    className="flex items-center justify-center p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
                                                >
                                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
                                                    </svg>
                                                </a>
                                                <button
                                                    onClick={() => handleWhatsAppContact(post.driver, `${post.title} (${post.category})`)}
                                                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg flex-1"
                                                >
                                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                                    </svg>
                                                    <span>WhatsApp</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>))
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
                <div className="w-full px-4 sm:px-6 lg:px-12 py-8 text-center">
                    <p className="text-gray-600 dark:text-gray-400">© 2024 RideX. All rights reserved.</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Contact drivers directly via WhatsApp</p>
                </div>
            </footer>
        </div>
    );
};
