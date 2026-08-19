import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, MapPin, Clock, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './DriverSidebar.module.css';

const DriverSidebar = () => {
  const { user } = useAuth();

  return (
    <aside className={styles.sidebar}>
      {/* Brand */}
      <div className={styles.brandBlock}>
        <div className={styles.logoMark}>🚚</div>
        <div className={styles.brandText}>
          <span className={styles.brandName}>Rahhawan</span>
          <span className={styles.brandSub}>Driver Portal</span>
        </div>
      </div>

      {/* Nav */}
      <nav className={styles.navContainer}>
        <div className={styles.sectionLabel}>Overview</div>
        <NavLink
          to="/driver/dashboard"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <LayoutDashboard className={styles.navIcon} size={17} />
          <span>Dashboard</span>
        </NavLink>

        <div className={styles.sectionLabel}>Deliveries</div>
        <NavLink
          to="/driver/assigned"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <Package className={styles.navIcon} size={17} />
          <span>Assigned Orders</span>
        </NavLink>
        <NavLink
          to="/driver/route"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <MapPin className={styles.navIcon} size={17} />
          <span>My Route</span>
        </NavLink>
        <NavLink
          to="/driver/history"
          className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
        >
          <Clock className={styles.navIcon} size={17} />
          <span>Delivery History</span>
        </NavLink>
      </nav>

      {/* Account */}
      <div className={styles.accountBlock}>
        <div className={styles.avatar}>{user?.initials ?? 'MV'}</div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{user?.name ?? 'Marcus Vance'}</span>
          <span className={styles.userRole}>Courier Driver</span>
        </div>
      </div>
    </aside>
  );
};

export default DriverSidebar;
