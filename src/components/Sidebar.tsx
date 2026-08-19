import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Truck, 
  Store, 
  Users, 
  Map, 
  CreditCard, 
  ShieldCheck, 
  Settings,
  MoreVertical,
  CheckCircle2
} from 'lucide-react';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  return (
    <aside className={styles.sidebar}>
      {/* Brand Block */}
      <div className={styles.brandBlock}>
        <div className={styles.logoMark}>R</div>
        <div className={styles.brandText}>
          <span className={styles.brandName}>Rahhawan</span>
          <span className={styles.portalType}>Master Portal / Super Admin</span>
        </div>
      </div>

      {/* Navigation Container */}
      <nav className={styles.navContainer}>
        <div className={styles.navSection}>
          <div className={styles.sectionLabel}>Overview</div>
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <LayoutDashboard className={styles.navIcon} size={18} />
            <span className={styles.navLabel}>Dashboard</span>
          </NavLink>
        </div>

        <div className={styles.navSection}>
          <div className={styles.sectionLabel}>Operations</div>
          <NavLink 
            to="/deliveries" 
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <Truck className={styles.navIcon} size={18} />
            <span className={styles.navLabel}>Deliveries</span>
            <span className={styles.navBadge}>12</span>
          </NavLink>
          <NavLink 
            to="/pharmacies" 
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <Store className={styles.navIcon} size={18} />
            <span className={styles.navLabel}>Pharmacies</span>
          </NavLink>
          <NavLink 
            to="/drivers" 
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <Users className={styles.navIcon} size={18} />
            <span className={styles.navLabel}>Drivers</span>
          </NavLink>
          <NavLink 
            to="/route4me" 
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <Map className={styles.navIcon} size={18} />
            <span className={styles.navLabel}>Route4Me Export</span>
          </NavLink>
        </div>

        <div className={styles.navSection}>
          <div className={styles.sectionLabel}>Business</div>
          <NavLink 
            to="/billing" 
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <CreditCard className={styles.navIcon} size={18} />
            <span className={styles.navLabel}>Billing</span>
          </NavLink>
        </div>

        <div className={styles.navSection}>
          <div className={styles.sectionLabel}>System</div>
          <NavLink 
            to="/access" 
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <ShieldCheck className={styles.navIcon} size={18} />
            <span className={styles.navLabel}>User & Role Access</span>
          </NavLink>
          <NavLink 
            to="/settings" 
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <Settings className={styles.navIcon} size={18} />
            <span className={styles.navLabel}>Settings</span>
          </NavLink>
        </div>
      </nav>

      {/* Account Block */}
      <div className={styles.accountBlock}>
        <div className={styles.avatar}>
          SJ
          <div className={styles.mfaBadge}>
            <CheckCircle2 size={10} color="white" />
          </div>
        </div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>Sarah Jenkins</span>
          <span className={styles.userRole}>Super Admin</span>
        </div>
        <MoreVertical size={16} color="var(--color-sidebar-text)" />
      </div>
    </aside>
  );
};

export default Sidebar;
