
import React, { useState, useEffect, useRef } from 'react';
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Line, ResponsiveContainer } from 'recharts';
import { DocumentIcon, MoneyIcon, SteeringWheelIcon, CarIcon, ExclamationCircleIcon, MapIcon, ExpandIcon, CloseIcon } from './Icons';
import { ApiService } from '../services/api';

type Metric = 'revenue' | 'subscriptions' | 'trials' | 'reactivations';
type TimeRange = 'This Week' | 'Last Week' | 'This Month';

// Placeholder for Mapbox Token - User must replace this with a valid token to enable the map
const MAPBOX_TOKEN: string = 'pk.eyJ1IjoicGF0cmljay0xIiwiYSI6ImNtaTh0cGR2ajBmbmUybnNlZTk1dGV1NGEifQ.UCC5FLCAdiDj0EL93gnekg';

declare global {
    interface Window {
        mapboxgl: any;
    }
}

const StatCard = ({ title, value, trend, trendUp, icon: Icon, subValue, onClick, breakdown }: { title: string, value: string, trend?: string, trendUp?: boolean, icon: any, subValue?: string, onClick?: () => void, breakdown?: {label: string, value: string}[] }) => (
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
    const [mapError, setMapError] = useState<string | null>(null);
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<any>(null);

    const dashboardData = ApiService.getDashboardData();

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

    useEffect(() => {
        if (!window.mapboxgl) return;
        if (map.current) return;

        if (MAPBOX_TOKEN === 'YOUR_MAPBOX_ACCESS_TOKEN_HERE' || !MAPBOX_TOKEN) {
            setMapError("Mapbox Token not set");
            return;
        }

        window.mapboxgl.accessToken = MAPBOX_TOKEN;
        
        const initMap = () => {
            try {
                map.current = new window.mapboxgl.Map({
                    container: mapContainer.current,
                    style: 'mapbox://styles/mapbox/dark-v11',
                    center: [-73.9851, 40.7589], // NYC Center
                    zoom: 12.5,
                    pitch: 55, // 3D Pitch
                    bearing: -17.6,
                    antialias: true,
                    attributionControl: false
                });

                map.current.on('load', () => {
                    // 3D Buildings Layer
                    const layers = map.current.getStyle().layers;
                    const labelLayerId = layers.find(
                        (layer: any) => layer.type === 'symbol' && layer.layout['text-field']
                    )?.id;

                    if (labelLayerId) {
                        try {
                            map.current.addLayer(
                                {
                                    'id': '3d-buildings',
                                    'source': 'composite',
                                    'source-layer': 'building',
                                    'filter': ['==', 'extrude', 'true'],
                                    'type': 'fill-extrusion',
                                    'minzoom': 15,
                                    'paint': {
                                        'fill-extrusion-color': '#444',
                                        'fill-extrusion-height': [
                                            'interpolate',
                                            ['linear'],
                                            ['zoom'],
                                            15,
                                            0,
                                            15.05,
                                            ['get', 'height']
                                        ],
                                        'fill-extrusion-base': [
                                            'interpolate',
                                            ['linear'],
                                            ['zoom'],
                                            15,
                                            0,
                                            15.05,
                                            ['get', 'min_height']
                                        ],
                                        'fill-extrusion-opacity': 0.8
                                    }
                                },
                                labelLayerId
                            );
                        } catch(e) { console.warn("Layer add failed", e); }
                    }

                    // Add Markers from API
                    const vehicles = dashboardData.mapVehicles;

                    vehicles.forEach(v => {
                        const el = document.createElement('div');
                        el.className = 'w-3 h-3 rounded-full border-2 border-white dark:border-dark-800 shadow-lg cursor-pointer';
                        el.style.backgroundColor = v.type === 'share' ? '#FACC15' : '#3b82f6';
                        
                        // Add simple pulse animation to some markers
                        if (Math.random() > 0.5) {
                             el.classList.add('animate-pulse');
                        }

                        new window.mapboxgl.Marker(el)
                            .setLngLat([v.lng, v.lat])
                            .addTo(map.current);
                    });
                });

                map.current.on('error', (e: any) => {
                     // Suppress specific errors in preview environments
                     if (e.error?.message?.includes('Blocked a frame') || e.error?.message?.includes('Location')) {
                        return;
                     }
                     console.warn("Mapbox runtime warning:", e);
                });

            } catch (error) {
                console.error("Mapbox initialization failed:", error);
                setMapError("Failed to load map");
            }
        };

        // Delay init slightly
        const timer = setTimeout(initMap, 100);
        return () => clearTimeout(timer);
    }, []);

    // Handle map resize when expanding/collapsing
    useEffect(() => {
        if (map.current) {
            setTimeout(() => {
                map.current.resize();
            }, 300);
        }
    }, [isExpanded]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 p-3 rounded-lg shadow-xl">
                    <p className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">{label}</p>
                    <p className="text-primary-600 dark:text-primary-500 text-lg font-bold">
                        MWK {payload[0].value.toLocaleString()}
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
                    value="MWK 128,560" 
                    trend="12.5%" 
                    trendUp={true} 
                    icon={MoneyIcon}
                    onClick={() => onNavigate('revenue')}
                />
                <StatCard 
                    title="Total Rides (Today)" 
                    value="432" 
                    icon={CarIcon} 
                    breakdown={[
                        { label: 'Ride Share', value: '312' },
                        { label: 'For Hire', value: '120' }
                    ]}
                    onClick={() => onNavigate('total-rides')}
                />
                <StatCard 
                    title="Active Drivers" 
                    value="1,240" 
                    trend="2.1%" 
                    trendUp={false} 
                    icon={SteeringWheelIcon} 
                    onClick={() => onNavigate('drivers')}
                />
                <StatCard 
                    title="Pending Disputes" 
                    value="14" 
                    icon={ExclamationCircleIcon} 
                    trend="3 New"
                    trendUp={false} // Red because disputes are bad
                    onClick={() => onNavigate('disputes')}
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
                                    tickFormatter={(value) => `MWK ${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`}
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
                    <div 
                        className={`bg-white dark:bg-dark-800 rounded-xl border border-gray-300 dark:border-dark-700 shadow-sm overflow-hidden transition-all duration-500 ease-in-out flex flex-col ${
                            isExpanded 
                            ? 'fixed inset-4 z-50 h-auto shadow-2xl border-2 border-primary-500/50' 
                            : 'relative h-64 w-full'
                        }`}
                    >
                        {/* Floating Close Button for Expanded View */}
                        {isExpanded && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
                                className="absolute top-4 right-4 z-[60] p-2 bg-white dark:bg-dark-800 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full shadow-xl border border-gray-200 dark:border-dark-600 transition-all transform hover:scale-105"
                                title="Close Map"
                            >
                                <CloseIcon className="h-6 w-6" />
                            </button>
                        )}

                        {/* Map Header Overlay */}
                        <div className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-start bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
                            <div className="pointer-events-auto">
                                <h2 className="text-lg font-semibold text-white flex items-center shadow-black/50 drop-shadow-md">
                                    <MapIcon className="h-5 w-5 mr-2 text-primary-500"/>
                                    Live Operations
                                </h2>
                                {!mapError && <span className="text-xs bg-green-500/90 text-white px-2 py-0.5 rounded-full animate-pulse ml-7 shadow-sm">● Live</span>}
                            </div>
                            {/* Show small expand button ONLY when NOT expanded (or if expanded but using the old logic, but we have a big close button now) */}
                            {!isExpanded && !mapError && (
                                <button 
                                    onClick={() => setIsExpanded(true)}
                                    className="pointer-events-auto p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-white transition-colors"
                                    title="Expand Map"
                                >
                                    <ExpandIcon className="h-5 w-5" />
                                </button>
                            )}
                        </div>

                        {/* Map Container */}
                        <div className="relative flex-1 w-full h-full bg-gray-100 dark:bg-dark-900 group">
                            {mapError ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-gray-500 dark:text-gray-400">
                                    <MapIcon className="h-12 w-12 mb-3 opacity-20" />
                                    <p className="font-medium">Map Unavailable</p>
                                    <p className="text-xs mt-1 max-w-xs opacity-70">Add a valid Mapbox Access Token to the code to enable the live map view.</p>
                                </div>
                            ) : (
                                <div ref={mapContainer} className="absolute inset-0" />
                            )}
                            
                            {/* Overlay to hint at clickability when not expanded. */}
                            {!isExpanded && (
                                <div 
                                    className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 cursor-pointer transition-all z-30"
                                    onClick={() => setIsExpanded(true)}
                                >
                                    <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-black/80 text-white px-5 py-3 rounded-full flex items-center shadow-lg backdrop-blur-sm border border-white/10">
                                        <ExpandIcon className="h-5 w-5 mr-2"/>
                                        <span className="font-semibold">Click to View Live Map</span>
                                    </div>
                                </div>
                            )}
                            
                            {/* Legend */}
                            <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-dark-800/90 backdrop-blur-md p-3 rounded-lg border border-gray-300 dark:border-dark-600 z-10 flex justify-between text-xs pointer-events-none">
                                <div className="flex items-center">
                                    <span className="w-2 h-2 rounded-full bg-primary-500 mr-2"></span>
                                    <span className="text-gray-600 dark:text-gray-300">Ride Share</span>
                                </div>
                                 <div className="flex items-center">
                                    <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                                    <span className="text-gray-600 dark:text-gray-300">For Hire</span>
                                </div>
                            </div>
                        </div>
                    </div>

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
