import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Calendar, ArrowRight } from 'lucide-react';

const Home = () => {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search State
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchOrigin, setSearchOrigin] = useState('');
    const [searchDestination, setSearchDestination] = useState('');

    useEffect(() => {
        fetchRoutes();
    }, []);

    const fetchRoutes = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/routes');
            setRoutes(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching routes:", error);
            setLoading(false);
        }
    };

    // Filter routes by Date, Origin, and Destination
    const filteredRoutes = routes.filter(route => {
        const matchDate = route.date === selectedDate;
        const matchOrigin = route.origin.toLowerCase().includes(searchOrigin.toLowerCase());
        const matchDestination = route.destination.toLowerCase().includes(searchDestination.toLowerCase());
        return matchDate && matchOrigin && matchDestination;
    });

    if (loading) {
        return <div className="container py-8" style={{ textAlign: 'center' }}>Loading routes...</div>;
    }

    return (
        <div className="container py-8 animate-fade-in">
            <header className="mb-4" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 className="text-3xl" style={{ marginBottom: '0.5rem' }}>Find Your Journey</h1>
                <p className="text-muted">Select a route to view available seats and book instantly.</p>

                {/* Search Bar */}
                <div className="card mt-8 p-6 shadow-md" style={{ maxWidth: '800px', margin: '2rem auto 0' }}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-left">From</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Origin (e.g. Colombo)"
                                    value={searchOrigin}
                                    onChange={(e) => setSearchOrigin(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border rounded focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-left">To</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Destination (e.g. Kandy)"
                                    value={searchDestination}
                                    onChange={(e) => setSearchDestination(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border rounded focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-left">Travel Date</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={selectedDate}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                    style={{ height: '42px' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRoutes.length > 0 ? (
                    filteredRoutes.map(route => (
                        <div key={route.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-2 text-muted" style={{ fontSize: '0.875rem' }}>
                                        <Calendar size={16} />
                                        <span>{route.date}</span>
                                        {route.status === 'cancelled' && (
                                            <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium ml-2 border border-red-200">
                                                Cancelled
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2" style={{ marginTop: '0.25rem' }}>
                                        <span className="text-xl">{route.origin}</span>
                                        <ArrowRight size={20} className="text-muted" />
                                        <span className="text-xl">{route.destination}</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div className="text-2xl" style={{ color: 'var(--primary)' }}>LKR {route.price}</div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                                <div className="flex items-center gap-4 text-muted">
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} />
                                        <span>Dep: {route.departure_time}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} />
                                        <span>Arr: {route.arrival_time}</span>
                                    </div>
                                </div>
                                {route.status === 'cancelled' ? (
                                    <button disabled className="btn bg-gray-300 text-gray-500 cursor-not-allowed">
                                        Unavailable
                                    </button>
                                ) : (
                                    <Link to={`/book/${route.id}`} className="btn btn-primary">
                                        Select Seats
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 text-muted">
                        <div className="mb-4" style={{ display: 'inline-block', padding: '1rem', background: '#f1f5f9', borderRadius: '50%' }}>
                            <Calendar size={32} />
                        </div>
                        <h3 className="text-xl font-medium">No bus schedules found for {selectedDate}</h3>
                        <p>Please try selecting a different date.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
