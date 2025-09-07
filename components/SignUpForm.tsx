import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { UserIcon, MailIcon, LockIcon, EyeIcon, EyeOffIcon } from './Icons';

interface SignUpFormProps {
    onSignUp: (name: string, email: string, password?: string) => void;
    onSwitchMode: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ onSignUp, onSwitchMode }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !password || !confirmPassword) {
            toast.error('Please fill out all fields.');
            return;
        }
        if (password !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }
        onSignUp(name, email, password);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-center text-white mb-6">Create Your Account</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
                    <div className="relative">
                         <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                           <UserIcon className="h-5 w-5 text-slate-500" />
                         </span>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-cyan-500 focus:border-cyan-500"
                            placeholder="Your Name"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="signup-email" className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
                    <div className="relative">
                         <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                           <MailIcon className="h-5 w-5 text-slate-500" />
                         </span>
                        <input
                            id="signup-email"
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
                    <label htmlFor="signup-password"  className="block text-sm font-medium text-slate-400 mb-2">Password</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                           <LockIcon className="h-5 w-5 text-slate-500" />
                         </span>
                        <input
                            id="signup-password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="new-password"
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
                            {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
                 <div>
                    <label htmlFor="confirm-password"  className="block text-sm font-medium text-slate-400 mb-2">Confirm Password</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                           <LockIcon className="h-5 w-5 text-slate-500" />
                         </span>
                        <input
                            id="confirm-password"
                            name="confirm-password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            autoComplete="new-password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-10 pr-10 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-cyan-500 focus:border-cyan-500"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white"
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                            {showConfirmPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
                <button
                    type="submit"
                    className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
                >
                    Create Account
                </button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-400">
                Already have an account?{' '}
                <button onClick={onSwitchMode} className="font-medium text-cyan-400 hover:text-cyan-300">
                    Login
                </button>
            </p>
        </div>
    );
};