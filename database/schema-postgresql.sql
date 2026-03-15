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

-- ============================================================
-- Beverages Master Table (Bug Fix 2: was missing entirely)
-- ============================================================
CREATE TABLE IF NOT EXISTS beverages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed a few default beverages so the dropdown isn't empty on first run
INSERT INTO beverages (name, price) VALUES
    ('Water', 20.00),
    ('Soft Drink', 40.00),
    ('Tea', 30.00),
    ('Coffee', 50.00)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Booking Beverages (line items per booking)
-- (Bug Fix 2 & 3: was missing entirely)
-- ============================================================
CREATE TABLE IF NOT EXISTS booking_beverages (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    beverage_id INTEGER NOT NULL REFERENCES beverages(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Extra columns on bookings needed by the UI
-- (Bug Fix 3 & 4: table_amount, beverage_amount, payment_method
--  were referenced by queries but never created)
-- ============================================================
ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS table_amount   DECIMAL(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS beverage_amount DECIMAL(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS payment_method  VARCHAR(50);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_method ON bookings(payment_method);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_name);
CREATE INDEX IF NOT EXISTS idx_payment_history_booking ON payment_history(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_beverages_booking ON booking_beverages(booking_id);

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
