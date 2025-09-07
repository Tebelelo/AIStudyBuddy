import React, { useState } from 'react';
import { XIcon, SaveIcon } from './Icons';

interface SaveSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (sessionName: string) => void;
    isSaving: boolean;
}

export const SaveSessionModal: React.FC<SaveSessionModalProps> = ({ isOpen, onClose, onSave, isSaving }) => {
    const [sessionName, setSessionName] = useState('My Study Session');

    if (!isOpen) return null;

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (sessionName.trim()) {
            onSave(sessionName.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="bg-slate-800 rounded-xl shadow-lg w-full max-w-md"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-cyan-400">Save Session</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-600 transition-colors" disabled={isSaving}>
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <form onSubmit={handleSave}>
                    <div className="p-6">
                        <label htmlFor="sessionName" className="block text-sm font-medium text-slate-400 mb-2">Session Name</label>
                        <input
                            id="sessionName"
                            type="text"
                            value={sessionName}
                            onChange={(e) => setSessionName(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-cyan-500 focus:border-cyan-500"
                            placeholder="e.g., Biology Chapter 5 Notes"
                            required
                            autoFocus
                        />
                    </div>
                    <div className="p-4 bg-slate-900/50 rounded-b-xl flex justify-end gap-3">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-lg transition-colors"
                            disabled={isSaving}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                            disabled={isSaving || !sessionName.trim()}
                        >
                            {isSaving ? (
                                <>
                                 <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Saving...
                                </>
                            ) : (
                                <>
                                    <SaveIcon className="w-5 h-5" />
                                    Save
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};