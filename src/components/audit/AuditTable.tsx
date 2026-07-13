import React from 'react';
import AuditRow, { AuditEntry } from './AuditRow';

interface AuditTableProps {
  entries: AuditEntry[];
  onRowClick?: (id: string) => void;
}

export function AuditTable({ entries, onRowClick }: AuditTableProps) {
  return (
    <div className="audit-table">
      <div className="audit-table-header">
        <div className="audit-cell audit-cell-time">Timestamp</div>
        <div className="audit-cell audit-cell-requester">Requester</div>
        <div className="audit-cell audit-cell-target">Target</div>
        <div className="audit-cell audit-cell-action">Action</div>
        <div className="audit-cell audit-cell-decision">Decision</div>
        <div className="audit-cell audit-cell-reason">Reason / Context</div>
      </div>
      <div className="audit-table-body">
        {entries.map((e) => (
          <AuditRow key={e.id} entry={e} onClick={onRowClick} />
        ))}
      </div>
    </div>
  );
}

export default AuditTable;
