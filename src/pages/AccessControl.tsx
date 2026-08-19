import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  Lock,
  User,
  CheckCircle,
  MoreVertical,
  Edit2,
  ShieldAlert,
  Key
} from 'lucide-react';

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Tenant Admin' | 'Compliance Officer' | 'Dispatcher' | 'Driver';
  organization: string;
  mfaEnabled: boolean;
  lastActive: string;
  status: 'Active' | 'Suspended';
}

const MOCK_USERS: SystemUser[] = [
  {
    id: 'USR-001',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@rahhawan.com',
    role: 'Super Admin',
    organization: 'Rahhawan Platform HQ',
    mfaEnabled: true,
    lastActive: '5 mins ago',
    status: 'Active',
  },
  {
    id: 'USR-002',
    name: 'Dr. Rebecca Vance',
    email: 'rebecca@northgate-infusion.com',
    role: 'Tenant Admin',
    organization: 'Northgate Infusion Rx',
    mfaEnabled: true,
    lastActive: '18 mins ago',
    status: 'Active',
  },
  {
    id: 'USR-003',
    name: 'Marcus Sterling, RPh',
    email: 'msterling@healthlinkrx.com',
    role: 'Compliance Officer',
    organization: 'HealthLink Compounding',
    mfaEnabled: true,
    lastActive: '1 hour ago',
    status: 'Active',
  },
  {
    id: 'USR-004',
    name: 'Alex Rivera',
    email: 'arivera@rahhawan.com',
    role: 'Dispatcher',
    organization: 'Rahhawan Platform HQ',
    mfaEnabled: true,
    lastActive: 'Just now',
    status: 'Active',
  },
  {
    id: 'USR-005',
    name: 'Marcus Vance',
    email: 'marcus.v@rahhawandriver.com',
    role: 'Driver',
    organization: 'Courier Fleet Tier 1',
    mfaEnabled: true,
    lastActive: '3 mins ago',
    status: 'Active',
  },
];

export const AccessControl: React.FC = () => {
  const [users, setUsers] = useState<SystemUser[]>(MOCK_USERS);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  const filtered = users.filter((u) => {
    if (selectedRole !== 'all' && u.role !== selectedRole) return false;
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.organization.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>User & Role-Based Access Control</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Granular permissions matrix, HIPAA credentialing, and multi-tenant authentication logs.
          </p>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} />
          <span>Invite New User</span>
        </button>
      </div>

      {/* Security Banner */}
      <div className="card" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, #111827 0%, #1E293B 100%)', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(14, 163, 131, 0.2)', color: 'var(--color-teal)' }}>
            <ShieldCheck size={28} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#F3F4F6' }}>
              Enforced Multi-Factor Authentication (MFA) & HIPAA Role Segmentation
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
              100% of staff accounts verified with hardware/TOTP MFA. PHI access is strictly masked based on minimal-necessary principle.
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div className="input" style={{ flex: 1, maxWidth: 360 }}>
            <Search size={16} color="var(--color-text-muted)" />
            <input
              type="text"
              placeholder="Search user name, email, organization..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['all', 'Super Admin', 'Tenant Admin', 'Compliance Officer', 'Dispatcher', 'Driver'].map((role) => (
              <button
                key={role}
                className={`btn btn-${selectedRole === role ? 'primary' : 'secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.625rem' }}
                onClick={() => setSelectedRole(role)}
              >
                {role === 'all' ? 'All Roles' : role}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>User & Email</th>
                <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Assigned Role</th>
                <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Organization</th>
                <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>MFA Security</th>
                <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Last Active</th>
                <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.75rem' }}>
                        {user.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{user.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{user.email}</div>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span
                      className={`badge badge-${
                        user.role === 'Super Admin'
                          ? 'teal'
                          : user.role === 'Tenant Admin'
                          ? 'blue'
                          : user.role === 'Compliance Officer'
                          ? 'amber'
                          : 'grey'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td style={{ padding: '1rem 1.25rem', color: 'var(--color-text-secondary)' }}>
                    {user.organization}
                  </td>

                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span className="badge badge-teal">
                      <Lock size={11} /> 2FA Active
                    </span>
                  </td>

                  <td style={{ padding: '1rem 1.25rem', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                    {user.lastActive}
                  </td>

                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span className="badge badge-teal">Active</span>
                  </td>

                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
                      <button className="btn btn-secondary" style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem' }} title="Permissions">
                        <Key size={13} />
                      </button>
                      <button className="btn btn-secondary" style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem' }} title="Edit">
                        <Edit2 size={13} />
                      </button>
                      <button className="btn btn-secondary" style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}>
                        <MoreVertical size={13} />
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

export default AccessControl;
