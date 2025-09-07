import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Header } from './components/Header';
import { InputArea } from './components/InputArea';
import { ActionsPanel } from './components/ActionsPanel';
import { OutputArea } from './components/OutputArea';
import { AuthPage } from './components/AuthPage';
import { AdminDashboard } from './components/AdminDashboard';
// FIX: Import GuideStep type to enforce type safety.
import { UserGuide, type GuideStep } from './components/UserGuide';
import { SessionHistoryModal } from './components/SessionHistoryModal';
import { SaveSessionModal } from './components/SaveSessionModal';
import { extractTextFromFile, generateSummary, generateQuiz, chatWithAI } from './services/geminiService';
import * as firebase from './services/firebase';
// FIX: Import the User type directly to resolve type errors.
import type { User } from './services/firebase';
import type { QuizQuestion, ChatMessage, StudySession } from './types';
import { SaveIcon, UploadIcon, Trash2Icon } from './components/Icons';

// The steps of the user guide, defined here to be accessible for download logic.
// FIX: Explicitly type guideSteps array to match the expected GuideStep[] type.
const guideSteps: GuideStep[] = [
  {
    targetKey: 'inputArea',
    text: "Welcome to your AI Study Buddy! First, provide some content. You can upload a document, enter text directly, or record your voice using these tabs.",
    position: 'bottom',
  },
  {
    targetKey: 'actionsPanel',
    text: "After providing content, these actions will light up. You can create a summary, generate a quiz, chat about the material, or save your session.",
    position: 'top',
  },
  {
    targetKey: 'outputArea',
    text: "Your results, like summaries, quizzes, and chat conversations, will appear here on the right.",
    position: 'left',
  },
  {
    targetKey: 'sessionControls',
    text: "You can also load a previously saved session or clear everything to start fresh using these buttons.",
    position: 'bottom',
  },
  {
    text: "You're all set. Happy studying!",
    position: 'center',
  },
];

// Helper for adding a timeout to a promise.
// FIX: Converted from a generic arrow function to a standard function declaration.
// The original syntax `<T>(...)` in a .tsx file was ambiguous and misinterpreted
// by the TypeScript parser as a JSX element, causing a cascade of errors.
function promiseWithTimeout<T>(
  promise: Promise<T>,
  ms: number,
  timeoutError = new Error('Operation timed out.')
): Promise<T> {
  const timeout = new Promise<T>((_, reject) => {
    setTimeout(() => {
      reject(timeoutError);
    }, ms);
  });
  return Promise.race([promise, timeout]);
};


const App: React.FC = () => {
    // Authentication State
    // FIX: Used the directly imported 'User' type because it's not available on the 'firebase' namespace object.
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // UI State
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Processing...');
    const [activeOutput, setActiveOutput] = useState<'summary' | 'quiz' | 'chat' | null>(null);
    const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isUserGuideVisible, setIsUserGuideVisible] = useState(false);
    const [isSessionSaved, setIsSessionSaved] = useState(false);
    
    // Data State
    const [sourceText, setSourceText] = useState('');
    const [summary, setSummary] = useState('');
    const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [sessions, setSessions] = useState<StudySession[]>([]);
    const [sessionsLoading, setSessionsLoading] = useState(false);

    // Refs for UserGuide
    const inputAreaRef = useRef<HTMLDivElement>(null);
    const actionsPanelRef = useRef<HTMLDivElement>(null);
    const outputAreaRef = useRef<HTMLDivElement>(null);
    const sessionControlsRef = useRef<HTMLDivElement>(null);

    // Authentication and User Profile Effect
    useEffect(() => {
        let unsubscribe: () => void = () => {};

        // Wait for Firebase to initialize, including persistence.
        firebase.firebasePromise.then(() => {
            if (!firebase.auth) {
                setAuthLoading(false);
                return;
            }
            // Once Firebase is ready, set up the auth state listener.
            unsubscribe = firebase.onAuthStateChanged(firebase.auth, async (currentUser) => {
                setUser(currentUser);
                const isAdminUser = currentUser?.email === 'admin@studybuddy.ai';
                setIsAdmin(isAdminUser);

                if (currentUser && !isAdminUser) {
                    try {
                        const prefs = await firebase.getUserPreferences(currentUser.uid);
                        setIsUserGuideVisible(prefs.showUserGuide);
                    } catch (error) {
                        console.error("Failed to get user preferences for guide.", error);
                        setIsUserGuideVisible(false); // Fail safe: don't show guide if prefs fail
                    }
                } else {
                    // For logged-out users, check local storage for the guide preference.
                    const guideCompleted = localStorage.getItem('userGuideCompleted');
                    setIsUserGuideVisible(!guideCompleted);
                }

                setAuthLoading(false);
            });
        });

        // Return a cleanup function that will call the correct unsubscribe method.
        return () => unsubscribe();
    }, []);


    const handleCompleteUserGuide = () => {
        setIsUserGuideVisible(false);
        if (user) {
            firebase.updateUserPreferences(user.uid, { showUserGuide: false }).catch(error => {
                toast.error("Could not save your preference. The guide might appear again.");
                console.error("Failed to update user guide preference:", error);
            });
        } else {
            // For logged-out users, save the preference to local storage.
            localStorage.setItem('userGuideCompleted', 'true');
        }
    };
    
    const handleShowGuide = () => {
        setIsUserGuideVisible(true);
    };

    const handleDownloadGuide = () => {
        const guideContent = guideSteps
            .map((step, index) => {
                if (index === guideSteps.length - 1) { // The final message
                    return `<p style="font-style: italic; text-align: center; margin-top: 2rem;">${step.text}</p>`;
                }
                return `
                    <div style="margin-bottom: 2rem;">
                        <h2 style="color: #374151; font-size: 1.25rem; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; margin-bottom: 0.75rem;">Step ${index + 1}</h2>
                        <p style="font-size: 1rem;">${step.text}</p>
                    </div>
                `;
            })
            .join('');

        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>AI Study Buddy - User Guide</title>
                <style>
                    body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #1f2937; padding: 2rem; max-width: 800px; margin: auto; }
                    h1 { color: #06b6d4; text-align: center; font-size: 2rem; margin-bottom: 2rem; }
                    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
                </style>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            </head>
            <body>
                <h1>AI Study Buddy - User Guide</h1>
                ${guideContent}
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
            }, 500); // Delay to allow fonts to load
        } else {
            toast.error("Could not open a new window. Please disable your pop-up blocker.");
        }
    };


    // Data Processing Handlers
    const handleFileProcess = useCallback(async (file: File) => {
        setIsLoading(true);
        setLoadingMessage('Reading your file...');
        setActiveOutput(null);
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const base64FileData = (e.target?.result as string).split(',')[1];
                    const text = await extractTextFromFile(base64FileData, file.type);
                    setSourceText(text);
                    toast.success('File processed successfully!');
                } catch (loadError) {
                     toast.error(loadError instanceof Error ? loadError.message : 'Failed to process file content.');
                } finally {
                     setIsLoading(false);
                }
            };
            reader.onerror = () => {
                throw new Error('Failed to read the file.');
            }
            reader.readAsDataURL(file);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'An unknown error occurred.');
            setIsLoading(false);
        }
    }, []);

    const handleTextSubmit = useCallback((text: string) => {
        setSourceText(text);
        toast.success('Text is ready to be processed!');
    }, []);

    // Action Handlers
    const handleAction = useCallback(async (action: 'summarize' | 'quiz') => {
        if (!sourceText) {
            toast.error('Please provide some content first.');
            return;
        }
        setIsLoading(true);
        setActiveOutput(null);

        try {
            if (action === 'summarize') {
                setLoadingMessage('Generating summary...');
                const result = await generateSummary(sourceText);
                setSummary(result);
                setActiveOutput('summary');
                toast.success('Summary generated!');
            } else if (action === 'quiz') {
                setLoadingMessage('Creating your quiz...');
                const result = await generateQuiz(sourceText);
                setQuiz(result);
                setActiveOutput('quiz');
                toast.success('Quiz generated!');
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : `Failed to perform action: ${action}`);
        } finally {
            setIsLoading(false);
        }
    }, [sourceText]);

    const handleStartChat = () => {
        if (!sourceText) {
            toast.error('Please provide some content to chat about.');
            return;
        }
        setActiveOutput('chat');
        if (chatHistory.length === 0) {
           setChatHistory([{ role: 'model', content: "Hi there! I'm your study buddy. Ask me anything about the content you provided." }]);
        }
    };
    
    const handleSendMessage = useCallback(async (message: string) => {
        const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: message }];
        setChatHistory(newHistory);
        setIsLoading(true);
        setLoadingMessage('Thinking...');
        try {
            const response = await chatWithAI(newHistory, message, sourceText);
            setChatHistory([...newHistory, { role: 'model', content: response }]);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to get a response.');
            setChatHistory(chatHistory); // Revert on error
        } finally {
            setIsLoading(false);
        }
    }, [chatHistory, sourceText]);

    const resetState = (showToast = true) => {
        // Stop any ongoing loading
        setIsLoading(false);
        setLoadingMessage('Processing...');
        setSessionsLoading(false);

        // Clear data
        setSourceText('');
        setSummary('');
        setQuiz([]);
        setChatHistory([]);
        setSessions([]);

        // Reset UI
        setActiveOutput(null);
        setIsSessionModalOpen(false);
        
        if (showToast) toast.success('Cleared session and started fresh!');
    };

    // Local Session Management
    const loadLocalSessions = useCallback(() => {
        setSessionsLoading(true);
        try {
            const localData = localStorage.getItem('studySessions');
            if (localData) {
                const parsedSessions: StudySession[] = JSON.parse(localData);
                // Sort by date, newest first
                parsedSessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setSessions(parsedSessions);
            } else {
                setSessions([]);
            }
        } catch (error) {
            console.error("Failed to load local sessions:", error);
            toast.error("Could not load sessions from local storage.");
            setSessions([]);
        } finally {
            setSessionsLoading(false);
        }
    }, []);

    const handleOpenSessionModal = () => {
        loadLocalSessions();
        setIsSessionModalOpen(true);
    };

    const handleInitiateSave = () => {
        if (!sourceText) {
            toast.error("There is no content to save.");
            return;
        }
        setIsSaveModalOpen(true);
    };

    const handleConfirmSave = async (sessionName: string) => {
        setIsLoading(true);
        setLoadingMessage('Saving session...');
        try {
            const localData = localStorage.getItem('studySessions');
            const existingSessions: StudySession[] = localData ? JSON.parse(localData) : [];

            const newSession: StudySession = {
                id: `local-${Date.now()}`,
                name: sessionName.trim(),
                createdAt: new Date().toISOString(),
                sourceText,
                summary,
                quiz,
                chatHistory,
            };

            const updatedSessions = [newSession, ...existingSessions];
            localStorage.setItem('studySessions', JSON.stringify(updatedSessions));

            loadLocalSessions();

            // Fake delay to give user feedback
            await new Promise(resolve => setTimeout(resolve, 300));

            toast.success('Session saved locally!');
            setIsSessionSaved(true);
            setTimeout(() => setIsSessionSaved(false), 2500);
        } catch (error) {
            console.error('Failed to save session locally:', error);
            toast.error("Could not save session to local storage. It may be full.");
        } finally {
            setIsLoading(false);
            setIsSaveModalOpen(false);
        }
    };

    const handleLoadSession = (session: StudySession) => {
        resetState(false);
        setSourceText(session.sourceText);
        setSummary(session.summary);
        setQuiz(session.quiz);
        setChatHistory(session.chatHistory);
        setIsSessionModalOpen(false);
        toast.success(`Session "${session.name}" loaded successfully!`);
    };

    const handleDeleteSession = async (sessionId: string) => {
        if (!window.confirm("Are you sure you want to delete this session?")) return;
        try {
            const localData = localStorage.getItem('studySessions');
            if (localData) {
                let existingSessions: StudySession[] = JSON.parse(localData);
                const updatedSessions = existingSessions.filter(s => s.id !== sessionId);
                localStorage.setItem('studySessions', JSON.stringify(updatedSessions));
                setSessions(updatedSessions);
                toast.success('Session deleted.');
            }
        } catch (error) {
            console.error('Failed to delete session locally:', error);
            toast.error("Could not delete session from local storage.");
        }
    };

    // Auth Handlers
    const handleLogin = async (email: string, password?: string) => {
        if (!firebase.auth) {
            toast.error("Authentication is not configured. Please contact the administrator.");
            return;
        }
        try {
            if (!password) throw new Error("Password is required.");
            await firebase.signInWithEmailAndPassword(firebase.auth, email, password);
        } catch (error: any) {
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                toast.error('Incorrect email or password. Please try again.');
            } else if (error.code === 'auth/invalid-email') {
                toast.error('Please enter a valid email address.');
            } else {
                toast.error('Login failed. Please try again later.');
            }
        }
    };

    const handleSignUp = async (name: string, email: string, password?: string) => {
        if (!firebase.auth) {
            toast.error("Authentication is not configured. Please contact the administrator.");
            return;
        }
        try {
            if (!password) throw new Error("Password is required.");
            const userCredential = await firebase.createUserWithEmailAndPassword(firebase.auth, email, password);
            await firebase.updateProfile(userCredential.user, { displayName: name });
            // Wrap the profile creation in a timeout to catch connection issues.
            await promiseWithTimeout(
                firebase.createUserProfileDocument(userCredential.user, { preferences: { showUserGuide: true } }),
                15000,
                new Error('Profile creation timed out.')
            );
        } catch (error: any) {
            if (error.message === 'Profile creation timed out.') {
                const projectId = firebase.firebaseConfig.projectId;
                const errorMessage = `Account created, but could not save profile. This strongly suggests a project setup or network issue. Please verify:\n1. Firestore database is created for project '${projectId}'.\n2. Your network is not blocking Google Cloud services.`;
                toast.error(errorMessage, { duration: 20000 });
            } else if (error.code === 'auth/email-already-in-use') {
                toast.error('An account with this email already exists.');
            } else if (error.code === 'auth/weak-password') {
                toast.error('Password is too weak. Please use at least 6 characters.');
            } else if (error.code === 'auth/invalid-email') {
                toast.error('Please enter a valid email address.');
            } else {
                console.error("Sign up error:", error);
                toast.error('Sign up failed. Please try again.');
            }
        }
    };

    const handlePasswordReset = async (email: string) => {
        if (!firebase.auth) {
            toast.error("Authentication is not configured. Please contact the administrator.");
            return;
        }
        try {
            await firebase.sendPasswordResetEmail(firebase.auth, email);
            toast.success('If an account exists, a password reset link has been sent.');
        } catch (error: any) {
            if (error.code === 'auth/invalid-email') {
                toast.error('Please enter a valid email address.');
            } else {
                toast.error('Failed to send reset email. Please try again later.');
            }
        }
    };

    const handleLogout = async () => {
        if (firebase.auth) {
            await firebase.signOut(firebase.auth);
        }
        resetState(false);
    };

    if (authLoading) {
        return <div className="bg-slate-900 min-h-screen" />; // Or a proper loading screen
    }

    if (!user) {
        return (
            <div className="bg-slate-900 min-h-screen">
                <Toaster position="top-center" toastOptions={{
                    style: { background: '#334155', color: '#e2e8f0' },
                }} />
                <AuthPage onLogin={handleLogin} onSignUp={handleSignUp} onAdminLogin={handleLogin} onPasswordReset={handlePasswordReset} />
            </div>
        );
    }
    
    if (isAdmin) {
         return (
             <div className="bg-slate-900 min-h-screen">
                <Toaster position="top-center" toastOptions={{
                    style: { background: '#334155', color: '#e2e8f0' },
                }} />
                <AdminDashboard onLogout={handleLogout} userName={user.displayName || user.email || 'Admin'} />
            </div>
         );
    }

    return (
        <div className="bg-slate-900 min-h-screen text-slate-200">
            <Toaster position="top-center" toastOptions={{
                style: { background: '#334155', color: '#e2e8f0' },
            }} />
            <Header
                isAuthenticated={!!user}
                userName={user.displayName || user.email || ''}
                onLogout={handleLogout}
                onShowGuide={handleShowGuide}
                onDownloadGuide={handleDownloadGuide}
            />
            
            {isUserGuideVisible && (
                <UserGuide 
                    onComplete={handleCompleteUserGuide}
                    onDownloadGuide={handleDownloadGuide}
                    guideSteps={guideSteps}
                    targets={{ inputArea: inputAreaRef, actionsPanel: actionsPanelRef, outputArea: outputAreaRef, sessionControls: sessionControlsRef }}
                />
            )}
            
            <SaveSessionModal
                isOpen={isSaveModalOpen}
                onClose={() => setIsSaveModalOpen(false)}
                onSave={handleConfirmSave}
                isSaving={isLoading}
            />
            
            <SessionHistoryModal 
                isOpen={isSessionModalOpen}
                onClose={() => setIsSessionModalOpen(false)}
                sessions={sessions}
                onLoadSession={handleLoadSession}
                onDeleteSession={handleDeleteSession}
                isLoading={sessionsLoading}
            />

            <main className="container mx-auto p-4 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="flex flex-col gap-8">
                        <div ref={inputAreaRef}>
                            <InputArea
                                onFileProcess={handleFileProcess}
                                onTranscriptionComplete={handleTextSubmit}
                                onTextSubmit={handleTextSubmit}
                                isLoading={isLoading}
                                hasSourceText={sourceText.length > 0}
                            />
                        </div>

                         <div ref={sessionControlsRef} className="flex flex-col sm:flex-row gap-4">
                             <button
                                onClick={handleOpenSessionModal}
                                className="flex-1 flex items-center justify-center gap-2 p-3 bg-slate-700 text-slate-300 font-semibold rounded-lg shadow-sm hover:bg-slate-600 transition-colors"
                            >
                                <UploadIcon className="w-5 h-5"/>
                                Load Session
                            </button>
                             <button
                                onClick={() => resetState()}
                                className="flex-1 flex items-center justify-center gap-2 p-3 bg-slate-700 text-slate-300 font-semibold rounded-lg shadow-sm hover:bg-slate-600 transition-colors"
                            >
                                <Trash2Icon className="w-5 h-5"/>
                                Clear & Start Fresh
                            </button>
                        </div>
                        
                        <div ref={actionsPanelRef}>
                            <ActionsPanel
                                onAction={handleAction}
                                onStartChat={handleStartChat}
                                onSaveSession={handleInitiateSave}
                                disabled={!sourceText || isLoading}
                                isSessionSaved={isSessionSaved}
                            />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div ref={outputAreaRef}>
                        <OutputArea
                            isLoading={isLoading}
                            loadingMessage={loadingMessage}
                            activeOutput={activeOutput}
                            summary={summary}
                            quiz={quiz}
                            chatHistory={chatHistory}
                            onSendMessage={handleSendMessage}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;