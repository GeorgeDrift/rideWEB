import React, { useState } from 'react';
import { Driver, DriverStatus } from '../types';
import { ApiService } from '../services/api';

const DriverStatusBadge: React.FC<{ status: DriverStatus }> = ({ status }) => {
    const baseClasses = "px-3 py-1 text-xs font-medium rounded-full inline-block border";
    const statusClasses = {
        Approved: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
        Pending: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
        Suspended: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

export const DriverManagement: React.FC = () => {
    const [drivers, setDrivers] = useState<Driver[]>(ApiService.getDrivers());

    return (
         <div className="bg-white dark:bg-dark-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-300 dark:border-dark-700">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-0">Driver Management</h2>
                <div className="flex space-x-2">
                    <input type="text" placeholder="Search drivers..." className="bg-gray-50 dark:bg-dark-700 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 border border-gray-300 dark:border-dark-600 placeholder-gray-500" />
                    <button className="bg-primary-600 text-black font-bold px-4 py-2 rounded-lg hover:bg-primary-700 transition">Add Driver</button>
                </div>
            </div>
            <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-dark-700">
                        <tr>
                            <th scope="col" className="px-6 py-3">Driver</th>
                            <th scope="col" className="px-6 py-3 hidden md:table-cell">Vehicle</th>
                            <th scope="col" className="px-6 py-3 hidden lg:table-cell">Total Rides</th>
                            <th scope="col" className="px-6 py-3 hidden lg:table-cell">Rating</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {drivers.map((driver) => (
                            <tr key={driver.id} className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700/50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <img className="h-10 w-10 rounded-full object-cover" src={driver.avatar} alt={driver.name} />
                                        <div className="pl-3">
                                            <div className="text-base font-semibold text-gray-900 dark:text-white">{driver.name}</div>
                                            <div className="font-normal text-gray-500">{driver.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 hidden md:table-cell">
                                    <div className="text-gray-900 dark:text-gray-200">{driver.vehicle}</div>
                                    <div className="text-gray-500">{driver.licensePlate}</div>
                                </td>
                                <td className="px-6 py-4 hidden lg:table-cell">{driver.totalRides}</td>
                                <td className="px-6 py-4 hidden lg:table-cell">
                                    <span className="text-yellow-500 dark:text-yellow-400">★</span> {driver.rating.toFixed(1)}
                                </td>
                                <td className="px-6 py-4"><DriverStatusBadge status={driver.status} /></td>
                                <td className="px-6 py-4 text-center">
                                    <button className="font-medium text-primary-600 dark:text-primary-500 hover:underline">Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};