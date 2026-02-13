import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, LogIn } from 'lucide-react';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await axios.post('http://localhost:3000/api/login', { username, password });
            // Save user to localStorage
            localStorage.setItem('user', JSON.stringify(res.data.user));
            // Trigger a storage event or use Context in a real app to update UI immediately
            // For now, simpler refresh or just nav
            window.location.href = '/'; // Force refresh to update Navbar if we implement dynamic navbar later
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div className="container py-8 flex items-center justify-center min-h-[60vh]">
            <div className="card w-full max-w-md animate-fade-in">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold">Welcome Back</h1>
                    <p className="text-muted">Sign in to manage your bookings</p>
                </div>

                {error && (
                    <div className="p-3 mb-4 bg-red-100 text-red-700 rounded text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Username</label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                placeholder="Enter your username"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                placeholder="Enter your password"
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary mt-2 flex justify-center items-center gap-2">
                        <LogIn size={18} /> Sign In
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-gray-500">Don't have an account? </span>
                    <Link to="/register" className="font-semibold text-primary hover:underline">
                        Register here
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
