import React from 'react';
import type { StudySession } from '../types';
import { TrashIcon, XIcon } from './Icons';

interface SessionHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    sessions: StudySession[];
    onLoadSession: (session: StudySession) => void;
    onDeleteSession: (sessionId: string) => void;
    isLoading: boolean;
}

const formatDate = (isoString: string) => {
    if (!isoString) {
        return 'Just now';
    }
    return new Date(isoString).toLocaleString();
};

export const SessionHistoryModal: React.FC<SessionHistoryModalProps> = ({
    isOpen,
    onClose,
    sessions,
    onLoadSession,
    onDeleteSession,
    isLoading
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="bg-slate-800 rounded-xl shadow-lg w-full max-w-2xl max-h-[80vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-cyan-400">Saved Sessions</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-600 transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto p-4">
                    {isLoading ? (
                        <p className="text-center text-slate-400">Loading sessions...</p>
                    ) : sessions.length === 0 ? (
                        <p className="text-center text-slate-500 py-8">You have no saved sessions.</p>
                    ) : (
                        <ul className="space-y-3">
                            {sessions.map(session => (
                                <li key={session.id} className="bg-slate-900 p-3 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                                    <div>
                                        <p className="font-semibold text-white">{session.name}</p>
                                        <p className="text-xs text-slate-400">Saved: {formatDate(session.createdAt)}</p>
                                    </div>
                                    <div className="flex items-center gap-2 self-end sm:self-auto">
                                        <button 
                                            onClick={() => onLoadSession(session)}
                                            className="px-3 py-1.5 text-sm bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-md transition-colors"
                                        >
                                            Load
                                        </button>
                                        <button 
                                            onClick={() => onDeleteSession(session.id)}
                                            className="p-2 text-slate-400 hover:text-red-400 rounded-md hover:bg-slate-700 transition-colors"
                                            aria-label="Delete session"
                                        >
                                            <TrashIcon className="w-5 h-5"/>
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};
