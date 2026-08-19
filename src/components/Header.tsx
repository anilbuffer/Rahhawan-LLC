import { Menu, Search, Bell, Plus, ChevronDown } from 'lucide-react';
import styles from './Header.module.css';

interface HeaderProps {
  onMenuClick?: () => void;
  pageTitle?: string;
}

const Header = ({ onMenuClick, pageTitle = "Dashboard" }: HeaderProps) => {
  return (
    <header className={styles.header}>
      {/* Left Section */}
      <div className={styles.leftSection}>
        <button className={styles.mobileMenuBtn} onClick={onMenuClick}>
          <Menu size={20} />
        </button>
        <div className={styles.contextTitle}>
          <span className={styles.roleLabel}>Super Admin</span>
          <h1 className={styles.pageTitle}>{pageTitle}</h1>
        </div>
      </div>

      {/* Right Section */}
      <div className={styles.rightSection}>
        {/* Global Search */}
        <div className={styles.searchContainer}>
          <div className="input">
            <Search size={16} color="var(--color-text-muted)" />
            <input type="text" placeholder="Search orders, pharmacies, drivers..." />
          </div>
        </div>

        {/* Quick Create Button */}
        <button className="btn btn-primary">
          <Plus size={16} />
          <span>Create</span>
        </button>

        {/* Notifications */}
        <button className={styles.iconBtn}>
          <Bell size={18} />
          <span className={styles.notificationBadge}>3</span>
        </button>

        {/* Admin Chip */}
        <div className={styles.adminChip}>
          <div className={styles.chipAvatar}>SJ</div>
          <span className={styles.chipName}>Sarah</span>
          <ChevronDown size={14} color="var(--color-text-muted)" />
        </div>
      </div>
    </header>
  );
};

export default Header;
