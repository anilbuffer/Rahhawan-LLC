import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  ChevronDown,
  LogOut,
  Navigation,
  Package,
  Menu,
  RefreshCw,
  Wifi,
  WifiOff,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { driverSyncService } from '../../services/driverSyncService';
import styles from './DriverHeader.module.css';

interface DriverHeaderProps {
  onMenuClick?: () => void;
  pageTitle?: string;
}

export const DriverHeader: React.FC<DriverHeaderProps> = ({
  onMenuClick,
  pageTitle = "Today's Shift",
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [syncState, setSyncState] = useState(driverSyncService.getSyncState());
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = driverSyncService.subscribe(() => {
      setSyncState(driverSyncService.getSyncState());
    });
    return unsub;
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setProfileOpen(false);
    driverSyncService.purgeLocalDriverData();
    logout();
    navigate('/login', { replace: true });
  };

  const renderSyncPill = () => {
    if (!syncState.isOnline) {
      return (
        <button
          className={`${styles.syncPill} ${styles.syncPillOffline}`}
          onClick={() => navigate('/driver/account')}
          title="Offline Mode — local writes queued. Click to inspect outbox."
        >
          <WifiOff size={14} />
          <span>Offline ({syncState.pendingCount})</span>
        </button>
      );
    }

    if (syncState.isSyncing) {
      return (
        <button
          className={`${styles.syncPill} ${styles.syncPillSyncing}`}
          onClick={() => navigate('/driver/account')}
          title="Syncing pending outbox items..."
        >
          <Loader2 size={14} className={styles.spinner} />
          <span>Syncing…</span>
        </button>
      );
    }

    if (syncState.rejectedCount > 0) {
      return (
        <button
          className={`${styles.syncPill} ${styles.syncPillConflict}`}
          onClick={() => navigate('/driver/account')}
          title="Sync Conflict detected. Click to review."
        >
          <AlertTriangle size={14} />
          <span>Conflict Alert</span>
        </button>
      );
    }

    if (syncState.pendingCount > 0) {
      return (
        <button
          className={`${styles.syncPill} ${styles.syncPillPending}`}
          onClick={() => navigate('/driver/account')}
          title={`${syncState.pendingCount} queued actions. Click to sync.`}
        >
          <RefreshCw size={14} />
          <span>{syncState.pendingCount} Pending</span>
        </button>
      );
    }

    return (
      <button
        className={`${styles.syncPill} ${styles.syncPillOnline}`}
        onClick={() => navigate('/driver/account')}
        title="All local data synchronized with server"
      >
        <span className={styles.onlineDot} />
        <span>Synced</span>
      </button>
    );
  };

  return (
    <header className={styles.header}>
      {/* Left */}
      <div className={styles.leftSection}>
        <button
          className={styles.menuBtn}
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className={styles.contextTitle}>
          <span className={styles.roleLabel}>Courier Driver Manifest</span>
          <h1 className={styles.pageTitle}>{pageTitle}</h1>
        </div>
      </div>

      {/* Right */}
      <div className={styles.rightSection}>
        {/* Outbox Sync Pill */}
        {renderSyncPill()}

        {/* Notifications */}
        <button className={styles.iconBtn} aria-label="Notifications" title="Notifications">
          <Bell size={18} />
          <span className={styles.notifDot} />
        </button>

        {/* Profile */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <div
            className={styles.profileChip}
            onClick={() => setProfileOpen(!profileOpen)}
            role="button"
            tabIndex={0}
          >
            <div className={styles.chipAvatar}>{user?.initials ?? 'MV'}</div>
            <div className={styles.chipInfo}>
              <span className={styles.chipName}>{user?.name?.split(' ')[0] ?? 'Marcus'}</span>
              <span className={styles.chipRole}>DRV-101</span>
            </div>
            <ChevronDown size={14} color="#6B7280" />
          </div>

          {profileOpen && (
            <div className={styles.profileDropdown}>
              <div className={styles.profileHeader}>
                <div className={styles.dropdownName}>{user?.name ?? 'Marcus Vance'}</div>
                <div className={styles.dropdownEmail}>{user?.email ?? 'marcus.vance@rahhawan.com'}</div>
                <div className={styles.badgeRow}>
                  <span className={styles.roleBadge}>
                    <ShieldCheck size={12} />
                    DEA Schedule II-V Certified
                  </span>
                </div>
              </div>

              <div className={styles.profileLinks}>
                <button
                  className={styles.profileLinkItem}
                  onClick={() => {
                    setProfileOpen(false);
                    navigate('/driver/assigned');
                  }}
                >
                  <Package size={16} />
                  <span>Assigned Deliveries</span>
                </button>

                <button
                  className={styles.profileLinkItem}
                  onClick={() => {
                    setProfileOpen(false);
                    navigate('/driver/route');
                  }}
                >
                  <Navigation size={16} />
                  <span>My Active Route</span>
                </button>

                <button
                  className={styles.profileLinkItem}
                  onClick={() => {
                    setProfileOpen(false);
                    navigate('/driver/account');
                  }}
                >
                  <RefreshCw size={16} />
                  <span>Outbox & Account</span>
                </button>

                <div className={styles.divider} />

                <button
                  className={`${styles.profileLinkItem} ${styles.logoutItem}`}
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  <span>End Shift & Secure Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DriverHeader;
