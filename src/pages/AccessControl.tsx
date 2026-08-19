import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Key,
  X,
  Check,
  AlertTriangle
} from 'lucide-react';
import { auditLogService } from '../services/auditLogService';

export interface SystemUser {
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

const PERMISSIONS_MATRIX = [
  { capability: 'View Full Unmasked PHI (HIPAA Minimum Necessary)', SuperAdmin: true, TenantAdmin: true, ComplianceOfficer: true, Dispatcher: false, Driver: false },
  { capability: 'Dispatch, Assign & Reassign Couriers', SuperAdmin: true, TenantAdmin: true, ComplianceOfficer: false, Dispatcher: true, Driver: false },
  { capability: 'Override DEA Form 222 Schedule II Holds', SuperAdmin: true, TenantAdmin: false, ComplianceOfficer: true, Dispatcher: false, Driver: false },
  { capability: 'Export Route4Me Route Optimization Batches', SuperAdmin: true, TenantAdmin: true, ComplianceOfficer: true, Dispatcher: true, Driver: false },
  { capability: 'Generate Invoices & View Financial Margins', SuperAdmin: true, TenantAdmin: true, ComplianceOfficer: false, Dispatcher: false, Driver: false },
  { capability: 'Configure System Security Safeguards & MFA', SuperAdmin: true, TenantAdmin: false, ComplianceOfficer: true, Dispatcher: false, Driver: false },
];

export const AccessControl: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [users, setUsers] = useState<SystemUser[]>(MOCK_USERS);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  // Modals state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);

  // New User Form state
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Dispatcher' as SystemUser['role'],
    organization: 'Rahhawan Platform HQ',
  });

  // Check URL query param ?new=true
  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setInviteModalOpen(true);
    }
  }, [searchParams]);

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

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created: SystemUser = {
      id: `USR-00${users.length + 1}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      organization: newUser.organization,
      mfaEnabled: true,
      lastActive: 'Just invited',
      status: 'Active',
    };

    setUsers((prev) => [created, ...prev]);
    setInviteModalOpen(false);

    auditLogService.logEvent({
      actionType: 'USER_AUTHENTICATION',
      category: 'Security & Auth',
      description: `Invited Staff User ${created.name} (${created.email}) with Role: ${created.role}`,
      actor: { id: 'USR-001', name: 'Sarah Jenkins', role: 'Super Admin' },
      severity: 'info',
      resource: { type: 'user', id: created.id, label: created.name, details: { role: created.role, organization: created.organization } }
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setUsers((prev) =>
      prev.map((u) => (u.id === editingUser.id ? editingUser : u))
    );

    auditLogService.logEvent({
      actionType: 'SECURITY_POLICY_CHANGE',
      category: 'Security & Auth',
      description: `Updated User Access Credentials for ${editingUser.name} (${editingUser.role}, Status: ${editingUser.status})`,
      actor: { id: 'USR-001', name: 'Sarah Jenkins', role: 'Super Admin' },
      severity: 'info',
      resource: { type: 'user', id: editingUser.id, label: editingUser.name, details: { role: editingUser.role, status: editingUser.status } }
    });

    setEditingUser(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>User & Role-Based Access Control</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Granular permissions matrix, HIPAA credentialing, and multi-tenant authentication logs.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => setPermissionsModalOpen(true)}>
            <Key size={16} />
            <span>Permissions Matrix</span>
          </button>
          <button className="btn btn-primary" onClick={() => setInviteModalOpen(true)}>
            <Plus size={16} />
            <span>Invite New User</span>
          </button>
        </div>
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
                    <span className={`badge badge-${user.status === 'Active' ? 'teal' : 'red'}`}>
                      {user.status}
                    </span>
                  </td>

                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
                        title="View Role Permissions"
                        onClick={() => setPermissionsModalOpen(true)}
                      >
                        <Key size={13} />
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
                        title="Edit User"
                        onClick={() => setEditingUser(user)}
                      >
                        <Edit2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Matrix Modal */}
      {permissionsModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(17, 24, 39, 0.5)',
            backdropFilter: 'blur(2px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setPermissionsModalOpen(false)}
        >
          <div
            style={{
              background: 'white',
              width: '100%',
              maxWidth: 720,
              borderRadius: '16px',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>HIPAA Role-Based Access Matrix</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  Enforces minimal-necessary PHI exposure across technical and operational roles.
                </p>
              </div>
              <button
                onClick={() => setPermissionsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', maxHeight: 420, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600 }}>Capability</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center', fontWeight: 600 }}>Admin</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center', fontWeight: 600 }}>Pharmacy</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center', fontWeight: 600 }}>Compliance</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center', fontWeight: 600 }}>Dispatcher</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center', fontWeight: 600 }}>Driver</th>
                  </tr>
                </thead>
                <tbody>
                  {PERMISSIONS_MATRIX.map((p, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{p.capability}</td>
                      <td style={{ textAlign: 'center', padding: '0.75rem 0.5rem' }}>
                        {p.SuperAdmin ? <Check size={16} color="var(--color-teal)" /> : <X size={14} color="#9CA3AF" />}
                      </td>
                      <td style={{ textAlign: 'center', padding: '0.75rem 0.5rem' }}>
                        {p.TenantAdmin ? <Check size={16} color="var(--color-teal)" /> : <X size={14} color="#9CA3AF" />}
                      </td>
                      <td style={{ textAlign: 'center', padding: '0.75rem 0.5rem' }}>
                        {p.ComplianceOfficer ? <Check size={16} color="var(--color-teal)" /> : <X size={14} color="#9CA3AF" />}
                      </td>
                      <td style={{ textAlign: 'center', padding: '0.75rem 0.5rem' }}>
                        {p.Dispatcher ? <Check size={16} color="var(--color-teal)" /> : <X size={14} color="#9CA3AF" />}
                      </td>
                      <td style={{ textAlign: 'center', padding: '0.75rem 0.5rem' }}>
                        {p.Driver ? <Check size={16} color="var(--color-teal)" /> : <X size={14} color="#9CA3AF" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', background: '#F9FAFB', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setPermissionsModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite User Modal */}
      {inviteModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(17, 24, 39, 0.5)',
            backdropFilter: 'blur(2px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setInviteModalOpen(false)}
        >
          <div
            style={{
              background: 'white',
              width: '100%',
              maxWidth: 520,
              borderRadius: '16px',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleInviteSubmit}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Invite Staff Account</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Assign appropriate role and provision 2FA credentials.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Jordan Miller"
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid var(--border-color)' }}
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                    Work Email
                  </label>
                  <input
                    type="email"
                    placeholder="user@rahhawan.com"
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid var(--border-color)' }}
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                      Assigned Role
                    </label>
                    <select
                      style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid var(--border-color)' }}
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                    >
                      <option value="Super Admin">Super Admin</option>
                      <option value="Tenant Admin">Tenant Admin</option>
                      <option value="Compliance Officer">Compliance Officer</option>
                      <option value="Dispatcher">Dispatcher</option>
                      <option value="Driver">Driver</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                      Organization
                    </label>
                    <input
                      type="text"
                      placeholder="Rahhawan HQ / Pharmacy"
                      style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid var(--border-color)' }}
                      value={newUser.organization}
                      onChange={(e) => setNewUser({ ...newUser, organization: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', background: '#F9FAFB', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setInviteModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(17, 24, 39, 0.5)',
            backdropFilter: 'blur(2px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setEditingUser(null)}
        >
          <div
            style={{
              background: 'white',
              width: '100%',
              maxWidth: 520,
              borderRadius: '16px',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleEditSubmit}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Edit Account: {editingUser.name}</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    ID: {editingUser.id} • {editingUser.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid var(--border-color)' }}
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                      Assigned Role
                    </label>
                    <select
                      style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid var(--border-color)' }}
                      value={editingUser.role}
                      onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                    >
                      <option value="Super Admin">Super Admin</option>
                      <option value="Tenant Admin">Tenant Admin</option>
                      <option value="Compliance Officer">Compliance Officer</option>
                      <option value="Dispatcher">Dispatcher</option>
                      <option value="Driver">Driver</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                      Account Status
                    </label>
                    <select
                      style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid var(--border-color)' }}
                      value={editingUser.status}
                      onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as any })}
                    >
                      <option value="Active">Active</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                    Organization
                  </label>
                  <input
                    type="text"
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid var(--border-color)' }}
                    value={editingUser.organization}
                    onChange={(e) => setEditingUser({ ...editingUser, organization: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', background: '#F9FAFB', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingUser(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessControl;
