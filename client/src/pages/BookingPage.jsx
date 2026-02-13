import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SeatLayout from '../components/SeatLayout';
import { CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

const BookingPage = () => {
    const { routeId } = useParams();
    const navigate = useNavigate();

    const [route, setRoute] = useState(null);
    const [bookedSeats, setBookedSeats] = useState([]);
    const [selectedSeat, setSelectedSeat] = useState(null);

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(null); // Contains booking ID

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [routeRes, bookingsRes] = await Promise.all([
                    axios.get(`http://localhost:3000/api/routes/${routeId}`),
                    axios.get(`http://localhost:3000/api/bookings/${routeId}`)
                ]);
                setRoute(routeRes.data.data);
                setBookedSeats(bookingsRes.data.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load booking data');
                setLoading(false);
            }
        };
        fetchData();
    }, [routeId]);

    const handleBooking = async (e) => {
        e.preventDefault();
        if (!selectedSeat) {
            setError('Please select a seat');
            return;
        }
        setError('');
        setSubmitting(true);

        try {
            const payload = {
                route_id: routeId,
                seat_number: selectedSeat,
                passenger_name: name,
                passenger_phone: phone
            };

            const res = await axios.post('http://localhost:3000/api/bookings', payload);
            setSuccess(res.data.booking_id);
            setSubmitting(false);
            // Refresh booked seats in background to show red immediately if we stayed (but we show success)
        } catch (err) {
            setError(err.response?.data?.error || 'Booking failed');
            setSubmitting(false);
        }
    };

    if (loading) return <div className="container py-8 text-center">Loading...</div>;
    if (!route) return <div className="container py-8 text-center">Route not found</div>;

    if (success) {
        return (
            <div className="container py-8 flex-col items-center justify-center animate-fade-in" style={{ maxWidth: '600px', display: 'flex', minHeight: '60vh' }}>
                <div className="card" style={{ width: '100%', textAlign: 'center', padding: '3rem' }}>
                    <div style={{ color: 'var(--accent)', marginBottom: '1rem' }}><CheckCircle size={64} /></div>
                    <h2 className="text-3xl mb-4">Booking Confirmed!</h2>
                    <p className="text-muted mb-4">Your seat has been reserved successfully.</p>

                    <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: 'var(--radius)', marginTop: '2rem', marginBottom: '2rem' }}>
                        <div className="text-sm text-muted">Booking ID</div>
                        <div className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>#{success}</div>
                        <div className="mt-4 grid grid-cols-2 gap-4 text-left">
                            <div>
                                <div className="text-xs text-muted">Route</div>
                                <div className="font-medium">{route.origin} - {route.destination}</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted">Seat</div>
                                <div className="font-medium">#{selectedSeat}</div>
                            </div>
                        </div>
                    </div>

                    <button onClick={() => navigate('/')} className="btn btn-outline">
                        Book Another
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-8 animate-fade-in">
            <button onClick={() => navigate('/')} className="btn btn-ghost mb-4 flex items-center gap-2 text-muted">
                <ArrowLeft size={16} /> Back to Routes
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <div className="card mb-4">
                        <h2 className="text-xl mb-4 font-bold">{route.origin} to {route.destination}</h2>
                        <div className="flex justify-between text-sm text-muted mb-2">
                            <span>Date</span>
                            <span className="font-medium text-main">{route.date}</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted mb-2">
                            <span>Time</span>
                            <span className="font-medium text-main">{route.departure_time} - {route.arrival_time}</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted">
                            <span>Price</span>
                            <span className="font-medium" style={{ color: 'var(--primary)' }}>LKR {route.price}</span>
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="text-lg font-bold mb-4">Passenger Details</h3>
                        <form onSubmit={handleBooking} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    required
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    placeholder="077 123 4567"
                                />
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm">
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}

                            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-muted">Total Amount</span>
                                    <span className="text-xl font-bold">LKR {selectedSeat ? route.price : '0'}</span>
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting || !selectedSeat}
                                    className="btn btn-primary"
                                    style={{ width: '100%', opacity: (!selectedSeat || submitting) ? 0.7 : 1 }}
                                >
                                    {submitting ? 'Confirming...' : 'Confirm Booking'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-bold mb-4">Select Seat</h3>
                    <SeatLayout
                        bookedSeats={bookedSeats}
                        selectedSeat={selectedSeat}
                        onSelect={setSelectedSeat}
                    />
                </div>
            </div>
        </div>
    );
};

export default BookingPage;
