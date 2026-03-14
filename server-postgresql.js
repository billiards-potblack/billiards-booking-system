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
        const { status, startDate, endDate, paymentStatus } = req.query;
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
app.put('/api/bookings/:id/end', async (req, res) => {
    try {
        const { id } = req.params;
        const { amount_paid, payment_method, notes, created_by } = req.body;

        const booking = await getQuery('SELECT * FROM bookings WHERE id = $1', [id]);
        
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // Calculate duration and total
        const endTime = new Date();
        const startTime = new Date(booking.start_time);
        const durationMinutes = Math.round((endTime - startTime) / 60000);
        const durationHours = durationMinutes / 60;
        const totalAmount = (durationHours * booking.price_per_hour).toFixed(2);
        const paidAmount = parseFloat(amount_paid || 0);
        const pendingAmount = (totalAmount - paidAmount).toFixed(2);
        const paymentStatus = paidAmount >= totalAmount ? 'paid' : (paidAmount > 0 ? 'partial' : 'pending');

        await pool.query(`
            UPDATE bookings 
            SET end_time = CURRENT_TIMESTAMP,
                duration_minutes = $1,
                total_amount = $2,
                amount_paid = $3,
                amount_pending = $4,
                status = 'completed',
                payment_status = $5,
                notes = $6
            WHERE id = $7
        `, [durationMinutes, totalAmount, paidAmount, pendingAmount, paymentStatus, notes, id]);

        // Record payment if any
        if (paidAmount > 0) {
            await pool.query(`
                INSERT INTO payment_history (booking_id, payment_amount, payment_method, notes, recorded_by)
                VALUES ($1, $2, $3, $4, $5)
            `, [id, paidAmount, payment_method, notes, created_by]);
        }

        const updatedBooking = await getQuery('SELECT * FROM bookings WHERE id = $1', [id]);
        res.json(updatedBooking);
    } catch (err) {
        res.status(500).json({ error: err.message });
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
app.get('/api/reports/pending-payments', async (req, res) => {
    try {
        const pending = await allQuery(`
            SELECT b.*, tt.type_name, tt.type_code
            FROM bookings b
            JOIN table_types tt ON b.table_type_id = tt.id
            WHERE b.payment_status IN ('pending', 'partial')
                AND b.status = 'completed'
            ORDER BY b.start_time DESC
        `);

        const summary = await getQuery(`
            SELECT 
                COUNT(*) as total_count,
                SUM(amount_pending) as total_pending
            FROM bookings
            WHERE payment_status IN ('pending', 'partial')
                AND status = 'completed'
        `);

        res.json({ summary, bookings: pending });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
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
