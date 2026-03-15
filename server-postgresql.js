const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection configuration
// IMPORTANT: Update these values for your PostgreSQL setup
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'billiards',
    password: process.env.DB_PASSWORD || 'your_password_here',
    port: process.env.DB_PORT || 5432,
});

// Test database connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to PostgreSQL database:', err);
        console.log('\n⚠️  Please update database credentials in server-postgresql.js');
        console.log('   or set environment variables: DB_USER, DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT\n');
    } else {
        console.log('✓ Connected to PostgreSQL database');
        release();
        initializeDatabase();
    }
});

// Initialize database with schema
async function initializeDatabase() {
    try {
        const schemaPath = path.join(__dirname, 'database', 'schema-postgresql.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(schema);

        // Create users table if it doesn't exist
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                full_name VARCHAR(100),
                role VARCHAR(20) NOT NULL DEFAULT 'user',
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Insert default admin if not exists
        await pool.query(`
            INSERT INTO users (username, password, full_name, role)
            VALUES ('admin', 'admin123', 'Administrator', 'admin')
            ON CONFLICT (username) DO NOTHING;
        `);

        console.log('✓ Database initialized successfully');
    } catch (err) {
        console.error('Error initializing database:', err);
    }
}

// Helper function to run queries
const runQuery = async (query, params = []) => {
    const result = await pool.query(query, params);
    return { id: result.rows[0]?.id, changes: result.rowCount };
};

const getQuery = async (query, params = []) => {
    const result = await pool.query(query, params);
    return result.rows[0];
};

const allQuery = async (query, params = []) => {
    const result = await pool.query(query, params);
    return result.rows;
};

// ============ API ROUTES ============

// Get all table types
app.get('/api/table-types', async (req, res) => {
    try {
        const types = await allQuery('SELECT * FROM table_types ORDER BY price_per_hour DESC');
        res.json(types);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update table type
app.put('/api/table-types/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { type_code, type_name, quantity, price_per_hour } = req.body;

        await pool.query(`
            UPDATE table_types 
            SET type_code = $1,
                type_name = $2,
                quantity = $3,
                price_per_hour = $4
            WHERE id = $5
        `, [type_code, type_name, quantity, price_per_hour, id]);

        const updated = await getQuery('SELECT * FROM table_types WHERE id = $1', [id]);
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add new table type
app.post('/api/table-types', async (req, res) => {
    try {
        const { type_code, type_name, quantity, price_per_hour } = req.body;

        const result = await pool.query(`
            INSERT INTO table_types (type_code, type_name, quantity, price_per_hour)
            VALUES ($1, $2, $3, $4)
            RETURNING id
        `, [type_code, type_name, quantity, price_per_hour]);

        const newType = await getQuery('SELECT * FROM table_types WHERE id = $1', [result.rows[0].id]);
        res.json(newType);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete table type (only if no bookings exist)
app.delete('/api/table-types/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const bookingCount = await getQuery(
            'SELECT COUNT(*) as count FROM bookings WHERE table_type_id = $1',
            [id]
        );

        if (parseInt(bookingCount.count) > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete table type with existing bookings' 
            });
        }

        await pool.query('DELETE FROM table_types WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get active bookings (tables currently in use)
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

// Get all bookings with filters
app.get('/api/bookings', async (req, res) => {
    try {
        // Bug Fix 1 & 4: Added customer and paymentMethod to destructured query params
        const { status, startDate, endDate, paymentStatus, customer, paymentMethod } = req.query;
        let query = `
            SELECT b.*, tt.type_code, tt.type_name
            FROM bookings b
            JOIN table_types tt ON b.table_type_id = tt.id
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 1;

        if (status) {
            query += ` AND b.status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }
        if (paymentStatus) {
            query += ` AND b.payment_status = $${paramCount}`;
            params.push(paymentStatus);
            paramCount++;
        }
        // Bug Fix 1: customer name filter (case-insensitive partial match)
        if (customer) {
            query += ` AND LOWER(b.customer_name) LIKE LOWER($${paramCount})`;
            params.push(`%${customer}%`);
            paramCount++;
        }
        // Bug Fix 4: payment method filter
        if (paymentMethod) {
            query += ` AND b.payment_method = $${paramCount}`;
            params.push(paymentMethod);
            paramCount++;
        }
        if (startDate) {
            query += ` AND DATE(b.start_time) >= DATE($${paramCount})`;
            params.push(startDate);
            paramCount++;
        }
        if (endDate) {
            query += ` AND DATE(b.start_time) <= DATE($${paramCount})`;
            params.push(endDate);
            paramCount++;
        }

        query += ' ORDER BY b.start_time DESC';

        const bookings = await allQuery(query, params);
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create new booking (start session)
app.post('/api/bookings', async (req, res) => {
    try {
        const { table_type_id, table_number, customer_name, created_by } = req.body;

        const tableType = await getQuery('SELECT price_per_hour FROM table_types WHERE id = $1', [table_type_id]);
        
        if (!tableType) {
            return res.status(404).json({ error: 'Table type not found' });
        }

        const result = await pool.query(`
            INSERT INTO bookings (table_type_id, table_number, customer_name, start_time, 
                                price_per_hour, status, payment_status, created_by)
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4, 'active', 'pending', $5)
            RETURNING id
        `, [table_type_id, table_number, customer_name, tableType.price_per_hour, created_by]);

        const booking = await getQuery('SELECT * FROM bookings WHERE id = $1', [result.rows[0].id]);
        
        res.json(booking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// End booking session
// Bug Fix 6: Accept end_time and total_amount from frontend to prevent amount drift
app.put('/api/bookings/:id/end', async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const {
            amount_paid, payment_method, notes, created_by,
            end_time, total_amount: clientTotalAmount,
            beverages = []   // array of { beverage_id, quantity }
        } = req.body;

        const booking = await getQuery('SELECT * FROM bookings WHERE id = $1', [id]);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // Bug Fix 6: Use the end time sent by the frontend (captured when modal opened).
        const endTime = end_time ? new Date(end_time) : new Date();
        const startTime = new Date(booking.start_time);
        const durationMinutes = Math.round((endTime - startTime) / 60000);
        const durationHours = durationMinutes / 60;

        // Calculate table amount from duration
        const tableAmount = parseFloat((durationHours * booking.price_per_hour).toFixed(2));

        // Calculate beverage amount from line items
        let beverageAmount = 0;
        const resolvedBeverages = [];
        for (const item of beverages) {
            if (!item.beverage_id) continue;
            const bev = await getQuery('SELECT * FROM beverages WHERE id = $1', [item.beverage_id]);
            if (bev) {
                const qty = parseInt(item.quantity) || 1;
                beverageAmount += bev.price * qty;
                resolvedBeverages.push({ beverage_id: bev.id, quantity: qty, unit_price: bev.price });
            }
        }
        beverageAmount = parseFloat(beverageAmount.toFixed(2));

        // Bug Fix 6: Use total_amount sent from client when provided (reflects what was shown in UI).
        // Server recalculates only as a fallback for backwards compatibility.
        const totalAmount = clientTotalAmount !== undefined
            ? parseFloat(parseFloat(clientTotalAmount).toFixed(2))
            : parseFloat((tableAmount + beverageAmount).toFixed(2));

        const paidAmount = parseFloat(amount_paid || 0);
        const pendingAmount = parseFloat((totalAmount - paidAmount).toFixed(2));
        const paymentStatus = paidAmount >= totalAmount ? 'paid' : (paidAmount > 0 ? 'partial' : 'pending');

        await client.query('BEGIN');

        // Update the booking record (now also stores table_amount, beverage_amount, payment_method)
        await client.query(`
            UPDATE bookings 
            SET end_time        = $1,
                duration_minutes = $2,
                table_amount     = $3,
                beverage_amount  = $4,
                total_amount     = $5,
                amount_paid      = $6,
                amount_pending   = $7,
                status           = 'completed',
                payment_status   = $8,
                payment_method   = $9,
                notes            = $10
            WHERE id = $11
        `, [endTime, durationMinutes, tableAmount, beverageAmount, totalAmount,
            paidAmount, pendingAmount, paymentStatus, payment_method, notes, id]);

        // Persist beverage line items
        for (const bev of resolvedBeverages) {
            await client.query(`
                INSERT INTO booking_beverages (booking_id, beverage_id, quantity, unit_price)
                VALUES ($1, $2, $3, $4)
            `, [id, bev.beverage_id, bev.quantity, bev.unit_price]);
        }

        // Record payment in audit history
        if (paidAmount > 0) {
            await client.query(`
                INSERT INTO payment_history (booking_id, payment_amount, payment_method, notes, recorded_by)
                VALUES ($1, $2, $3, $4, $5)
            `, [id, paidAmount, payment_method, notes, created_by]);
        }

        await client.query('COMMIT');

        const updatedBooking = await getQuery('SELECT * FROM bookings WHERE id = $1', [id]);
        res.json(updatedBooking);
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

// Add payment to existing booking
app.post('/api/bookings/:id/payment', async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_amount, payment_method, notes, created_by } = req.body;

        const booking = await getQuery('SELECT * FROM bookings WHERE id = $1', [id]);
        
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        const newPaidAmount = parseFloat(booking.amount_paid) + parseFloat(payment_amount);
        const newPendingAmount = parseFloat(booking.total_amount) - newPaidAmount;
        const paymentStatus = newPendingAmount <= 0 ? 'paid' : 'partial';

        await pool.query(`
            UPDATE bookings 
            SET amount_paid = $1,
                amount_pending = $2,
                payment_status = $3
            WHERE id = $4
        `, [newPaidAmount, newPendingAmount, paymentStatus, id]);

        await pool.query(`
            INSERT INTO payment_history (booking_id, payment_amount, payment_method, notes, recorded_by)
            VALUES ($1, $2, $3, $4, $5)
        `, [id, payment_amount, payment_method, notes, created_by]);

        const updatedBooking = await getQuery('SELECT * FROM bookings WHERE id = $1', [id]);
        res.json(updatedBooking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Reports - Daily
app.get('/api/reports/daily', async (req, res) => {
    try {
        const { date } = req.query;
        const targetDate = date || new Date().toISOString().split('T')[0];

        const report = await getQuery(`
            SELECT 
                COUNT(*) as total_bookings,
                SUM(total_amount) as total_revenue,
                SUM(amount_paid) as total_paid,
                SUM(amount_pending) as total_pending,
                SUM(duration_minutes) as total_minutes
            FROM bookings
            WHERE DATE(start_time) = DATE($1)
                AND status = 'completed'
        `, [targetDate]);

        const byTableType = await allQuery(`
            SELECT 
                tt.type_name,
                tt.type_code,
                COUNT(*) as bookings,
                SUM(b.total_amount) as revenue,
                SUM(b.duration_minutes) as minutes
            FROM bookings b
            JOIN table_types tt ON b.table_type_id = tt.id
            WHERE DATE(b.start_time) = DATE($1)
                AND b.status = 'completed'
            GROUP BY tt.id, tt.type_name, tt.type_code
        `, [targetDate]);

        res.json({ summary: report, byTableType });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Reports - Weekly
app.get('/api/reports/weekly', async (req, res) => {
    try {
        const { startDate } = req.query;
        const start = startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const report = await getQuery(`
            SELECT 
                COUNT(*) as total_bookings,
                SUM(total_amount) as total_revenue,
                SUM(amount_paid) as total_paid,
                SUM(amount_pending) as total_pending,
                SUM(duration_minutes) as total_minutes
            FROM bookings
            WHERE DATE(start_time) >= DATE($1)
                AND DATE(start_time) <= CURRENT_DATE
                AND status = 'completed'
        `, [start]);

        const daily = await allQuery(`
            SELECT 
                DATE(start_time) as date,
                COUNT(*) as bookings,
                SUM(total_amount) as revenue
            FROM bookings
            WHERE DATE(start_time) >= DATE($1)
                AND DATE(start_time) <= CURRENT_DATE
                AND status = 'completed'
            GROUP BY DATE(start_time)
            ORDER BY date
        `, [start]);

        res.json({ summary: report, daily });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Reports - Monthly
app.get('/api/reports/monthly', async (req, res) => {
    try {
        const { year, month } = req.query;
        const targetYear = year || new Date().getFullYear();
        const targetMonth = month || (new Date().getMonth() + 1);

        const report = await getQuery(`
            SELECT 
                COUNT(*) as total_bookings,
                SUM(total_amount) as total_revenue,
                SUM(amount_paid) as total_paid,
                SUM(amount_pending) as total_pending,
                SUM(duration_minutes) as total_minutes
            FROM bookings
            WHERE EXTRACT(YEAR FROM start_time) = $1
                AND EXTRACT(MONTH FROM start_time) = $2
                AND status = 'completed'
        `, [targetYear, targetMonth]);

        const byTableType = await allQuery(`
            SELECT 
                tt.type_name,
                COUNT(*) as bookings,
                SUM(b.total_amount) as revenue
            FROM bookings b
            JOIN table_types tt ON b.table_type_id = tt.id
            WHERE EXTRACT(YEAR FROM b.start_time) = $1
                AND EXTRACT(MONTH FROM b.start_time) = $2
                AND b.status = 'completed'
            GROUP BY tt.type_name
        `, [targetYear, targetMonth]);

        res.json({ summary: report, byTableType });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Reports - Yearly
app.get('/api/reports/yearly', async (req, res) => {
    try {
        const { year } = req.query;
        const targetYear = year || new Date().getFullYear();

        const report = await getQuery(`
            SELECT 
                COUNT(*) as total_bookings,
                SUM(total_amount) as total_revenue,
                SUM(amount_paid) as total_paid,
                SUM(amount_pending) as total_pending,
                SUM(duration_minutes) as total_minutes
            FROM bookings
            WHERE EXTRACT(YEAR FROM start_time) = $1
                AND status = 'completed'
        `, [targetYear]);

        const monthly = await allQuery(`
            SELECT 
                EXTRACT(MONTH FROM start_time) as month,
                COUNT(*) as bookings,
                SUM(total_amount) as revenue
            FROM bookings
            WHERE EXTRACT(YEAR FROM start_time) = $1
                AND status = 'completed'
            GROUP BY EXTRACT(MONTH FROM start_time)
            ORDER BY month
        `, [targetYear]);

        res.json({ summary: report, monthly });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get pending payments
// Bug Fix 5: Added customer, startDate, endDate filter support
app.get('/api/reports/pending-payments', async (req, res) => {
    try {
        const { customer, startDate, endDate } = req.query;

        let pendingQuery = `
            SELECT b.*, tt.type_name, tt.type_code
            FROM bookings b
            JOIN table_types tt ON b.table_type_id = tt.id
            WHERE b.payment_status IN ('pending', 'partial')
                AND b.status = 'completed'
        `;
        let summaryQuery = `
            SELECT 
                COUNT(*) as total_count,
                SUM(amount_pending) as total_pending
            FROM bookings b
            WHERE payment_status IN ('pending', 'partial')
                AND status = 'completed'
        `;
        const pendingParams = [];
        const summaryParams = [];
        let paramCount = 1;

        if (customer) {
            pendingQuery += ` AND LOWER(b.customer_name) LIKE LOWER($${paramCount})`;
            summaryQuery += ` AND LOWER(b.customer_name) LIKE LOWER($${paramCount})`;
            pendingParams.push(`%${customer}%`);
            summaryParams.push(`%${customer}%`);
            paramCount++;
        }
        if (startDate) {
            pendingQuery += ` AND DATE(b.start_time) >= DATE($${paramCount})`;
            summaryQuery += ` AND DATE(b.start_time) >= DATE($${paramCount})`;
            pendingParams.push(startDate);
            summaryParams.push(startDate);
            paramCount++;
        }
        if (endDate) {
            pendingQuery += ` AND DATE(b.start_time) <= DATE($${paramCount})`;
            summaryQuery += ` AND DATE(b.start_time) <= DATE($${paramCount})`;
            pendingParams.push(endDate);
            summaryParams.push(endDate);
            paramCount++;
        }

        pendingQuery += ' ORDER BY b.start_time DESC';

        const pending = await allQuery(pendingQuery, pendingParams);
        const summary = await getQuery(summaryQuery, summaryParams);

        res.json({ summary, bookings: pending });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============ BEVERAGE ROUTES (Bug Fix 2) ============

// Get all beverages
app.get('/api/beverages', async (req, res) => {
    try {
        const beverages = await allQuery('SELECT * FROM beverages ORDER BY name ASC');
        res.json(beverages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add new beverage
app.post('/api/beverages', async (req, res) => {
    try {
        const { name, price } = req.body;
        if (!name || price === undefined) {
            return res.status(400).json({ error: 'Name and price are required' });
        }
        const result = await pool.query(
            'INSERT INTO beverages (name, price) VALUES ($1, $2) RETURNING id',
            [name, parseFloat(price)]
        );
        const newBev = await getQuery('SELECT * FROM beverages WHERE id = $1', [result.rows[0].id]);
        res.json(newBev);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update beverage
app.put('/api/beverages/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price } = req.body;
        await pool.query(
            'UPDATE beverages SET name = $1, price = $2 WHERE id = $3',
            [name, parseFloat(price), id]
        );
        const updated = await getQuery('SELECT * FROM beverages WHERE id = $1', [id]);
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete beverage
app.delete('/api/beverages/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Check if beverage is used in any booking
        const usageCheck = await getQuery(
            'SELECT COUNT(*) as count FROM booking_beverages WHERE beverage_id = $1',
            [id]
        );
        if (parseInt(usageCheck.count) > 0) {
            return res.status(400).json({ error: 'Cannot delete beverage that has been ordered' });
        }
        await pool.query('DELETE FROM beverages WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============ TABLE-REVENUE & BEVERAGE-REVENUE REPORTS (Bug Fix 3) ============

// Reports - Table Revenue
app.get('/api/reports/table-revenue', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const params = [];
        let paramCount = 1;

        let dateFilter = '';
        if (startDate) {
            dateFilter += ` AND DATE(b.start_time) >= DATE($${paramCount})`;
            params.push(startDate);
            paramCount++;
        }
        if (endDate) {
            dateFilter += ` AND DATE(b.start_time) <= DATE($${paramCount})`;
            params.push(endDate);
            paramCount++;
        }

        const summary = await getQuery(`
            SELECT
                COUNT(*) as total_bookings,
                COALESCE(SUM(table_amount), 0) as total_revenue
            FROM bookings b
            WHERE b.status = 'completed'
            ${dateFilter}
        `, params);

        const byTableType = await allQuery(`
            SELECT
                tt.type_name,
                tt.type_code,
                COUNT(*) as bookings,
                COALESCE(SUM(b.table_amount), 0) as revenue,
                COALESCE(SUM(b.duration_minutes), 0) as minutes
            FROM bookings b
            JOIN table_types tt ON b.table_type_id = tt.id
            WHERE b.status = 'completed'
            ${dateFilter}
            GROUP BY tt.id, tt.type_name, tt.type_code
            ORDER BY revenue DESC
        `, params);

        res.json({ summary, byTableType });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Reports - Beverage Revenue
app.get('/api/reports/beverage-revenue', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const params = [];
        let paramCount = 1;

        let dateFilter = '';
        if (startDate) {
            dateFilter += ` AND DATE(b.start_time) >= DATE($${paramCount})`;
            params.push(startDate);
            paramCount++;
        }
        if (endDate) {
            dateFilter += ` AND DATE(b.start_time) <= DATE($${paramCount})`;
            params.push(endDate);
            paramCount++;
        }

        const summary = await getQuery(`
            SELECT
                COALESCE(SUM(bb.quantity * bev.price), 0) as total_beverage_revenue,
                COUNT(DISTINCT bb.id) as total_orders
            FROM booking_beverages bb
            JOIN beverages bev ON bb.beverage_id = bev.id
            JOIN bookings b ON bb.booking_id = b.id
            WHERE b.status = 'completed'
            ${dateFilter}
        `, params);

        const items = await allQuery(`
            SELECT
                bev.name,
                COALESCE(SUM(bb.quantity), 0) as total_quantity,
                COALESCE(SUM(bb.quantity * bev.price), 0) as total_revenue
            FROM booking_beverages bb
            JOIN beverages bev ON bb.beverage_id = bev.id
            JOIN bookings b ON bb.booking_id = b.id
            WHERE b.status = 'completed'
            ${dateFilter}
            GROUP BY bev.id, bev.name
            ORDER BY total_revenue DESC
        `, params);

        res.json({ summary, items });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============ AUTH ROUTES ============

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }
        const user = await getQuery(
            'SELECT * FROM users WHERE username = $1 AND is_active = true',
            [username]
        );
        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        const { password: _, ...safeUser } = user;
        res.json(safeUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/users
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

// POST /api/users
app.post('/api/users', async (req, res) => {
    try {
        const { username, password, full_name, role } = req.body;
        if (!username || !password || !role) {
            return res.status(400).json({ error: 'Username, password, and role are required' });
        }
        const result = await pool.query(
            'INSERT INTO users (username, password, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id',
            [username, password, full_name || '', role]
        );
        res.json({ id: result.rows[0].id, message: 'User created successfully' });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ error: 'Username already exists' });
        }
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/users/:id
app.put('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { password, full_name, role, is_active } = req.body;
        await pool.query(
            'UPDATE users SET password = COALESCE($1, password), full_name = COALESCE($2, full_name), role = COALESCE($3, role), is_active = COALESCE($4, is_active), updated_at = NOW() WHERE id = $5',
            [password || null, full_name || null, role || null, is_active ?? null, id]
        );
        res.json({ message: 'User updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/users/:id
app.delete('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Serve frontend
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n========================================`);
    console.log(`🎱 Billiards API Server (PostgreSQL)`);
    console.log(`========================================`);
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Database: PostgreSQL`);
    console.log(`========================================\n`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down gracefully...');
    await pool.end();
    process.exit(0);
});
