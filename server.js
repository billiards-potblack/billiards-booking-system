const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : '*',
    credentials: true
}));
app.use(express.json());

const dbPath = path.join(__dirname, 'billiards.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

function initializeDatabase() {
    // First, check if columns exist and add them if not
    db.all("PRAGMA table_info(bookings)", (err, columns) => {
        if (!err && columns) {
            const columnNames = columns.map(col => col.name);
            
            // Add missing columns if they don't exist
            if (!columnNames.includes('table_amount')) {
                db.run('ALTER TABLE bookings ADD COLUMN table_amount DECIMAL(10,2)', (err) => {
                    if (err) console.log('table_amount column may already exist');
                });
            }
            if (!columnNames.includes('beverage_amount')) {
                db.run('ALTER TABLE bookings ADD COLUMN beverage_amount DECIMAL(10,2) DEFAULT 0', (err) => {
                    if (err) console.log('beverage_amount column may already exist');
                });
            }
            if (!columnNames.includes('payment_method')) {
                db.run('ALTER TABLE bookings ADD COLUMN payment_method VARCHAR(50)', (err) => {
                    if (err) console.log('payment_method column may already exist');
                });
            }
        }
    });

    // Create new tables if they don't exist
    db.run(`CREATE TABLE IF NOT EXISTS beverages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (!err) {
            // Insert default beverages
            db.run(`INSERT OR IGNORE INTO beverages (id, name, price) VALUES
                (1, 'Tea', 20.00),
                (2, 'Coffee', 30.00),
                (3, 'Cold Drink', 40.00),
                (4, 'Water Bottle', 20.00),
                (5, 'Energy Drink', 60.00)`);
        }
    });
    
    // Create users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(100),
        role VARCHAR(20) NOT NULL DEFAULT 'user',
        is_active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (!err) {
            // Insert default users
            db.run(`INSERT OR IGNORE INTO users (username, password, full_name, role) VALUES
                ('admin', 'admin123', 'Administrator', 'admin'),
                ('user', 'user123', 'Regular User', 'user')`);
        }
    });

    db.run('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)');
    db.run('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)');

    db.run(`CREATE TABLE IF NOT EXISTS booking_beverages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id INTEGER NOT NULL,
        beverage_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price_at_time DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id),
        FOREIGN KEY (beverage_id) REFERENCES beverages(id)
    )`);

    // Create indexes
    db.run('CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_name)');
    db.run('CREATE INDEX IF NOT EXISTS idx_bookings_payment_method ON bookings(payment_method)');
    db.run('CREATE INDEX IF NOT EXISTS idx_booking_beverages_booking ON booking_beverages(booking_id)');

    console.log('Database initialized/updated successfully');
}

const runQuery = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(query, params, function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, changes: this.changes });
        });
    });
};

const getQuery = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

const allQuery = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

const roundAmount = (amount) => Math.round(parseFloat(amount) || 0);

// ============ BEVERAGE ROUTES ============

app.get('/api/beverages', async (req, res) => {
    try {
        const beverages = await allQuery('SELECT * FROM beverages ORDER BY name');
        res.json(beverages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/beverages', async (req, res) => {
    try {
        const { name, price } = req.body;
        const result = await runQuery(
            'INSERT INTO beverages (name, price) VALUES (?, ?)',
            [name, roundAmount(price)]
        );
        const newBeverage = await getQuery('SELECT * FROM beverages WHERE id = ?', [result.id]);
        res.json(newBeverage);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/beverages/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price } = req.body;
        await runQuery(
            'UPDATE beverages SET name = ?, price = ? WHERE id = ?',
            [name, roundAmount(price), id]
        );
        const updated = await getQuery('SELECT * FROM beverages WHERE id = ?', [id]);
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/beverages/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await runQuery('DELETE FROM beverages WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============ TABLE TYPE ROUTES ============

app.get('/api/table-types', async (req, res) => {
    try {
        const types = await allQuery('SELECT * FROM table_types ORDER BY price_per_hour DESC');
        res.json(types);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/table-types/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { type_code, type_name, quantity, price_per_hour } = req.body;
        await runQuery(`
            UPDATE table_types 
            SET type_code = ?, type_name = ?, quantity = ?, price_per_hour = ?
            WHERE id = ?
        `, [type_code, type_name, quantity, roundAmount(price_per_hour), id]);
        const updated = await getQuery('SELECT * FROM table_types WHERE id = ?', [id]);
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/table-types', async (req, res) => {
    try {
        const { type_code, type_name, quantity, price_per_hour } = req.body;
        const result = await runQuery(`
            INSERT INTO table_types (type_code, type_name, quantity, price_per_hour)
            VALUES (?, ?, ?, ?)
        `, [type_code, type_name, quantity, roundAmount(price_per_hour)]);
        const newType = await getQuery('SELECT * FROM table_types WHERE id = ?', [result.id]);
        res.json(newType);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/table-types/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const bookingCount = await getQuery(
            'SELECT COUNT(*) as count FROM bookings WHERE table_type_id = ?',
            [id]
        );
        if (bookingCount && bookingCount.count > 0) {
            return res.status(400).json({ 
                error: `Cannot delete table type with ${bookingCount.count} existing bookings` 
            });
        }
        const result = await runQuery('DELETE FROM table_types WHERE id = ?', [id]);
        if (result.changes > 0) {
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Table type not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============ BOOKING ROUTES ============

app.get('/api/bookings/active', async (req, res) => {
    try {
        const bookings = await allQuery(`
            SELECT b.*, tt.type_code, tt.type_name, tt.price_per_hour as current_price
            FROM bookings b
            JOIN table_types tt ON b.table_type_id = tt.id
            WHERE b.status = 'active'
            ORDER BY b.start_time DESC
        `);
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/bookings', async (req, res) => {
    try {
        const { status, startDate, endDate, paymentStatus, paymentMethod, customer } = req.query;
        let query = `
            SELECT b.*, tt.type_code, tt.type_name
            FROM bookings b
            JOIN table_types tt ON b.table_type_id = tt.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ' AND b.status = ?';
            params.push(status);
        }
        if (paymentStatus) {
            query += ' AND b.payment_status = ?';
            params.push(paymentStatus);
        }
        if (paymentMethod) {
            query += ' AND b.payment_method = ?';
            params.push(paymentMethod);
        }
        if (customer) {
            query += ' AND b.customer_name LIKE ?';
            params.push(`%${customer}%`);
        }
        if (startDate) {
            query += ' AND DATE(b.start_time) >= DATE(?)';
            params.push(startDate);
        }
        if (endDate) {
            query += ' AND DATE(b.start_time) <= DATE(?)';
            params.push(endDate);
        }

        query += ' ORDER BY b.start_time DESC';

        const bookings = await allQuery(query, params);
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/bookings', async (req, res) => {
    try {
        const { table_type_id, table_number, customer_name, created_by } = req.body;
        const tableType = await getQuery('SELECT price_per_hour FROM table_types WHERE id = ?', [table_type_id]);
        
        if (!tableType) {
            return res.status(404).json({ error: 'Table type not found' });
        }

        const result = await runQuery(`
            INSERT INTO bookings (table_type_id, table_number, customer_name, start_time, 
                                price_per_hour, status, payment_status, created_by)
            VALUES (?, ?, ?, datetime('now', 'localtime'), ?, 'active', 'pending', ?)
        `, [table_type_id, table_number, customer_name, roundAmount(tableType.price_per_hour), created_by]);

        const booking = await getQuery('SELECT * FROM bookings WHERE id = ?', [result.id]);
        res.json(booking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/bookings/:id/end', async (req, res) => {
    try {
        const { id } = req.params;
        const { amount_paid, payment_method, notes, beverages, created_by } = req.body;

        const booking = await getQuery('SELECT * FROM bookings WHERE id = ?', [id]);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        const endTime = new Date();
        const startTime = new Date(booking.start_time);
        const durationMinutes = Math.round((endTime - startTime) / 60000);
        const durationHours = durationMinutes / 60;
        const tableAmount = roundAmount(durationHours * booking.price_per_hour);

        // Calculate beverage amount
        let beverageAmount = 0;
        if (beverages && beverages.length > 0) {
            for (const item of beverages) {
                if (!item.beverage_id) continue;
                const beverage = await getQuery('SELECT price FROM beverages WHERE id = ?', [item.beverage_id]);
                if (beverage) {
                    const itemTotal = roundAmount(beverage.price * item.quantity);
                    beverageAmount += itemTotal;
                    
                    await runQuery(`
                        INSERT INTO booking_beverages (booking_id, beverage_id, quantity, price_at_time)
                        VALUES (?, ?, ?, ?)
                    `, [id, item.beverage_id, item.quantity, beverage.price]);
                }
            }
        }

        const totalAmount = roundAmount(tableAmount + beverageAmount);
        const paidAmount = roundAmount(amount_paid || 0);
        const pendingAmount = roundAmount(totalAmount - paidAmount);
        const paymentStatus = paidAmount >= totalAmount ? 'paid' : (paidAmount > 0 ? 'partial' : 'pending');

        await runQuery(`
            UPDATE bookings 
            SET end_time = datetime('now', 'localtime'),
                duration_minutes = ?,
                table_amount = ?,
                beverage_amount = ?,
                total_amount = ?,
                amount_paid = ?,
                amount_pending = ?,
                status = 'completed',
                payment_status = ?,
                payment_method = ?,
                notes = ?,
                updated_at = datetime('now', 'localtime')
            WHERE id = ?
        `, [durationMinutes, tableAmount, beverageAmount, totalAmount, paidAmount, pendingAmount, 
            paymentStatus, payment_method, notes, id]);

        if (paidAmount > 0) {
            await runQuery(`
                INSERT INTO payment_history (booking_id, payment_amount, payment_method, notes, recorded_by)
                VALUES (?, ?, ?, ?, ?)
            `, [id, paidAmount, payment_method, notes, created_by]);
        }

        const updatedBooking = await getQuery('SELECT * FROM bookings WHERE id = ?', [id]);
        res.json(updatedBooking);
    } catch (err) {
        console.error('Error ending booking:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/bookings/:id/payment', async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_amount, payment_method, notes, created_by } = req.body;

        const booking = await getQuery('SELECT * FROM bookings WHERE id = ?', [id]);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        const newPaidAmount = roundAmount(parseFloat(booking.amount_paid || 0) + parseFloat(payment_amount));
        const newPendingAmount = roundAmount(parseFloat(booking.total_amount) - newPaidAmount);
        const paymentStatus = newPendingAmount <= 0 ? 'paid' : 'partial';

        await runQuery(`
            UPDATE bookings 
            SET amount_paid = ?, amount_pending = ?, payment_status = ?, 
                payment_method = ?, updated_at = datetime('now', 'localtime')
            WHERE id = ?
        `, [newPaidAmount, newPendingAmount, paymentStatus, payment_method, id]);

        await runQuery(`
            INSERT INTO payment_history (booking_id, payment_amount, payment_method, notes, recorded_by)
            VALUES (?, ?, ?, ?, ?)
        `, [id, roundAmount(payment_amount), payment_method, notes, created_by]);

        const updatedBooking = await getQuery('SELECT * FROM bookings WHERE id = ?', [id]);
        res.json(updatedBooking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============ REPORTS ============

app.get('/api/reports/daily', async (req, res) => {
    try {
        const { date } = req.query;
        const targetDate = date || new Date().toISOString().split('T')[0];

        const report = await getQuery(`
            SELECT 
                COUNT(*) as total_bookings,
                COALESCE(SUM(table_amount), 0) as table_revenue,
                COALESCE(SUM(beverage_amount), 0) as beverage_revenue,
                COALESCE(SUM(total_amount), 0) as total_revenue,
                COALESCE(SUM(amount_paid), 0) as total_paid,
                COALESCE(SUM(amount_pending), 0) as total_pending,
                SUM(duration_minutes) as total_minutes
            FROM bookings
            WHERE DATE(start_time) = DATE(?) AND status = 'completed'
        `, [targetDate]);

        const byTableType = await allQuery(`
            SELECT 
                tt.type_name, tt.type_code,
                COUNT(*) as bookings,
                COALESCE(SUM(b.table_amount), 0) as revenue,
                SUM(b.duration_minutes) as minutes
            FROM bookings b
            JOIN table_types tt ON b.table_type_id = tt.id
            WHERE DATE(b.start_time) = DATE(?) AND b.status = 'completed'
            GROUP BY tt.id, tt.type_name, tt.type_code
        `, [targetDate]);

        res.json({ summary: report, byTableType });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/reports/table-revenue', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let params = [];
        
        let query = `
            SELECT 
                tt.type_name,
                tt.type_code,
                COUNT(*) as bookings,
                COALESCE(SUM(b.table_amount), 0) as revenue,
                COALESCE(SUM(b.duration_minutes), 0) as minutes
            FROM bookings b
            JOIN table_types tt ON b.table_type_id = tt.id
            WHERE b.status = 'completed'
        `;

        if (startDate) {
            query += ' AND DATE(b.start_time) >= DATE(?)';
            params.push(startDate);
        }
        if (endDate) {
            query += ' AND DATE(b.start_time) <= DATE(?)';
            params.push(endDate);
        }

        query += ' GROUP BY tt.id, tt.type_name, tt.type_code ORDER BY revenue DESC';

        const byTableType = await allQuery(query, params);
        
        let summaryQuery = `
            SELECT 
                COUNT(DISTINCT b.id) as total_bookings,
                COALESCE(SUM(b.table_amount), 0) as total_revenue,
                COALESCE(SUM(b.duration_minutes), 0) as total_minutes
            FROM bookings b
            WHERE b.status = 'completed'
        `;
        
        let summaryParams = [];
        if (startDate) {
            summaryQuery += ' AND DATE(b.start_time) >= DATE(?)';
            summaryParams.push(startDate);
        }
        if (endDate) {
            summaryQuery += ' AND DATE(b.start_time) <= DATE(?)';
            summaryParams.push(endDate);
        }

        const summary = await getQuery(summaryQuery, summaryParams);

        res.json({ summary, byTableType });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/reports/beverage-revenue', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let query = `
            SELECT 
                bev.name,
                SUM(bb.quantity) as total_quantity,
                COALESCE(SUM(bb.quantity * bb.price_at_time), 0) as total_revenue
            FROM booking_beverages bb
            JOIN beverages bev ON bb.beverage_id = bev.id
            JOIN bookings b ON bb.booking_id = b.id
            WHERE b.status = 'completed'
        `;
        const params = [];

        if (startDate) {
            query += ' AND DATE(b.start_time) >= DATE(?)';
            params.push(startDate);
        }
        if (endDate) {
            query += ' AND DATE(b.start_time) <= DATE(?)';
            params.push(endDate);
        }

        query += ' GROUP BY bev.id, bev.name ORDER BY total_revenue DESC';

        const beverageReport = await allQuery(query, params);
        
        const summary = await getQuery(`
            SELECT 
                COALESCE(SUM(bb.quantity * bb.price_at_time), 0) as total_beverage_revenue,
                COUNT(DISTINCT bb.booking_id) as total_orders
            FROM booking_beverages bb
            JOIN bookings b ON bb.booking_id = b.id
            WHERE b.status = 'completed'
            ${startDate ? 'AND DATE(b.start_time) >= DATE(?)' : ''}
            ${endDate ? 'AND DATE(b.start_time) <= DATE(?)' : ''}
        `, params);

        res.json({ summary, items: beverageReport });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/reports/pending-payments', async (req, res) => {
    try {
        const { customer, startDate, endDate } = req.query;
        let query = `
            SELECT b.*, tt.type_name, tt.type_code
            FROM bookings b
            JOIN table_types tt ON b.table_type_id = tt.id
            WHERE b.payment_status IN ('pending', 'partial') AND b.status = 'completed'
        `;
        const params = [];

        if (customer) {
            query += ' AND b.customer_name LIKE ?';
            params.push(`%${customer}%`);
        }
        if (startDate) {
            query += ' AND DATE(b.start_time) >= DATE(?)';
            params.push(startDate);
        }
        if (endDate) {
            query += ' AND DATE(b.start_time) <= DATE(?)';
            params.push(endDate);
        }

        query += ' ORDER BY b.start_time DESC';

        const pending = await allQuery(query, params);

        const summary = await getQuery(`
            SELECT 
                COUNT(*) as total_count,
                COALESCE(SUM(amount_pending), 0) as total_pending
            FROM bookings
            WHERE payment_status IN ('pending', 'partial') AND status = 'completed'
        `);

        res.json({ summary, bookings: pending });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============ AUTHENTICATION ROUTES ============

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const user = await getQuery(
            'SELECT id, username, full_name, role, is_active FROM users WHERE username = ? AND password = ?',
            [username, password]
        );

        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        if (!user.is_active) {
            return res.status(401).json({ error: 'Account is inactive' });
        }

        res.json({
            id: user.id,
            username: user.username,
            fullName: user.full_name,
            role: user.role
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============ USER MANAGEMENT ROUTES ============

app.get('/api/users', async (req, res) => {
    try {
        const users = await allQuery(
            'SELECT id, username, full_name, role, is_active, created_at FROM users ORDER BY created_at DESC'
        );
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const { username, password, full_name, role } = req.body;
        
        const existing = await getQuery('SELECT id FROM users WHERE username = ?', [username]);
        if (existing) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const result = await runQuery(
            'INSERT INTO users (username, password, full_name, role) VALUES (?, ?, ?, ?)',
            [username, password, full_name, role || 'user']
        );
        
        const newUser = await getQuery(
            'SELECT id, username, full_name, role, is_active FROM users WHERE id = ?',
            [result.id]
        );
        res.json(newUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { username, password, full_name, role, is_active } = req.body;
        
        let query = 'UPDATE users SET username = ?, full_name = ?, role = ?, is_active = ?';
        let params = [username, full_name, role, is_active ? 1 : 0];
        
        if (password && password.trim() !== '') {
            query += ', password = ?';
            params.push(password);
        }
        
        query += ' WHERE id = ?';
        params.push(id);
        
        await runQuery(query, params);
        
        const updated = await getQuery(
            'SELECT id, username, full_name, role, is_active FROM users WHERE id = ?',
            [id]
        );
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Prevent deleting the last admin
        const adminCount = await getQuery(
            "SELECT COUNT(*) as count FROM users WHERE role = 'admin' AND is_active = 1"
        );
        
        const user = await getQuery('SELECT role FROM users WHERE id = ?', [id]);
        if (user && user.role === 'admin' && adminCount.count <= 1) {
            return res.status(400).json({ error: 'Cannot delete the last admin user' });
        }
        
        await runQuery('DELETE FROM users WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Serve static files (index.html)
app.use(express.static(__dirname));

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Billiards API server running on http://localhost:${PORT}`);
});