import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { MailIcon } from './Icons';

interface ForgotPasswordFormProps {
    onSwitchMode: (mode: 'login') => void;
    onPasswordReset: (email: string) => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSwitchMode, onPasswordReset }) => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error('Please enter your email address.');
            return;
        }
        onPasswordReset(email);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-center text-white mb-6">Reset Password</h2>
            <p className="text-center text-slate-400 mb-6 text-sm">Enter your email and we'll send a link to reset your password.</p>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="reset-email" className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
                    <div className="relative">
                         <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                           <MailIcon className="h-5 w-5 text-slate-500" />
                         </span>
                        <input
                            id="reset-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-cyan-500 focus:border-cyan-500"
                            placeholder="you@example.com"
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
                >
                    Send Reset Link
                </button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-400">
                Remember your password?{' '}
                <button onClick={() => onSwitchMode('login')} className="font-medium text-cyan-400 hover:text-cyan-300">
                    Back to Login
                </button>
            </p>
        </div>
    );
};