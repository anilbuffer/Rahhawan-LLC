import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  Star,
  ShieldCheck,
  Phone,
  Snowflake,
  Lock,
  CheckCircle,
  Clock,
  MoreVertical
} from 'lucide-react';
import styles from './Drivers.module.css';

interface DriverProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicle: string;
  licensePlate: string;
  status: 'on_shift' | 'delivering' | 'offline';
  rating: number;
  completedDeliveries: number;
  currentActiveLoads: number;
  certifications: {
    hipaaCertified: boolean;
    controlledSubstances: boolean;
    coldChainCertified: boolean;
  };
  backgroundCheck: 'Clear' | 'Pending' | 'Flagged';
}

const MOCK_DRIVERS: DriverProfile[] = [
  {
    id: 'DRV-101',
    name: 'Marcus Vance',
    phone: '+1 (555) 234-8901',
    email: 'marcus.v@rahhawandriver.com',
    vehicle: 'Toyota Prius (Eco)',
    licensePlate: 'IL-9428-TX',
    status: 'delivering',
    rating: 4.95,
    completedDeliveries: 482,
    currentActiveLoads: 3,
    certifications: {
      hipaaCertified: true,
      controlledSubstances: true,
      coldChainCertified: true,
    },
    backgroundCheck: 'Clear',
  },
  {
    id: 'DRV-102',
    name: 'Elena Rostova',
    phone: '+1 (555) 345-9012',
    email: 'elena.r@rahhawandriver.com',
    vehicle: 'Honda CR-V (Refrigerated Cargo)',
    licensePlate: 'IL-8102-RF',
    status: 'delivering',
    rating: 4.98,
    completedDeliveries: 614,
    currentActiveLoads: 2,
    certifications: {
      hipaaCertified: true,
      controlledSubstances: true,
      coldChainCertified: true,
    },
    backgroundCheck: 'Clear',
  },
  {
    id: 'DRV-103',
    name: 'David Chen',
    phone: '+1 (555) 456-0123',
    email: 'david.c@rahhawandriver.com',
    vehicle: 'Ford Transit Connect',
    licensePlate: 'IL-3391-VN',
    status: 'delivering',
    rating: 4.88,
    completedDeliveries: 320,
    currentActiveLoads: 4,
    certifications: {
      hipaaCertified: true,
      controlledSubstances: false,
      coldChainCertified: true,
    },
    backgroundCheck: 'Clear',
  },
  {
    id: 'DRV-104',
    name: 'Sarah Jenkins',
    phone: '+1 (555) 567-1234',
    email: 'sarah.j@rahhawandriver.com',
    vehicle: 'Chevy Bolt EV',
    licensePlate: 'IL-5921-EV',
    status: 'on_shift',
    rating: 4.92,
    completedDeliveries: 289,
    currentActiveLoads: 0,
    certifications: {
      hipaaCertified: true,
      controlledSubstances: true,
      coldChainCertified: false,
    },
    backgroundCheck: 'Clear',
  },
  {
    id: 'DRV-105',
    name: 'Tariq Al-Mansoor',
    phone: '+1 (555) 678-2345',
    email: 'tariq.m@rahhawandriver.com',
    vehicle: 'Subaru Outback',
    licensePlate: 'IL-7721-AW',
    status: 'on_shift',
    rating: 4.97,
    completedDeliveries: 512,
    currentActiveLoads: 1,
    certifications: {
      hipaaCertified: true,
      controlledSubstances: true,
      coldChainCertified: true,
    },
    backgroundCheck: 'Clear',
  },
  {
    id: 'DRV-106',
    name: 'Chloe Bennett',
    phone: '+1 (555) 789-3456',
    email: 'chloe.b@rahhawandriver.com',
    vehicle: 'Nissan Leaf EV',
    licensePlate: 'IL-2019-LF',
    status: 'offline',
    rating: 4.91,
    completedDeliveries: 194,
    currentActiveLoads: 0,
    certifications: {
      hipaaCertified: true,
      controlledSubstances: true,
      coldChainCertified: false,
    },
    backgroundCheck: 'Clear',
  },
];

export const Drivers: React.FC = () => {
  const [drivers, setDrivers] = useState<DriverProfile[]>(MOCK_DRIVERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = drivers.filter((d) => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      return (
        d.name.toLowerCase().includes(q) ||
        d.vehicle.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const toggleDriverShift = (driverId: string) => {
    setDrivers((prev) =>
      prev.map((d) => {
        if (d.id === driverId) {
          const nextStatus = d.status === 'offline' ? 'on_shift' : 'offline';
          return { ...d, status: nextStatus };
        }
        return d;
      })
    );
  };

  return (
    <div className={styles.driversContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Drivers & Courier Fleet</h1>
          <p className={styles.pageSubtitle}>
            Live driver roster, cold-chain & DEA Schedule II handling certifications, and active shift oversight.
          </p>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} />
          <span>Onboard New Driver</span>
        </button>
      </div>

      {/* KPI Overview */}
      <div className={styles.kpiStrip}>
        <div className={styles.kpiCard}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Total Fleet
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem' }}>
              {drivers.length} Drivers
            </div>
          </div>
          <div style={{ padding: '0.625rem', borderRadius: 'var(--radius-2xl)', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--color-blue)' }}>
            <Truck size={22} />
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Active on Shift
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--color-teal)' }}>
              {drivers.filter((d) => d.status !== 'offline').length} Drivers
            </div>
          </div>
          <div style={{ padding: '0.625rem', borderRadius: 'var(--radius-2xl)', background: 'rgba(14, 163, 131, 0.1)', color: 'var(--color-teal)' }}>
            <CheckCircle size={22} />
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Fleet Average Rating
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              4.94 <Star size={18} fill="#F59E0B" color="#F59E0B" />
            </div>
          </div>
          <div style={{ padding: '0.625rem', borderRadius: 'var(--radius-2xl)', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-amber)' }}>
            <Star size={22} />
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div className="input" style={{ flex: 1, maxWidth: 380 }}>
            <Search size={16} color="var(--color-text-muted)" />
            <input
              type="text"
              placeholder="Search driver name, vehicle, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className={`btn btn-${statusFilter === 'all' ? 'primary' : 'secondary'}`}
              style={{ fontSize: '0.8125rem' }}
              onClick={() => setStatusFilter('all')}
            >
              All Drivers ({drivers.length})
            </button>
            <button
              className={`btn btn-${statusFilter === 'delivering' ? 'primary' : 'secondary'}`}
              style={{ fontSize: '0.8125rem' }}
              onClick={() => setStatusFilter('delivering')}
            >
              Active Delivering ({drivers.filter((d) => d.status === 'delivering').length})
            </button>
            <button
              className={`btn btn-${statusFilter === 'on_shift' ? 'primary' : 'secondary'}`}
              style={{ fontSize: '0.8125rem' }}
              onClick={() => setStatusFilter('on_shift')}
            >
              Available On-Shift ({drivers.filter((d) => d.status === 'on_shift').length})
            </button>
            <button
              className={`btn btn-${statusFilter === 'offline' ? 'primary' : 'secondary'}`}
              style={{ fontSize: '0.8125rem' }}
              onClick={() => setStatusFilter('offline')}
            >
              Offline ({drivers.filter((d) => d.status === 'offline').length})
            </button>
          </div>
        </div>
      </div>

      {/* Driver Cards Grid */}
      <div className={styles.grid}>
        {filtered.map((driver) => {
          return (
            <div key={driver.id} className={styles.driverCard}>
              <div className={styles.driverHeader}>
                <div className={styles.driverProfile}>
                  <div className={styles.avatar}>
                    {driver.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{driver.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      ID: {driver.id} • {driver.licensePlate}
                    </div>
                  </div>
                </div>

                <span
                  className={`badge badge-${
                    driver.status === 'delivering'
                      ? 'blue'
                      : driver.status === 'on_shift'
                      ? 'teal'
                      : 'grey'
                  }`}
                >
                  {driver.status === 'delivering'
                    ? 'In Transit'
                    : driver.status === 'on_shift'
                    ? 'Available'
                    : 'Offline'}
                </span>
              </div>

              <div className={styles.detailsList}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Vehicle</span>
                  <span className={styles.detailValue}>{driver.vehicle}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Active Deliveries</span>
                  <span className={styles.detailValue} style={{ color: 'var(--color-teal)', fontWeight: 700 }}>
                    {driver.currentActiveLoads} active orders
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Total Delivered</span>
                  <span className={styles.detailValue}>{driver.completedDeliveries} completed</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Rating</span>
                  <span className={styles.detailValue} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {driver.rating} <Star size={14} fill="#F59E0B" color="#F59E0B" />
                  </span>
                </div>
              </div>

              {/* Verified Badges */}
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  Compliance & Certifications:
                </span>
                <div className={styles.badgeList} style={{ marginTop: '0.375rem' }}>
                  {driver.certifications.hipaaCertified && (
                    <span className="badge badge-teal" title="HIPAA Compliant Courier">
                      <ShieldCheck size={11} /> HIPAA
                    </span>
                  )}
                  {driver.certifications.controlledSubstances && (
                    <span className="badge badge-amber" title="DEA Schedule II Clearance">
                      <Lock size={11} /> DEA Controlled
                    </span>
                  )}
                  {driver.certifications.coldChainCertified && (
                    <span className="badge badge-blue" title="Cold Chain Validated">
                      <Snowflake size={11} /> Cold Chain
                    </span>
                  )}
                </div>
              </div>

              {/* Action Footer */}
              <div className={styles.footerActions}>
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.625rem' }}
                  onClick={() => toggleDriverShift(driver.id)}
                >
                  <Clock size={13} />
                  <span>{driver.status === 'offline' ? 'Set On Shift' : 'End Shift'}</span>
                </button>

                <div style={{ display: 'flex', gap: '0.375rem' }}>
                  <a
                    href={`tel:${driver.phone}`}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.5rem' }}
                    title="Call Driver"
                  >
                    <Phone size={13} />
                  </a>
                  <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.5rem' }}>
                    <MoreVertical size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Drivers;
