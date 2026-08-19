import { Plus, MoreVertical, Edit2, Lock } from 'lucide-react';
import styles from './Tenants.module.css';

const MOCK_TENANTS = [
  { id: 'TN-001', name: 'PharmaPlus', status: 'Active', plan: 'Enterprise', users: 45 },
  { id: 'TN-002', name: 'HealthHub Rx', status: 'Active', plan: 'Professional', users: 12 },
  { id: 'TN-003', name: 'CityCare Pharmacy', status: 'Suspended', plan: 'Basic', users: 5 },
  { id: 'TN-004', name: 'QuickMeds', status: 'Active', plan: 'Enterprise', users: 112 },
];

const Tenants = () => {
  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Tenants & Pharmacies</h1>
          <p className={styles.subtitle}>Manage all pharmacy organizations within the platform.</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} />
          <span>Add New Tenant</span>
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tenant ID</th>
                <th>Name</th>
                <th>Status</th>
                <th>Subscription Plan</th>
                <th>Users</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_TENANTS.map((tenant) => (
                <tr key={tenant.id}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>{tenant.id}</td>
                  <td style={{ fontWeight: 500 }}>{tenant.name}</td>
                  <td>
                    <span className={`badge badge-${tenant.status === 'Active' ? 'success' : 'danger'}`}>
                      {tenant.status}
                    </span>
                  </td>
                  <td>{tenant.plan}</td>
                  <td>{tenant.users}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className={styles.actionBtn} aria-label="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button className={styles.actionBtn} aria-label="Permissions">
                        <Lock size={16} />
                      </button>
                      <button className={styles.actionBtn} aria-label="More">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Tenants;
