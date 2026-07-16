// Canonical resource-sensitivity taxonomy for HealthVault.
//
// This is shared by record ingestion (DashboardScreen) and ABAC policy
// definition/evaluation (PoliciesScreen, AccessControlScreen) so the values
// a record can be tagged with are always the same set ABAC policies can
// actually match against. These two things drifted out of sync once before
// (ingestion used Normal/Restricted/Highly Restricted while policies used
// this set) — if you need to change these values, update it here only, and
// make sure both ingestion and policy UIs still make sense with the change.
export const SENSITIVITY_OPTIONS: string[] = ['Critical (PHI)', 'Confidential', 'Restricted', 'Public'];

// Default sensitivity for newly ingested records. Deliberately not
// 'Critical (PHI)' — that tier should be reserved for records someone
// actively flags as most sensitive, not the default noise value.
export const DEFAULT_INGESTION_SENSITIVITY = 'Confidential';
