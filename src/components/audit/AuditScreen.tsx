import React, { useEffect, useState } from 'react';
import AuditHeader from './AuditHeader';
import FiltersBar from './FiltersBar';
import AuditTable from './AuditTable';
import type { AuditEntry } from './AuditRow';
import { fetchAuditLogs, type AuditLogItem } from '../../lib/supabase';

interface AuditScreenProps {
  onRowClick?: (id: string) => void;
}

const mapAuditLogToEntry = (log: AuditLogItem): AuditEntry => {
  let action = log.event_type;
  let decision = 'PERMIT';
  let reason = '';
  let targetLabel = 'System / Policy';
  let requesterName = log.subject;

  if (log.event_type === 'access_allowed') {
    action = log.detail?.action || 'Access';
    decision = 'PERMIT';
    reason = log.detail?.policy ? `Matched: ${log.detail.policy}` : 'Allowed';
    targetLabel = 'Resource Evaluation';
  } else if (log.event_type === 'access_denied') {
    action = log.detail?.action || 'Access';
    decision = 'DENY';
    reason = log.detail?.policy ? `Denied by: ${log.detail.policy}` : log.detail?.reason || 'Denied';
    targetLabel = 'Resource Evaluation';
  } else if (log.event_type.startsWith('policy_')) {
    action = log.event_type.replace('policy_', '').toUpperCase();
    reason = log.detail?.effect ? `Effect: ${log.detail.effect}` : (log.detail?.dry_run ? 'Dry-run' : '');
    targetLabel = `Policy: ${log.subject}`;
    requesterName = 'System Admin'; // For policy changes, the subject is the policy name or ID in our backend
  }

  return {
    id: log.id,
    timestampUtc: new Date(log.created_at).toLocaleString(),
    requester: { name: requesterName, role: log.event_type.startsWith('policy_') ? 'Admin' : log.subject },
    target: { id: '', label: targetLabel },
    action,
    decision,
    reason,
  };
};

export function AuditScreen({ onRowClick }: AuditScreenProps) {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs().then((logs) => {
      setEntries(logs.map(mapAuditLogToEntry));
      setLoading(false);
    });
  }, []);

  return (
    <div className="audit-screen dashboard-main">
      <AuditHeader subtitle="Recent access and policy decisions" />
      <FiltersBar onFilter={() => {}} />
      <div className="audit-table-wrap">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#737685' }}>Loading audit logs...</div>
        ) : entries.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#737685' }}>No audit logs found.</div>
        ) : (
          <AuditTable entries={entries} onRowClick={onRowClick} />
        )}
      </div>
      {!loading && entries.length > 0 && (
        <div className="pagination-footer">
          <div className="pagination-info">Showing 1–{entries.length} of {entries.length}</div>
          <div className="pagination-controls">
            <button className="btn-compact">Prev</button>
            <button className="btn-compact">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuditScreen;

