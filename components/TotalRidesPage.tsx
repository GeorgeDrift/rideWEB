
import React, { useState } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend, AreaChart, Area 
} from 'recharts';
import { ArrowLeftIcon, CarIcon, SteeringWheelIcon, TagIcon, DocumentIcon } from './Icons';
import { ApiService } from '../services/api';

interface TotalRidesPageProps {
    onBack: () => void;
}

type TimeRange = 'Weekly' | 'Monthly' | 'Yearly';

const statusData = [
    { name: 'Completed', value: 85, color: '#22c55e' }, // Green
    { name: 'Cancelled', value: 10, color: '#ef4444' }, // Red
    { name: 'In Progress', value: 5, color: '#eab308' }, // Yellow
];

const StatCard = ({ 
    title, 
    value, 
    subValue, 
    icon: Icon, 
    active, 
    breakdown,
    hoverClass
}: { 
    title: string, 
    value: string, 
    subValue: string, 
    icon: any, 
    active?: boolean,
    breakdown?: { label: string; value: string; color?: string }[],
    hoverClass?: string
}) => (
    <div className={`p-6 rounded-xl border transition-all duration-300 group hover:shadow-lg ${
        active 
        ? 'bg-primary-50 dark:bg-primary-500/10 border-primary-500 shadow-md' 
        : `bg-white dark:bg-dark-800 border-gray-300 dark:border-dark-700 ${hoverClass || 'hover:border-primary-500/50 hover:shadow-primary-500/40'}`
    }`}>
        <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm font-medium ${active ? 'text-primary-700 dark:text-primary-500' : 'text-gray-500 dark:text-gray-400'}`}>{title}</h3>
            <div className={`p-2 rounded-lg transition-colors duration-300 ${active ? 'bg-primary-200 dark:bg-primary-500/20' : 'bg-gray-100 dark:bg-dark-700'}`}>
                <Icon className={`h-5 w-5 ${active ? 'text-primary-700 dark:text-primary-500' : 'text-gray-500 dark:text-gray-400'}`} />
            </div>
        </div>
        <div className="flex flex-col">
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">{subValue}</div>
            
            {breakdown && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-4">
                    {breakdown.map((item, idx) => (
                        <div key={idx}>
                            <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">{item.label}</p>
                            <p className={`text-sm font-bold ${item.color || 'text-gray-700 dark:text-gray-200'}`}>{item.value}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
);

export const TotalRidesPage: React.FC<TotalRidesPageProps> = ({ onBack }) => {
    const [timeRange, setTimeRange] = useState<TimeRange>('Weekly');
    const ridesData = ApiService.getTotalRidesData();

    const getData = () => {
        switch (timeRange) {
            case 'Weekly': return ridesData.weekly;
            case 'Monthly': return ridesData.monthly;
            case 'Yearly': return ridesData.yearly;
            default: return ridesData.weekly;
        }
    };

    const getTotal = () => {
        const data = getData();
        return data.reduce((acc, curr) => acc + curr.rides, 0);
    };

    const totalRides = getTotal();
    const formattedTotal = totalRides.toLocaleString();
    
    // Calculate mock breakdown values based on total
    const rideShareValue = Math.floor(totalRides * 0.65).toLocaleString();
    const forHireValue = Math.floor(totalRides * 0.35).toLocaleString();
    const completedValue = Math.floor(totalRides * 0.92).toLocaleString();
    const cancelledValue = Math.floor(totalRides * 0.08).toLocaleString();
    
    // Reuse monthly data for area chart
    const monthlyData = ridesData.monthly;

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 p-3 rounded-lg shadow-xl">
                    <p className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">{label}</p>
                    <p className="text-primary-600 dark:text-primary-500 text-lg font-bold">
                        {payload[0].value.toLocaleString()} Rides
                    </p>
                    <p className="text-red-500 text-xs font-medium mt-1">
                        {payload[1]?.value.toLocaleString()} Cancelled
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4 mb-2">
                <button 
                    onClick={onBack}
                    className="p-2 rounded-lg bg-gray-200 dark:bg-dark-700 hover:bg-gray-300 dark:hover:bg-dark-600 text-gray-900 dark:text-white transition-colors"
                >
                    <ArrowLeftIcon className="h-5 w-5" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Total Rides Analytics</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Detailed breakdown of ride volume and performance</p>
                </div>
            </div>

            {/* Top Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Rides" 
                    value={formattedTotal} 
                    subValue={`Total ${timeRange.toLowerCase()} volume`}
                    icon={CarIcon} 
                    active={true}
                    breakdown={[
                        { label: 'Ride Share', value: rideShareValue, color: 'text-primary-600 dark:text-primary-500' },
                        { label: 'For Hire', value: forHireValue, color: 'text-blue-600 dark:text-blue-500' }
                    ]}
                    hoverClass="hover:border-primary-500 hover:shadow-primary-500/40"
                />
                <StatCard 
                    title="Ride Status" 
                    value="92.4%" 
                    subValue="Completion Rate"
                    icon={SteeringWheelIcon} 
                    breakdown={[
                        { label: 'Completed', value: completedValue, color: 'text-green-600 dark:text-green-500' },
                        { label: 'Cancelled', value: cancelledValue, color: 'text-red-600 dark:text-red-500' }
                    ]}
                    hoverClass="hover:border-green-500 hover:shadow-green-500/40"
                />
                 <StatCard 
                    title="Avg Daily Rides" 
                    value="1,240" 
                    subValue="Peak: 1,850 (Sat)"
                    icon={DocumentIcon} 
                    hoverClass="hover:border-orange-500 hover:shadow-orange-500/40"
                />
                 <StatCard 
                    title="Avg Distance" 
                    value="4.8 km" 
                    subValue="Per trip avg."
                    icon={TagIcon} 
                    hoverClass="hover:border-indigo-500 hover:shadow-indigo-500/40"
                />
            </div>

            {/* Main Chart Section */}
            <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-gray-300 dark:border-dark-700 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ride Volume History</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Comparative view of completed vs cancelled rides</p>
                    </div>
                    <div className="bg-gray-100 dark:bg-dark-700 p-1 rounded-lg flex space-x-1 mt-4 sm:mt-0">
                        {['Weekly', 'Monthly', 'Yearly'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range as TimeRange)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                    timeRange === range 
                                    ? 'bg-white dark:bg-dark-600 text-primary-600 dark:text-primary-500 shadow-sm' 
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getData()} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#9CA3AF', fontSize: 12 }} 
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                            <Bar 
                                dataKey="rides" 
                                fill="#FACC15" 
                                radius={[4, 4, 0, 0]} 
                                barSize={timeRange === 'Yearly' ? 60 : 30}
                            />
                             <Bar 
                                dataKey="cancelled" 
                                fill="#EF4444" 
                                radius={[4, 4, 0, 0]} 
                                barSize={timeRange === 'Yearly' ? 60 : 30}
                                stackId="a"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Secondary Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart - Ride Status */}
                <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-gray-300 dark:border-dark-700 shadow-sm flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Ride Status Distribution</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Breakdown of all requested rides</p>
                    
                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                                    itemStyle={{ color: '#f3f4f6' }}
                                />
                                <Legend 
                                    verticalAlign="bottom" 
                                    height={36} 
                                    formatter={(value, entry: any) => <span className="text-gray-600 dark:text-gray-300 ml-2">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                 {/* Area Chart - Ride Types */}
                <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-gray-300 dark:border-dark-700 shadow-sm flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Ride Type Trends</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Share vs For Hire Comparison</p>

                    <div className="flex-1 min-h-[300px]">
                         <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorShare" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FACC15" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#FACC15" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorHire" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                                />
                                <Area type="monotone" dataKey="rides" stroke="#FACC15" fillOpacity={1} fill="url(#colorShare)" name="Ride Share" />
                                <Area type="monotone" dataKey="cancelled" stroke="#3b82f6" fillOpacity={1} fill="url(#colorHire)" name="For Hire" />
                                <Legend verticalAlign="top" align="right" height={36} iconType="circle"/>
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Daily Statistics Table (New Section) */}
            <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-gray-300 dark:border-dark-700 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Daily Ride Statistics (Last 7 Days)</h3>
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-dark-700">
                            <tr>
                                <th scope="col" className="px-6 py-3">Day</th>
                                <th scope="col" className="px-6 py-3">Total Rides</th>
                                <th scope="col" className="px-6 py-3">Cancelled</th>
                                <th scope="col" className="px-6 py-3">Completion Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ridesData.weekly.map((day, index) => {
                                const completionRate = day.rides > 0 ? ((day.rides - day.cancelled) / day.rides * 100).toFixed(1) : '0.0';
                                return (
                                    <tr key={index} className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{day.name}</td>
                                        <td className="px-6 py-4 text-gray-900 dark:text-white font-bold">{day.rides.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-red-500 font-medium">{day.cancelled}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <span className="text-gray-700 dark:text-gray-300 mr-3 w-10 text-right">{completionRate}%</span>
                                                <div className="w-32 bg-gray-200 dark:bg-dark-600 rounded-full h-2">
                                                    <div 
                                                        className={`h-2 rounded-full ${parseFloat(completionRate) > 90 ? 'bg-green-500' : parseFloat(completionRate) > 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                        style={{ width: `${completionRate}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
