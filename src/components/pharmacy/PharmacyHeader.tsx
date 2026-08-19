import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  Package,
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  User,
} from 'lucide-react';
import { PHARMACY_TENANT, PHARMACY_STAFF, PHARMACY_NOTIFICATIONS, PHARMACY_DELIVERIES } from '../../mock/pharmacyMockData';
import { useAuth } from '../../context/AuthContext';
import styles from './PharmacyHeader.module.css';

interface PharmacyHeaderProps {
  onMenuClick?: () => void;
  pageTitle?: string;
}

const PharmacyHeader: React.FC<PharmacyHeaderProps> = ({ onMenuClick, pageTitle = 'Dashboard' }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState(PHARMACY_NOTIFICATIONS);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSearch = PHARMACY_DELIVERIES.filter((order) => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    return (
      order.id.toLowerCase().includes(q) ||
      order.patientInitials.toLowerCase().includes(q) ||
      order.patientSafeId.toLowerCase().includes(q) ||
      order.prescriptionSummary.description.toLowerCase().includes(q)
    );
  });

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <header className={styles.header}>
      {/* Left Section */}
      <div className={styles.leftSection}>
        <button className={styles.mobileMenuBtn} onClick={onMenuClick} aria-label="Open Navigation">
          <Menu size={20} />
        </button>
        <div className={styles.contextTitle}>
          <span className={styles.roleLabel}>Pharmacy Portal</span>
          <h1 className={styles.pageTitle}>{pageTitle}</h1>
        </div>
      </div>

      {/* Right Section */}
      <div className={styles.rightSection}>
        {/* Tenant-Scoped Search */}
        <div className={styles.searchContainer} ref={searchRef}>
          <div className="input" style={{ position: 'relative' }}>
            <Search size={16} color="var(--color-text-muted)" />
            <input
              type="text"
              placeholder="Search your orders, patients..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <X size={14} color="var(--color-text-muted)" />
              </button>
            )}
          </div>

          {searchOpen && searchQuery.trim().length > 0 && (
            <div className={styles.searchDropdown}>
              <div className={styles.dropdownHeader}>
                <span>Results for "{searchQuery}"</span>
                <span className={styles.badgeCount}>{filteredSearch.length} found</span>
              </div>
              <div className={styles.searchResultsList}>
                {filteredSearch.length === 0 ? (
                  <div className={styles.emptySearch}>
                    <p>No matching orders in your pharmacy.</p>
                  </div>
                ) : (
                  filteredSearch.map((order) => (
                    <div
                      key={order.id}
                      className={styles.searchResultItem}
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery('');
                        navigate('/pharmacy/deliveries');
                      }}
                    >
                      <div className={styles.searchResultIcon}>
                        <Package size={16} />
                      </div>
                      <div className={styles.searchResultText}>
                        <div className={styles.searchResultTitle}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{order.id}</span>
                          {' — '}
                          {order.prescriptionSummary.description.substring(0, 40)}...
                        </div>
                        <div className={styles.searchResultSubtitle}>
                          Patient {order.patientInitials} ({order.patientSafeId}) • {order.status}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            className={styles.iconBtn}
            onClick={() => setNotifOpen(!notifOpen)}
            aria-label="Notifications"
            title="Pharmacy Alerts & Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className={styles.notificationBadge}>{unreadCount}</span>
            )}
          </button>

          {notifOpen && (
            <div className={styles.notifDropdown}>
              <div className={styles.notifHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Pharmacy Alerts</span>
                  {unreadCount > 0 && (
                    <span className="badge badge-red">{unreadCount} New</span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button className={styles.markReadBtn} onClick={markAllRead}>
                    Mark all read
                  </button>
                )}
              </div>

              <div className={styles.notifList}>
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`${styles.notifItem} ${n.unread ? styles.notifUnread : ''}`}
                    onClick={() => {
                      setNotifOpen(false);
                      navigate(n.link);
                    }}
                  >
                    <div className={styles.notifIcon}>
                      {n.type === 'warning' ? (
                        <AlertTriangle size={16} color="var(--color-amber)" />
                      ) : (
                        <CheckCircle2 size={16} color="var(--color-teal)" />
                      )}
                    </div>
                    <div className={styles.notifContent}>
                      <div className={styles.notifTitle}>{n.title}</div>
                      <div className={styles.notifDesc}>{n.description}</div>
                      <div className={styles.notifTime}>{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.notifFooter}>
                <Link
                  to="/pharmacy/deliveries"
                  className={styles.viewAllLink}
                  onClick={() => setNotifOpen(false)}
                >
                  View All Deliveries →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile Chip */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <div
            className={styles.adminChip}
            onClick={() => setProfileOpen(!profileOpen)}
            role="button"
            tabIndex={0}
          >
            <div className={styles.chipAvatar}>{PHARMACY_STAFF.initials}</div>
            <span className={styles.chipName}>{PHARMACY_STAFF.name.split(' ')[1]}</span>
            <ChevronDown size={14} color="var(--color-text-muted)" />
          </div>

          {profileOpen && (
            <div className={styles.profileDropdown}>
              <div className={styles.profileHeader}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{PHARMACY_STAFF.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {PHARMACY_STAFF.email}
                </div>
                <span className="badge badge-teal" style={{ alignSelf: 'flex-start', marginTop: '0.25rem' }}>
                  {PHARMACY_STAFF.role}
                </span>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                  {PHARMACY_TENANT.name}
                </div>
              </div>

              <div className={styles.profileLinks}>
                <Link
                  to="/pharmacy/deliveries"
                  className={styles.profileLinkItem}
                  onClick={() => setProfileOpen(false)}
                >
                  <Package size={16} />
                  <span>My Deliveries</span>
                </Link>
                <Link
                  to="/pharmacy/billing"
                  className={styles.profileLinkItem}
                  onClick={() => setProfileOpen(false)}
                >
                  <User size={16} />
                  <span>Account & Billing</span>
                </Link>
                <div className={styles.divider} />
                <button
                  className={styles.profileLinkItem}
                  style={{ color: 'var(--color-red)', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                    navigate('/login', { replace: true });
                  }}
                >
                  <LogOut size={16} />
                  <span>Session Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default PharmacyHeader;
