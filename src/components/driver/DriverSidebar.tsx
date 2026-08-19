import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  MapPin,
  Clock,
  User,
  ShieldCheck,
  Truck,
  Navigation,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { driverSyncService } from '../../services/driverSyncService';
import styles from './DriverSidebar.module.css';

export const DriverSidebar: React.FC = () => {
  const { user } = useAuth();
  const [syncState, setSyncState] = useState(driverSyncService.getSyncState());
  const [deliveries, setDeliveries] = useState(driverSyncService.getDeliveries());

  useEffect(() => {
    const unsub = driverSyncService.subscribe(() => {
      setSyncState(driverSyncService.getSyncState());
      setDeliveries(driverSyncService.getDeliveries());
    });
    return unsub;
  }, []);

  const activeStopsCount = deliveries.filter((d) => d.status !== 'Delivered' && d.status !== 'Failed').length;

  return (
    <aside className={styles.sidebar}>
      {/* Brand Block */}
      <div className={styles.brandBlock}>
        <div className={styles.logoMark}>
          <Truck size={20} />
        </div>
        <div className={styles.brandText}>
          <span className={styles.brandName}>Rahhawan</span>
          <span className={styles.portalTag}>Driver Portal</span>
        </div>
      </div>

      {/* Quick Launch CTA */}
      <div className={styles.ctaWrapper}>
        <NavLink to="/driver/route" className={styles.ctaButton}>
          <Navigation size={16} />
          <span>Active Route ({activeStopsCount})</span>
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className={styles.navContainer}>
        <div className={styles.navSection}>
          <div className={styles.sectionLabel}>Operations</div>

          <NavLink
            to="/driver/shift"
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <LayoutDashboard className={styles.navIcon} size={18} />
            <span className={styles.navLabel}>Today's Shift</span>
            <span className={styles.countBadge}>{deliveries.length}</span>
          </NavLink>

          <NavLink
            to="/driver/assigned"
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <Package className={styles.navIcon} size={18} />
            <span className={styles.navLabel}>Assigned Orders</span>
            {activeStopsCount > 0 && (
              <span className={`${styles.countBadge} ${styles.activeBadge}`}>{activeStopsCount}</span>
            )}
          </NavLink>

          <NavLink
            to="/driver/route"
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <MapPin className={styles.navIcon} size={18} />
            <span className={styles.navLabel}>My Route</span>
          </NavLink>
        </div>

        <div className={styles.navSection}>
          <div className={styles.sectionLabel}>Records & System</div>

          <NavLink
            to="/driver/history"
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <Clock className={styles.navIcon} size={18} />
            <span className={styles.navLabel}>Delivery History</span>
          </NavLink>

          <NavLink
            to="/driver/account"
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <RefreshCw className={styles.navIcon} size={18} />
            <span className={styles.navLabel}>Sync & Account</span>
            {!syncState.isOnline ? (
              <WifiOff size={14} color="#EF4444" />
            ) : syncState.pendingCount > 0 ? (
              <span className={styles.pendingDot} />
            ) : (
              <Wifi size={14} color="#10B981" />
            )}
          </NavLink>
        </div>
      </nav>

      {/* Compliance Block */}
      <div className={styles.complianceBlock}>
        <ShieldCheck className={styles.complianceIcon} size={20} />
        <div className={styles.complianceContent}>
          <div className={styles.complianceTitle}>DEA & Cold-Chain</div>
          <div className={styles.complianceText}>
            Schedule II Certified • Vehicle Temp: 38.5°F
          </div>
        </div>
      </div>

      {/* Account Block */}
      <NavLink to="/driver/account" className={styles.accountBlock}>
        <div className={styles.avatar}>{user?.initials ?? 'MV'}</div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{user?.name ?? 'Marcus Vance'}</span>
          <span className={styles.userRole}>Courier (DRV-101)</span>
          <span className={styles.vehicleInfo}>Toyota Prius • Box #4</span>
        </div>
      </NavLink>
    </aside>
  );
};

export default DriverSidebar;
