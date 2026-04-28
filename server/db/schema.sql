-- ==============================================================================
-- BidMaster Production PostgreSQL Schema (Designed for Neon)
-- ==============================================================================
-- Enable the UUID extension (Neon supports this natively)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- ENUMS
-- ==============================================================================
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'unverified');
CREATE TYPE auction_status AS ENUM ('draft', 'active', 'ended', 'cancelled');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE notification_type AS ENUM ('outbid', 'won', 'payment_failed', 'system', 'auction_started');

-- ==============================================================================
-- TABLES
-- ==============================================================================

-- 1. USERS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role user_role DEFAULT 'user',
    status user_status DEFAULT 'unverified',
    avatar_url TEXT,
    stripe_customer_id VARCHAR(255), -- For payment pre-authorization
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. AUCTIONS
CREATE TABLE auctions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    
    -- Financials (using NUMERIC for precise currency representation)
    starting_price NUMERIC(12, 2) NOT NULL,
    current_highest_bid NUMERIC(12, 2) DEFAULT 0.00,
    min_increment NUMERIC(10, 2) NOT NULL,
    
    -- Timing
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    
    status auction_status DEFAULT 'draft',
    winner_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Null until auction ends
    
    -- Media
    image_url TEXT,
    
    -- Security
    requires_payment_verification BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint: End time must be after start time
    CONSTRAINT check_times CHECK (end_time > start_time)
);

-- 3. BIDS
CREATE TABLE bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    bidder_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TRANSACTIONS
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auction_id UUID NOT NULL REFERENCES auctions(id),
    buyer_id UUID NOT NULL REFERENCES users(id),
    seller_id UUID NOT NULL REFERENCES users(id),
    
    amount NUMERIC(12, 2) NOT NULL,
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    status transaction_status DEFAULT 'pending',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    reference_id UUID, -- Polymorphic reference (could be auction_id, transaction_id, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. WATCHLISTS (Join Table for Premium Feature)
CREATE TABLE watchlists (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, auction_id)
);

-- ==============================================================================
-- INDEXING FOR PERFORMANCE (Optimized for High Concurrency)
-- ==============================================================================

-- Bids table needs ultra-fast reads for "get highest bid" and websocket broadcasts
CREATE INDEX idx_bids_auction_id_amount_desc ON bids(auction_id, amount DESC);

-- Auctions table needs fast filtering by status and end_time (for the Redis worker)
CREATE INDEX idx_auctions_status_end_time ON auctions(status, end_time);
CREATE INDEX idx_auctions_category ON auctions(category);
CREATE INDEX idx_auctions_seller_id ON auctions(seller_id);

-- Notifications need fast filtering by user and read status
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);

-- ==============================================================================
-- TRIGGERS
-- ==============================================================================
-- Trigger to auto-update 'updated_at' columns on row modifications
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_auctions_modtime BEFORE UPDATE ON auctions FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_transactions_modtime BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_modified_column();
