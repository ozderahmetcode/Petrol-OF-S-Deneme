-- Core Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE payment_method AS ENUM ('CASH', 'CREDIT_CARD', 'LOGISTICS', 'COMPLIMENTARY');
CREATE TYPE product_type AS ENUM ('FUEL', 'MARKET_GOODS', 'SERVICE');
CREATE TYPE task_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- 1. Branches & Users
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(100),
    role_id INTEGER REFERENCES roles(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Products & Inventory
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id INTEGER REFERENCES categories(id),
    sku VARCHAR(50) UNIQUE,
    barcode VARCHAR(100) UNIQUE,
    name VARCHAR(255) NOT NULL,
    type product_type DEFAULT 'MARKET_GOODS',
    unit VARCHAR(20) DEFAULT 'piece',
    base_price DECIMAL(12, 2) NOT NULL,
    tax_rate DECIMAL(5, 2) DEFAULT 20.00,
    min_stock_level INTEGER DEFAULT 5,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    batch_number VARCHAR(100),
    quantity DECIMAL(12, 3) NOT NULL,
    purchase_price DECIMAL(12, 2),
    expiry_date DATE,
    received_at TIMESTAMP DEFAULT NOW()
);

-- 3. Sales & POS
CREATE TABLE shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    branch_id UUID REFERENCES branches(id),
    start_time TIMESTAMP DEFAULT NOW(),
    end_time TIMESTAMP,
    initial_cash DECIMAL(12, 2) DEFAULT 0,
    expected_amount DECIMAL(12, 2) DEFAULT 0,
    actual_amount DECIMAL(12, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'OPEN'
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shift_id UUID REFERENCES shifts(id),
    branch_id UUID REFERENCES branches(id),
    total_gross DECIMAL(12, 2) NOT NULL,
    discount_amount DECIMAL(12, 2) DEFAULT 0,
    total_net DECIMAL(12, 2) NOT NULL,
    is_voided BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    product_id UUID REFERENCES products(id),
    quantity DECIMAL(12, 3) NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    pump_id VARCHAR(50),
    nozzle_id VARCHAR(50)
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    type payment_method NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    fee_amount DECIMAL(12, 2) DEFAULT 0,
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Operations (Tasks)
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES branches(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    schedule_cron VARCHAR(100),
    assigned_role_id INTEGER REFERENCES roles(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE task_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id),
    user_id UUID REFERENCES users(id),
    status task_status DEFAULT 'PENDING',
    proof_image_url TEXT,
    notes TEXT,
    completed_at TIMESTAMP
);

-- 5. Notifications (SKT Alerts)
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50),
    message TEXT,
    target_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 6. Initial Data (Seeds)
INSERT INTO roles (name) VALUES ('ADMIN'), ('CASHIER'), ('OPERATOR');
