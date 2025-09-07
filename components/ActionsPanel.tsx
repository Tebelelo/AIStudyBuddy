import React from 'react';
import { BookOpenIcon, HelpCircleIcon, MessageSquareIcon, SaveIcon, CheckCircleIcon } from './Icons';

interface ActionsPanelProps {
    onAction: (action: 'summarize' | 'quiz') => void;
    onStartChat: () => void;
    onSaveSession: () => void;
    disabled: boolean;
    isSessionSaved: boolean;
}

const ActionButton: React.FC<{
    onClick: () => void;
    disabled: boolean;
    icon: React.ReactNode;
    label: string;
}> = ({ onClick, disabled, icon, label }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="flex-1 flex flex-col items-center justify-center gap-2 p-4 bg-slate-800 rounded-lg shadow-md hover:bg-slate-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-cyan-500"
    >
        {icon}
        <span className="font-semibold text-sm text-slate-300">{label}</span>
    </button>
);

export const ActionsPanel: React.FC<ActionsPanelProps> = ({ onAction, onStartChat, onSaveSession, disabled, isSessionSaved }) => {
    return (
        <div className="p-4 bg-slate-800/50 rounded-xl shadow-lg">
            <h3 className="text-lg font-bold mb-4 text-cyan-400 text-center">What's Next?</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <ActionButton
                    onClick={() => onAction('summarize')}
                    disabled={disabled}
                    icon={<BookOpenIcon className="w-8 h-8 text-cyan-400" />}
                    label="Summarize"
                />
                <ActionButton
                    onClick={() => onAction('quiz')}
                    disabled={disabled}
                    icon={<HelpCircleIcon className="w-8 h-8 text-cyan-400" />}
                    label="Generate Quiz"
                />
                <ActionButton
                    onClick={onStartChat}
                    disabled={disabled}
                    icon={<MessageSquareIcon className="w-8 h-8 text-cyan-400" />}
                    label="Chat About It"
                />
                 {isSessionSaved ? (
                    <button
                        disabled
                        className="flex-1 flex flex-col items-center justify-center gap-2 p-4 bg-slate-800 rounded-lg shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <CheckCircleIcon className="w-8 h-8 text-green-400" />
                        <span className="font-semibold text-sm text-green-400">Saved!</span>
                    </button>
                 ) : (
                    <ActionButton
                        onClick={onSaveSession}
                        disabled={disabled}
                        icon={<SaveIcon className="w-8 h-8 text-cyan-400" />}
                        label="Save Session"
                    />
                 )}
            </div>
        </div>
    );
};