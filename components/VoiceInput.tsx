import React, { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { MicIcon, StopCircleIcon } from './Icons';

// Fix: Add type definitions for Web Speech API to fix TypeScript errors.
interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message: string;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onend: (() => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    start(): void;
    stop(): void;
}

interface SpeechRecognitionStatic {
    new(): SpeechRecognition;
}

declare global {
    interface Window {
        SpeechRecognition: SpeechRecognitionStatic;
        webkitSpeechRecognition: SpeechRecognitionStatic;
    }
}

interface VoiceInputProps {
    onTranscriptionComplete: (text: string) => void;
    disabled: boolean;
}

// Fix: Rename constant to avoid conflict with the SpeechRecognition interface type.
const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

export const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscriptionComplete, disabled }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    // Fix: This now correctly refers to the SpeechRecognition interface.
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        // Fix: Use renamed constant for the check.
        if (!SpeechRecognitionAPI) {
            toast.error("Your browser doesn't support the Speech Recognition API.");
            return;
        }

        // Fix: Use renamed constant to create a new instance.
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript) {
                setTranscript(prev => prev + finalTranscript + ' ');
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            toast.error(`Speech recognition error: ${event.error}`);
            setIsListening(false);
        };
        
        recognition.onend = () => {
             // When recognition ends (either manually or by timeout), update the state.
             setIsListening(false);
        };
        
        recognitionRef.current = recognition;

        return () => {
            recognition.stop();
        };
    }, []); // FIX: Changed dependency to [] to set up the recognition object only once.

    const startListening = useCallback(() => {
        if (isListening || disabled || !recognitionRef.current) return;
        setTranscript('');
        setIsListening(true);
        recognitionRef.current.start();
        toast.success("Recording started...");
    }, [isListening, disabled]);

    const stopListening = useCallback(() => {
        if (!isListening || !recognitionRef.current) return;
        setIsListening(false);
        recognitionRef.current.stop();
        onTranscriptionComplete(transcript.trim());
        toast.success("Recording stopped. Processing...");
    }, [isListening, onTranscriptionComplete, transcript]);
    
    return (
        <div className="flex flex-col items-center gap-4">
            <p className="text-slate-400 text-center">
                {isListening ? "Click the button below to stop recording." : "Click the button to start recording your lecture or thoughts."}
            </p>
            {isListening ? (
                 <button
                    onClick={stopListening}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={disabled}
                >
                    <StopCircleIcon className="w-6 h-6" />
                    Stop Recording
                </button>
            ) : (
                <button
                    onClick={startListening}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:bg-cyan-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={disabled}
                >
                    <MicIcon className="w-6 h-6" />
                    Start Recording
                </button>
            )}
            {transcript && (
                 <div className="w-full mt-4 bg-slate-900 p-4 rounded-lg">
                    <h4 className="font-semibold text-slate-300 mb-2">Live Transcript:</h4>
                    <p className="text-slate-400">{transcript}</p>
                 </div>
            )}
        </div>
    );
};