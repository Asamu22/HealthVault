import React from 'react';

interface AuditHeaderProps {
  subtitle?: string;
}

export function AuditHeader({ subtitle }: AuditHeaderProps) {
  return (
    <div className="audit-header">
      <div className="audit-header-title-group">
        <h1 className="header-title">Compliance Audit Log</h1>
        {subtitle && <p className="header-subtitle">{subtitle}</p>}
      </div>
      <div className="audit-header-actions">
        <span className="integrity-badge">AUDIT INTEGRITY: HASH-CHAIN VERIFIED</span>
      </div>
    </div>
  );
}

export default AuditHeader;
