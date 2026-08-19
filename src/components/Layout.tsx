import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, Settings, Bell, Search } from 'lucide-react';
import styles from './Layout.module.css';

const Layout = () => {
  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logoArea}>
          <span className={`${styles.logoText} text-gradient`}>Rahhawan Master</span>
        </div>
        <nav className={styles.nav}>
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
          >
            <LayoutDashboard size={20} />
            <span>Overview</span>
          </NavLink>
          <NavLink 
            to="/tenants" 
            className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
          >
            <Building2 size={20} />
            <span>Tenants & Pharmacies</span>
          </NavLink>
          <NavLink 
            to="/users" 
            className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
          >
            <Users size={20} />
            <span>User Management</span>
          </NavLink>
        </nav>
        
        {/* Settings at bottom */}
        <div className={styles.nav} style={{ flex: 'none', borderTop: '1px solid var(--color-border)' }}>
          <NavLink 
            to="/settings" 
            className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
          >
            <Settings size={20} />
            <span>Platform Settings</span>
          </NavLink>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.searchBar}>
            <Search size={18} color="var(--color-text-muted)" />
            <input 
              type="text" 
              placeholder="Search across all tenants..." 
              className={styles.searchInput} 
            />
          </div>
          
          <div className={styles.headerActions}>
            <button className={styles.iconBtn} aria-label="Notifications">
              <Bell size={20} />
            </button>
            
            <div className={styles.userProfile}>
              <div className={styles.avatar}>SA</div>
              <div>
                <div className={styles.userName}>Super Admin</div>
                <div className={styles.userRole}>System Operator</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className={styles.contentArea}>
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
