import { Outlet, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, HeartPulse, Calendar, Users2, 
  CreditCard, ShieldAlert, CheckSquare, Activity, 
  BookOpen, UserPlus, MessageSquare, PieChart, 
  Search, Bell, ChevronDown, CheckCircle2, ShieldCheck
} from 'lucide-react';
import styles from './Layout.module.css';

const Layout = () => {
  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logoArea}>
          <div className={styles.logoIcon}>R</div>
          <span className={styles.logoText}>Rahhawan Care</span>
        </div>
        
        <nav className={styles.nav}>
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink 
            to="/users" 
            className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
          >
            <Users size={18} />
            <span>User Management</span>
          </NavLink>
          <NavLink 
            to="/tenants" 
            className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
          >
            <HeartPulse size={18} />
            <span>Patients</span>
          </NavLink>
          
          <div className={styles.navSection}>Compliance & Quality</div>
          
          <NavLink 
            to="/incident-risk" 
            className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
          >
            <ShieldAlert size={18} />
            <span>Incident & Risk</span>
          </NavLink>
          <NavLink 
            to="/compliance" 
            className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
          >
            <CheckSquare size={18} />
            <span>Compliance Tracking</span>
          </NavLink>
          <NavLink 
            to="/evv" 
            className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
          >
            <Activity size={18} />
            <span>EVV Compliance</span>
          </NavLink>
          
          <div className={styles.navSection}>Talent & Growth</div>
          
          <NavLink 
            to="/training" 
            className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
          >
            <BookOpen size={18} />
            <span>Training (LMS)</span>
          </NavLink>
          <NavLink 
            to="/referrals" 
            className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
          >
            <UserPlus size={18} />
            <span>Referrals & Intake</span>
          </NavLink>
        </nav>
        
        {/* User Profile Area */}
        <div className={styles.userProfileSidebar}>
          <div className={styles.hipaaBox}>
            <ShieldCheck size={20} color="var(--color-primary)" style={{flexShrink: 0}} />
            <div>
              <div className={styles.hipaaTitle}>HIPAA Compliant</div>
              <div className={styles.hipaaText}>Data encrypted in transit and at rest.</div>
            </div>
          </div>
          
          <div className={styles.userInfo}>
            <div style={{display: 'flex', gap: '0.75rem', alignItems: 'center'}}>
              <div className={styles.userAvatar}>SJ</div>
              <div>
                <div className={styles.userName}>Sarah Jenkins</div>
                <div className={styles.userRole}>Admin</div>
              </div>
            </div>
            <ChevronDown size={16} color="var(--color-sidebar-text)" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.pageTitleContainer}>
            <button className={styles.sidebarToggle} aria-label="Toggle Menu">
              <LayoutDashboard size={20} />
            </button>
            <h1 className={styles.pageTitle}>Dashboard</h1>
          </div>
          
          <div className={styles.headerActions}>
            <div className={styles.searchBar}>
              <Search size={16} color="var(--color-text-muted)" />
              <input 
                type="text" 
                placeholder="Search medications..." 
                className={styles.searchInput} 
              />
              <div className={styles.searchTags}>
                <span className={`${styles.tag} ${styles.tagGlobal}`}>⌘ GLOBAL</span>
                <span className={`${styles.tag} ${styles.tagKey}`}>⌘ K</span>
              </div>
            </div>
            
            <button className={styles.iconBtn} aria-label="Notifications">
              <Bell size={18} />
            </button>
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
