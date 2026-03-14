-- Billiards Booking System Database Schema (PostgreSQL Version)

-- Table Types Master
CREATE TABLE IF NOT EXISTS table_types (
    id SERIAL PRIMARY KEY,
    type_code VARCHAR(10) NOT NULL UNIQUE,
    type_name VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL,
    price_per_hour DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default table types
INSERT INTO table_types (type_code, type_name, quantity, price_per_hour) 
VALUES
    ('SS', 'Super Standard Table', 1, 220.00),
    ('S', 'Standard Table', 2, 200.00),
    ('M', 'Medium Table', 3, 160.00)
ON CONFLICT (type_code) DO NOTHING;

-- Bookings/Sessions Table
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    table_type_id INTEGER NOT NULL,
    table_number INTEGER NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration_minutes INTEGER,
    price_per_hour DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2),
    amount_paid DECIMAL(10,2) DEFAULT 0,
    amount_pending DECIMAL(10,2),
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, completed, cancelled
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, partial, paid
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    FOREIGN KEY (table_type_id) REFERENCES table_types(id)
);

-- Payment History Table (for audit)
CREATE TABLE IF NOT EXISTS payment_history (
    id SERIAL PRIMARY KEY,
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
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id INTEGER NOT NULL,
    action VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
    old_values TEXT,
    new_values TEXT,
    changed_by VARCHAR(50),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_payment_history_booking ON payment_history(booking_id);

-- Auto-update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at 
    BEFORE UPDATE ON bookings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
