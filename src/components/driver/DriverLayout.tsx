import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import DriverSidebar from './DriverSidebar';
import DriverHeader from './DriverHeader';
import { driverSyncService } from '../../services/driverSyncService';
import layoutStyles from '../Layout.module.css';
import styles from './DriverLayout.module.css';

export const DriverLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [syncState, setSyncState] = useState(driverSyncService.getSyncState());
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Sync state subscription
  useEffect(() => {
    const unsub = driverSyncService.subscribe(() => {
      setSyncState(driverSyncService.getSyncState());
    });
    return unsub;
  }, []);

  // Derive page title from path
  const getPageTitle = () => {
    const path = location.pathname.replace('/driver/', '').replace('/driver', '');
    if (!path || path === 'shift' || path === 'dashboard') return 'My Shift & Manifest';
    if (path === 'assigned') return 'Assigned Deliveries';
    if (path === 'route') return 'Route & Navigation';
    if (path === 'history') return 'Delivery History';
    if (path === 'account') return 'Driver Account & Sync';
    if (path.startsWith('order/')) return 'Stop Delivery Details';
    return path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');
  };

  return (
    <div className={layoutStyles.layout}>
      {/* Mobile Drawer Scrim */}
      <div
        className={`${layoutStyles.drawerScrim} ${sidebarOpen ? layoutStyles.visible : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar Wrapper */}
      <div className={`${layoutStyles.sidebarWrapper} ${sidebarOpen ? layoutStyles.open : ''}`}>
        <DriverSidebar />
      </div>

      {/* Main Content Area */}
      <div className={layoutStyles.mainWrapper}>
        {/* Global Offline warning stripe if disconnected */}
        {!syncState.isOnline && (
          <div className={styles.offlineBanner}>
            <div className={styles.offlineLeft}>
              <span className={styles.offlineIcon}>⚠️</span>
              <span><strong>OFFLINE MODE</strong> — Optimistic local outbox enabled. All actions will sync automatically once reconnected.</span>
            </div>
            <span className={styles.offlineBadge}>
              {syncState.pendingCount} pending in queue
            </span>
          </div>
        )}

        <DriverHeader
          onMenuClick={() => setSidebarOpen(true)}
          pageTitle={getPageTitle()}
        />

        <main className={layoutStyles.contentArea}>
          <div className="animate-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DriverLayout;
