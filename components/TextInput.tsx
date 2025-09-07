
import React, { useState } from 'react';

interface TextInputProps {
    onTextSubmit: (text: string) => void;
    disabled: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({ onTextSubmit, disabled }) => {
    const [text, setText] = useState('');

    const handleSubmit = () => {
        if (text.trim()) {
            onTextSubmit(text.trim());
            setText('');
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste or type your content here..."
                className="w-full h-48 p-4 bg-slate-900 border border-slate-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-300 disabled:opacity-50"
                disabled={disabled}
                aria-label="Text input area"
            />
            <button
                onClick={handleSubmit}
                disabled={disabled || !text.trim()}
                className="self-end px-6 py-2 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Process Text
            </button>
        </div>
    );
};
