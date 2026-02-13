import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bus, User, LogOut } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav style={{ backgroundColor: 'var(--surface)', boxShadow: 'var(--shadow-sm)', position: 'sticky', top: 0, zIndex: 10 }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '4rem' }}>
                <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                    <Bus size={28} />
                    <span>BusBooker</span>
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <Link to="/" className="font-medium hover:text-primary">Find Bus</Link>

                    {user ? (
                        <>
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <User size={16} />
                                <span>{user.username}</span>
                            </div>
                            {user.username === 'admin' && ( // Simple admin check for demo
                                <Link to="/admin" className="font-medium text-muted hover:text-primary">Admin</Link>
                            )}
                            <button onClick={handleLogout} className="btn btn-sm btn-outline flex items-center gap-1">
                                <LogOut size={16} /> Logout
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="btn btn-primary">Login</Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
