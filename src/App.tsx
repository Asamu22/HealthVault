import { useState, useEffect } from 'react';
import { LoginScreen } from './components/auth/LoginScreen';
import { MfaChallengeScreen } from './components/auth/MfaChallengeScreen';
import { SideNavBar } from './components/layout/SideNavBar';
import { AuditScreen } from './components/audit/AuditScreen';
import { DashboardScreen } from './components/dashboard/DashboardScreen';
import { PatientRecordScreen } from './components/dashboard/PatientRecordScreen';
import { PatientRecordsScreen } from './components/dashboard/PatientRecordsScreen';
import { UsersManagementScreen } from './components/users/UsersManagementScreen';
import { AccessControlScreen } from './components/access/AccessControlScreen';
import type { PatientRecordItem } from './types';
import { supabase, isSupabaseConfigured } from './lib/supabase';

type AppRole = 'admin' | 'staff';
type AppScreen = 'dashboard' | 'records' | 'users' | 'audit' | 'access' | 'settings';

const INITIAL_RECORDS: PatientRecordItem[] = [
  {
    id: 'EHR-992-A',
    patient: { initials: 'JD', name: 'Doe, John' },
    sensitivity: 'Restricted',
    status: 'Encrypted',
    encryption: 'Encrypted',
    department: 'Cardiology',
    date: '2024-11-01',
    author: 'Dr. A. Chen',
  },
  {
    id: 'EHR-841-B',
    patient: { initials: 'AS', name: 'Smith, Alice' },
    sensitivity: 'Normal',
    status: 'Verified',
    encryption: 'Verified',
    department: 'Oncology',
    date: '2024-10-14',
    author: 'Dr. L. Park',
  },
  {
    id: 'EHR-773-C',
    patient: { initials: 'MR', name: 'Rivera, Marcus' },
    sensitivity: 'Restricted',
    status: 'Processing',
    encryption: 'Processing',
    department: 'Neurology',
    date: '2024-09-22',
    author: 'Dr. R. Singh',
  },
];

function SettingsView() {
  return (
    <div className="panel-card">
      <h2>System Settings</h2>
      <p>Temporary user settings view for the demo login experience.</p>
    </div>
  );
}

function App() {
  const [activeRole, setActiveRole] = useState<AppRole | null>(null);
  const isAuthenticated = activeRole !== null;
  const isAdmin = activeRole === 'admin';
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [selectedScreen, setSelectedScreen] = useState<AppScreen>('dashboard');
  const [records, setRecords] = useState<PatientRecordItem[]>(INITIAL_RECORDS);
  const [needsMfa, setNeedsMfa] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const allowedScreens: AppScreen[] = isAdmin ? ['dashboard', 'records', 'users', 'audit', 'access', 'settings'] : ['dashboard', 'records', 'settings'];

  useEffect(() => {
    const query = '(max-width: 767px)';
    const mediaQuery = window.matchMedia(query);
    const handleChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);

    setIsMobile(mediaQuery.matches);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  useEffect(() => {
    if (!isAdmin && !allowedScreens.includes(selectedScreen)) {
      setSelectedScreen('dashboard');
    }
  }, [allowedScreens, isAdmin, selectedScreen]);

  useEffect(() => {
    const restoreSession = async () => {
      if (!isSupabaseConfigured) {
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const role = session.user?.user_metadata?.role === 'admin' ? 'admin' : 'staff';
        setActiveRole(role);
        setNeedsMfa(true);
      }
    };

    restoreSession();
  }, []);

  if (!isAuthenticated) {
    return <LoginScreen onLogin={(role) => {
      setActiveRole(role);
      setNeedsMfa(true);
      setAuthMessage(null);
    }} />;
  }

  if (needsMfa) {
    return <MfaChallengeScreen onVerified={() => {
      setNeedsMfa(false);
      setAuthMessage(null);
    }} />;
  }

  const handleNavigate = (screen: string) => {
    if (allowedScreens.includes(screen as AppScreen)) {
      setSelectedScreen(screen as AppScreen);
      setIsMobileNavOpen(false);
    }
  };

  const handleAddRecord = (record: PatientRecordItem) => {
    setRecords((current) => [record, ...current]);
  };

  const renderContent = () => {
    if (selectedRecordId) {
      return <PatientRecordScreen recordId={selectedRecordId} onBack={() => setSelectedRecordId(null)} />;
    }

    return (
      <>
        {selectedScreen === 'dashboard' && <DashboardScreen records={records} onRecordAdd={handleAddRecord} onRecordClick={setSelectedRecordId} />}
        {selectedScreen === 'records' && <PatientRecordsScreen records={records} onRecordClick={(id) => setSelectedRecordId(id)} />}
        {selectedScreen === 'users' && isAdmin && <UsersManagementScreen />}
        {selectedScreen === 'audit' && isAdmin && <AuditScreen onRowClick={(recordId) => setSelectedRecordId(recordId)} />}
        {selectedScreen === 'access' && isAdmin && <AccessControlScreen />}
        {selectedScreen === 'settings' && <SettingsView />}
      </>
    );
  };

  if (isMobile) {
    return (
      <div className="app-shell-grid">
        <div className={`mobile-nav-backdrop ${isMobileNavOpen ? 'active' : ''}`} onClick={() => setIsMobileNavOpen(false)} />
        <SideNavBar
          mobile
          isOpen={isMobileNavOpen}
          onClose={() => setIsMobileNavOpen(false)}
          activeScreen={selectedScreen}
          role={activeRole ?? 'user'}
          onNavigate={handleNavigate}
        />
        <div className="content-column">
          <header className="mobile-header">
            <div className="mobile-header-top">
              <button className="mobile-nav-toggle" type="button" aria-label="Open navigation" onClick={() => setIsMobileNavOpen(true)}>
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
          </header>
          {authMessage ? <div className="login-note">{authMessage}</div> : null}
          {renderContent()}
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell-grid">
      <SideNavBar activeScreen={selectedScreen} role={activeRole ?? 'staff'} onNavigate={handleNavigate} />
      <div className="content-column">
        {authMessage ? <div className="login-note">{authMessage}</div> : null}
        {renderContent()}
      </div>
    </div>
  );
}

export default App;
