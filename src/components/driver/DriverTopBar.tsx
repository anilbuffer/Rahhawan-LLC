import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { driverSyncService } from '../../services/driverSyncService';
import styles from './DriverTopBar.module.css';

interface DriverTopBarProps {
  onOpenSyncSheet?: () => void;
}

export const DriverTopBar: React.FC<DriverTopBarProps> = ({ onOpenSyncSheet }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [syncState, setSyncState] = useState(driverSyncService.getSyncState());

  useEffect(() => {
    const unsubscribe = driverSyncService.subscribe(() => {
      setSyncState(driverSyncService.getSyncState());
    });
    return unsubscribe;
  }, []);

  const handleSyncClick = () => {
    if (onOpenSyncSheet) {
      onOpenSyncSheet();
    } else {
      navigate('/driver/account');
    }
  };

  const renderSyncIndicator = () => {
    if (!syncState.isOnline) {
      return (
        <div
          className={`${styles.syncPill} ${styles.syncPillOffline}`}
          onClick={handleSyncClick}
          role="button"
          tabIndex={0}
          title="Offline Mode — writes saved to local outbox. Tap to inspect."
        >
          <span className={`${styles.syncDot} ${styles.dotOffline}`} />
          <span>Offline · {syncState.pendingCount} pending</span>
        </div>
      );
    }

    if (syncState.isSyncing) {
      return (
        <div
          className={`${styles.syncPill} ${styles.syncPillSyncing}`}
          onClick={handleSyncClick}
          role="button"
          tabIndex={0}
          title="Syncing pending outbox items with server..."
        >
          <Loader2 size={13} className={styles.spinner} />
          <span>Syncing…</span>
        </div>
      );
    }

    if (syncState.pendingCount > 0) {
      return (
        <div
          className={`${styles.syncPill} ${styles.syncPillSyncing}`}
          onClick={handleSyncClick}
          role="button"
          tabIndex={0}
          title={`${syncState.pendingCount} items queued for sync`}
        >
          <span className={`${styles.syncDot} ${styles.dotSyncing}`} />
          <span>{syncState.pendingCount} pending</span>
        </div>
      );
    }

    if (syncState.rejectedCount > 0) {
      return (
        <div
          className={`${styles.syncPill} ${styles.syncPillOffline}`}
          onClick={handleSyncClick}
          role="button"
          tabIndex={0}
          title="Action sync conflict occurred. Tap to review."
        >
          <AlertCircle size={13} />
          <span>Conflict Alert</span>
        </div>
      );
    }

    return (
      <div
        className={`${styles.syncPill} ${styles.syncPillOnline}`}
        onClick={handleSyncClick}
        role="button"
        tabIndex={0}
        title="Connected & Synced with Server"
      >
        <span className={`${styles.syncDot} ${styles.dotOnline}`} />
        <span>Synced</span>
      </div>
    );
  };

  return (
    <header className={styles.topBar}>
      {/* Left: Brand mark & eyebrow */}
      <div className={styles.leftBrand} onClick={() => navigate('/driver/shift')}>
        <div className={styles.logoMark}>R</div>
        <div className={styles.brandInfo}>
          <span className={styles.eyebrow}>Driver Portal</span>
          <span className={styles.brandName}>Rahhawan</span>
        </div>
      </div>

      {/* Center: Persistent Sync Status Indicator */}
      <div className={styles.centerSync}>{renderSyncIndicator()}</div>

      {/* Right: Driver Initials Avatar */}
      <div className={styles.rightAvatar}>
        <button
          className={styles.avatarBtn}
          onClick={() => navigate('/driver/account')}
          aria-label="Account Settings & Shift Info"
          title={`${user?.name ?? 'Marcus Vance'} (DRV-101)`}
        >
          {user?.initials ?? 'MV'}
        </button>
      </div>
    </header>
  );
};

export default DriverTopBar;
