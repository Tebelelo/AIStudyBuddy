import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { AdminLoginForm } from './AdminLoginForm';
import { BrainIcon } from './Icons';

interface AuthPageProps {
    onLogin: (email: string, password?: string) => void;
    onSignUp: (name: string, email: string, password?: string) => void;
    onAdminLogin: (email: string, password?: string) => void;
    onPasswordReset: (email: string) => void;
}

type AuthMode = 'login' | 'signup' | 'forgotPassword' | 'adminLogin';

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onSignUp, onAdminLogin, onPasswordReset }) => {
    const [mode, setMode] = useState<AuthMode>('login');

    const renderForm = () => {
        switch (mode) {
            case 'signup':
                return <SignUpForm onSignUp={onSignUp} onSwitchMode={() => setMode('login')} />;
            case 'forgotPassword':
                return <ForgotPasswordForm onPasswordReset={onPasswordReset} onSwitchMode={() => setMode('login')} />;
             case 'adminLogin':
                return <AdminLoginForm onAdminLogin={onAdminLogin} onSwitchMode={() => setMode('login')} />;
            case 'login':
            default:
                return (
                    <LoginForm
                        onLogin={onLogin}
                        onSwitchMode={() => setMode('signup')}
                        onSwitchToForgotPassword={() => setMode('forgotPassword')}
                        onSwitchToAdminLogin={() => setMode('adminLogin')}
                    />
                );
        }
    };
    
    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <BrainIcon className="h-16 w-16 text-cyan-400" />
                        <h1 className="text-3xl sm:text-4xl font-bold text-white">AI Study Buddy</h1>
                    </div>
                    <p className="text-slate-400">Your intelligent partner in learning.</p>
                </div>
                <div className="bg-slate-800 rounded-xl shadow-lg p-6 sm:p-8">
                    {renderForm()}
                </div>
            </div>
        </div>
    );
};