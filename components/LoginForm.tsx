import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon } from './Icons';

interface LoginFormProps {
    onLogin: (email: string, password?: string) => void;
    onSwitchMode: () => void;
    onSwitchToForgotPassword: () => void;
    onSwitchToAdminLogin: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onSwitchMode, onSwitchToForgotPassword, onSwitchToAdminLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Please enter both email and password.');
            return;
        }
        onLogin(email, password);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-center text-white mb-6">Welcome Back!</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
                    <div className="relative">
                         <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                           <MailIcon className="h-5 w-5 text-slate-500" />
                         </span>
                        <input
                            id="email"
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
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label htmlFor="password"  className="block text-sm font-medium text-slate-400">Password</label>
                         <div className="text-sm">
                            <button
                                type="button"
                                onClick={onSwitchToForgotPassword}
                                className="font-medium text-cyan-400 hover:text-cyan-300"
                            >
                                Forgot password?
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                           <LockIcon className="h-5 w-5 text-slate-500" />
                         </span>
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            required
                             value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-10 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-cyan-500 focus:border-cyan-500"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? (
                                <EyeOffIcon className="h-5 w-5" />
                            ) : (
                                <EyeIcon className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>
                <div className="space-y-4">
                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        onClick={onSwitchToAdminLogin}
                        className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-lg shadow-md transition-colors duration-200"
                    >
                        Admin Login
                    </button>
                </div>
            </form>
            <p className="mt-6 text-center text-sm text-slate-400">
                Don't have an account?{' '}
                <button onClick={onSwitchMode} className="font-medium text-cyan-400 hover:text-cyan-300">
                    Sign Up
                </button>
            </p>
        </div>
    );
};