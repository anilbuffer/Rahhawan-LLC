import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import PharmacySidebar from './PharmacySidebar';
import PharmacyHeader from './PharmacyHeader';
import layoutStyles from '../Layout.module.css';

const PharmacyLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Derive page title from path
  const getPageTitle = () => {
    const path = location.pathname.replace('/pharmacy/', '').replace('/pharmacy', '');
    if (!path || path === 'dashboard') return 'Dashboard';
    if (path === 'new-order') return 'New Delivery Order';
    if (path === 'deliveries') return 'Deliveries';
    if (path === 'billing') return 'Billing';
    return path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');
  };

  return (
    <div className={layoutStyles.layout}>
      {/* Mobile Drawer Scrim */}
      <div
        className={`${layoutStyles.drawerScrim} ${sidebarOpen ? layoutStyles.visible : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar Wrapper */}
      <div className={`${layoutStyles.sidebarWrapper} ${sidebarOpen ? layoutStyles.open : ''}`}>
        <PharmacySidebar />
      </div>

      {/* Main Content Area */}
      <div className={layoutStyles.mainWrapper}>
        <PharmacyHeader
          onMenuClick={() => setSidebarOpen(true)}
          pageTitle={getPageTitle()}
        />
        <main className={layoutStyles.contentArea}>
          <div className="animate-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PharmacyLayout;
