import type { ReactNode } from 'react';

// SVG Icons
function DashboardIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="6" height="6" rx="1" fill={active ? '#006374' : '#434654'} />
      <rect x="11" y="1" width="6" height="6" rx="1" fill={active ? '#006374' : '#434654'} />
      <rect x="1" y="11" width="6" height="6" rx="1" fill={active ? '#006374' : '#434654'} />
      <rect x="11" y="11" width="6" height="6" rx="1" fill={active ? '#006374' : '#434654'} />
    </svg>
  );
}

function RecordsIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="16" viewBox="0 0 20 16" fill="none" aria-hidden="true">
      <path d="M1 2h12M1 6h12M1 10h8" stroke={active ? '#006374' : '#434654'} strokeWidth="1.5" strokeLinecap="round" />
      <rect x="1" y="1" width="12" height="14" rx="1" stroke={active ? '#006374' : '#434654'} strokeWidth="1.5" />
    </svg>
  );
}

function LogsIcon({ active }: { active: boolean }) {
  return (
    <svg width="19.5" height="16" viewBox="0 0 20 16" fill="none" aria-hidden="true">
      <path d="M1 4h8M1 8h12M1 12h8" stroke={active ? '#006374' : '#434654'} strokeWidth="1.5" strokeLinecap="round" />
      <rect x="1" y="1" width="12" height="14" rx="1" stroke={active ? '#006374' : '#434654'} strokeWidth="1.5" />
      <path d="M14 4l2 2 4-4" stroke={active ? '#006374' : '#434654'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SettingsIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="2.5" stroke={active ? '#006374' : '#434654'} strokeWidth="1.5" />
      <path
        d="M10 1v2.5M10 16.5V19M19 10h-2.5M2.5 10H0M15.657 4.343l-1.768 1.768M5.11 14.89l-1.768 1.768M15.657 15.657l-1.768-1.768M5.11 5.11L3.343 3.343"
        stroke={active ? '#006374' : '#434654'}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface BottomNavItemProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function BottomNavItem({ icon, label, active = false, onClick }: BottomNavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`bottom-nav-link ${active ? 'bottom-nav-link-active' : ''}`}
      type="button"
      aria-label={label}
    >
      <div className="bottom-nav-icon">{icon}</div>
      <span className="bottom-nav-label">{label}</span>
    </button>
  );
}

interface BottomNavBarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function BottomNavBar({ activeTab = 'dashboard', onTabChange }: BottomNavBarProps) {
  return (
    <nav className="bottom-nav-bar">
      <BottomNavItem
        icon={<DashboardIcon active={activeTab === 'dashboard'} />}
        label="Dashboard"
        active={activeTab === 'dashboard'}
        onClick={() => onTabChange?.('dashboard')}
      />
      <BottomNavItem
        icon={<RecordsIcon active={activeTab === 'records'} />}
        label="Records"
        active={activeTab === 'records'}
        onClick={() => onTabChange?.('records')}
      />
      <BottomNavItem
        icon={<LogsIcon active={activeTab === 'logs'} />}
        label="Logs"
        active={activeTab === 'logs'}
        onClick={() => onTabChange?.('logs')}
      />
      <BottomNavItem
        icon={<SettingsIcon active={activeTab === 'settings'} />}
        label="Settings"
        active={activeTab === 'settings'}
        onClick={() => onTabChange?.('settings')}
      />
    </nav>
  );
}
