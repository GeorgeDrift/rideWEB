
import React, { useState, useEffect } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { ArrowLeftIcon, TagIcon, DocumentIcon, MapIcon, CarIcon, PlusIcon } from './Icons';
import { ApiService } from '../services/api';
import { VehicleCategory } from '../types/vehicle';

interface ForHirePageProps {
    onBack: () => void;
}

const StatCard = ({ title, value, subValue, icon: Icon, trend, trendUp }: { title: string, value: string, subValue: string, icon: any, trend?: string, trendUp?: boolean }) => (
    <div className="p-6 rounded-xl border bg-white dark:bg-dark-800 border-gray-300 dark:border-dark-700 shadow-sm transition-all duration-300 group hover:shadow-lg hover:border-purple-500 hover:shadow-purple-500/40">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-500/20 group-hover:bg-purple-200 dark:group-hover:bg-purple-500/30 transition-colors">
                <Icon className="h-5 w-5 text-purple-600 dark:text-purple-500" />
            </div>
        </div>
        <div className="flex flex-col">
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
            <div className="flex items-center text-xs">
                {trend && (
                    <span className={`font-medium mr-2 ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
                        {trendUp ? '↑' : '↓'} {trend}
                    </span>
                )}
                <span className="text-gray-500 dark:text-gray-400">{subValue}</span>
            </div>
        </div>
    </div>
);

const FleetCard: React.FC<{ category: any; onClick: () => void }> = ({ category, onClick }) => (
    <div
        onClick={onClick}
        className="cursor-pointer bg-white dark:bg-dark-800 p-5 rounded-xl border border-gray-300 dark:border-dark-700 shadow-sm hover:shadow-lg hover:border-purple-500 hover:scale-[1.02] transition-all duration-300"
    >
        <div className="flex justify-between items-start mb-4">
            <div className="flex items-center">
                <div className="text-3xl mr-3">{category.icon}</div>
                <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">{category.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{category.count} Units Listed</p>
                </div>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-2 py-1 rounded">
                {category.available} Avail.
            </div>
        </div>

        {/* Availability Bar */}
        <div className="w-full bg-gray-100 dark:bg-dark-700 rounded-full h-1.5 mb-4">
            <div
                className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${(category.available / category.count) * 100}%` }}
            ></div>
        </div>

        <div className="space-y-1">
            {category.examples.slice(0, 4).map((ex: string, i: number) => (
                <div key={i} className="text-xs text-gray-600 dark:text-gray-300 flex items-center">
                    <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-600 rounded-full mr-2"></span>
                    {ex}
                </div>
            ))}
            {category.examples.length > 4 && (
                <div className="text-xs text-purple-600 dark:text-purple-400 font-medium pl-3.5 pt-1">
                    +{category.examples.length - 4} more models
                </div>
            )}
        </div>
    </div>
);

export const ForHirePage: React.FC<ForHirePageProps> = ({ onBack }) => {
    const [timeRange, setTimeRange] = useState<'Weekly' | 'Monthly'>('Weekly');
    const [selectedCategory, setSelectedCategory] = useState<any | null>(null);

    const [forHireData, setForHireData] = useState<any>({ weekly: [], monthly: [], categories: [] });

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const data = await ApiService.getForHireData();
                if (mounted) setForHireData(data);
            } catch (e) {
                console.warn('Failed to load for-hire data', e);
            }
        })();
        return () => { mounted = false; };
    }, []);

    // const getData = () => (timeRange === 'Weekly' ? (forHireData.weekly || []) : (forHireData.monthly || []));

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 p-3 rounded-lg shadow-xl">
                    <p className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">{label}</p>
                    <p className="text-purple-500 dark:text-purple-400 text-sm font-bold">
                        {(payload[0]?.value ?? 0).toLocaleString()} Requests
                    </p>
                </div>
            );
        }
        return null;
    };

    // Detail View for Selected Category
    if (selectedCategory) {
        return (
            <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center space-x-4 mb-6">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className="p-2 rounded-lg bg-gray-200 dark:bg-dark-700 hover:bg-gray-300 dark:hover:bg-dark-600 text-gray-900 dark:text-white transition-colors"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                            <span className="text-3xl mr-3">{selectedCategory.icon}</span>
                            {selectedCategory.title}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Detailed performance and fleet analytics</p>
                    </div>
                </div>

                {/* Detailed Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Active Rentals"
                        value={selectedCategory.stats.activeRentals.toString()}
                        subValue="People currently hiring"
                        trend={`${Math.abs(selectedCategory.stats.growth)}%`}
                        trendUp={selectedCategory.stats.growth > 0}
                        icon={DocumentIcon}
                    />
                    <StatCard
                        title="Fleet Size"
                        value={selectedCategory.count.toString()}
                        subValue={`${selectedCategory.available} currently available`}
                        icon={CarIcon}
                    />
                    <StatCard
                        title="Weekly Revenue"
                        value={`MWK ${(selectedCategory?.stats?.revenue ?? 0).toLocaleString()}`}
                        subValue="From this category"
                        trend="4.2%"
                        trendUp={true}
                        icon={TagIcon}
                    />
                    <StatCard
                        title="Avg Rate"
                        value={`MWK ${selectedCategory.stats.avgRate}`}
                        subValue="Per day / job"
                        icon={DocumentIcon}
                    />
                </div>

                {/* Category Chart */}
                <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-gray-300 dark:border-dark-700 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Demand Trend (Last 7 Days)</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={selectedCategory.stats.chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCategory" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                                <XAxis
                                    dataKey="day"
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
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#374151', strokeWidth: 1 }} />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorCategory)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Specific Model List */}
                <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-gray-300 dark:border-dark-700 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vehicles in this Category</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedCategory.examples.map((model: string, idx: number) => (
                            <div key={idx} className="flex items-center p-3 bg-gray-50 dark:bg-dark-700/50 rounded-lg border border-gray-200 dark:border-dark-600">
                                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-dark-600 flex items-center justify-center mr-3 text-lg">
                                    {selectedCategory.icon}
                                </div>
                                <span className="text-gray-800 dark:text-gray-200 font-medium">{model}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Default Main View
    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4 mb-6">
                <button
                    onClick={onBack}
                    className="p-2 rounded-lg bg-gray-200 dark:bg-dark-700 hover:bg-gray-300 dark:hover:bg-dark-600 text-gray-900 dark:text-white transition-colors"
                >
                    <ArrowLeftIcon className="h-5 w-5" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                        <span className="w-3 h-3 rounded-full bg-purple-500 mr-3"></span>
                        For Hire Analytics
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Private hire, machinery, and scheduled trip performance</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <StatCard
                    title="Total Hire Jobs"
                    value="2,450"
                    subValue="+5% vs last week"
                    icon={TagIcon}
                />
                <StatCard
                    title="Advance Bookings"
                    value="32%"
                    subValue="Of total trips"
                    icon={DocumentIcon}
                />
                <StatCard
                    title="Avg Trip Distance"
                    value="12.4 km"
                    subValue="Longer than ride share"
                    icon={MapIcon}
                />
            </div>

            <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-gray-300 dark:border-dark-700 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{timeRange} Scheduled vs Immediate</h3>
                    <div className="bg-gray-100 dark:bg-dark-700 p-1 rounded-lg flex space-x-1 mt-4 sm:mt-0">
                        {['Weekly', 'Monthly'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range as 'Weekly' | 'Monthly')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${timeRange === range
                                    ? 'bg-white dark:bg-dark-600 text-purple-600 dark:text-purple-500 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={timeRange === 'Weekly' ? (forHireData.weekly || []) : (forHireData.monthly || [])} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorScheduled" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorImmediate" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                </linearGradient>
                            </defs>
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
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#374151', strokeWidth: 1 }} />
                            <Area
                                type="monotone"
                                dataKey="scheduled"
                                stroke="#4f46e5"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorScheduled)"
                                name="Scheduled"
                            />
                            <Area
                                type="monotone"
                                dataKey="immediate"
                                stroke="#a855f7"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorImmediate)"
                                name="Immediate"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Fleet Availability Section */}
            <div className="pt-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Fleet Availability & Categories</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Select a category below to view specific hiring statistics and trends.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {forHireData.categories.map((category: any, index: number) => (
                        <FleetCard
                            key={index}
                            category={category}
                            onClick={() => setSelectedCategory(category)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
