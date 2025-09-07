import React from 'react';
import { SummaryView } from './SummaryView';
import { QuizView } from './QuizView';
import { ChatView } from './ChatView';
import { Loader } from './Loader';
import type { QuizQuestion, ChatMessage } from '../types';

interface OutputAreaProps {
    isLoading: boolean;
    loadingMessage: string;
    activeOutput: 'summary' | 'quiz' | 'chat' | null;
    summary: string;
    quiz: QuizQuestion[];
    chatHistory: ChatMessage[];
    onSendMessage: (message: string) => void;
}

export const OutputArea: React.FC<OutputAreaProps> = ({ 
    isLoading, 
    loadingMessage, 
    activeOutput, 
    summary, 
    quiz,
    chatHistory,
    onSendMessage
}) => {
    
    const renderContent = () => {
        if (isLoading) {
            return <Loader message={loadingMessage} />;
        }

        switch (activeOutput) {
            case 'summary':
                return <SummaryView summary={summary} />;
            case 'quiz':
                return <QuizView quiz={quiz} />;
            case 'chat':
                return <ChatView chatHistory={chatHistory} onSendMessage={onSendMessage} />;
            default:
                return (
                    <div className="text-center text-slate-500 flex flex-col items-center justify-center h-full p-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 sm:w-16 sm:h-16 mb-4 text-slate-600"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"></path><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m4.93 19.07 1.41-1.41"></path><path d="m17.66 6.34 1.41-1.41"></path></svg>
                        <h3 className="text-lg sm:text-xl font-semibold">Your results will appear here</h3>
                        <p className="text-sm sm:text-base">Upload a document or record your voice, then choose an action.</p>
                    </div>
                );
        }
    };
    
    return (
        <div className="bg-slate-800 p-4 md:p-6 rounded-xl shadow-lg min-h-[50vh] lg:min-h-[600px] flex flex-col">
            {renderContent()}
        </div>
    );
};