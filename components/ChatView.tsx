import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import type { ChatMessage } from '../types';
import { SendIcon, DownloadIcon } from './Icons';

interface ChatViewProps {
    chatHistory: ChatMessage[];
    onSendMessage: (message: string) => void;
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

export const ChatView: React.FC<ChatViewProps> = ({ chatHistory, onSendMessage }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [chatHistory]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            onSendMessage(input.trim());
            setInput('');
        }
    };
    
    const handleExport = () => {
        if(chatHistory.length === 0) {
            toast.error("Nothing to export.");
            return;
        }
        try {
            let chatContent = "AI Study Buddy - Chat History\n============================\n\n";
            chatHistory.forEach(msg => {
                const prefix = msg.role === 'user' ? 'You' : 'AI';
                chatContent += `${prefix}: ${msg.content}\n\n`;
            });
            downloadFile(chatContent, 'chat-history.txt', 'text/plain');
            toast.success('Chat history exported!');
        } catch (error) {
            console.error('Failed to export chat:', error);
            toast.error('Could not export chat history.');
        }
    };
    
    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                 <h2 className="text-xl sm:text-2xl font-bold text-cyan-400">Chat</h2>
                 <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-700 text-slate-300 text-sm font-semibold rounded-lg shadow-sm hover:bg-slate-600 transition-colors"
                    aria-label="Export chat history as text file"
                >
                    <DownloadIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Export</span>
                </button>
            </div>
           
            <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                {chatHistory.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        </div>
                    </div>
                ))}
                 <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} className="mt-4 flex-shrink-0 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question..."
                    className="flex-grow bg-slate-700 border border-slate-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white"
                />
                <button type="submit" className="bg-cyan-600 text-white p-3 rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50">
                    <SendIcon className="w-6 h-6"/>
                </button>
            </form>
        </div>
    );
};