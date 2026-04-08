-- Add version field for optimistic locking to prevent race conditions in delivery redistribution
-- This migration adds a version column that is incremented on each update

ALTER TABLE movimientos_vacunas ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1 NOT NULL;

-- Create index for faster version checks
CREATE INDEX IF NOT EXISTS idx_movimientos_vacunas_version ON movimientos_vacunas(id, version);

COMMENT ON COLUMN movimientos_vacunas.version IS 'Optimistic locking version - incremented on each update to detect concurrent modifications';
