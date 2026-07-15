import { createClient } from '@supabase/supabase-js';
import type { PatientRecordItem, StaffMember } from '../types';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
const recordsBucket = (import.meta.env.VITE_SUPABASE_RECORDS_BUCKET || 'patient-record').trim();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project-ref') && !supabaseAnonKey.includes('your-anon-key'));

interface SupabasePatientRecord {
  id: string;
  patient_name: string;
  patient_initials: string;
  sensitivity: string;
  status: string;
  encryption: string;
  department: string;
  date: string;
  author: string;
  file_path: string;
  file_name: string;
  created_at: string;
}

function mapRecord(row: SupabasePatientRecord): PatientRecordItem {
  return {
    id: row.id,
    patient: {
      initials: row.patient_initials,
      name: row.patient_name,
    },
    sensitivity: row.sensitivity,
    status: row.status,
    encryption: row.encryption,
    department: row.department,
    date: row.date,
    author: row.author,
    filePath: row.file_path,
    fileName: row.file_name,
    createdAt: row.created_at,
  };
}

export async function fetchPatientRecords(): Promise<PatientRecordItem[]> {
  try {
    const response = await fetch('/api/records/list');
    if (!response.ok) {
      console.warn('Failed to fetch patient records from backend:', response.status);
      return [];
    }
    const payload = await response.json();
    const rows = (payload.records as SupabasePatientRecord[]) ?? [];
    return rows.map(mapRecord);
  } catch (err) {
    console.warn('Unable to load patient records:', err);
    return [];
  }
}

export async function insertPatientRecordMetadata(record: PatientRecordItem): Promise<PatientRecordItem> {
  try {
    const { data, error } = await supabase
      .from('patient_records')
      .insert({
        id: record.id,
        patient_name: record.patient.name,
        patient_initials: record.patient.initials,
        sensitivity: record.sensitivity,
        status: record.status,
        encryption: record.encryption,
        department: record.department,
        date: record.date,
        author: record.author,
        file_path: record.filePath,
        file_name: record.fileName,
      })
      .select('*')
      .single();

    if (error || !data) {
      console.warn('Patient record metadata insert failed, falling back to local record state:', error?.message);
      return record;
    }

    return mapRecord(data as SupabasePatientRecord);
  } catch (error) {
    console.warn('Patient record metadata insert unavailable:', error);
    return record;
  }
}

export async function uploadPatientPdf(file: File, record: PatientRecordItem): Promise<PatientRecordItem> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('patient_name', record.patient.name);
  formData.append('patient_initials', record.patient.initials);
  formData.append('sensitivity', record.sensitivity);
  formData.append('department', record.department);
  formData.append('author', record.author);
  formData.append('record_id', record.id);

  const response = await fetch('/api/records/upload', {
    method: 'POST',
    body: formData,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.detail || 'Unable to upload PDF.');
  }

  // Backend returns flat DB fields (patient_name, patient_initials, …).
  // Map them to the nested PatientRecordItem shape the UI expects.
  return mapRecord(payload.record as SupabasePatientRecord);
}

export function getRecordPdfUrl(filePath: string): string {
  // Backend proxy serves the PDF with Content-Disposition: inline
  return `/api/records/pdf-proxy?file_path=${encodeURIComponent(filePath)}`;
}

// ─── Staff Members ───────────────────────────────────────────────────────────

interface SupabaseStaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  status: 'Active' | 'Pending';
  last_active?: string;
  is_admin?: boolean;
}

function mapStaff(row: SupabaseStaffMember): StaffMember {
  const parts = row.name.trim().split(' ');
  const initials = parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
  return {
    id: row.id,
    initials,
    name: row.name,
    email: row.email,
    role: row.role,
    department: row.department,
    status: row.status,
    lastActive: row.last_active ?? 'Never',
    isAdmin: row.is_admin ?? false,
  };
}

export async function fetchStaffMembers(): Promise<StaffMember[]> {
  try {
    const response = await fetch('/api/users/list');
    if (!response.ok) {
      console.warn('Failed to fetch staff members from backend:', response.status);
      return [];
    }
    const payload = await response.json();
    const rows = (payload.staff_members as SupabaseStaffMember[]) ?? [];
    return rows.map(mapStaff);
  } catch (err) {
    console.warn('fetchStaffMembers error:', err);
    return [];
  }
}

export interface CreateStaffPayload {
  fullName: string;
  email: string;
  password: string;
  role: string;
  department: string;
  isAdmin: boolean;
}

export async function createStaffMember(payload: CreateStaffPayload): Promise<StaffMember> {
  const response = await fetch('/api/users/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.detail || 'Failed to create user.');
  }

  return mapStaff(data.staff_member as SupabaseStaffMember);
}

// ─── ABAC Access Policies ─────────────────────────────────────────────────────

export interface PolicyCondition {
  field: string;
  value: string;
}

export interface AccessPolicy {
  id: string;
  name: string;
  department: string;
  subject_role: string;
  action: string;
  resource_sensitivity: string;
  environment: string;
  extra_conditions: PolicyCondition[];
  effect: 'allow' | 'deny';
  is_dry_run: boolean;
  created_at: string;
}

export interface EvaluateResult {
  decision: 'allow' | 'deny';
  matched_policy: string | null;
  reason: string;
}

export async function fetchPolicies(): Promise<AccessPolicy[]> {
  try {
    const res = await fetch('/api/access/policies');
    if (!res.ok) return [];
    const data = await res.json();
    return (data.policies as AccessPolicy[]) ?? [];
  } catch {
    return [];
  }
}

export async function savePolicy(
  policy: Omit<AccessPolicy, 'id' | 'created_at'>,
): Promise<AccessPolicy> {
  const res = await fetch('/api/access/policies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(policy),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail || 'Failed to save policy.');
  return data.policy as AccessPolicy;
}

export async function deletePolicy(id: string): Promise<void> {
  const res = await fetch(`/api/access/policies/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.detail || 'Failed to delete policy.');
  }
}

export async function updatePolicy(
  id: string,
  policy: Omit<AccessPolicy, 'id' | 'created_at'>,
): Promise<AccessPolicy> {
  const res = await fetch(`/api/access/policies/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(policy),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail || 'Failed to update policy.');
  return data.policy as AccessPolicy;
}


export async function evaluateAccess(request: {
  subject_role: string;
  action: string;
  resource_sensitivity: string;
  department: string;
  environment: string;
}): Promise<EvaluateResult> {
  const res = await fetch('/api/access/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail || 'Evaluation failed.');
  return data as EvaluateResult;
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────

export interface AuditLogItem {
  id: string;
  event_type: string;
  subject: string;
  detail: any;
  created_at: string;
}

export async function fetchAuditLogs(): Promise<AuditLogItem[]> {
  try {
    const res = await fetch('/api/audit');
    if (!res.ok) return [];
    const data = await res.json();
    return (data.audit_logs as AuditLogItem[]) ?? [];
  } catch {
    return [];
  }
}


