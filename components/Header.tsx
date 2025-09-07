import React, { useState, useRef, useEffect } from 'react';
import { LogoutIcon, HelpCircleIcon, BrainIcon } from './Icons';

interface HeaderProps {
    isAuthenticated?: boolean;
    userName?: string;
    onLogout?: () => void;
    onShowGuide: () => void;
    onDownloadGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isAuthenticated, userName, onLogout, onShowGuide, onDownloadGuide }) => {
    const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);
    const helpMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (helpMenuRef.current && !helpMenuRef.current.contains(event.target as Node)) {
                setIsHelpMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="py-4 px-4 md:px-8 border-b border-slate-700">
            <div className="container mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <BrainIcon className="h-8 w-8 text-cyan-400" />
                    <span className="text-xl font-bold text-white">AI Study Buddy</span>
                </div>
                {isAuthenticated && (
                    <div className="flex items-center gap-2 sm:gap-4">
                        <span className="text-slate-300 hidden sm:block">Welcome, {userName}!</span>
                        
                        <div className="relative" ref={helpMenuRef}>
                            <button
                                onClick={() => setIsHelpMenuOpen(prev => !prev)}
                                className="p-2 bg-slate-700 text-slate-300 rounded-full shadow-sm hover:bg-slate-600 transition-colors"
                                aria-label="Help menu"
                            >
                                <HelpCircleIcon className="w-5 h-5"/>
                            </button>
                            {isHelpMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-slate-700 rounded-md shadow-lg z-20">
                                    <ul className="py-1">
                                        <li>
                                            <button onClick={() => { onShowGuide(); setIsHelpMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-600">
                                                Show Guide
                                            </button>
                                        </li>
                                        <li>
                                            <button onClick={() => { onDownloadGuide(); setIsHelpMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-600">
                                                Download Guide
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>

                         <button
                            onClick={onLogout}
                            className="flex items-center gap-2 px-3 py-2 bg-slate-700 text-slate-300 font-semibold rounded-lg shadow-sm hover:bg-slate-600 transition-colors"
                            aria-label="Log out"
                        >
                            <LogoutIcon className="w-5 h-5"/>
                            <span className="hidden md:block">Logout</span>
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};