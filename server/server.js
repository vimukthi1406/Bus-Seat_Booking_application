const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Logging Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// --- AUTH API ---

// Register
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
    }

    // In real app: hash password here (e.g. bcrypt)
    const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
    db.run(sql, [username, password], function (err) {
        if (err) {
            if (err.message.includes("UNIQUE constraint failed")) {
                return res.status(409).json({ error: "Username already exists" });
            }
            return res.status(400).json({ error: err.message });
        }
        res.json({ message: "User registered successfully", userId: this.lastID });
    });
});

// Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
    db.get(sql, [username, password], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(401).json({ error: "Invalid username or password" });
        }
        // In real app: generate JWT token here
        res.json({
            message: "Login successful",
            user: { id: row.id, username: row.username }
        });
    });
});


// --- ROUTES API ---

// Get all routes
app.get('/api/routes', (req, res) => {
    const sql = "SELECT * FROM routes ORDER BY date, departure_time";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: "success",
            data: rows
        });
    });
});

// Get single route by ID
app.get('/api/routes/:id', (req, res) => {
    const sql = "SELECT * FROM routes WHERE id = ?";
    const params = [req.params.id];
    db.get(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: "success",
            data: row
        });
    });
});

// Add new route (Admin)
app.post('/api/routes', (req, res) => {
    const { origin, destination, date, departure_time, arrival_time, price } = req.body;
    const sql = "INSERT INTO routes (origin, destination, date, departure_time, arrival_time, price) VALUES (?,?,?,?,?,?)";
    const params = [origin, destination, date, departure_time, arrival_time, price];
    db.run(sql, params, function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: "success",
            data: { id: this.lastID }
        });
    });
});

// Update a route status (Admin)
app.put('/api/routes/:id/status', (req, res) => {
    const { status } = req.body;
    const sql = "UPDATE routes SET status = ? WHERE id = ?";
    db.run(sql, [status, req.params.id], function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: "success", changes: this.changes });
    });
});

// --- BOOKINGS API ---

// Get bookings for a specific route (to show reserved seats)
app.get('/api/bookings/:route_id', (req, res) => {
    const sql = "SELECT seat_number FROM bookings WHERE route_id = ?";
    const params = [req.params.route_id];
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        // Return array of seat numbers
        const bookedSeats = rows.map(row => row.seat_number);
        res.json({
            message: "success",
            data: bookedSeats
        });
    });
});

// Get all bookings (Admin)
app.get('/api/bookings', (req, res) => {
    const sql = `
        SELECT bookings.id, bookings.seat_number, bookings.passenger_name, bookings.passenger_phone, bookings.booking_date,
               bookings.route_id,
               routes.origin, routes.destination, routes.date, routes.departure_time
        FROM bookings
        JOIN routes ON bookings.route_id = routes.id
        ORDER BY bookings.booking_date DESC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: "success",
            data: rows
        });
    });
});

// Create a booking
app.post('/api/bookings', (req, res) => {
    const { route_id, seat_number, passenger_name, passenger_phone } = req.body;
    const sql = "INSERT INTO bookings (route_id, seat_number, passenger_name, passenger_phone) VALUES (?,?,?,?)";
    const params = [route_id, seat_number, passenger_name, passenger_phone];

    db.run(sql, params, function (err) {
        if (err) {
            // Check for unique constraint violation (double booking)
            if (err.message.includes("UNIQUE constraint failed")) {
                res.status(409).json({ error: "Seat already booked" });
            } else {
                res.status(400).json({ error: err.message });
            }
            return;
        }
        res.json({
            message: "success",
            booking_id: this.lastID
        });
    });
});

// Update a booking (Admin)
app.put('/api/bookings/:id', (req, res) => {
    const { seat_number, passenger_name, passenger_phone, route_id } = req.body;
    const bookingId = req.params.id;

    // We need route_id to check for seat conflicts if seat is changed.
    // However, the client might not send route_id if it's just a name change.
    // But for simplicity, let's assume the client sends all details or we fetch them.
    // Actually, unique constraint is on (route_id, seat_number).
    // If we update seat_number, we must ensure (route_id, new_seat_number) is valid.

    // Let's first get the current booking to know the route_id if not provided,
    // but the most robust way is to expect route_id from client or look it up.
    // For now, let's assume route_id is valid and provided or retrieved.

    // A better approach for SQLite unique constraint update:
    // Just try to update. If conflict, it will fail.

    const sql = `
        UPDATE bookings 
        SET seat_number = COALESCE(?, seat_number),
            passenger_name = COALESCE(?, passenger_name),
            passenger_phone = COALESCE(?, passenger_phone)
        WHERE id = ?
    `;

    const params = [seat_number, passenger_name, passenger_phone, bookingId];

    db.run(sql, params, function (err) {
        if (err) {
            if (err.message.includes("UNIQUE constraint failed")) {
                res.status(409).json({ error: "Seat already booked for this route." });
            } else {
                res.status(400).json({ error: err.message });
            }
            return;
        }

        if (this.changes === 0) {
            res.status(404).json({ error: "Booking not found" });
            return;
        }

        res.json({
            message: "success",
            changes: this.changes
        });
    });
});

// Delete a booking (Admin)
app.delete('/api/bookings/:id', (req, res) => {
    console.log(`Deleting booking with ID: ${req.params.id}`);
    const sql = "DELETE FROM bookings WHERE id = ?";
    db.run(sql, [req.params.id], function (err) {
        if (err) {
            console.error("Error deleting booking:", err.message);
            res.status(400).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            console.log("No booking found with that ID to delete.");
            res.status(404).json({ error: "Booking not found" });
            return;
        }
        console.log("Booking deleted successfully.");
        res.json({ message: "deleted", changes: this.changes });
    });
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
