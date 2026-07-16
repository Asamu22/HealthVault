-- Migrate patient_records.sensitivity from the old ingestion-only taxonomy
-- (Normal / Restricted / Highly Restricted) to the canonical ABAC taxonomy
-- also used by access_policies.resource_sensitivity
-- (Critical (PHI) / Confidential / Restricted / Public).
--
-- Mapping (confirmed against this data before running):
--   Normal            -> Confidential
--   Restricted         -> Restricted
--   Highly Restricted -> Critical (PHI)
--
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor), AFTER
-- deploying the frontend/backend changes that write the new taxonomy, so no
-- new rows land with the old values while this runs.

BEGIN;

UPDATE patient_records
SET sensitivity = 'Confidential'
WHERE sensitivity = 'Normal';

UPDATE patient_records
SET sensitivity = 'Critical (PHI)'
WHERE sensitivity = 'Highly Restricted';

-- 'Restricted' already matches the canonical taxonomy's spelling, but note
-- it likely meant something different under the old ingestion-only scheme
-- than it does now that it lines up with ABAC's 'Restricted' tier — no data
-- change needed, just flagging the semantic shift.

-- Bring the table's default in line with the new taxonomy's ingestion
-- default (see src/lib/constants.ts DEFAULT_INGESTION_SENSITIVITY) so any
-- future direct inserts that omit sensitivity don't fall back to a value
-- that no longer exists in the taxonomy.
ALTER TABLE patient_records
  ALTER COLUMN sensitivity SET DEFAULT 'Confidential';

COMMIT;

-- Verify no rows were left on old values:
-- SELECT sensitivity, count(*) FROM patient_records GROUP BY sensitivity;
-- Expected sensitivity values after this migration: 'Critical (PHI)',
-- 'Confidential', 'Restricted', 'Public'.
