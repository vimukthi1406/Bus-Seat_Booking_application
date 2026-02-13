const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite database
const dbPath = path.resolve(__dirname, 'bus_booking.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Create Routes table
        // Added 'status' column. Default 'scheduled'.
        db.run(`CREATE TABLE IF NOT EXISTS routes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            origin TEXT NOT NULL,
            destination TEXT NOT NULL,
            date TEXT NOT NULL,
            departure_time TEXT NOT NULL,
            arrival_time TEXT NOT NULL,
            price REAL NOT NULL,
            status TEXT DEFAULT 'scheduled'
        )`, (err) => {
            if (!err) {
                // Check if we need to migrate existing tables (simple check)
                // In production, use proper migration. Here, we can just try to add column if missing
                // but for simplicity in this dev environment, if table existed without status, 
                // we might need to recreate or alter.
                // Let's try to add the column just in case it didn't exist (ignoring error if exists)
                db.run("ALTER TABLE routes ADD COLUMN status TEXT DEFAULT 'scheduled'", () => { });
            }
        });

        // Create Bookings table
        db.run(`CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            route_id INTEGER NOT NULL,
            seat_number INTEGER NOT NULL,
            passenger_name TEXT NOT NULL,
            passenger_phone TEXT NOT NULL,
            booking_date TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (route_id) REFERENCES routes(id),
            UNIQUE(route_id, seat_number)
        )`);

        // Create Users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )`);

        // Seed Admin User
        db.get("SELECT * FROM users WHERE username = 'admin'", (err, row) => {
            if (!row) {
                console.log("Seeding admin user...");
                // In a real app, hash this password!
                db.run("INSERT INTO users (username, password) VALUES (?, ?)", ['admin', 'admin123']);
            }
        });

        // Seed initial routes if empty or strictly needed for demo
        // We want to ensure we have routes for the next 7 days.
        const today = new Date();
        const routePatterns = [
            { origin: "Colombo", destination: "Kandy", dep: "08:00", arr: "11:00", price: 1500 },
            { origin: "Kandy", destination: "Colombo", dep: "14:00", arr: "17:00", price: 1500 },
            { origin: "Galle", destination: "Matara", dep: "09:00", arr: "10:30", price: 500 },
            { origin: "Colombo", destination: "Jaffna", dep: "22:00", arr: "06:00", price: 3500 },
            { origin: "Jaffna", destination: "Colombo", dep: "08:00", arr: "16:00", price: 3500 }
        ];

        // Check if we have routes for today. If not, seed for next 7 days.
        const todayStr = today.toISOString().split('T')[0];
        db.get("SELECT count(*) as count FROM routes WHERE date = ?", [todayStr], (err, row) => {
            if (row && row.count === 0) {
                console.log("Seeding routes for the next 7 days...");
                const stmt = db.prepare("INSERT INTO routes (origin, destination, date, departure_time, arrival_time, price, status) VALUES (?, ?, ?, ?, ?, ?, ?)");

                for (let i = 0; i < 7; i++) {
                    const d = new Date(today);
                    d.setDate(today.getDate() + i);
                    const dateStr = d.toISOString().split('T')[0];

                    routePatterns.forEach(p => {
                        stmt.run(p.origin, p.destination, dateStr, p.dep, p.arr, p.price, 'scheduled');
                    });
                }
                stmt.finalize();
            }
        });
    });
}

module.exports = db;
