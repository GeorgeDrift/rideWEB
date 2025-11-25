
import React, { useState } from 'react';
import { Ride, RideStatus, View } from '../types';
import { CarIcon, SteeringWheelIcon, TagIcon, MapIcon } from './Icons';
import { ApiService } from '../services/api';

const RideStatusBadge: React.FC<{ status: RideStatus }> = ({ status }) => {
    const baseClasses = "px-3 py-1 text-xs font-medium rounded-full inline-block border";
    const statusClasses = {
        Completed: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
        'In Progress': 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800 animate-pulse',
        Cancelled: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
        Scheduled: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

const SummaryCard = ({ title, value, icon: Icon, color, hoverClass, onClick }: { title: string, value: number, icon: any, color: string, hoverClass?: string, onClick?: () => void }) => (
    <div 
        onClick={onClick}
        className={`bg-white dark:bg-dark-800 p-6 rounded-xl shadow-sm border border-gray-300 dark:border-gray-700 flex items-center hover:shadow-lg transition-all duration-300 ${onClick ? `cursor-pointer ${hoverClass}` : ''}`}
    >
        <div className={`p-3 rounded-full mr-4 ${color} text-white shadow-md`}>
            <Icon className="h-6 w-6" />
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);

interface RidesManagementProps {
    onNavigate: (view: View) => void;
}

export const RidesManagement: React.FC<RidesManagementProps> = ({ onNavigate }) => {
    const [rides] = useState<Ride[]>(ApiService.getRides());

    const totalRides = rides.length;
    const rideShareCount = rides.filter(r => r.type === 'Ride Share').length;
    const forHireCount = rides.filter(r => r.type === 'For Hire').length;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard 
                    title="Total Rides" 
                    value={totalRides} 
                    icon={CarIcon} 
                    color="bg-primary-500"
                    hoverClass="hover:shadow-primary-500/40 hover:border-primary-500"
                    onClick={() => onNavigate('total-rides')}
                />
                <SummaryCard 
                    title="Ride Share" 
                    value={rideShareCount} 
                    icon={SteeringWheelIcon} 
                    color="bg-blue-500" 
                    hoverClass="hover:shadow-blue-500/40 hover:border-blue-500"
                    onClick={() => onNavigate('ride-share')}
                />
                <SummaryCard 
                    title="For Hire" 
                    value={forHireCount} 
                    icon={TagIcon} 
                    color="bg-purple-500" 
                    hoverClass="hover:shadow-purple-500/40 hover:border-purple-500"
                    onClick={() => onNavigate('for-hire')}
                />
            </div>

            <div className="bg-white dark:bg-dark-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-300 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white w-full sm:w-auto">All Rides</h2>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                        <input 
                            type="text" 
                            placeholder="Search rides..." 
                            className="w-full sm:w-64 bg-gray-50 dark:bg-dark-700 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 border border-gray-300 dark:border-dark-600 placeholder-gray-500 transition-colors" 
                        />
                        <button className="w-full sm:w-auto bg-primary-500 text-black font-bold px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors shadow-sm">
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* Mobile Card View (Visible on small screens) */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                    {rides.map((ride) => (
                        <div key={ride.id} className="p-4 rounded-xl border border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-700/30 shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono font-semibold text-gray-500 dark:text-gray-400">#{ride.id}</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide ${ride.type === 'Ride Share' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400'}`}>
                                            {ride.type}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">{ride.date}</div>
                                </div>
                                <RideStatusBadge status={ride.status} />
                            </div>

                            <div className="mb-4 relative pl-3 border-l-2 border-dashed border-gray-300 dark:border-dark-600 ml-1 space-y-4">
                                <div className="relative">
                                    <div className="absolute -left-[19px] top-1 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-dark-800"></div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Origin</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{ride.origin}</p>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-[19px] top-1 w-3 h-3 rounded-full bg-red-500 border-2 border-white dark:border-dark-800"></div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Destination</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{ride.destination}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-dark-700">
                                <div className="flex items-center space-x-2">
                                    <div className="relative">
                                        <img src={ride.rider.avatar} alt="Rider" className="w-8 h-8 rounded-full border border-gray-200 dark:border-dark-600" />
                                        <img src={ride.driver.avatar} alt="Driver" className="w-6 h-6 rounded-full border border-white dark:border-dark-800 absolute -bottom-1 -right-2" />
                                    </div>
                                    <div className="pl-3">
                                        <p className="text-xs font-medium text-gray-900 dark:text-white">{ride.rider.name}</p>
                                        <p className="text-[10px] text-gray-500">w/ {ride.driver.name}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">MWK {ride.fare.toFixed(2)}</p>
                                    <button className="text-xs font-medium text-primary-600 dark:text-primary-500 hover:underline">View Details</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop Table View (Hidden on small screens) */}
                <div className="hidden md:block overflow-x-auto no-scrollbar">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-dark-700">
                            <tr>
                                <th scope="col" className="px-6 py-3">Ride ID</th>
                                <th scope="col" className="px-6 py-3">Type</th>
                                <th scope="col" className="px-6 py-3">Rider</th>
                                <th scope="col" className="px-6 py-3 hidden lg:table-cell">Driver</th>
                                <th scope="col" className="px-6 py-3 hidden lg:table-cell">Route</th>
                                <th scope="col" className="px-6 py-3">Fare</th>
                                <th scope="col" className="px-6 py-3 hidden xl:table-cell">Date</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rides.map((ride) => (
                                <tr key={ride.id} className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-primary-600 dark:text-primary-500 whitespace-nowrap">{ride.id}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${ride.type === 'Ride Share' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'}`}>
                                            {ride.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                         <div className="flex items-center">
                                            <img className="h-8 w-8 rounded-full object-cover ring-2 ring-white dark:ring-dark-800" src={ride.rider.avatar} alt={ride.rider.name} />
                                            <div className="pl-3">
                                                <div className="font-semibold text-gray-900 dark:text-white">{ride.rider.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 hidden lg:table-cell">
                                         <div className="flex items-center">
                                            <img className="h-8 w-8 rounded-full object-cover ring-2 ring-white dark:ring-dark-800" src={ride.driver.avatar} alt={ride.driver.name} />
                                            <div className="pl-3">
                                                <div className="font-semibold text-gray-900 dark:text-white">{ride.driver.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 hidden lg:table-cell">
                                        <div className="flex flex-col text-xs">
                                            <span className="text-gray-900 dark:text-white font-medium">{ride.origin}</span>
                                            <span className="text-gray-400">to</span>
                                            <span className="text-gray-900 dark:text-white font-medium">{ride.destination}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">MWK {ride.fare.toFixed(2)}</td>
                                    <td className="px-6 py-4 hidden xl:table-cell text-xs text-gray-500">{ride.date}</td>
                                    <td className="px-6 py-4"><RideStatusBadge status={ride.status} /></td>
                                    <td className="px-6 py-4 text-center">
                                        <button className="font-medium text-primary-600 dark:text-primary-500 hover:text-primary-700 dark:hover:text-primary-400 transition-colors">Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
