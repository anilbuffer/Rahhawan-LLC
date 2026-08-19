import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import styles from './Layout.module.css';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Derived page title based on path
  const getPageTitle = () => {
    const path = location.pathname.substring(1);
    if (!path) return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');
  };

  return (
    <div className={styles.layout}>
      {/* Mobile Drawer Scrim */}
      <div 
        className={`${styles.drawerScrim} ${sidebarOpen ? styles.visible : ''}`} 
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar Wrapper */}
      <div className={`${styles.sidebarWrapper} ${sidebarOpen ? styles.open : ''}`}>
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className={styles.mainWrapper}>
        <Header 
          onMenuClick={() => setSidebarOpen(true)} 
          pageTitle={getPageTitle()} 
        />
        <main className={styles.contentArea}>
          <div className="animate-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
