-- Enhanced Billiards Booking System Database Schema

-- Table Types Master
CREATE TABLE IF NOT EXISTS table_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type_code VARCHAR(10) NOT NULL UNIQUE,
    type_name VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL,
    price_per_hour DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default table types
INSERT OR IGNORE INTO table_types (type_code, type_name, quantity, price_per_hour) VALUES
('SS', 'Super Standard Table', 1, 220.00),
('S', 'Standard Table', 2, 200.00),
('M', 'Medium Table', 3, 160.00);

-- Beverages Master Table
CREATE TABLE IF NOT EXISTS beverages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default beverages
INSERT OR IGNORE INTO beverages (name, price) VALUES
('Tea', 20.00),
('Coffee', 30.00),
('Cold Drink', 40.00),
('Water Bottle', 20.00),
('Energy Drink', 60.00);

-- Bookings/Sessions Table (Enhanced)
CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_type_id INTEGER NOT NULL,
    table_number INTEGER NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration_minutes INTEGER,
    price_per_hour DECIMAL(10,2) NOT NULL,
    table_amount DECIMAL(10,2),
    beverage_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2),
    amount_paid DECIMAL(10,2) DEFAULT 0,
    amount_pending DECIMAL(10,2),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    FOREIGN KEY (table_type_id) REFERENCES table_types(id)
);

-- Booking Beverages Junction Table
CREATE TABLE IF NOT EXISTS booking_beverages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL,
    beverage_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price_at_time DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (beverage_id) REFERENCES beverages(id)
);

-- Payment History Table (Enhanced)
CREATE TABLE IF NOT EXISTS payment_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL,
    payment_amount DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(50),
    notes TEXT,
    recorded_by VARCHAR(50),
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- Audit Log Table
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name VARCHAR(50) NOT NULL,
    record_id INTEGER NOT NULL,
    action VARCHAR(20) NOT NULL,
    old_values TEXT,
    new_values TEXT,
    changed_by VARCHAR(50),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_name);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_method ON bookings(payment_method);
CREATE INDEX IF NOT EXISTS idx_payment_history_booking ON payment_history(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_beverages_booking ON booking_beverages(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_beverages_beverage ON booking_beverages(beverage_id);