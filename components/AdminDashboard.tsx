import React, { useState, useEffect, useCallback } from 'react';
import { getLogs } from '../services/monitoringService';
import type { ApiLogEntry } from '../types';
import type { ChartData } from 'chart.js';
import { ApiChart } from './ApiChart';
import { LogoutIcon, BarChartIcon, RefreshCwIcon } from './Icons';

interface AdminDashboardProps {
    onLogout: () => void;
    userName?: string;
}

const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
};

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-slate-800 p-4 rounded-xl shadow-lg flex items-center gap-4">
        <div className="p-3 bg-slate-700 rounded-lg">
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-400">{title}</p>
            <p className="text-xl font-bold text-white">{value}</p>
        </div>
    </div>
);

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, userName }) => {
    const [logs, setLogs] = useState<ApiLogEntry[]>([]);
    const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [callCountData, setCallCountData] = useState<ChartData<'bar', number[], string>>({ labels: [], datasets: [] });
    const [timeConsumptionData, setTimeConsumptionData] = useState<ChartData<'doughnut', number[], string>>({ labels: [], datasets: [] });

    const fetchLogs = useCallback(() => {
        const currentLogs = getLogs();
        setLogs(currentLogs);
        setLastRefreshed(new Date());

        if (currentLogs.length > 0) {
            const counts: { [key: string]: number } = {};
            const durations: { [key: string]: number } = {};
            
            currentLogs.forEach(log => {
                counts[log.functionName] = (counts[log.functionName] || 0) + 1;
                durations[log.functionName] = (durations[log.functionName] || 0) + log.duration;
            });

            setCallCountData({
                labels: Object.keys(counts),
                datasets: [{
                    label: 'API Call Counts',
                    data: Object.values(counts),
                }],
            });

            setTimeConsumptionData({
                labels: Object.keys(durations),
                datasets: [{
                    label: 'Total Duration (ms)',
                    data: Object.values(durations),
                }]
            });
        } else {
            setCallCountData({ labels: [], datasets: [] });
            setTimeConsumptionData({ labels: [], datasets: [] });
        }

    }, []);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchLogs();
        // Use a timeout to ensure the user sees the spin animation
        setTimeout(() => setIsRefreshing(false), 500);
    };

    const totalCalls = logs.length;
    const totalErrors = logs.filter(log => log.status === 'error').length;
    const averageDuration = totalCalls > 0 ? Math.round(logs.reduce((acc, log) => acc + log.duration, 0) / totalCalls) : 0;
    
    return (
        <div className="min-h-screen bg-slate-900 text-slate-200">
            <header className="py-4 px-4 md:px-8 border-b border-slate-700">
                <div className="container mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                        <p className="text-sm text-slate-400">API Usage & Monitoring</p>
                    </div>
                    <div className="flex items-center gap-4">
                         <span className="text-slate-300 hidden sm:block">Welcome, {userName}!</span>
                         <button
                            onClick={onLogout}
                            className="flex items-center gap-2 px-3 py-2 bg-slate-700 text-slate-300 font-semibold rounded-lg shadow-sm hover:bg-slate-600 transition-colors"
                            aria-label="Log out"
                        >
                            <LogoutIcon className="w-5 h-5"/>
                            <span className="hidden md:block">Logout</span>
                        </button>
                    </div>
                </div>
            </header>
            <main className="container mx-auto p-4 md:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
                    <StatCard title="Total API Calls" value={totalCalls} icon={<BarChartIcon className="w-6 h-6 text-cyan-400"/>} />
                    <StatCard title="Total Errors" value={totalErrors} icon={<BarChartIcon className="w-6 h-6 text-red-400"/>} />
                    <StatCard title="Avg. Duration" value={formatDuration(averageDuration)} icon={<BarChartIcon className="w-6 h-6 text-yellow-400"/>} />
                </div>
                
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-cyan-400 mb-4">API Call Visualization</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                        <ApiChart data={callCountData} title="API Call Distribution" type="bar" />
                        <ApiChart data={timeConsumptionData} title="API Time Consumption by Function" type="doughnut" />
                    </div>
                </div>


                <div className="bg-slate-800 rounded-xl shadow-lg p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-cyan-400">API Call Logs</h2>
                            <p className="text-xs text-slate-500 mt-1">
                                Last refreshed: {lastRefreshed ? lastRefreshed.toLocaleString() : 'Never'}
                            </p>
                        </div>
                        <div className="flex items-center gap-4 self-start sm:self-center">
                            <button onClick={handleRefresh} className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors disabled:opacity-50" disabled={isRefreshing}>
                                <RefreshCwIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-400">
                            <thead className="text-xs text-slate-300 uppercase bg-slate-700">
                                <tr>
                                    <th scope="col" className="px-4 md:px-6 py-3">Function</th>
                                    <th scope="col" className="px-4 md:px-6 py-3">Status</th>
                                    <th scope="col" className="px-4 md:px-6 py-3">Duration</th>
                                    <th scope="col" className="px-4 md:px-6 py-3">Timestamp</th>
                                    <th scope="col" className="px-4 md:px-6 py-3">Error</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.length > 0 ? logs.map(log => (
                                    <tr key={log.id} className="bg-slate-800 border-b border-slate-700 hover:bg-slate-700/50">
                                        <th scope="row" className="px-4 md:px-6 py-4 font-medium text-white whitespace-nowrap">{log.functionName}</th>
                                        <td className="px-4 md:px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${log.status === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="px-4 md:px-6 py-4">{formatDuration(log.duration)}</td>
                                        <td className="px-4 md:px-6 py-4">{new Date(log.startTime).toLocaleString()}</td>
                                        <td className="px-4 md:px-6 py-4 text-red-400 whitespace-pre-wrap break-all">{log.errorMessage || 'N/A'}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8">No API logs found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};