import React, { useState } from 'react';
import { FileUpload } from './FileUpload';
import { VoiceInput } from './VoiceInput';
import { TextInput } from './TextInput';
import { DocumentIcon, MicIcon, TypeIcon, CheckCircleIcon } from './Icons';

interface InputAreaProps {
    onFileProcess: (file: File) => void;
    onTranscriptionComplete: (text: string) => void;
    onTextSubmit: (text: string) => void;
    isLoading: boolean;
    hasSourceText: boolean;
}

type InputMode = 'file' | 'text' | 'voice';

export const InputArea: React.FC<InputAreaProps> = ({ onFileProcess, onTranscriptionComplete, onTextSubmit, isLoading, hasSourceText }) => {
    const [mode, setMode] = useState<InputMode>('file');

    const tabBaseClasses = "flex-1 text-center py-3 px-4 rounded-t-lg transition-colors duration-200 ease-in-out flex items-center justify-center gap-2 font-medium min-w-0";
    const activeTabClasses = "bg-slate-800 text-cyan-400";
    const inactiveTabClasses = "bg-slate-900 text-slate-400 hover:bg-slate-700";

    return (
        <div className="bg-slate-800 rounded-xl shadow-lg">
            <div className="flex">
                <button
                    onClick={() => setMode('file')}
                    className={`${tabBaseClasses} ${mode === 'file' ? activeTabClasses : inactiveTabClasses}`}
                    disabled={isLoading}
                >
                    <DocumentIcon className="w-5 h-5 flex-shrink-0" />
                    <span className="hidden sm:inline truncate">Upload</span>
                </button>
                <button
                    onClick={() => setMode('text')}
                    className={`${tabBaseClasses} ${mode === 'text' ? activeTabClasses : inactiveTabClasses}`}
                    disabled={isLoading}
                >
                    <TypeIcon className="w-5 h-5 flex-shrink-0" />
                    <span className="hidden sm:inline truncate">Text</span>
                    {hasSourceText && (
                        <CheckCircleIcon className="w-5 h-5 text-green-400 ml-2 flex-shrink-0" />
                    )}
                </button>
                <button
                    onClick={() => setMode('voice')}
                    className={`${tabBaseClasses} ${mode === 'voice' ? activeTabClasses : inactiveTabClasses}`}
                    disabled={isLoading}
                >
                    <MicIcon className="w-5 h-5 flex-shrink-0" />
                    <span className="hidden sm:inline truncate">Voice</span>
                </button>
            </div>
            <div className="p-4 md:p-6">
                {mode === 'file' && <FileUpload onFileProcess={onFileProcess} disabled={isLoading} />}
                {mode === 'text' && <TextInput onTextSubmit={onTextSubmit} disabled={isLoading} />}
                {mode === 'voice' && <VoiceInput onTranscriptionComplete={onTranscriptionComplete} disabled={isLoading} />}
            </div>
        </div>
    );
};