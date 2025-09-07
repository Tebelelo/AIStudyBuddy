import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { MailIcon, LockIcon, ShieldCheckIcon, EyeIcon, EyeOffIcon } from './Icons';

interface AdminLoginFormProps {
    onAdminLogin: (email: string, password?: string) => void;
    onSwitchMode: () => void;
}

export const AdminLoginForm: React.FC<AdminLoginFormProps> = ({ onAdminLogin, onSwitchMode }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Please enter both email and password.');
            return;
        }
        onAdminLogin(email, password);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-center text-white mb-2 flex items-center justify-center gap-2">
                <ShieldCheckIcon className="w-7 h-7 text-cyan-400" />
                Admin Login
            </h2>
            <p className="text-center text-sm text-slate-400 mb-6">Enter your administrative credentials.</p>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="admin-email" className="block text-sm font-medium text-slate-400 mb-2">Admin Email</label>
                    <div className="relative">
                         <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                           <MailIcon className="h-5 w-5 text-slate-500" />
                         </span>
                        <input
                            id="admin-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-cyan-500 focus:border-cyan-500"
                            placeholder="admin@studybuddy.ai"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="admin-password"  className="block text-sm font-medium text-slate-400 mb-2">Password</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                           <LockIcon className="h-5 w-5 text-slate-500" />
                         </span>
                        <input
                            id="admin-password"
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
                            {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
                <button
                    type="submit"
                    className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
                >
                    Login as Admin
                </button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-400">
                Not an admin?{' '}
                <button onClick={onSwitchMode} className="font-medium text-cyan-400 hover:text-cyan-300">
                    Back to User Login
                </button>
            </p>
        </div>
    );
};