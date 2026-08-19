import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  RefreshCw,
  Wifi,
  WifiOff,
  AlertTriangle,
  LogOut,
  Lock,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { driverSyncService, type OutboxItem, type DriverDeliveryOrder } from '../../services/driverSyncService';
import styles from './DriverAccountTab.module.css';

export const DriverAccountTab: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [syncState, setSyncState] = useState(driverSyncService.getSyncState());
  const [outbox, setOutbox] = useState<OutboxItem[]>(driverSyncService.getOutbox());
  const [deliveries, setDeliveries] = useState<DriverDeliveryOrder[]>(driverSyncService.getDeliveries());
  const [isPurgingLogout, setIsPurgingLogout] = useState(false);

  useEffect(() => {
    const unsub = driverSyncService.subscribe(() => {
      setSyncState(driverSyncService.getSyncState());
      setOutbox(driverSyncService.getOutbox());
      setDeliveries(driverSyncService.getDeliveries());
    });
    return unsub;
  }, []);

  const rejectedOrders = deliveries.filter((d) => !!d.rejectionNotice);

  const handleToggleOnline = () => {
    driverSyncService.setOnlineSimulation(!syncState.isOnline);
  };

  const handleManualSync = () => {
    driverSyncService.processOutbox(false);
  };

  const handleSimulateConflict = () => {
    driverSyncService.queueAction('DEL-10055', 'STATUS_CHANGE', {
      status: 'En Route',
      title: 'En Route Simulation',
    }, true);
  };

  const handleSecureLogout = async () => {
    setIsPurgingLogout(true);
    await new Promise((r) => setTimeout(r, 600));
    driverSyncService.purgeLocalDriverData();
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Driver Account & Outbox Inspector</h1>
        <span className={styles.pageSubtitle}>Active Session Verification, DEA Credentials & Offline Sync Engine</span>
      </div>

      <div className={styles.accountGrid}>
        {/* Left Column: Driver Profile & Credentials */}
        <div className={styles.leftCol}>
          {/* Profile Summary Card */}
          <div className={styles.profileCard}>
            <div className={styles.profileTopRow}>
              <div className={styles.driverAvatar}>
                {user?.initials ?? 'MV'}
              </div>
              <div className={styles.driverNameBlock}>
                <div className={styles.driverName}>{user?.name ?? 'Marcus Vance'}</div>
                <div className={styles.driverIdText}>ID: DRV-101 • Courier Driver</div>
                <div className={styles.driverEmail}>{user?.email ?? 'marcus.vance@rahhawan.com'}</div>
              </div>
            </div>

            {/* DEA Schedule II Authorization Badge */}
            <div className={styles.deaBadgeRow}>
              <ShieldCheck size={22} color="#D97706" style={{ flexShrink: 0 }} />
              <div>
                <div className={styles.deaTitle}>DEA Schedule II-V Courier Authorized</div>
                <div className={styles.deaAdminNote}>
                  Cryptographic PKI Token Active • Verified by Super Admin HQ
                </div>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Assigned Vehicle</span>
                <span className={styles.metaValue}>Toyota Prius (Refrig. Box #4)</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Shift Started</span>
                <span className={styles.metaValue}>Today, 08:30 AM</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Active Manifest</span>
                <span className={styles.metaValue}>{deliveries.length} Planned Stops</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Cold-Box Status</span>
                <span className={styles.metaValue} style={{ color: '#0284C7' }}>Calibrated (38.5°F)</span>
              </div>
            </div>
          </div>

          {/* HIPAA Notice & End Shift Action */}
          <div className={styles.securityCard}>
            <div className={styles.securityNoticeBox}>
              <Lock size={20} color="#0EA383" style={{ flexShrink: 0 }} />
              <div>
                <strong>HIPAA & PHI Security Policy:</strong> All cached patient health addresses and
                identification tokens are strictly short-lived on courier devices. Ending your shift immediately purges
                local browser memory and signs off the cryptographic session.
              </div>
            </div>

            <button
              id="driver-logout-btn"
              className={styles.logoutBtn}
              onClick={handleSecureLogout}
            >
              <LogOut size={18} />
              <span>End Shift & Secure PHI Purge</span>
            </button>
          </div>
        </div>

        {/* Right Column: Outbox Sync Engine */}
        <div className={styles.rightCol}>
          <div className={styles.syncCard}>
            <div className={styles.syncHeaderRow}>
              <div className={styles.syncSectionTitle}>
                <RefreshCw size={18} className={syncState.isSyncing ? styles.spinnerLarge : ''} />
                <span>Local Outbox Sync Queue</span>
              </div>

              <button
                id="driver-toggle-online-btn"
                className={`${styles.networkToggleBtn} ${!syncState.isOnline ? styles.networkToggleOffline : ''}`}
                onClick={handleToggleOnline}
              >
                {syncState.isOnline ? (
                  <>
                    <Wifi size={14} color="#10B981" />
                    <span>Simulate Offline</span>
                  </>
                ) : (
                  <>
                    <WifiOff size={14} color="#DC2626" />
                    <span>Go Online</span>
                  </>
                )}
              </button>
            </div>

            {/* Sync Rejections / Conflicts */}
            {rejectedOrders.length > 0 && (
              <div className={styles.rejectionList}>
                {rejectedOrders.map((ro) => (
                  <div key={ro.id} className={styles.rejectionCard}>
                    <div className={styles.rejectionCardTitle}>
                      <AlertTriangle size={16} />
                      <span>Sync Conflict on {ro.id}</span>
                    </div>
                    <div className={styles.rejectionCardText}>
                      {ro.rejectionNotice?.message}
                    </div>
                    <button
                      className={styles.ackBtn}
                      onClick={() => driverSyncService.dismissRejectionNotice(ro.id)}
                    >
                      Acknowledge & Clear Notice
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Queue Items */}
            <div className={styles.outboxQueueList}>
              {outbox.length === 0 ? (
                <div className={styles.emptyOutboxBox}>
                  <CheckCircle2 size={32} color="#10B981" />
                  <div className={styles.emptyOutboxTitle}>Outbox is Empty & Fully Synced</div>
                  <div className={styles.emptyOutboxSub}>All driver origin writes are committed to the cloud backend.</div>
                </div>
              ) : (
                outbox.map((item) => (
                  <div key={item.id} className={styles.outboxItemCard}>
                    <div>
                      <span className={styles.outboxOrderId}>{item.orderId}</span>
                      <span className={styles.outboxAction}> · {item.actionType}</span>
                    </div>
                    <div>
                      <span
                        className={`${styles.outboxPill} ${
                          item.status === 'synced'
                            ? styles.outboxSynced
                            : item.status === 'rejected'
                            ? styles.outboxRejected
                            : styles.outboxPending
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Sync Actions Row */}
            <div className={styles.syncActionsRow}>
              <button
                id="driver-sync-now-btn"
                className={styles.syncNowBtn}
                onClick={handleManualSync}
                disabled={syncState.isSyncing || !syncState.isOnline}
              >
                <RefreshCw size={15} />
                <span>Sync Outbox Now</span>
              </button>

              <button
                id="driver-simulate-conflict-btn"
                className={styles.simConflictBtn}
                onClick={handleSimulateConflict}
                title="Demonstrate how offline rejections and conflicts are handled"
              >
                Simulate Conflict
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Purging State Overlay */}
      {isPurgingLogout && (
        <div className={styles.purgingOverlay}>
          <Loader2 size={48} className={styles.spinnerLarge} />
          <div style={{ color: '#111827', fontWeight: 800, fontSize: '1.25rem' }}>
            Purging Local PHI & Ending Shift...
          </div>
          <div style={{ color: '#6B7280', fontSize: '0.875rem' }}>
            Wiping local storage cache buffers and signing out Marcus Vance.
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverAccountTab;
