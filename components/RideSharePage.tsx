
import React, { useState, useEffect } from 'react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { ArrowLeftIcon, CarIcon, SteeringWheelIcon, DocumentIcon } from './Icons';
import { ApiService } from '../services/api';

interface RideSharePageProps {
    onBack: () => void;
}

const StatCard = ({ title, value, subValue, icon: Icon }: { title: string, value: string, subValue: string, icon: any }) => (
    <div className="p-6 rounded-xl border bg-white dark:bg-dark-800 border-gray-300 dark:border-dark-700 shadow-sm transition-all duration-300 group hover:shadow-lg hover:border-blue-500 hover:shadow-blue-500/40">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-500/20 group-hover:bg-blue-200 dark:group-hover:bg-blue-500/30 transition-colors">
                <Icon className="h-5 w-5 text-blue-600 dark:text-blue-500" />
            </div>
        </div>
        <div className="flex flex-col">
            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{subValue}</div>
        </div>
    </div>
);

export const RideSharePage: React.FC<RideSharePageProps> = ({ onBack }) => {
    const [timeRange, setTimeRange] = useState<'Weekly' | 'Monthly'>('Weekly');
    const [rideShareData, setRideShareData] = useState<any>({ weekly: [], monthly: [] });

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const data = await ApiService.getRideShareData();
                if (mounted) setRideShareData(data);
            } catch (e) {
                console.warn('Failed to load ride share data', e);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const getData = () => (timeRange === 'Weekly' ? (rideShareData.weekly || []) : (rideShareData.monthly || []));

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 p-3 rounded-lg shadow-xl">
                    <p className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">{label}</p>
                    <p className="text-blue-600 dark:text-blue-500 text-lg font-bold">
                        {(payload[0]?.value ?? 0).toLocaleString()} Rides
                    </p>
                </div>
            );
        }
        return null;
    };

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
                        <span className="w-3 h-3 rounded-full bg-blue-500 mr-3"></span>
                        Ride Share Analytics
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Performance metrics for Ride Share services</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <StatCard 
                    title="Total Ride Shares" 
                    value="13,720" 
                    subValue="+12% vs last week"
                    icon={CarIcon} 
                />
                <StatCard 
                    title="Active Vehicles" 
                    value="845" 
                    subValue="Currently on road"
                    icon={SteeringWheelIcon} 
                />
                <StatCard 
                    title="Avg Fare" 
                    value="MWK 24.50" 
                    subValue="Per completed trip"
                    icon={DocumentIcon} 
                />
            </div>

            <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-gray-300 dark:border-dark-700 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{timeRange} Volume</h3>
                    <div className="bg-gray-100 dark:bg-dark-700 p-1 rounded-lg flex space-x-1 mt-4 sm:mt-0">
                        {['Weekly', 'Monthly'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range as 'Weekly' | 'Monthly')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                    timeRange === range 
                                    ? 'bg-white dark:bg-dark-600 text-blue-600 dark:text-blue-500 shadow-sm' 
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
                        <AreaChart data={getData()} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRideShare" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
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
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3b82f6', strokeWidth: 1 }} />
                            <Area 
                                type="monotone" 
                                dataKey="rides" 
                                stroke="#3b82f6" 
                                strokeWidth={3} 
                                fillOpacity={1} 
                                fill="url(#colorRideShare)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
