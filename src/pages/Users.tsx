import { Plus, MoreVertical, Edit2, ShieldAlert } from 'lucide-react';
import styles from './Tenants.module.css';

const MOCK_USERS = [
  { id: 'USR-001', name: 'Alice Admin', role: 'Super Admin', email: 'alice@rahhawan.com', status: 'Active' },
  { id: 'USR-002', name: 'Bob Pharmacist', role: 'Tenant Admin', email: 'bob@pharmaplus.com', status: 'Active' },
  { id: 'USR-003', name: 'Charlie Driver', role: 'Driver', email: 'charlie@delivery.com', status: 'Inactive' },
];

const Users = () => {
  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>User Management</h1>
          <p className={styles.subtitle}>Global oversight of Super Admins, Tenant Staff, and Drivers.</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} />
          <span>Invite User</span>
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Role</th>
                <th>Email</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_USERS.map((user) => (
                <tr key={user.id}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>{user.id}</td>
                  <td style={{ fontWeight: 500 }}>{user.name}</td>
                  <td>
                    <span className={`badge badge-${user.role === 'Super Admin' ? 'primary' : 'warning'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge badge-${user.status === 'Active' ? 'success' : 'danger'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className={styles.actionBtn} aria-label="Edit Role">
                        <ShieldAlert size={16} />
                      </button>
                      <button className={styles.actionBtn} aria-label="Edit">
                        <Edit2 size={16} />
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

export default Users;
