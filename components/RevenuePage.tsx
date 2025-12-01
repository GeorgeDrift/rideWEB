
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeftIcon, MoneyIcon, DocumentIcon } from './Icons';
import { ApiService, Transaction } from '../services/api';
import { useState, useEffect } from 'react';

interface RevenuePageProps {
    onBack: () => void;
}

const SummaryCard = ({ title, value, subtitle, type }: { title: string, value: string, subtitle: string, type: 'primary' | 'green' | 'blue' }) => {
    const colors = {
        primary: 'text-primary-600 dark:text-primary-500 border-primary-500/30 bg-primary-500/5',
        green: 'text-green-600 dark:text-green-500 border-green-500/30 bg-green-500/5',
        blue: 'text-blue-600 dark:text-blue-500 border-blue-500/30 bg-blue-500/5',
    };
    
    return (
        <div className={`p-6 rounded-xl border ${colors[type].replace('text-', 'border-')} bg-white dark:bg-dark-800`}>
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">{title}</h3>
            <div className={`text-3xl font-bold mb-1 ${colors[type].split(' ')[0]}`}>{value}</div>
            <div className="text-xs text-gray-500">{subtitle}</div>
        </div>
    );
};

export const RevenuePage: React.FC<RevenuePageProps> = ({ onBack }) => {
    const [revenueData, setRevenueData] = useState<any>({ annual: [], transactions: [] });

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const data = await ApiService.getRevenueData();
                if (mounted) setRevenueData(data);
            } catch (e) {
                console.warn('Failed to fetch revenue data', e);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const annualData = revenueData.annual || [];
    const transactions = revenueData.transactions || [];
    
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 p-3 rounded-lg shadow-xl">
                    <p className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-1">{label} 2023</p>
                    <p className="text-primary-600 dark:text-primary-500 text-lg font-bold">
                        MWK {(payload[0]?.value ?? 0).toLocaleString()}
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
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Revenue Analytics</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Financial overview and transaction history</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard 
                    title="Net Revenue" 
                    value="MWK 1,245,920" 
                    subtitle="+18.2% vs last year" 
                    type="primary" 
                />
                <SummaryCard 
                    title="Pending Payouts" 
                    value="MWK 42,300" 
                    subtitle="Processing next Monday" 
                    type="blue" 
                />
                <SummaryCard 
                    title="Avg Revenue / Ride" 
                    value="MWK 28.45" 
                    subtitle="+2.4% vs last month" 
                    type="green" 
                />
            </div>

            {/* Main Chart */}
            <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-gray-300 dark:border-dark-700 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Annual Revenue Growth</h3>
                     <div className="flex items-center space-x-2">
                        <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <span className="w-2 h-2 rounded-full bg-primary-500 mr-2"></span>
                            2023
                        </span>
                     </div>
                </div>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={annualData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#FACC15" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#FACC15" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#383838" opacity={0.2} />
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
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#383838', strokeWidth: 1, strokeDasharray: '5 5' }} />
                            <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke="#FACC15" 
                                strokeWidth={3} 
                                fillOpacity={1} 
                                fill="url(#colorRevenue)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-gray-300 dark:border-dark-700 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
                    <button className="text-sm text-primary-600 dark:text-primary-500 hover:text-primary-500 font-medium">View All</button>
                </div>
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-500 dark:text-gray-500 uppercase bg-gray-50 dark:bg-dark-700/50">
                            <tr>
                                <th className="px-4 py-3 rounded-l-lg">Transaction ID</th>
                                <th className="px-4 py-3">Source</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right rounded-r-lg">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((trx: Transaction, index: number) => (
                                <tr key={index} className="border-b border-gray-100 dark:border-dark-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-dark-700/30 transition-colors">
                                    <td className="px-4 py-4 font-mono text-xs text-gray-600 dark:text-gray-300">{trx.id}</td>
                                    <td className="px-4 py-4 text-gray-900 dark:text-white font-medium">{trx.source}</td>
                                    <td className="px-4 py-4">{trx.date}</td>
                                    <td className="px-4 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                                            trx.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                            trx.status === 'Pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                                            'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                        }`}>
                                            {trx.status}
                                        </span>
                                    </td>
                                    <td className={`px-4 py-4 text-right font-bold ${trx.amount < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                                        {trx.amount < 0 ? '-' : '+'}MWK {Math.abs(trx.amount).toFixed(2)}
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
