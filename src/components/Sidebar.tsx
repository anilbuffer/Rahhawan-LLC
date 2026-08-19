import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Building2, 
  Users, 
  CreditCard, 
  UserCheck, 
  Settings,
  ShieldCheck,
  User,
  ChevronDown
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
        </div>
      </div>

      {/* Navigation Container */}
      <nav className={styles.navContainer}>
        <div className={styles.navSection}>
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <LayoutDashboard className={styles.navIcon} size={18} />
            <span className={styles.navLabel}>Dashboard</span>
          </NavLink>
        </div>

        <div className={styles.navSection}>
          <div className={styles.sectionLabel}>OPERATIONS</div>
          <NavLink 
            to="/deliveries" 
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <Package className={styles.navIcon} size={18} />
            <span className={styles.navLabel}>Deliveries</span>
          </NavLink>
          <NavLink 
            to="/pharmacies" 
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <Building2 className={styles.navIcon} size={18} />
            <span className={styles.navLabel}>Pharmacies</span>
          </NavLink>
          <NavLink 
            to="/drivers" 
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <Users className={styles.navIcon} size={18} />
            <span className={styles.navLabel}>Drivers</span>
          </NavLink>
        </div>

        <div className={styles.navSection}>
          <div className={styles.sectionLabel}>BUSINESS</div>
          <NavLink 
            to="/billing" 
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <CreditCard className={styles.navIcon} size={18} />
            <span className={styles.navLabel}>Billing</span>
          </NavLink>
        </div>

        <div className={styles.navSection}>
          <div className={styles.sectionLabel}>COMPLIANCE & QUALITY</div>
          <NavLink 
            to="/access" 
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <UserCheck className={styles.navIcon} size={18} />
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

      {/* Compliance Block */}
      <div className={styles.complianceBlock}>
        <ShieldCheck className={styles.complianceIcon} size={20} />
        <div className={styles.complianceContent}>
          <span className={styles.complianceTitle}>HIPAA Compliant</span>
          <span className={styles.complianceText}>Data encrypted in transit and at rest.</span>
        </div>
      </div>

      {/* Account Block */}
      <div className={styles.accountBlock}>
        <div className={styles.avatar}>
          <User size={20} color="#8A9BA8" />
        </div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>Admin User</span>
          <span className={styles.userRole}>ADMIN</span>
        </div>
        <ChevronDown size={16} color="#4B5E6D" className={styles.chevronIcon} />
      </div>
    </aside>
  );
};

export default Sidebar;
