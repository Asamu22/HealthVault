import type { ReactNode } from 'react';

// SVG Icons
function DashboardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="6" height="6" rx="1" fill="currentColor" />
      <rect x="11" y="1" width="6" height="6" rx="1" fill="currentColor" />
      <rect x="1" y="11" width="6" height="6" rx="1" fill="currentColor" />
      <rect x="11" y="11" width="6" height="6" rx="1" fill="currentColor" />
    </svg>
  );
}

function PatientRecordsIcon() {
  return (
    <svg width="20" height="16" viewBox="0 0 20 16" fill="none" aria-hidden="true">
      <path d="M1 2h12M1 6h12M1 10h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="1" y="1" width="12" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function AuditLogsIcon() {
  return (
    <svg width="19.5" height="16" viewBox="0 0 20 16" fill="none" aria-hidden="true">
      <path d="M1 4h8M1 8h12M1 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="1" y="1" width="12" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14 4l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AccessControlIcon() {
  return (
    <svg width="18" height="20" viewBox="0 0 18 20" fill="none" aria-hidden="true">
      <path d="M2 8h14v9c0 1-1 2-2 2H4c-1 0-2-1-2-2V8Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 8V4c0-1 1-2 2-2h4c1 0 2 1 2 2v4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="9" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="20.1" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 1v2.5M10 16.5V19M19 10h-2.5M2.5 10H0M15.657 4.343l-1.768 1.768M5.11 14.89l-1.768 1.768M15.657 15.657l-1.768-1.768M5.11 5.11L3.343 3.343" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SecurityCenterIcon() {
  return (
    <svg width="16" height="20" viewBox="0 0 16 20" fill="none" aria-hidden="true">
      <path d="M8 1L2 4v4c0 5 6 9 6 9s6-4 6-9V4l-6-3Z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM8 11c0 1 1 2 2 2s2-1 2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M6 2v6M3 5l3-3 3 3M2 10h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface NavLinkProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function NavLink({ icon, label, active = false, onClick }: NavLinkProps) {
  return (
    <button
      onClick={onClick}
      className={`nav-link ${active ? 'nav-link-active' : ''}`}
      type="button"
    >
      <span className="nav-link-icon">{icon}</span>
      <span className="nav-link-text">{label}</span>
    </button>
  );
}

interface SideNavBarProps {
  mobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export function SideNavBar({ mobile = false, isOpen = true, onClose }: SideNavBarProps) {
  return (
    <aside className={`side-nav-bar ${mobile ? 'side-nav-bar-mobile' : ''} ${mobile && isOpen ? 'side-nav-bar-open' : ''}`}>
      {mobile && (
        <button className="mobile-nav-close" type="button" aria-label="Close menu" onClick={onClose}>
          ×
        </button>
      )}
      {/* Header Info Section */}
      <div className="side-nav-header">
        <div className="side-nav-avatar">
          <span className="avatar-initials">JV</span>
        </div>
        <div className="side-nav-user-info">
          <h2 className="side-nav-user-name">Dr. Julian Vane</h2>
          <p className="side-nav-user-role">Clinician | Cardiology</p>
        </div>
      </div>

      {/* Upload Button */}
      <div className="side-nav-cta">
        <button className="btn-upload" type="button">
          <UploadIcon />
          <span>Upload New Record</span>
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="side-nav-menu">
        <NavLink icon={<DashboardIcon />} label="Dashboard" active={true} />
        <NavLink icon={<PatientRecordsIcon />} label="Patient Records" />
        <NavLink icon={<AuditLogsIcon />} label="Audit Logs" />
        <NavLink icon={<AccessControlIcon />} label="Access Control" />
        <NavLink icon={<SettingsIcon />} label="Settings" />
      </nav>

      {/* Footer Navigation */}
      <div className="side-nav-footer">
        <NavLink icon={<SecurityCenterIcon />} label="Security Center" />
        <NavLink icon={<SupportIcon />} label="Support" />
      </div>
    </aside>
  );
}
