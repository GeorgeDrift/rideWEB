
import React, { useState, useEffect, useRef } from 'react';
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Line, ResponsiveContainer } from 'recharts';
import { DocumentIcon, MoneyIcon, SteeringWheelIcon, CarIcon, ExclamationCircleIcon, ExpandIcon, CloseIcon, UsersIcon } from './Icons';
import { ApiService } from '../services/api';
import { pollingService } from '../services/polling';

type Metric = 'revenue' | 'subscriptions' | 'trials' | 'reactivations';
type TimeRange = 'This Week' | 'Last Week' | 'This Month';

// Mapbox types removed


const StatCard = ({ title, value, trend, trendUp, icon: Icon, subValue, onClick, breakdown }: { title: string, value: string, trend?: string, trendUp?: boolean, icon: any, subValue?: string, onClick?: () => void, breakdown?: { label: string, value: string }[] }) => (
    <div
        onClick={onClick}
        className={`bg-white dark:bg-dark-800 p-6 rounded-xl border border-gray-300 dark:border-dark-700 shadow-sm transition-all duration-300 group hover:shadow-lg hover:border-primary-500/50 dark:hover:shadow-primary-500/40 ${onClick ? 'cursor-pointer' : ''}`}
    >
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</h3>
            <div className="p-2 bg-gray-100 dark:bg-dark-700 rounded-lg group-hover:bg-primary-100 dark:group-hover:bg-primary-500/20 transition-colors duration-300">
                <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-500 transition-colors duration-300" />
            </div>
        </div>
        <div className="flex items-end justify-between">
            <div className="w-full">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
                {trend && (
                    <div className={`text-xs font-medium ${trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} flex items-center`}>
                        {trendUp ? '↑' : '↓'} {trend}
                        <span className="text-gray-500 dark:text-gray-500 ml-1">vs last month</span>
                    </div>
                )}
                {breakdown && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-dark-700 flex justify-between text-xs">
                        {breakdown.map((item, idx) => (
                            <div key={idx} className="flex flex-col">
                                <span className="text-gray-500 dark:text-gray-400">{item.label}</span>
                                <span className="font-semibold text-gray-700 dark:text-gray-200">{item.value}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {subValue && <div className="text-xs text-gray-500 dark:text-gray-500 mb-1">{subValue}</div>}
        </div>
    </div>
);

interface DashboardProps {
    onNavigate: (view: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
    const [timeRange, setTimeRange] = useState<TimeRange>('This Week');
    const [isExpanded, setIsExpanded] = useState(false);
    const [dashboardData, setDashboardData] = useState<any>({ users: 0, activeDrivers: 0, rides: 0, revenue: 0, pendingDisputes: 0, weekly: [], lastWeek: [], monthly: [] });

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const data = await ApiService.getDashboardData();
                if (mounted && data) setDashboardData(data);
            } catch (e) {
                console.warn('Failed to load dashboard data', e);
            }
        };
        load();
        return () => { mounted = false; };
    }, []);

    // Auto-poll admin dashboard data for real-time updates
    useEffect(() => {
        // Poll dashboard metrics every 10 seconds
        pollingService.startPolling('admin-dashboard', {
            interval: 10000,
            onPoll: async () => {
                try {
                    const data = await ApiService.getDashboardData();
                    setDashboardData(data || { users: 0, activeDrivers: 0, rides: 0, revenue: 0, pendingDisputes: 0, weekly: [], lastWeek: [], monthly: [] });
                } catch (e) { console.warn('Polling dashboard data failed', e); }
            }
        });

        // Cleanup: stop polling when component unmounts
        return () => {
            pollingService.stopPolling('admin-dashboard');
        };
    }, []);

    const getCurrentData = () => {
        switch (timeRange) {
            case 'This Week': return dashboardData.weekly;
            case 'Last Week': return dashboardData.lastWeek;
            case 'This Month': return dashboardData.monthly;
            default: return dashboardData.weekly;
        }
    };

    const getSubtitle = () => {
        switch (timeRange) {
            case 'This Month': return 'Monthly revenue history (Last 7 Months)';
            default: return 'Daily revenue performance';
        }
    }

    // Map effects removed


    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 p-3 rounded-lg shadow-xl">
                    <p className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">{label}</p>
                    <p className="text-primary-600 dark:text-primary-500 text-lg font-bold">
                        MWK {(payload[0]?.value ?? 0).toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 relative">
            {/* Backdrop for expanded view */}
            {isExpanded && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity duration-300"
                    onClick={() => setIsExpanded(false)}
                />
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`MWK ${(dashboardData.revenue || 0).toLocaleString()}`}
                    trend={undefined}
                    trendUp={true}
                    icon={MoneyIcon}
                    onClick={() => onNavigate('revenue')}
                />
                <StatCard
                    title="Total Rides"
                    value={`${dashboardData.rides || 0}`}
                    icon={CarIcon}
                    breakdown={[
                        { label: 'Ride Share', value: dashboardData?.rideShareCount ? `${dashboardData.rideShareCount}` : '—' },
                        { label: 'For Hire', value: dashboardData?.forHireCount ? `${dashboardData.forHireCount}` : '—' }
                    ]}
                    onClick={() => onNavigate('total-rides')}
                />
                <StatCard
                    title="Active Drivers"
                    value={`${dashboardData.activeDrivers || 0}`}
                    trend={undefined}
                    trendUp={false}
                    icon={SteeringWheelIcon}
                    onClick={() => onNavigate('drivers')}
                />
                <StatCard
                    title="Total Users"
                    value={`${dashboardData.users || 0}`}
                    icon={UsersIcon}
                    breakdown={[
                        { label: 'Riders', value: `${dashboardData.riderCount || 0}` },
                        { label: 'Drivers', value: `${dashboardData.driverCount || 0}` }
                    ]}
                    onClick={() => onNavigate('riders')} // Navigate to riders list or a general users list
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-dark-800 p-6 rounded-xl border border-gray-300 dark:border-dark-700 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Revenue Overview</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{getSubtitle()}</p>
                        </div>
                        <div className="flex space-x-2 mt-4 sm:mt-0">
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                                className="bg-gray-100 dark:bg-dark-700 border-none text-sm text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary-500 cursor-pointer outline-none"
                            >
                                <option value="This Week">This Week</option>
                                <option value="Last Week">Last Week</option>
                                <option value="This Month">This Month</option>
                            </select>
                            <button className="p-2 bg-gray-100 dark:bg-dark-700 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                                <DocumentIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={getCurrentData()} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                                    tickFormatter={(value) => `MWK ${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#374151', strokeWidth: 2 }} />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#FACC15"
                                    strokeWidth={3}
                                    dot={{ fill: '#1F2937', stroke: '#FACC15', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, fill: '#FACC15' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Side: Active Operations Map & Stats */}
                <div className="space-y-6">
                    {/* Active Ride Map Widget */}
                    {/* Map Removed - Space reserved for future widgets */}


                    <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-gray-300 dark:border-dark-700 shadow-sm">
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Platform Stats</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Key performance indicators</p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-500 dark:text-gray-400">Active Subscriptions</span>
                                    <span className="text-gray-900 dark:text-white font-medium">85%</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-dark-700 rounded-full h-2">
                                    <div className="bg-primary-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-500 dark:text-gray-400">Customer Satisfaction</span>
                                    <span className="text-gray-900 dark:text-white font-medium">92%</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-dark-700 rounded-full h-2">
                                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
