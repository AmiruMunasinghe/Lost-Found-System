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

-- New Admin & Operations API Enums
CREATE TYPE claim_status_enum AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'AWAITING_PICKUP', 'HANDED_OVER', 'CLOSED');
CREATE TYPE evidence_status_enum AS ENUM ('REQUESTED', 'PROVIDED', 'PENDING');
CREATE TYPE audit_action_enum AS ENUM ('APPROVE_CLAIM', 'REJECT_CLAIM', 'REQUEST_EVIDENCE', 'SCHEDULE_PICKUP', 'CONFIRM_HANDOVER', 'CLOSE_CLAIM');

-- Claims table (user requests to claim matched found items)
CREATE TABLE IF NOT EXISTS claims (
    id BIGSERIAL PRIMARY KEY,
    item_match_id BIGINT NOT NULL UNIQUE,
    claimant_id BIGINT NOT NULL,
    status claim_status_enum DEFAULT 'PENDING' NOT NULL,
    evidence TEXT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_claims_item_match FOREIGN KEY (item_match_id) REFERENCES item_matches(id) ON DELETE CASCADE,
    CONSTRAINT fk_claims_claimant FOREIGN KEY (claimant_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_claimant_id ON claims(claimant_id);
CREATE INDEX IF NOT EXISTS idx_claims_requested_at ON claims(requested_at);
CREATE INDEX IF NOT EXISTS idx_claims_status_and_created_at ON claims(status, requested_at);

-- Evidence Requests table (admin requests evidence from claimants)
CREATE TABLE IF NOT EXISTS evidence_requests (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT NOT NULL,
    message TEXT NOT NULL,
    status evidence_status_enum DEFAULT 'PENDING' NOT NULL,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    responded_at TIMESTAMP,
    response_message TEXT,
    CONSTRAINT fk_evidence_requests_claim FOREIGN KEY (claim_id) REFERENCES claims(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_evidence_requests_claim_id ON evidence_requests(claim_id);
CREATE INDEX IF NOT EXISTS idx_evidence_requests_status ON evidence_requests(status);

-- Pickup Schedules table (admins schedule pickups for claimed items)
CREATE TABLE IF NOT EXISTS pickup_schedules (
    id BIGSERIAL PRIMARY KEY,
    claim_id BIGINT NOT NULL UNIQUE,
    scheduled_at TIMESTAMP NOT NULL,
    location VARCHAR(255) NOT NULL,
    handover_confirmed_at TIMESTAMP,
    handover_confirmed_by BIGINT,
    CONSTRAINT fk_pickup_schedules_claim FOREIGN KEY (claim_id) REFERENCES claims(id) ON DELETE CASCADE,
    CONSTRAINT fk_pickup_schedules_admin FOREIGN KEY (handover_confirmed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_pickup_schedules_claim_id ON pickup_schedules(claim_id);
CREATE INDEX IF NOT EXISTS idx_pickup_schedules_scheduled_at ON pickup_schedules(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_pickup_schedules_scheduled_at_range ON pickup_schedules(scheduled_at);

-- Audit Logs table (track all admin actions)
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    admin_id BIGINT,
    action audit_action_enum NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id BIGINT NOT NULL,
    outcome VARCHAR(50) NOT NULL,
    notes TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_audit_logs_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_and_timestamp ON audit_logs(admin_id, timestamp);
