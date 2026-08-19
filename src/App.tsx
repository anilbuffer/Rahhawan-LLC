import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Page
import LoginPage from './pages/Login';

// Super Admin Portal
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Deliveries from './pages/Deliveries';
import Pharmacies from './pages/Pharmacies';
import Drivers from './pages/Drivers';
import Billing from './pages/Billing';
import AccessControl from './pages/AccessControl';
import Settings from './pages/Settings';
import Route4MeExport from './pages/Route4MeExport';
import AuditLogViewer from './pages/AuditLogViewer';

// Pharmacy Portal
import PharmacyLayout from './components/pharmacy/PharmacyLayout';
import PharmacyDashboard from './pages/pharmacy/PharmacyDashboard';
import NewDeliveryOrder from './pages/pharmacy/NewDeliveryOrder';
import PharmacyDeliveries from './pages/pharmacy/PharmacyDeliveries';
import PharmacyBilling from './pages/pharmacy/PharmacyBilling';

// Driver Portal
import DriverLayout from './components/driver/DriverLayout';
import DriverDashboard from './pages/driver/DriverDashboard';
import DriverAssigned from './pages/driver/DriverAssigned';
import DriverRoute from './pages/driver/DriverRoute';
import DriverHistory from './pages/driver/DriverHistory';
import DriverOrderDetail from './pages/driver/DriverOrderDetail';
import DriverAccountTab from './pages/driver/DriverAccountTab';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Super Admin Portal (Protected) */}
          <Route
            path="/"
            element={
              <ProtectedRoute role="super_admin">
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="deliveries" element={<Deliveries />} />
            <Route path="route4me" element={<Route4MeExport />} />
            <Route path="route-export" element={<Navigate to="/route4me" replace />} />
            <Route path="pharmacies" element={<Pharmacies />} />
            <Route path="tenants" element={<Navigate to="/pharmacies" replace />} />
            <Route path="drivers" element={<Drivers />} />
            <Route path="billing" element={<Billing />} />
            <Route path="access" element={<AccessControl />} />
            <Route path="users" element={<Navigate to="/access" replace />} />
            <Route path="audit-logs" element={<AuditLogViewer />} />
            <Route path="audit-log" element={<Navigate to="/audit-logs" replace />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Pharmacy Portal (Protected) */}
          <Route
            path="/pharmacy"
            element={
              <ProtectedRoute role="pharmacy">
                <PharmacyLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/pharmacy/dashboard" replace />} />
            <Route path="dashboard" element={<PharmacyDashboard />} />
            <Route path="new-order" element={<NewDeliveryOrder />} />
            <Route path="deliveries" element={<PharmacyDeliveries />} />
            <Route path="billing" element={<PharmacyBilling />} />
          </Route>

          {/* Driver Portal (Protected) */}
          <Route
            path="/driver"
            element={
              <ProtectedRoute role="driver">
                <DriverLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/driver/shift" replace />} />
            <Route path="shift" element={<DriverDashboard />} />
            <Route path="dashboard" element={<DriverDashboard />} />
            <Route path="assigned" element={<DriverAssigned />} />
            <Route path="route" element={<DriverRoute />} />
            <Route path="history" element={<DriverHistory />} />
            <Route path="search" element={<DriverDashboard />} />
            <Route path="order/:orderId" element={<DriverOrderDetail />} />
            <Route path="account" element={<DriverAccountTab />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
