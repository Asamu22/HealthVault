import React from 'react';
import { ActionBadge } from '../ui/ActionBadge';
import { DecisionPill } from '../ui/DecisionPill';

export interface AuditEntry {
  id: string;
  timestampUtc: string;
  requester: { name: string; role?: string };
  target: { id: string; label: string };
  action: string;
  decision: 'PERMIT' | 'DENY' | string;
  reason?: string;
}

interface AuditRowProps {
  entry: AuditEntry;
  onClick?: (recordId: string) => void;
}

export function AuditRow({ entry, onClick }: AuditRowProps) {
  return (
    <div className={`audit-row ${entry.decision === 'DENY' ? 'audit-row-deny' : ''}`} onClick={() => onClick?.(entry.target.id)}>
      <div className="audit-cell audit-cell-time">{entry.timestampUtc}</div>
      <div className="audit-cell audit-cell-requester">
        <div className="requester-name">{entry.requester.name}</div>
        {entry.requester.role && <div className="requester-role">{entry.requester.role}</div>}
      </div>
      <div className="audit-cell audit-cell-target">{entry.target.label}</div>
      <div className="audit-cell audit-cell-action"><ActionBadge label={entry.action} /></div>
      <div className="audit-cell audit-cell-decision"><DecisionPill decision={entry.decision} /></div>
      <div className="audit-cell audit-cell-reason">{entry.reason}</div>
    </div>
  );
}

export default AuditRow;
