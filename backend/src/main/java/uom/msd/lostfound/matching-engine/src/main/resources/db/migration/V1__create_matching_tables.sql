-- V1__create_matching_tables.sql
-- Matching Engine schema (Team 3)
-- Flyway migration – run once on first deployment

-- ─── match ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS match (
    match_id             UUID         NOT NULL DEFAULT gen_random_uuid(),
    lost_item_id         UUID         NOT NULL,
    found_item_id        UUID         NOT NULL,
    confidence_score     SMALLINT     NOT NULL CHECK (confidence_score BETWEEN 0 AND 100),
    status               VARCHAR(20)  NOT NULL DEFAULT 'PENDING'
                         CHECK (status IN ('PENDING','CONFIRMED','REJECTED')),
    confirmed_by_user_id UUID,
    confirm_at           TIMESTAMPTZ,
    created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_match PRIMARY KEY (match_id),
    CONSTRAINT uq_match_lost_found UNIQUE (lost_item_id, found_item_id)
);

CREATE INDEX IF NOT EXISTS idx_match_lost_item   ON match (lost_item_id);
CREATE INDEX IF NOT EXISTS idx_match_found_item  ON match (found_item_id);
CREATE INDEX IF NOT EXISTS idx_match_score       ON match (confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_match_status      ON match (status);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_match_updated_at ON match;
CREATE TRIGGER trg_match_updated_at
    BEFORE UPDATE ON match
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── manual_review_queue ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS manual_review_queue (
    review_id              UUID         NOT NULL DEFAULT gen_random_uuid(),
    match_id               UUID         NOT NULL UNIQUE REFERENCES match(match_id) ON DELETE CASCADE,
    confidence_score       NUMERIC(5,2) NOT NULL,
    score_breakdown        JSONB,
    status                 VARCHAR(20)  NOT NULL DEFAULT 'PENDING'
                           CHECK (status IN ('PENDING','APPROVED','REJECTED')),
    queued_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    resolved_at            TIMESTAMPTZ,
    resolved_by_admin_id   UUID,
    resolution_note        TEXT,

    CONSTRAINT pk_manual_review_queue PRIMARY KEY (review_id)
);

CREATE INDEX IF NOT EXISTS idx_mrq_status    ON manual_review_queue (status);
CREATE INDEX IF NOT EXISTS idx_mrq_queued_at ON manual_review_queue (queued_at);

-- GIN index for fast JSONB queries on score_breakdown
CREATE INDEX IF NOT EXISTS idx_mrq_breakdown_gin ON manual_review_queue USING GIN (score_breakdown);
