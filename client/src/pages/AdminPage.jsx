import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Users, Calendar, Edit, X } from 'lucide-react';

const AdminPage = () => {
    const [bookings, setBookings] = useState([]);
    const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'addRoute'
    const [loading, setLoading] = useState(true);

    // Edit Booking State
    const [editingBooking, setEditingBooking] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [availableSeats, setAvailableSeats] = useState([]);

    // Route Form State
    const [newRoute, setNewRoute] = useState({
        origin: '', destination: '', date: '', departure_time: '', arrival_time: '', price: ''
    });
    const [routeMessage, setRouteMessage] = useState('');

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/bookings');
            setBookings(res.data.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddRoute = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3000/api/routes', newRoute);
            setRouteMessage('Route added successfully!');
            setNewRoute({ origin: '', destination: '', date: '', departure_time: '', arrival_time: '', price: '' });
            setTimeout(() => setRouteMessage(''), 3000);
        } catch (err) {
            setRouteMessage('Failed to add route.');
        }
    };

    const handleEditClick = async (booking) => {
        setEditingBooking({ ...booking });
        // We need to fetch booked seats for this route to determine availability
        // The booking object from /api/bookings join query doesn't have route_id directly visible in the SELECT
        // Wait, looking at server.js: 
        // SELECT bookings.id, bookings.seat_number, bookings.passenger_name, bookings.booking_date,
        //        routes.origin, routes.destination, routes.date, routes.departure_time
        // It DOES NOT select bookings.route_id. I need to update server to fetch route_id too.

        // Actually, let's look at what I received. 
        // If I don't have route_id, I can't fetch availability easily.
        // I will assume for now I can pass route info or I might need to fix the GET /api/bookings query first.

        // Let's rely on the fact that I will fix the GET query in a moment.
        // Assuming booking has route_id.
        if (booking.route_id) {
            fetchAvailableSeats(booking.route_id, booking.seat_number);
        }
        setShowEditModal(true);
    };

    const fetchAvailableSeats = async (routeId, currentSeat) => {
        try {
            const res = await axios.get(`http://localhost:3000/api/bookings/${routeId}`);
            const booked = res.data.data; // Array of seat numbers

            // Total seats assumed 40 as per standard layout
            const totalSeats = 40;
            const allSeats = Array.from({ length: totalSeats }, (_, i) => i + 1);

            // Available = All seats that are NOT booked OR are the current seat (since we can keep it)
            const available = allSeats.filter(seat => !booked.includes(seat) || seat === parseInt(currentSeat));
            setAvailableSeats(available);
        } catch (err) {
            console.error("Failed to fetch seat availability", err);
        }
    };

    const handleUpdateBooking = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:3000/api/bookings/${editingBooking.id}`, {
                passenger_name: editingBooking.passenger_name,
                passenger_phone: editingBooking.passenger_phone, // Note: fetchBookings needs to return phone too
                seat_number: editingBooking.seat_number
            });
            setShowEditModal(false);
            setEditingBooking(null);
            fetchBookings(); // Refresh list
            alert('Booking updated successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to update booking: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleDeleteBooking = async (id) => {
        try {
            await axios.delete(`http://localhost:3000/api/bookings/${id}`);
            fetchBookings(); // Refresh list
            alert('Booking deleted successfully');
        } catch (err) {
            console.error(err);
            const errMsg = err.response?.data?.error || err.message;
            alert(`Failed to delete booking: ${errMsg}`);
        }
    };

    return (
        <div className="container py-8 animate-fade-in relative">
            <h1 className="text-3xl mb-8">Admin Dashboard</h1>

            <div className="flex gap-4 mb-8">
                <button
                    onClick={() => setActiveTab('bookings')}
                    className={`btn ${activeTab === 'bookings' ? 'btn-primary' : 'btn-outline'}`}
                >
                    <Users size={18} style={{ marginRight: '8px' }} /> View Bookings
                </button>
                <button
                    onClick={() => setActiveTab('bookings')}
                    className={`btn ${activeTab === 'bookings' ? 'btn-primary' : 'btn-outline'}`}
                >
                    <Users size={18} style={{ marginRight: '8px' }} /> View Bookings
                </button>
                <button
                    onClick={() => setActiveTab('routes')}
                    className={`btn ${activeTab === 'routes' ? 'btn-primary' : 'btn-outline'}`}
                >
                    <Calendar size={18} style={{ marginRight: '8px' }} /> Manage Routes
                </button>
                <button
                    onClick={() => setActiveTab('addRoute')}
                    className={`btn ${activeTab === 'addRoute' ? 'btn-primary' : 'btn-outline'}`}
                >
                    <Plus size={18} style={{ marginRight: '8px' }} /> Add Route
                </button>
            </div>

            {/* Routes Manager Component (Inline for simplicity) */}
            {activeTab === 'routes' && <RoutesManager />}

            {activeTab === 'bookings' && (
                <div className="card" style={{ overflowX: 'auto' }}>
                    <h2 className="text-xl mb-4 font-bold">Recent Bookings</h2>
                    {loading ? <p>Loading...</p> : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                                    <th className="p-4 text-muted font-medium">ID</th>
                                    <th className="p-4 text-muted font-medium">Passenger</th>
                                    <th className="p-4 text-muted font-medium">Route</th>
                                    <th className="p-4 text-muted font-medium">Date</th>
                                    <th className="p-4 text-muted font-medium">Seat</th>
                                    <th className="p-4 text-muted font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map(booking => (
                                    <tr key={booking.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td className="p-4 font-bold">#{booking.id}</td>
                                        <td className="p-4">
                                            <div className="font-medium">{booking.passenger_name}</div>
                                            <div className="text-xs text-muted">{booking.passenger_phone}</div>
                                        </td>
                                        <td className="p-4">{booking.origin} → {booking.destination}</td>
                                        <td className="p-4">{booking.date}<br /><span className="text-xs text-muted">{booking.departure_time}</span></td>
                                        <td className="p-4"><span style={{ backgroundColor: '#e0e7ff', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.875rem', fontWeight: 'bold' }}>{booking.seat_number}</span></td>
                                        <td className="p-4">
                                            <button onClick={() => handleEditClick(booking)} className="btn btn-sm btn-outline flex items-center gap-1">
                                                <Edit size={14} /> Edit
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Are you sure you want to delete this booking?')) {
                                                        handleDeleteBooking(booking.id);
                                                    }
                                                }}
                                                className="btn btn-sm btn-outline-danger flex items-center gap-1"
                                                style={{ marginLeft: '0.5rem', borderColor: 'red', color: 'red' }}
                                            >
                                                <X size={14} /> Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {bookings.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="p-4 text-center text-muted">No bookings found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {activeTab === 'routes' && (
                <RoutesManager />
            )}

            {activeTab === 'addRoute' && (
                <div className="card" style={{ maxWidth: '600px' }}>
                    <h2 className="text-xl mb-4 font-bold">Add New Schedule</h2>
                    {routeMessage && (
                        <div className={`p-4 mb-4 rounded ${routeMessage.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {routeMessage}
                        </div>
                    )}
                    <form onSubmit={handleAddRoute} className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Origin</label>
                                <input type="text" required value={newRoute.origin} onChange={e => setNewRoute({ ...newRoute, origin: e.target.value })} placeholder="Colombo" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Destination</label>
                                <input type="text" required value={newRoute.destination} onChange={e => setNewRoute({ ...newRoute, destination: e.target.value })} placeholder="Kandy" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Date</label>
                            <input type="date" required value={newRoute.date} onChange={e => setNewRoute({ ...newRoute, date: e.target.value })} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Departure</label>
                                <input type="time" required value={newRoute.departure_time} onChange={e => setNewRoute({ ...newRoute, departure_time: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Arrival</label>
                                <input type="time" required value={newRoute.arrival_time} onChange={e => setNewRoute({ ...newRoute, arrival_time: e.target.value })} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Price (LKR)</label>
                            <input type="number" required value={newRoute.price} onChange={e => setNewRoute({ ...newRoute, price: e.target.value })} placeholder="1500" />
                        </div>

                        <button type="submit" className="btn btn-primary mt-2">
                            Add Schedule
                        </button>
                    </form>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && editingBooking && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Edit Booking #{editingBooking.id}</h2>
                            <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateBooking} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Passenger Name</label>
                                <input
                                    type="text"
                                    required
                                    value={editingBooking.passenger_name}
                                    onChange={e => setEditingBooking({ ...editingBooking, passenger_name: e.target.value })}
                                    className="w-full border rounded p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Passenger Phone</label>
                                <input
                                    type="text"
                                    required
                                    value={editingBooking.passenger_phone}
                                    onChange={e => setEditingBooking({ ...editingBooking, passenger_phone: e.target.value })}
                                    className="w-full border rounded p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Seat Number</label>
                                <select
                                    value={editingBooking.seat_number}
                                    onChange={e => setEditingBooking({ ...editingBooking, seat_number: e.target.value })}
                                    className="w-full border rounded p-2"
                                >
                                    {availableSeats.map(seat => (
                                        <option key={seat} value={seat}>
                                            Seat {seat}
                                        </option>
                                    ))}
                                    {/* Fallback if availableSeats fetch fails but we want to show current seat */}
                                    {!availableSeats.includes(parseInt(editingBooking.seat_number)) && (
                                        <option value={editingBooking.seat_number}>Seat {editingBooking.seat_number}</option>
                                    )}
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-outline">Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const RoutesManager = () => {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRoutes();
    }, []);

    const fetchRoutes = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/routes');
            setRoutes(res.data.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const toggleStatus = async (route) => {
        const newStatus = route.status === 'cancelled' ? 'scheduled' : 'cancelled';
        try {
            await axios.put(`http://localhost:3000/api/routes/${route.id}/status`, { status: newStatus });
            // Optimistic update
            setRoutes(routes.map(r => r.id === route.id ? { ...r, status: newStatus } : r));
        } catch (err) {
            alert('Failed to update status');
        }
    };

    if (loading) return <p>Loading routes...</p>;

    return (
        <div className="card">
            <h2 className="text-xl mb-4 font-bold">Manage Bus Routes</h2>
            <div className="overflow-x-auto">
                <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                            <th className="p-3">Date</th>
                            <th className="p-3">Route</th>
                            <th className="p-3">Time</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {routes.map(r => (
                            <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td className="p-3">{r.date}</td>
                                <td className="p-3">{r.origin} → {r.destination}</td>
                                <td className="p-3">{r.departure_time} - {r.arrival_time}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${r.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                        {r.status || 'Scheduled'}
                                    </span>
                                </td>
                                <td className="p-3">
                                    <button
                                        onClick={() => toggleStatus(r)}
                                        className={`btn btn-sm ${r.status === 'cancelled' ? 'btn-primary' : 'btn-outline-danger'}`}
                                        style={r.status !== 'cancelled' ? { borderColor: 'red', color: 'red' } : {}}
                                    >
                                        {r.status === 'cancelled' ? 'Activate' : 'Cancel'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPage;
