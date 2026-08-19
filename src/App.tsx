import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Deliveries from './pages/Deliveries';
import Pharmacies from './pages/Pharmacies';
import Drivers from './pages/Drivers';
import Billing from './pages/Billing';
import AccessControl from './pages/AccessControl';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="deliveries" element={<Deliveries />} />
          <Route path="pharmacies" element={<Pharmacies />} />
          <Route path="tenants" element={<Navigate to="/pharmacies" replace />} />
          <Route path="drivers" element={<Drivers />} />
          <Route path="billing" element={<Billing />} />
          <Route path="access" element={<AccessControl />} />
          <Route path="users" element={<Navigate to="/access" replace />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
