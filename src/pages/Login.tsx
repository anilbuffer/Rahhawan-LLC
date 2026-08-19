import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ShieldCheck, CheckCircle, AlertCircle, Lock, Pill, Truck } from 'lucide-react';
import { useAuth, type PortalRole } from '../context/AuthContext';
import styles from './Login.module.css';

interface PortalConfig {
  role: PortalRole;
  title: string;
  desc: string;
  icon: React.ReactNode;
  emoji: string;
  accent: string;
  accentRgb: string;
  email: string;
  password: string;
  redirect: string;
  bgIcon: string;
}

const PORTALS: PortalConfig[] = [
  {
    role: 'super_admin',
    title: 'Super Admin',
    desc: 'Platform HQ',
    icon: <ShieldCheck size={22} />,
    emoji: '🛡️',
    accent: '#0EA383',
    accentRgb: '14, 163, 131',
    email: 'sarah.jenkins@rahhawan.com',
    password: 'SuperAdmin2024!',
    redirect: '/dashboard',
    bgIcon: '🛡️',
  },
  {
    role: 'pharmacy',
    title: 'Pharmacy',
    desc: 'Dispensing Hub',
    icon: <Pill size={22} />,
    emoji: '💊',
    accent: '#3B82F6',
    accentRgb: '59, 130, 246',
    email: 'dr.chen@northgate-infusion.com',
    password: 'Pharmacy2024!',
    redirect: '/pharmacy/dashboard',
    bgIcon: '💊',
  },
  {
    role: 'driver',
    title: 'Driver',
    desc: 'Courier Portal',
    icon: <Truck size={22} />,
    emoji: '🚚',
    accent: '#F59E0B',
    accentRgb: '245, 158, 11',
    email: 'marcus.vance@rahhawan.com',
    password: 'Driver2024!',
    redirect: '/driver/dashboard',
    bgIcon: '🚚',
  },
];

const USERS: Record<PortalRole, { name: string; initials: string }> = {
  super_admin: { name: 'Sarah Jenkins', initials: 'SJ' },
  pharmacy: { name: 'Dr. Linda Chen', initials: 'LC' },
  driver: { name: 'Marcus Vance', initials: 'MV' },
};

const LoginPage: React.FC = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<PortalRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [autofilled, setAutofilled] = useState(false);

  // If already logged in, redirect to correct portal
  if (isAuthenticated && user) {
    const portal = PORTALS.find((p) => p.role === user.role);
    return <Navigate to={portal?.redirect ?? '/dashboard'} replace />;
  }

  const handleRoleSelect = (portal: PortalConfig) => {
    setSelectedRole(portal.role);
    setEmail(portal.email);
    setPassword(portal.password);
    setAutofilled(true);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedRole) {
      setError('Please select a portal role first.');
      return;
    }

    const portal = PORTALS.find((p) => p.role === selectedRole)!;

    // Validate credentials
    if (email !== portal.email || password !== portal.password) {
      setError('Invalid credentials. Use the auto-filled demo credentials.');
      return;
    }

    setLoading(true);
    // Simulate auth delay
    await new Promise((r) => setTimeout(r, 900));

    const userInfo = USERS[selectedRole];
    login({
      role: selectedRole,
      name: userInfo.name,
      email,
      initials: userInfo.initials,
    });

    navigate(portal.redirect, { replace: true });
  };

  const activePortal = PORTALS.find((p) => p.role === selectedRole);

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.brandLogo}>R</div>
          <div>
            <div className={styles.brandName}>Rahhawan</div>
            <div className={styles.brandSub}>Pharmaceutical Logistics Platform</div>
          </div>
        </div>

        {/* Heading */}
        <h1 className={styles.heading}>Select Your Portal</h1>
        <p className={styles.subheading}>
          Choose your role to access your portal. Demo credentials will auto-fill.
        </p>

        {/* Role Selector */}
        <div className={styles.roleLabel}>Portal Access</div>
        <div className={styles.roleGrid}>
          {PORTALS.map((portal) => (
            <div
              key={portal.role}
              id={`role-card-${portal.role}`}
              className={`${styles.roleCard} ${selectedRole === portal.role ? styles.active : ''}`}
              onClick={() => handleRoleSelect(portal)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleRoleSelect(portal)}
              style={
                selectedRole === portal.role
                  ? ({
                      '--roleAccent': portal.accent,
                      '--roleAccentRgb': portal.accentRgb,
                    } as React.CSSProperties)
                  : undefined
              }
            >
              {selectedRole === portal.role && <div className={styles.roleCheck}>✓</div>}
              <div
                className={styles.roleIconWrapper}
                style={{
                  background:
                    selectedRole === portal.role
                      ? `rgba(${portal.accentRgb}, 0.14)`
                      : '#F3F4F6',
                  color: selectedRole === portal.role ? portal.accent : 'inherit',
                }}
              >
                {portal.emoji}
              </div>
              <div className={styles.roleTitle}>{portal.title}</div>
              <div className={styles.roleDesc}>{portal.desc}</div>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.formGroup}>
            <label className={styles.fieldLabel} htmlFor="login-email">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              className={`${styles.inputField} ${autofilled && email ? styles.autofilled : ''}`}
              placeholder="Select a portal role above…"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setAutofilled(false);
              }}
              autoComplete="email"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.fieldLabel} htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              className={`${styles.inputField} ${autofilled && password ? styles.autofilled : ''}`}
              placeholder="Select a portal role above…"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setAutofilled(false);
              }}
              autoComplete="current-password"
            />
          </div>

          {autofilled && activePortal && (
            <div className={styles.autofillHint}>
              <CheckCircle size={13} />
              Demo credentials auto-filled for {activePortal.title} portal
            </div>
          )}

          {error && (
            <div className={styles.errorMsg}>
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          <button
            id="login-submit-btn"
            type="submit"
            className={styles.submitBtn}
            disabled={loading || !selectedRole}
            style={
              activePortal
                ? {
                    background: `linear-gradient(135deg, ${activePortal.accent} 0%, ${activePortal.accent}cc 100%)`,
                    boxShadow: `0 4px 16px rgba(${activePortal.accentRgb}, 0.35)`,
                  }
                : undefined
            }
          >
            {loading ? (
              <>Authenticating…</>
            ) : (
              <>
                <Lock size={16} />
                {selectedRole ? `Enter ${activePortal?.title} Portal` : 'Select a Portal First'}
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className={styles.loginFooter}>
          <span className={styles.footerText}>© 2024 Rahhawan LLC. All rights reserved.</span>
          <div className={styles.footerBadge}>
            <ShieldCheck size={12} />
            HIPAA Compliant
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
