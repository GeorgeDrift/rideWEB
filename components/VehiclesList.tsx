
import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { CarIcon, SearchIcon, FilterIcon } from './Icons';

interface Vehicle {
    id: string;
    type: 'Ride Share' | 'For Hire';
    make: string;
    model: string;
    plate: string;
    driver: string;
    status: string;
    category: string;
}

export const VehiclesList: React.FC = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState<'All' | 'Ride Share' | 'For Hire'>('All');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadVehicles();
    }, []);

    useEffect(() => {
        let result = vehicles;
        if (filterType !== 'All') {
            result = result.filter(v => v.type === filterType);
        }
        if (search) {
            const lowerSearch = search.toLowerCase();
            result = result.filter(v =>
                v.make.toLowerCase().includes(lowerSearch) ||
                v.model.toLowerCase().includes(lowerSearch) ||
                v.plate.toLowerCase().includes(lowerSearch) ||
                v.driver.toLowerCase().includes(lowerSearch)
            );
        }
        setFilteredVehicles(result);
    }, [vehicles, search, filterType]);

    const loadVehicles = async () => {
        try {
            setLoading(true);
            const data = await ApiService.getAllVehicles();
            setVehicles(data);
            setFilteredVehicles(data);
        } catch (err) {
            console.error('Failed to load vehicles', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                        <CarIcon className="h-8 w-8 text-primary-500 mr-3" />
                        Vehicle Inventory
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage fleet and partner vehicles</p>
                </div>
                <div className="flex space-x-2 w-full sm:w-auto">
                    <button
                        onClick={() => loadVehicles()}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        Refresh List
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 p-4">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by make, model, plate, or driver..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-gray-50 dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <FilterIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        <select
                            value={filterType}
                            onChange={(e: any) => setFilterType(e.target.value)}
                            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="All">All Types</option>
                            <option value="Ride Share">Ride Share</option>
                            <option value="For Hire">For Hire</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-dark-700">
                                <th className="py-3 px-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Vehicle</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Type</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Plate</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Driver/Provider</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Status</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Category</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-dark-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                                        Loading inventory...
                                    </td>
                                </tr>
                            ) : filteredVehicles.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                                        No vehicles found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredVehicles.map((vehicle) => (
                                    <tr key={vehicle.id} className="hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors">
                                        <td className="py-3 px-4">
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white">{vehicle.make} {vehicle.model}</p>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${vehicle.type === 'Ride Share'
                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                                                }`}>
                                                {vehicle.type}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300 font-mono">{vehicle.plate}</td>
                                        <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{vehicle.driver}</td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${vehicle.status.toLowerCase() === 'active' || vehicle.status.toLowerCase() === 'available'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                }`}>
                                                {vehicle.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{vehicle.category}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-right">
                    Showing {filteredVehicles.length} of {vehicles.length} vehicles
                </div>
            </div>
        </div>
    );
};
