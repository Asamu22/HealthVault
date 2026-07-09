import { useState, useEffect } from 'react';
import { SideNavBar } from '../layout/SideNavBar';

// SVG Icons
function CloudUploadIcon() {
  return (
    <svg width="22" height="16" viewBox="0 0 22 16" fill="none" aria-hidden="true">
      <path d="M10 16H5.5C3.98333 16 2.6875 15.475 1.6125 14.425C0.5375 13.375 0 12.0917 0 10.575C0 9.275 0.391667 8.11667 1.175 7.1C1.95833 6.08333 2.98333 5.43333 4.25 5.15C4.66667 3.61667 5.5 2.375 6.75 1.425C8 0.475 9.41667 0 11 0C12.95 0 14.6042 0.679167 15.9625 2.0375C17.3208 3.39583 18 5.05 18 7C19.15 7.13333 20.1042 7.62917 20.8625 8.4875C21.6208 9.34583 22 10.35 22 11.5C22 12.75 21.5625 13.8125 20.6875 14.6875C19.8125 15.5625 18.75 16 17.5 16H12V8.85L13.6 10.4L15 9L11 5L7 9L8.4 10.4L10 8.85V16Z" fill="#006374" />
    </svg>
  );
}

function LockCheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3.5 7l2 2 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M16.6 18L10.3 11.7C9.8 12.1 9.225 12.4167 8.575 12.65C7.925 12.8833 7.23333 13 6.5 13C4.68333 13 3.14583 12.3708 1.8875 11.1125C0.629167 9.85417 0 8.31667 0 6.5C0 4.68333 0.629167 3.14583 1.8875 1.8875C3.14583 0.629167 4.68333 0 6.5 0C8.31667 0 9.85417 0.629167 11.1125 1.8875C12.3708 3.14583 13 4.68333 13 6.5C13 7.23333 12.8833 7.925 12.65 8.575C12.4167 9.225 12.1 9.8 11.7 10.3L18 16.6L16.6 18ZM6.5 11C7.75 11 8.8125 10.5625 9.6875 9.6875C10.5625 8.8125 11 7.75 11 6.5C11 5.25 10.5625 4.1875 9.6875 3.3125C8.8125 2.4375 7.75 2 6.5 2C5.25 2 4.1875 2.4375 3.3125 3.3125C2.4375 4.1875 2 5.25 2 6.5C2 7.75 2.4375 8.8125 3.3125 9.6875C4.1875 10.5625 5.25 11 6.5 11Z" fill="#737685" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M1 1h16l-6 8v6l-4-2v-4L1 1Z" stroke="#737685" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MoreActionsIcon() {
  return (
    <svg width="4" height="16" viewBox="0 0 4 16" fill="none" aria-hidden="true">
      <circle cx="2" cy="2" r="1.5" fill="#737685" />
      <circle cx="2" cy="8" r="1.5" fill="#737685" />
      <circle cx="2" cy="14" r="1.5" fill="#737685" />
    </svg>
  );
}

interface Record {
  id: string;
  patient: {
    initials: string;
    name: string;
  };
  sensitivity: string;
  status: string;
  encryption: string;
}

const MOCK_RECORDS: Record[] = [
  {
    id: 'EHR-992-A',
    patient: { initials: 'JD', name: 'Doe, John' },
    sensitivity: 'Restricted',
    status: 'Encrypted',
    encryption: 'Encrypted',
  },
  {
    id: 'EHR-841-B',
    patient: { initials: 'AS', name: 'Smith, Alice' },
    sensitivity: 'Normal',
    status: 'Verified',
    encryption: 'Verified',
  },
  {
    id: 'EHR-773-C',
    patient: { initials: 'MR', name: 'Rivera, Marcus' },
    sensitivity: 'Restricted',
    status: 'Processing',
    encryption: 'Processing',
  },
];

function StatusBadge({ status }: { status: string }) {
  const colors: { [key: string]: { bg: string; text: string } } = {
    Restricted: { bg: 'rgba(186, 26, 26, 0.1)', text: '#BA1A1A' },
    Normal: { bg: '#DFE8FF', text: '#091C35' },
    'Processing': { bg: 'rgba(186, 26, 26, 0.1)', text: '#BA1A1A' },
  };
  
  const color = colors[status] || colors.Normal;
  
  return (
    <span className="status-badge" style={{ backgroundColor: color.bg, color: color.text }}>
      {status}
    </span>
  );
}

function EncryptionStatus({ status }: { status: string }) {
  if (status === 'Encrypted') {
    return (
      <div className="encryption-status encrypted">
        <LockCheckIcon />
        <span>Encrypted</span>
      </div>
    );
  }
  if (status === 'Verified') {
    return (
      <div className="encryption-status verified">
        <LockCheckIcon />
        <span>Verified</span>
      </div>
    );
  }
  return (
    <div className="encryption-status processing">
      <span>Processing...</span>
    </div>
  );
}

export function DashboardScreen() {
  const [_searchQuery, setSearchQuery] = useState('');
  const [uploadProgress] = useState(78); // 78% complete for demo
  const [isMobile, setIsMobile] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile) {
    return (
      <div className="dashboard-mobile">
        <div className={`mobile-nav-backdrop ${isNavOpen ? 'active' : ''}`} onClick={() => setIsNavOpen(false)} />
        <SideNavBar mobile isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />

        {/* Mobile Header */}
        <header className="mobile-header">
          <div className="mobile-header-top">
            <button className="mobile-nav-toggle" type="button" aria-label="Open navigation" onClick={() => setIsNavOpen(true)}>
              <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
                <path d="M1 1h16M1 7h16M1 13h16" stroke="#434654" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <h1 className="mobile-brand">HealthVault Secure</h1>
            <div className="mobile-header-actions">
              <button className="mobile-icon-btn" aria-label="Notifications">
                <svg width="16" height="20" viewBox="0 0 16 20" fill="none" aria-hidden="true">
                  <path d="M2 7c0-3 2-5 6-5s6 2 6 5v4l1 3H1l1-3V7Z" stroke="#434654" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="2" r="2" fill="#BA1A1A" />
                </svg>
              </button>
              <button className="mobile-profile-btn" aria-label="Profile">
                <img src="https://via.placeholder.com/40" alt="Profile" className="profile-image" />
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="mobile-search-wrapper">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search patient ID or records..."
              value={_searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mobile-search-input"
            />
            <button type="button" className="mobile-search-mic" aria-label="Voice search">
              <svg width="11.67" height="15.83" viewBox="0 0 12 16" fill="none" aria-hidden="true">
                <path d="M6 1v5M3 6h6v4c0 2-1 3-3 3s-3-1-3-3V6Z" stroke="#434654" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </header>

        {/* Mobile Main Content */}
        <main className="mobile-main">
          {/* Data Synchronization Card */}
          <section className="mobile-sync-card">
            <div className="sync-card-overlay" />
            <div className="sync-card-content">
              <div className="sync-header">
                <div className="sync-icon-title">
                  <div className="sync-icon">
                    <svg width="16" height="13" viewBox="0 0 16 13" fill="none" aria-hidden="true">
                      <path d="M2 1h12M2 5h12M2 9h8" stroke="#00687A" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <h2 className="sync-title">Data Synchronization</h2>
                </div>
                <div className="sync-badge">
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 6l3 3 5-5" stroke="#004E32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>AES-256</span>
                </div>
              </div>
              <p className="sync-subtitle">End-to-End Encrypted Tunnel</p>
              <div className="sync-progress-section">
                <div className="sync-progress-header">
                  <span className="sync-label">Uploading Patient Batch</span>
                  <span className="sync-percent">78%</span>
                </div>
                <div className="sync-progress-bar">
                  <div className="sync-progress-fill" style={{ width: `${uploadProgress}%` }} />
                </div>
                <div className="sync-timer">EST: 0m 42s remaining</div>
              </div>
            </div>
          </section>

          {/* Recent Records Section */}
          <section className="mobile-records-section">
            <div className="mobile-records-header">
              <h2 className="records-title">Recent Records</h2>
              <button type="button" className="view-all-link">View All</button>
            </div>

            {/* Records List */}
            <div className="mobile-records-list">
              {MOCK_RECORDS.map((record) => (
                <div key={record.id} className="mobile-record-card">
                  <div className="record-card-left">
                    <div className="record-avatar">{record.patient.initials}</div>
                    <div className="record-info">
                      <div className="record-header-row">
                        <h3 className="record-name">{record.patient.name}</h3>
                        <span className="record-time">10:42 AM</span>
                      </div>
                      <p className="record-id">📋 {record.id}</p>
                      <div className="record-tags">
                        <StatusBadge status={record.sensitivity} />
                        <span className="record-specialty">Cardiology</span>
                      </div>
                    </div>
                  </div>
                  <button type="button" className="record-more-btn" aria-label="More options">
                    <MoreActionsIcon />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </main>

      </div>
    );
  }

  // Desktop view remains the same
  return (
    <div className="dashboard-layout">
      {/* Main Content */}
      <main className="dashboard-main">
        {/* Header Section */}
        <div className="dashboard-header-top">
          <div className="header-title-group">
            <h1 className="header-title">Overview</h1>
          </div>

          {/* Global Search */}
          <div className="search-input-wrapper">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search EHR (Name, ID, Date)..."
              value={_searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <p className="header-subtitle">Secure Workspace Session Active</p>

        {/* Content Grid */}
        <div className="dashboard-content">
          {/* Section 1: Data Ingestion */}
          <section className="dashboard-section data-ingestion-section">
            <h2 className="section-title">Data Ingestion</h2>
            <div className="data-ingestion-card">
              {/* Upload Area */}
              <div className="upload-area">
                <div className="upload-icon-container">
                  <CloudUploadIcon />
                </div>
                <h3 className="upload-heading">Drag & Drop Secure File</h3>
                <p className="upload-description">
                  DICOM, PDF, HL7 supported. Max 500MB.
                </p>
                <button type="button" className="btn-select-file">
                  Select File
                </button>
              </div>

              {/* Progress State */}
              <div className="upload-progress-container">
                <div className="progress-row">
                  <div className="progress-file-info">
                    <span className="file-icon">📄</span>
                    <span className="file-name">vane_cardio_scan_04.dcm</span>
                  </div>
                  <span className="file-size">6.5.1</span>
                </div>
                <div className="progress-status">
                  AES-GCM ENCRYPTION IN PROGRESS
                </div>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Recent Records */}
          <section className="dashboard-section recent-records-section">
            <div className="section-header">
              <h2 className="section-title">Recent Records Log</h2>
              <button type="button" className="btn-view-full">
                <span>View Full Log</span>
                <svg width="10.67" height="10.67" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M5 2l4 4-4 4" stroke="#003D9B" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Table */}
            <div className="records-table-container">
              <table className="records-table">
                <thead>
                  <tr className="table-header-row">
                    <th className="table-cell table-cell-header">Record ID</th>
                    <th className="table-cell table-cell-header">Patient</th>
                    <th className="table-cell table-cell-header">Sensitivity</th>
                    <th className="table-cell table-cell-header">Status</th>
                    <th className="table-cell table-cell-header table-cell-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_RECORDS.map((record, index) => (
                    <tr key={record.id} className={index > 0 ? 'table-body-row border-top' : 'table-body-row'}>
                      <td className="table-cell table-cell-record-id">
                        <span className="record-id-mono">{record.id}</span>
                      </td>
                      <td className="table-cell table-cell-patient">
                        <div className="patient-info">
                          <div className="patient-avatar">{record.patient.initials}</div>
                          <span className="patient-name">{record.patient.name}</span>
                        </div>
                      </td>
                      <td className="table-cell table-cell-sensitivity">
                        <StatusBadge status={record.sensitivity} />
                      </td>
                      <td className="table-cell table-cell-status">
                        <EncryptionStatus status={record.encryption} />
                      </td>
                      <td className="table-cell table-cell-actions">
                        <button type="button" className="btn-more-actions" aria-label="More actions">
                          <MoreActionsIcon />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
