import { Outlet } from 'react-router-dom';
import DriverSidebar from './DriverSidebar';
import DriverHeader from './DriverHeader';

const DriverLayout = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0d1117' }}>
      <DriverSidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <DriverHeader />
        <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DriverLayout;
