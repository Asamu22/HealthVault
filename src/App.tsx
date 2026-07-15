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
import { PoliciesScreen } from './components/access/PoliciesScreen';
import type { PatientRecordItem } from './types';
import { supabase, fetchPatientRecords } from './lib/supabase';
import { clearStoredOtpEmail } from './lib/otp';

type AppRole = 'admin' | 'staff';
type AppScreen = 'dashboard' | 'records' | 'users' | 'audit' | 'access' | 'policies' | 'settings';


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
  const [needsMfa, setNeedsMfa] = useState(false);
  const [sessionRestored, setSessionRestored] = useState(false);
  const isAuthenticated = activeRole !== null;
  const isAdmin = activeRole === 'admin';
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [selectedScreen, setSelectedScreen] = useState<AppScreen>('dashboard');
  const [records, setRecords] = useState<PatientRecordItem[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const allowedScreens: AppScreen[] = isAdmin
    ? ['dashboard', 'records', 'users', 'audit', 'access', 'policies', 'settings']
    : ['dashboard', 'records', 'settings'];

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
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const role = session.user?.user_metadata?.role === 'admin' ? 'admin' : 'staff';
          setActiveRole(role);
          setNeedsMfa(false);
        }
      } catch (err) {
        console.warn('Session restore failed:', err);
      }
      setSessionRestored(true);
    };

    restoreSession();
  }, []);

  useEffect(() => {
    const loadRecords = async () => {
      const remoteRecords = await fetchPatientRecords();
      setRecords(remoteRecords);
      setRecordsLoading(false);
    };

    loadRecords();
  }, []);

  if (!sessionRestored) {
    return <div className="loading-screen">Restoring authentication session...</div>;
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={(role) => {
      setActiveRole(role);
      setNeedsMfa(false);
      setAuthMessage(null);
    }} />;
  }

  if (needsMfa) {
    return <MfaChallengeScreen
      onVerified={() => {
        setNeedsMfa(false);
        setAuthMessage(null);
      }}
      onCancel={async () => {
        await supabase.auth.signOut();
        setActiveRole(null);
        setNeedsMfa(false);
        clearStoredOtpEmail();
        setAuthMessage('You have been returned to login. Please sign in again.');
      }}
    />;
  }

  const handleNavigate = (screen: string) => {
    if (allowedScreens.includes(screen as AppScreen)) {
      setSelectedScreen(screen as AppScreen);
      setIsMobileNavOpen(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setActiveRole(null);
    clearStoredOtpEmail();
    setAuthMessage('You have successfully logged out.');
  };

  const handleAddRecord = (record: PatientRecordItem) => {
    setRecords((current) => [record, ...current]);
  };

  const selectedRecord = selectedRecordId ? records.find((record) => record.id === selectedRecordId) : null;

  const renderContent = () => {
    if (selectedRecord) {
      return <PatientRecordScreen record={selectedRecord} onBack={() => setSelectedRecordId(null)} />;
    }

    return (
      <>
        {selectedScreen === 'dashboard' && <DashboardScreen records={records} onRecordAdd={handleAddRecord} onRecordClick={setSelectedRecordId} onViewFullLog={() => setSelectedScreen('records')} />}
        {selectedScreen === 'records' && <PatientRecordsScreen records={records} onRecordClick={(id) => setSelectedRecordId(id)} />}
        {selectedScreen === 'users' && isAdmin && <UsersManagementScreen />}
        {selectedScreen === 'audit' && isAdmin && <AuditScreen onRowClick={(recordId) => setSelectedRecordId(recordId)} />}
        {selectedScreen === 'access' && isAdmin && <AccessControlScreen />}
        {selectedScreen === 'policies' && isAdmin && <PoliciesScreen />}
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
          role={activeRole ?? 'user' as AppRole}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
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
      <SideNavBar activeScreen={selectedScreen} role={activeRole ?? 'staff'} onNavigate={handleNavigate} onLogout={handleLogout} />
      <div className="content-column">
        {authMessage ? <div className="login-note">{authMessage}</div> : null}
        {renderContent()}
      </div>
    </div>
  );
}

export default App;
