import React from 'react';
import AuditHeader from './AuditHeader';
import FiltersBar from './FiltersBar';
import AuditTable from './AuditTable';
import type { AuditEntry } from './AuditRow';

interface AuditScreenProps {
  onRowClick?: (id: string) => void;
}

const MOCK_ENTRIES: AuditEntry[] = [
  {
    id: '1',
    timestampUtc: '2026-07-10 09:12:04 UTC',
    requester: { name: 'Dr. A. Chen', role: 'physician' },
    target: { id: 'rec-1001', label: 'Patient Record #1001' },
    action: 'Access',
    decision: 'PERMIT',
    reason: 'Routine checkup',
  },
  {
    id: '2',
    timestampUtc: '2026-07-10 09:18:21 UTC',
    requester: { name: 'M. Roberts RN', role: 'Nurse' },
    target: { id: 'rec-1002', label: 'Patient Record #1002' },
    action: 'Update',
    decision: 'DENY',
    reason: 'Scope mismatch',
  },
  {
    id: '3',
    timestampUtc: '2026-07-10 09:25:10 UTC',
    requester: { name: 'System Process', role: 'System' },
    target: { id: 'rec-1003', label: 'Patient Record #1003' },
    action: 'Sync',
    decision: 'PERMIT',
    reason: 'Background sync',
  },
  {
    id: '4',
    timestampUtc: '2026-07-10 09:31:02 UTC',
    requester: { name: 'Unknown IP', role: '' },
    target: { id: 'rec-1004', label: 'Patient Record #1004' },
    action: 'Access',
    decision: 'DENY',
    reason: 'Unrecognized network',
  },
];

export function AuditScreen({ onRowClick }: AuditScreenProps) {
  return (
    <div className="audit-screen dashboard-main">
      <AuditHeader subtitle="Recent access and policy decisions" />
      <FiltersBar onFilter={() => {}} />
      <div className="audit-table-wrap">
        <AuditTable entries={MOCK_ENTRIES} onRowClick={onRowClick} />
      </div>
      <div className="pagination-footer">
        <div className="pagination-info">Showing 1–4 of 4</div>
        <div className="pagination-controls">
          <button className="btn-compact">Prev</button>
          <button className="btn-compact">Next</button>
        </div>
      </div>
    </div>
  );
}

export default AuditScreen;
