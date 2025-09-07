import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import type { ChartData, ChartOptions } from 'chart.js';

interface ApiChartProps {
    data: ChartData<'bar' | 'doughnut', number[], string>;
    title: string;
    type: 'bar' | 'doughnut';
}

const chartColors = [
    '#14b8a6', // teal-500
    '#f59e0b', // amber-500
    '#8b5cf6', // violet-500
    '#f43f5e', // rose-500
    '#38bdf8', // sky-500
    '#84cc16', // lime-500
];

export const ApiChart: React.FC<ApiChartProps> = ({ data, title, type }) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<Chart<'bar' | 'doughnut', number[], string> | null>(null);
    const hasData = data && data.datasets.length > 0 && data.datasets[0].data.length > 0;

    useEffect(() => {
        if (!chartRef.current || !hasData) return;

        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;

        const options: ChartOptions<'bar' | 'doughnut'> = {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: title,
                    color: '#cbd5e1', // slate-300
                    font: {
                        size: 16,
                        weight: 'bold',
                    },
                    padding: {
                        bottom: 20,
                    }
                },
                legend: {
                    display: type === 'doughnut',
                    position: 'bottom',
                    labels: {
                        color: '#94a3b8', // slate-400
                        padding: 20,
                        font: {
                            size: 12,
                        }
                    },
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw as number;
                            if (type === 'doughnut') {
                                const dataPoints = context.dataset.data as number[];
                                const total = dataPoints.reduce((a, b) => a + b, 0);
                                const percentage = ((value / (total || 1)) * 100).toFixed(1) + '%';
                                return `${label}: ${percentage}`;
                            }
                            return `${label}: ${value}`;
                        }
                    }
                }
            },
        };

        // FIX: Cast options to the specific chart options type to allow setting type-specific properties.
        if (type === 'doughnut') {
            (options as ChartOptions<'doughnut'>).cutout = '60%';
        } else if (type === 'bar') {
            (options as ChartOptions<'bar'>).scales = {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#94a3b8', precision: 0 },
                    grid: { color: '#334155' }
                },
                x: {
                    ticks: { color: '#94a3b8' },
                    grid: { display: false }
                }
            };
        }

        chartInstance.current = new Chart(ctx, {
            type: type,
            data: {
                ...data,
                datasets: data.datasets.map(dataset => ({
                    ...dataset,
                    backgroundColor: type === 'bar' ? chartColors[0] : chartColors,
                    borderColor: '#1e293b', // slate-800
                    borderWidth: type === 'doughnut' ? 2 : 0,
                    hoverOffset: type === 'doughnut' ? 8 : undefined,
                })),
            },
            options: options,
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
                chartInstance.current = null;
            }
        };
    }, [data, title, type, hasData]);

    return (
        <div className="bg-slate-800 p-4 rounded-xl shadow-lg h-full relative">
            <h3 className="text-center text-base font-bold text-slate-300 mb-4">{title}</h3>
            <div className="relative h-[300px]">
                {!hasData && (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-500 z-10">
                        <p>No data to display</p>
                    </div>
                )}
                <canvas ref={chartRef} className={!hasData ? 'opacity-20' : ''}></canvas>
            </div>
        </div>
    );
};