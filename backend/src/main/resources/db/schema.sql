-- Lost and Found Management System Database Schema (PostgreSQL)

-- Create ENUMS
CREATE TYPE report_type_enum AS ENUM ('LOST', 'FOUND');
CREATE TYPE item_status_enum AS ENUM ('OPEN', 'MATCHED', 'CLAIMED', 'PENDING_REVIEW', 'AWAITING_PICKUP', 'SCHEDULED_FOR_AUCTION', 'SCHEDULED_FOR_DONATION', 'CLOSED');
CREATE TYPE match_status_enum AS ENUM ('SUGGESTED', 'ACCEPTED', 'REJECTED', 'PENDING_REVIEW');

-- Items table (main report data)
CREATE TABLE IF NOT EXISTS items (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    location VARCHAR(255),
    report_type report_type_enum NOT NULL,
    status item_status_enum DEFAULT 'OPEN' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_items_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_items_report_type ON items(report_type);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at);

-- Item Images table (one-to-many relationship with items)
CREATE TABLE IF NOT EXISTS item_images (
    id BIGSERIAL PRIMARY KEY,
    item_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_item_images_item FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_item_images_item_id ON item_images(item_id);

-- Item Matches table (links lost and found items)
CREATE TABLE IF NOT EXISTS item_matches (
    id BIGSERIAL PRIMARY KEY,
    lost_item_id BIGINT NOT NULL,
    found_item_id BIGINT NOT NULL,
    confidence_score DECIMAL(3,2) DEFAULT 0.0 NOT NULL,
    status match_status_enum DEFAULT 'SUGGESTED' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_item_matches_lost_item FOREIGN KEY (lost_item_id) REFERENCES items(id) ON DELETE CASCADE,
    CONSTRAINT fk_item_matches_found_item FOREIGN KEY (found_item_id) REFERENCES items(id) ON DELETE CASCADE,
    CONSTRAINT chk_different_items CHECK (lost_item_id != found_item_id),
    CONSTRAINT uk_item_match UNIQUE (lost_item_id, found_item_id)
);

CREATE INDEX IF NOT EXISTS idx_item_matches_status ON item_matches(status);
CREATE INDEX IF NOT EXISTS idx_item_matches_confidence_score ON item_matches(confidence_score);
CREATE INDEX IF NOT EXISTS idx_item_matches_created_at ON item_matches(created_at);
