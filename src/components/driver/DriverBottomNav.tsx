import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, User } from 'lucide-react';
import { driverSyncService } from '../../services/driverSyncService';
import styles from './DriverBottomNav.module.css';

export const DriverBottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [syncState, setSyncState] = useState(driverSyncService.getSyncState());

  useEffect(() => {
    const unsub = driverSyncService.subscribe(() => {
      setSyncState(driverSyncService.getSyncState());
    });
    return unsub;
  }, []);

  const currentPath = location.pathname;
  const isShift = currentPath.includes('/driver/shift') || currentPath === '/driver' || currentPath === '/driver/';
  const isSearch = currentPath.includes('/driver/search');
  const isAccount = currentPath.includes('/driver/account');

  return (
    <nav className={styles.bottomNav} aria-label="Mobile Driver Navigation">
      {/* Tab 1: Shift */}
      <button
        id="driver-tab-shift"
        className={`${styles.navTab} ${isShift ? styles.activeTab : ''}`}
        onClick={() => navigate('/driver/shift')}
        aria-label="Shift Dashboard"
      >
        <div className={styles.tabIconWrapper}>
          <Home size={20} strokeWidth={isShift ? 2.5 : 2} />
        </div>
        <span className={styles.tabLabel}>Shift</span>
      </button>

      {/* Tab 2: Search */}
      <button
        id="driver-tab-search"
        className={`${styles.navTab} ${isSearch ? styles.activeTab : ''}`}
        onClick={() => navigate('/driver/search')}
        aria-label="Order ID Search"
      >
        <div className={styles.tabIconWrapper}>
          <Search size={20} strokeWidth={isSearch ? 2.5 : 2} />
        </div>
        <span className={styles.tabLabel}>Search</span>
      </button>

      {/* Tab 3: Account */}
      <button
        id="driver-tab-account"
        className={`${styles.navTab} ${isAccount ? styles.activeTab : ''}`}
        onClick={() => navigate('/driver/account')}
        aria-label="Account and Sync Details"
      >
        <div className={styles.tabIconWrapper}>
          <User size={20} strokeWidth={isAccount ? 2.5 : 2} />
        </div>
        <span className={styles.tabLabel}>Account</span>
        {(syncState.pendingCount > 0 || syncState.rejectedCount > 0) && (
          <span className={styles.badge}>
            {syncState.rejectedCount > 0 ? '!' : syncState.pendingCount}
          </span>
        )}
      </button>
    </nav>
  );
};

export default DriverBottomNav;
