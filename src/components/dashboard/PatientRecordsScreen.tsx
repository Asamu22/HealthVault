import { useMemo, useState } from 'react';
import type { PatientRecordItem } from '../../types';

interface PatientRecordsScreenProps {
  records: PatientRecordItem[];
  onRecordClick: (recordId: string) => void;
}

export function PatientRecordsScreen({ records, onRecordClick }: PatientRecordsScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const rows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return records;
    return records.filter((record) =>
      [record.id, record.department ?? '', record.author ?? '', record.sensitivity, record.status].join(' ').toLowerCase().includes(q),
    );
  }, [records, searchQuery]);

  function badgeStyle(s: string) {
    if (s.toLowerCase().includes('restrict') || s.toLowerCase().includes('critical'))
      return { backgroundColor: 'rgba(186, 26, 26, 0.1)', color: '#BA1A1A' };
    return { backgroundColor: '#DFE8FF', color: '#091C35' };
  }

  return (
    <div className="patient-records-screen">
      <div className="record-table-header">
        <h2>All Patient Records</h2>
        <div className="record-table-actions">
          <div className="record-search-wrapper">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" className="record-search-icon">
              <path d="M16.6 18L10.3 11.7C9.8 12.1 9.225 12.4167 8.575 12.65C7.925 12.8833 7.23333 13 6.5 13C4.68333 13 3.14583 12.3708 1.8875 11.1125C0.629167 9.85417 0 8.31667 0 6.5C0 4.68333 0.629167 3.14583 1.8875 1.8875C3.14583 0.629167 4.68333 0 6.5 0C8.31667 0 9.85417 0.629167 11.1125 1.8875C12.3708 3.14583 13 4.68333 13 6.5C13 7.23333 12.8833 7.925 12.65 8.575C12.4167 9.225 12.1 9.8 11.7 10.3L18 16.6L16.6 18ZM6.5 11C7.75 11 8.8125 10.5625 9.6875 9.6875C10.5625 8.8125 11 7.75 11 6.5C11 5.25 10.5625 4.1875 9.6875 3.3125C8.8125 2.4375 7.75 2 6.5 2C5.25 2 4.1875 2.4375 3.3125 3.3125C2.4375 4.1875 2 5.25 2 6.5C2 7.75 2.4375 8.8125 3.3125 9.6875C4.1875 10.5625 5.25 11 6.5 11Z" fill="#737685" />
            </svg>
            <input
              type="text"
              className="record-search-input"
              placeholder="Search records by ID, dept, author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="records-table-container">
        <table className="records-table">
          <thead>
            <tr className="table-header-row">
              <th className="table-cell table-cell-header">Record ID</th>
              <th className="table-cell table-cell-header">Date</th>
              <th className="table-cell table-cell-header">Department</th>
              <th className="table-cell table-cell-header">Author</th>
              <th className="table-cell table-cell-header">Sensitivity</th>
              <th className="table-cell table-cell-header">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="table-body-row" onClick={() => onRecordClick(r.id)}>
                <td className="table-cell">{r.id}</td>
                <td className="table-cell">{r.date}</td>
                <td className="table-cell">{r.department}</td>
                <td className="table-cell">{r.author}</td>
                <td className="table-cell">
                  <span className="status-badge" style={badgeStyle(r.sensitivity)}>{r.sensitivity}</span>
                </td>
                <td className="table-cell">{r.status}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#737685' }}>
                  No records match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}