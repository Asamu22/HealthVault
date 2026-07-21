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

function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M6 7.5C6 9.15685 7.34315 10.5 9 10.5C10.6569 10.5 12 9.15685 12 7.5C12 5.84315 10.6569 4.5 9 4.5C7.34315 4.5 6 5.84315 6 7.5Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 16.5C2 13.7386 4.23858 11.5 7 11.5H11C13.7614 11.5 16 13.7386 16 16.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 16.5C6 14.8431 7.34315 13.5 9 13.5H11C12.6569 13.5 14 14.8431 14 16.5" stroke="currentColor" strokeWidth="1.5" />
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

function PoliciesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 6h10M4 9h7M4 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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

function LogoutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M11.6667 14.1667L15.8333 10L11.6667 5.83333M15.8333 10H5M7.5 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V4.16667C2.5 3.72464 2.67559 3.30072 2.98816 2.98816C3.30072 2.67559 3.72464 2.5 4.16667 2.5H7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
  activeScreen?: string;
  role?: 'admin' | 'staff';
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
  userName?: string;
  userInitials?: string;
}

export function SideNavBar({ mobile = false, isOpen = true, onClose, activeScreen = 'dashboard', role = 'admin', onNavigate, onLogout, userName, userInitials }: SideNavBarProps) {
  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'records', label: 'Patient Records', icon: <PatientRecordsIcon /> },
    { id: 'users', label: 'Users', icon: <UsersIcon /> },
    { id: 'audit', label: 'Audit Logs', icon: <AuditLogsIcon /> },
    { id: 'access', label: 'Access Control', icon: <AccessControlIcon /> },
    { id: 'policies', label: 'Policies', icon: <PoliciesIcon /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
  ];

  const visibleMainItems = role === 'admin' ? mainNavItems : mainNavItems.filter((item) => ['dashboard', 'records', 'settings'].includes(item.id));

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
          <span className="avatar-initials">{userInitials || 'U'}</span>
        </div>
        <div className="side-nav-user-info">
          <h2 className="side-nav-user-name">{userName || 'Unknown User'}</h2>
          <p className="side-nav-user-role">{role === 'admin' ? 'Admin | Full Access' : 'Staff | Limited Access'}</p>
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
        {visibleMainItems.map((item) => (
          <NavLink key={item.id} icon={item.icon} label={item.label} active={activeScreen === item.id} onClick={() => onNavigate?.(item.id)} />
        ))}
      </nav>

      {/* Footer Navigation */}
      <div className="side-nav-footer">
        {role === 'admin' && (
          <>
            <NavLink icon={<SecurityCenterIcon />} label="Security Center" />
            <NavLink icon={<SupportIcon />} label="Support" />
          </>
        )}
        <NavLink icon={<LogoutIcon />} label="Log Out" onClick={onLogout} />
      </div>
    </aside>
  );
}
