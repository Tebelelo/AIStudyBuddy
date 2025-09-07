import React from 'react';
import { toast } from 'react-hot-toast';
import { DownloadIcon } from './Icons';

interface SummaryViewProps {
    summary: string;
}

const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const SummaryView: React.FC<SummaryViewProps> = ({ summary }) => {
    
    const handleExport = () => {
        try {
            downloadFile(summary, 'summary.txt', 'text/plain');
            toast.success('Summary exported!');
        } catch (error) {
            console.error('Failed to export summary:', error);
            toast.error('Could not export summary.');
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                <h2 className="text-2xl font-bold text-cyan-400">Summary</h2>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-700 text-slate-300 text-sm font-semibold rounded-lg shadow-sm hover:bg-slate-600 transition-colors self-end sm:self-auto"
                    aria-label="Export summary as text file"
                >
                    <DownloadIcon className="w-4 h-4" />
                    Export as TXT
                </button>
            </div>
            <div className="prose prose-invert prose-sm sm:prose-base prose-p:text-slate-300 prose-headings:text-slate-200 max-w-none whitespace-pre-wrap">
                {summary}
            </div>
        </div>
    );
};