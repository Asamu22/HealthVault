import { useState, useEffect } from 'react';
import { LoginScreen } from './components/auth/LoginScreen';
import { SideNavBar } from './components/layout/SideNavBar';
import { DashboardScreen } from './components/dashboard/DashboardScreen';

function App() {
  // TODO: Implement state management for auth flow
  // For now, showing dashboard. Change to LoginScreen to see auth screens
  const isAuthenticated = true;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Desktop sidebar - hidden on mobile */}
      {!isMobile && <SideNavBar />}
      {/* Dashboard handles both desktop and mobile layouts internally */}
      <DashboardScreen />
    </div>
  );
}

export default App;
