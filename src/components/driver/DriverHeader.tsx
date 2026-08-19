import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, Navigation, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './DriverHeader.module.css';

interface DriverHeaderProps {
  onMenuClick?: () => void;
  pageTitle?: string;
}

const DriverHeader: React.FC<DriverHeaderProps> = ({ onMenuClick, pageTitle = 'Dashboard' }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

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
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className={styles.header}>
      {/* Left */}
      <div className={styles.leftSection}>
        <div className={styles.contextTitle}>
          <span className={styles.roleLabel}>🚚 Driver Portal</span>
          <h1 className={styles.pageTitle}>{pageTitle}</h1>
        </div>
      </div>

      {/* Right */}
      <div className={styles.rightSection}>
        <button className={styles.iconBtn} aria-label="Notifications">
          <Bell size={17} />
        </button>

        {/* Profile */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <div
            className={styles.adminChip}
            onClick={() => setProfileOpen(!profileOpen)}
            role="button"
            tabIndex={0}
          >
            <div className={styles.chipAvatar}>{user?.initials ?? 'MV'}</div>
            <span className={styles.chipName}>{user?.name?.split(' ')[0] ?? 'Marcus'}</span>
            <ChevronDown size={14} color="rgba(255,255,255,0.4)" />
          </div>

          {profileOpen && (
            <div className={styles.profileDropdown}>
              <div className={styles.profileHeader}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{user?.name ?? 'Marcus Vance'}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{user?.email}</div>
                <span
                  className="badge"
                  style={{
                    background: 'rgba(245,158,11,0.15)',
                    color: '#F59E0B',
                    alignSelf: 'flex-start',
                    marginTop: '0.25rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: 999,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                  }}
                >
                  Courier Driver
                </span>
              </div>

              <div className={styles.profileLinks}>
                <button className={styles.profileLinkItem} onClick={() => { setProfileOpen(false); navigate('/driver/assigned'); }}>
                  <Package size={15} />
                  <span>Assigned Orders</span>
                </button>
                <button className={styles.profileLinkItem} onClick={() => { setProfileOpen(false); navigate('/driver/route'); }}>
                  <Navigation size={15} />
                  <span>My Route</span>
                </button>
                <div className={styles.divider} />
                <button
                  className={styles.profileLinkItem}
                  style={{ color: '#EF4444' }}
                  onClick={handleLogout}
                >
                  <LogOut size={15} />
                  <span>Logout</span>
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
