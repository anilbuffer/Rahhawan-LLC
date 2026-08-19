import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Plus,
  ChevronDown,
  Package,
  Building2,
  Users,
  ShieldCheck,
  Settings as SettingsIcon,
  LogOut,
  X,
  Clock,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import styles from './Header.module.css';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onMenuClick?: () => void;
  pageTitle?: string;
}

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  category: 'Deliveries' | 'Pharmacies' | 'Drivers' | 'Access';
  link: string;
}

const SEARCH_ITEMS: SearchResult[] = [
  { id: 'ORD-9842', title: 'ORD-9842 — Morphine Sulfate C-II', subtitle: 'Patient J.D. (PT-88210) • Northgate Infusion', category: 'Deliveries', link: '/deliveries' },
  { id: 'ORD-9840', title: 'ORD-9840 — Insulin Glargine Cold-Chain', subtitle: 'Patient R.S. (PT-44910) • Metro Specialty', category: 'Deliveries', link: '/deliveries' },
  { id: 'ORD-9839', title: 'ORD-9839 — Ketamine HCl Infusion (Held)', subtitle: 'Patient M.K. (PT-12940) • Northgate Infusion', category: 'Deliveries', link: '/deliveries' },
  { id: 'PHARM-01', title: 'Northgate Infusion Pharmacy', subtitle: 'DEA License DN-9948218-A • 14 Active Loads', category: 'Pharmacies', link: '/pharmacies' },
  { id: 'PHARM-02', title: 'HealthLink Compounding Center', subtitle: 'DEA License DN-8491024-C • 28 Active Loads', category: 'Pharmacies', link: '/pharmacies' },
  { id: 'DRV-101', title: 'Marcus Vance (Driver)', subtitle: 'Toyota Prius • Active Transit • 4.95 ★', category: 'Drivers', link: '/drivers' },
  { id: 'DRV-102', title: 'Elena Rostova (Driver)', subtitle: 'Honda CR-V Refrigerated • Active Transit', category: 'Drivers', link: '/drivers' },
  { id: 'USR-001', title: 'Sarah Jenkins (Super Admin)', subtitle: 'Platform HQ • Active MFA', category: 'Access', link: '/access' },
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'Northgate DEA License Expired',
    description: 'Automated compliance check flagged DEA 222 authorization required.',
    time: '1h ago',
    type: 'critical',
    link: '/pharmacies',
    unread: true,
  },
  {
    id: 'n2',
    title: 'SLA Near Breach: ORD-9841',
    description: 'Driver Elena Rostova ETA 12 mins. Window expires in 18 mins.',
    time: '25m ago',
    type: 'warning',
    link: '/deliveries',
    unread: true,
  },
  {
    id: 'n3',
    title: 'Route4Me Route Batch Ready',
    description: '8 active orders formatted with verified HIPAA safe addresses.',
    time: '45m ago',
    type: 'info',
    link: '/route4me',
    unread: true,
  },
];

const Header: React.FC<HeaderProps> = ({ onMenuClick, pageTitle = "Dashboard" }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Dropdown states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const searchRef = useRef<HTMLDivElement>(null);
  const createRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (createRef.current && !createRef.current.contains(e.target as Node)) {
        setCreateMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSearch = SEARCH_ITEMS.filter((item) => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleQuickCreate = (targetRoute: string) => {
    setCreateMenuOpen(false);
    navigate(targetRoute);
  };

  return (
    <header className={styles.header}>
      {/* Left Section */}
      <div className={styles.leftSection}>
        <button className={styles.mobileMenuBtn} onClick={onMenuClick} aria-label="Open Navigation">
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
        <div className={styles.searchContainer} ref={searchRef}>
          <div className="input" style={{ position: 'relative' }}>
            <Search size={16} color="var(--color-text-muted)" />
            <input
              type="text"
              placeholder="Search orders, pharmacies, drivers..."
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

          {/* Search Results Dropdown */}
          {searchOpen && searchQuery.trim().length > 0 && (
            <div className={styles.searchDropdown}>
              <div className={styles.dropdownHeader}>
                <span>Search Results for "{searchQuery}"</span>
                <span className={styles.badgeCount}>{filteredSearch.length} found</span>
              </div>
              <div className={styles.searchResultsList}>
                {filteredSearch.length === 0 ? (
                  <div className={styles.emptySearch}>
                    <p>No matching deliveries, pharmacies, or drivers.</p>
                  </div>
                ) : (
                  filteredSearch.map((item) => (
                    <div
                      key={item.id}
                      className={styles.searchResultItem}
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery('');
                        navigate(item.link);
                      }}
                    >
                      <div className={styles.searchResultIcon}>
                        {item.category === 'Deliveries' && <Package size={16} />}
                        {item.category === 'Pharmacies' && <Building2 size={16} />}
                        {item.category === 'Drivers' && <Users size={16} />}
                        {item.category === 'Access' && <ShieldCheck size={16} />}
                      </div>
                      <div className={styles.searchResultText}>
                        <div className={styles.searchResultTitle}>{item.title}</div>
                        <div className={styles.searchResultSubtitle}>{item.subtitle}</div>
                      </div>
                      <span className={styles.searchCategoryBadge}>{item.category}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Create Button & Dropdown */}
        <div style={{ position: 'relative' }} ref={createRef}>
          <button
            className="btn btn-primary"
            onClick={() => setCreateMenuOpen(!createMenuOpen)}
            aria-expanded={createMenuOpen}
          >
            <Plus size={16} />
            <span>Create</span>
            <ChevronDown size={14} />
          </button>

          {createMenuOpen && (
            <div className={styles.menuDropdown}>
              <div className={styles.menuDropdownHeader}>Quick Create Actions</div>
              <button
                className={styles.menuItem}
                onClick={() => handleQuickCreate('/deliveries?new=true')}
              >
                <Package size={16} color="var(--color-teal)" />
                <div>
                  <div className={styles.menuItemTitle}>New Delivery Order</div>
                  <div className={styles.menuItemSub}>Dispatch Rx with DEA / cold-chain flag</div>
                </div>
              </button>

              <button
                className={styles.menuItem}
                onClick={() => handleQuickCreate('/pharmacies?new=true')}
              >
                <Building2 size={16} color="var(--color-blue)" />
                <div>
                  <div className={styles.menuItemTitle}>Onboard Pharmacy Hub</div>
                  <div className={styles.menuItemSub}>Register DEA license & dispensing hub</div>
                </div>
              </button>

              <button
                className={styles.menuItem}
                onClick={() => handleQuickCreate('/drivers?new=true')}
              >
                <Users size={16} color="var(--color-amber)" />
                <div>
                  <div className={styles.menuItemTitle}>Add Courier Driver</div>
                  <div className={styles.menuItemSub}>Verify HIPAA & Schedule II clearance</div>
                </div>
              </button>

              <button
                className={styles.menuItem}
                onClick={() => handleQuickCreate('/access?new=true')}
              >
                <ShieldCheck size={16} color="var(--color-teal)" />
                <div>
                  <div className={styles.menuItemTitle}>Invite Staff User</div>
                  <div className={styles.menuItemSub}>Configure granular RBAC permissions</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            className={styles.iconBtn}
            onClick={() => setNotifOpen(!notifOpen)}
            aria-label="Notifications"
            title="System Alerts & Notifications"
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
                  <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>System Alerts</span>
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
                      {n.type === 'critical' ? (
                        <AlertTriangle size={16} color="var(--color-red)" />
                      ) : n.type === 'warning' ? (
                        <Clock size={16} color="var(--color-amber)" />
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
                  to="/audit-logs"
                  className={styles.viewAuditLink}
                  onClick={() => setNotifOpen(false)}
                >
                  View Full HIPAA Audit Logs →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Admin Chip */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <div
            className={styles.adminChip}
            onClick={() => setProfileOpen(!profileOpen)}
            role="button"
            tabIndex={0}
          >
            <div className={styles.chipAvatar}>SJ</div>
            <span className={styles.chipName}>Sarah</span>
            <ChevronDown size={14} color="var(--color-text-muted)" />
          </div>

          {profileOpen && (
            <div className={styles.profileDropdown}>
              <div className={styles.profileHeader}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Sarah Jenkins</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  sarah.jenkins@rahhawan.com
                </div>
                <span className="badge badge-teal" style={{ alignSelf: 'flex-start', marginTop: '0.25rem' }}>
                  Super Admin
                </span>
              </div>

              <div className={styles.profileLinks}>
                <Link
                  to="/access"
                  className={styles.profileLinkItem}
                  onClick={() => setProfileOpen(false)}
                >
                  <Users size={16} />
                  <span>User & Role Access</span>
                </Link>
                <Link
                  to="/settings"
                  className={styles.profileLinkItem}
                  onClick={() => setProfileOpen(false)}
                >
                  <SettingsIcon size={16} />
                  <span>Compliance Settings</span>
                </Link>
                <Link
                  to="/audit-logs"
                  className={styles.profileLinkItem}
                  onClick={() => setProfileOpen(false)}
                >
                  <ShieldCheck size={16} />
                  <span>HIPAA Audit Trail</span>
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

export default Header;
