import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  CreditCard,
  ShieldCheck,
  User,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { PHARMACY_TENANT, PHARMACY_STAFF } from '../../mock/pharmacyMockData';
import styles from './PharmacySidebar.module.css';

const PharmacySidebar = () => {
  return (
    <aside className={styles.sidebar}>
      {/* Brand Block */}
      <div className={styles.brandBlock}>
        <div className={styles.logoMark}>R</div>
        <div className={styles.brandText}>
          <span className={styles.brandName}>Rahhawan</span>
          <span className={styles.tenantLabel}>{PHARMACY_TENANT.name}</span>
        </div>
      </div>

      {/* Primary CTA */}
      <div className={styles.ctaWrapper}>
        <NavLink to="/pharmacy/new-order" className={styles.ctaButton}>
          <Plus size={16} />
          <span>New Delivery Order</span>
        </NavLink>
      </div>

      {/* Navigation Container */}
      <nav className={styles.navContainer}>
        <div className={styles.navSection}>
          <NavLink
            to="/pharmacy/dashboard"
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <LayoutDashboard className={styles.navIcon} size={18} />
            <span className={styles.navLabel}>Dashboard</span>
          </NavLink>
          <NavLink
            to="/pharmacy/deliveries"
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <Package className={styles.navIcon} size={18} />
            <span className={styles.navLabel}>Deliveries</span>
          </NavLink>
          <NavLink
            to="/pharmacy/billing"
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <CreditCard className={styles.navIcon} size={18} />
            <span className={styles.navLabel}>Billing</span>
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
      <Link to="/pharmacy/dashboard" className={styles.accountBlock} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className={styles.avatar}>
          <User size={20} color="#8A9BA8" />
        </div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{PHARMACY_STAFF.name}</span>
          <span className={styles.userRole}>PHARMACY ADMIN</span>
          <span className={styles.tenantContext}>{PHARMACY_TENANT.name}</span>
        </div>
        <ChevronRight size={16} color="#4B5E6D" className={styles.chevronIcon} />
      </Link>
    </aside>
  );
};

export default PharmacySidebar;
