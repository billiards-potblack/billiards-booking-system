const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'billiards.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Create table_types table
    db.run(`CREATE TABLE IF NOT EXISTS table_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type_code VARCHAR(10) UNIQUE NOT NULL,
        type_name VARCHAR(50) NOT NULL,
        quantity INTEGER NOT NULL,
        price_per_hour DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Insert default table types
    db.run(`INSERT OR IGNORE INTO table_types (type_code, type_name, quantity, price_per_hour) VALUES
        ('PB', 'Pool Black', 4, 100),
        ('SN', 'Snooker', 2, 150)`);

    // Create bookings table with ALL columns
    db.run(`CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_type_id INTEGER NOT NULL,
        table_number INTEGER NOT NULL,
        customer_name VARCHAR(100),
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP,
        duration_minutes INTEGER,
        price_per_hour DECIMAL(10,2) NOT NULL,
        table_amount DECIMAL(10,2),
        beverage_amount DECIMAL(10,2) DEFAULT 0,
        total_amount DECIMAL(10,2),
        amount_paid DECIMAL(10,2) DEFAULT 0,
        amount_pending DECIMAL(10,2) DEFAULT 0,
        status VARCHAR(20) DEFAULT 'active',
        payment_status VARCHAR(20) DEFAULT 'pending',
        payment_method VARCHAR(50),
        notes TEXT,
        created_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (table_type_id) REFERENCES table_types(id)
    )`);

    // Create beverages table
    db.run(`CREATE TABLE IF NOT EXISTS beverages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Insert default beverages
    db.run(`INSERT OR IGNORE INTO beverages (id, name, price) VALUES
        (1, 'Tea', 20.00),
        (2, 'Coffee', 30.00),
        (3, 'Cold Drink', 40.00),
        (4, 'Water Bottle', 20.00),
        (5, 'Energy Drink', 60.00)`);

    // Create booking_beverages table
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

    // Create payment_history table
    db.run(`CREATE TABLE IF NOT EXISTS payment_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id INTEGER NOT NULL,
        payment_amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50),
        notes TEXT,
        recorded_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id)
    )`);

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
    )`);

    // Insert default users
    db.run(`INSERT OR IGNORE INTO users (username, password, full_name, role) VALUES
        ('admin', 'admin123', 'Administrator', 'admin'),
        ('user', 'user123', 'Regular User', 'user')`);

    // Create indexes
    db.run('CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_name)');
    db.run('CREATE INDEX IF NOT EXISTS idx_bookings_payment_method ON bookings(payment_method)');
    db.run('CREATE INDEX IF NOT EXISTS idx_booking_beverages_booking ON booking_beverages(booking_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)');
    db.run('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)', (err) => {
        // This is the LAST query, so close the database here
        if (err) {
            console.error('Error creating index:', err);
        }
        console.log('✅ Database initialized successfully!');
        console.log('All tables created with proper schema.');
        console.log('Default users created: admin/admin123 and user/user123');
        
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err);
            } else {
                console.log('Database connection closed. You can now run: node server.js');
            }
        });
    });
});