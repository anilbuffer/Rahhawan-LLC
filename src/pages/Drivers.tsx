import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  MoreVertical,
  X,
  Package,
  Mail,
  UserCheck
} from 'lucide-react';
import { auditLogService } from '../services/auditLogService';
import styles from './Drivers.module.css';

export interface DriverProfile {
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<DriverProfile[]>(MOCK_DRIVERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal and Profile state
  const [onboardModalOpen, setOnboardModalOpen] = useState(false);
  const [selectedDriverProfile, setSelectedDriverProfile] = useState<DriverProfile | null>(null);

  // New Driver Form
  const [newDriver, setNewDriver] = useState({
    name: '',
    phone: '',
    email: '',
    vehicle: '',
    licensePlate: '',
    hipaaCertified: true,
    controlledSubstances: true,
    coldChainCertified: true,
  });

  // Check URL query param ?new=true
  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setOnboardModalOpen(true);
    }
  }, [searchParams]);

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

  const toggleDriverShift = (driverId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const targetDriver = drivers.find((d) => d.id === driverId);
    if (!targetDriver) return;

    const nextStatus: DriverProfile['status'] = targetDriver.status === 'offline' ? 'on_shift' : 'offline';
    const updated: DriverProfile = { ...targetDriver, status: nextStatus };

    setDrivers((prev) => prev.map((d) => (d.id === driverId ? updated : d)));
    if (selectedDriverProfile?.id === driverId) {
      setSelectedDriverProfile(updated);
    }

    auditLogService.logEvent({
      actionType: 'ORDER_STATUS_UPDATE',
      category: 'State Change',
      description: `Driver ${targetDriver.name} Shift Status toggled to: ${nextStatus === 'on_shift' ? 'Available (On Shift)' : 'Offline'}`,
      actor: { id: 'USR-001', name: 'Sarah Jenkins', role: 'Super Admin' },
      severity: 'info',
      resource: { type: 'driver', id: targetDriver.id, label: targetDriver.name, details: { previousStatus: targetDriver.status, newStatus: nextStatus } }
    });
  };

  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created: DriverProfile = {
      id: `DRV-10${drivers.length + 1}`,
      name: newDriver.name,
      phone: newDriver.phone,
      email: newDriver.email,
      vehicle: newDriver.vehicle,
      licensePlate: newDriver.licensePlate,
      status: 'on_shift',
      rating: 5.0,
      completedDeliveries: 0,
      currentActiveLoads: 0,
      certifications: {
        hipaaCertified: newDriver.hipaaCertified,
        controlledSubstances: newDriver.controlledSubstances,
        coldChainCertified: newDriver.coldChainCertified,
      },
      backgroundCheck: 'Clear',
    };

    setDrivers((prev) => [created, ...prev]);
    setOnboardModalOpen(false);
    setSelectedDriverProfile(created);

    auditLogService.logEvent({
      actionType: 'SECURITY_POLICY_CHANGE',
      category: 'Compliance',
      description: `Onboarded and Verified Courier Driver: ${created.name} (Vehicle: ${created.vehicle})`,
      actor: { id: 'USR-001', name: 'Sarah Jenkins', role: 'Super Admin' },
      severity: 'info',
      resource: { type: 'driver', id: created.id, label: created.name, details: { certifications: created.certifications, plate: created.licensePlate } }
    });
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
        <button className="btn btn-primary" onClick={() => setOnboardModalOpen(true)}>
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

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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
            <div
              key={driver.id}
              className={styles.driverCard}
              onClick={() => setSelectedDriverProfile(driver)}
            >
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
              <div className={styles.footerActions} onClick={(e) => e.stopPropagation()}>
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.625rem' }}
                  onClick={(e) => toggleDriverShift(driver.id, e)}
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
                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.5rem' }}
                    title="View Profile Details"
                    onClick={() => setSelectedDriverProfile(driver)}
                  >
                    <MoreVertical size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Driver Profile Detail Modal */}
      {selectedDriverProfile && createPortal(
        <div className={styles.modalOverlay} onClick={() => setSelectedDriverProfile(null)}>
          <div className={styles.modalContent} style={{ maxWidth: 580 }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className={styles.avatar} style={{ width: 48, height: 48, fontSize: '1rem' }}>
                  {selectedDriverProfile.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{selectedDriverProfile.name}</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Driver ID: {selectedDriverProfile.id} • {selectedDriverProfile.licensePlate}
                  </p>
                </div>
              </div>
              <button className={styles.drawerCloseBtn} onClick={() => setSelectedDriverProfile(null)}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: 8 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                    VEHICLE & TELEMETRY
                  </span>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 700, marginTop: '0.25rem' }}>
                    {selectedDriverProfile.vehicle}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                    Plate: {selectedDriverProfile.licensePlate}
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: 8 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                    PERFORMANCE & DISPATCH
                  </span>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 700, marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {selectedDriverProfile.rating} <Star size={14} fill="#F59E0B" color="#F59E0B" /> ({selectedDriverProfile.completedDeliveries} completed)
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-teal)', fontWeight: 600, marginTop: '0.25rem' }}>
                    {selectedDriverProfile.currentActiveLoads} active loads in progress
                  </div>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  DIRECT CONTACT CHANNELS
                </span>
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.375rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <Phone size={14} color="var(--color-teal)" />
                    <span>{selectedDriverProfile.phone}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <Mail size={14} color="var(--color-blue)" />
                    <span>{selectedDriverProfile.email}</span>
                  </div>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  COMPLIANCE BADGES & CERTIFICATIONS
                </span>
                <div className={styles.badgeList} style={{ marginTop: '0.5rem', gap: '0.5rem' }}>
                  {selectedDriverProfile.certifications.hipaaCertified && (
                    <span className="badge badge-teal" style={{ padding: '0.4rem 0.75rem' }}>
                      <ShieldCheck size={13} /> HIPAA Privacy & Security Trained
                    </span>
                  )}
                  {selectedDriverProfile.certifications.controlledSubstances && (
                    <span className="badge badge-amber" style={{ padding: '0.4rem 0.75rem' }}>
                      <Lock size={13} /> DEA Schedule II Chain of Custody Clearance
                    </span>
                  )}
                  {selectedDriverProfile.certifications.coldChainCertified && (
                    <span className="badge badge-blue" style={{ padding: '0.4rem 0.75rem' }}>
                      <Snowflake size={13} /> Cold Chain Temperature Validated (2°C-8°C)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className="btn btn-secondary"
                onClick={() => toggleDriverShift(selectedDriverProfile.id)}
              >
                <Clock size={14} />
                <span>{selectedDriverProfile.status === 'offline' ? 'Set On Shift' : 'End Active Shift'}</span>
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setSelectedDriverProfile(null);
                  navigate('/deliveries');
                }}
              >
                <Package size={14} />
                <span>View Assigned Orders</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Onboard New Driver Modal */}
      {onboardModalOpen && createPortal(
        <div className={styles.modalOverlay} onClick={() => setOnboardModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleOnboardSubmit}>
              <div className={styles.modalHeader}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Onboard New Courier Driver</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Add courier to fleet with verified HIPAA and cold-chain compliance.
                  </p>
                </div>
                <button type="button" className={styles.drawerCloseBtn} onClick={() => setOnboardModalOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              <div className={styles.modalBody}>
                <div>
                  <label className={styles.formLabel}>Full Legal Name</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="e.g. Jordan Miller"
                    value={newDriver.name}
                    onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className={styles.formLabel}>Direct Mobile Phone</label>
                    <input
                      type="tel"
                      className={styles.formInput}
                      placeholder="+1 (555) 000-0000"
                      value={newDriver.phone}
                      onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className={styles.formLabel}>Email Address</label>
                    <input
                      type="email"
                      className={styles.formInput}
                      placeholder="driver@domain.com"
                      value={newDriver.email}
                      onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className={styles.formLabel}>Vehicle Make & Model</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="e.g. Toyota RAV4 (Refrigerated)"
                      value={newDriver.vehicle}
                      onChange={(e) => setNewDriver({ ...newDriver, vehicle: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className={styles.formLabel}>License Plate</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="IL-9921-TX"
                      value={newDriver.licensePlate}
                      onChange={(e) => setNewDriver({ ...newDriver, licensePlate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                    Verified Certifications & Background Check:
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={newDriver.hipaaCertified}
                        onChange={(e) => setNewDriver({ ...newDriver, hipaaCertified: e.target.checked })}
                      />
                      <span>HIPAA Privacy & Data Protection Certified</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={newDriver.controlledSubstances}
                        onChange={(e) => setNewDriver({ ...newDriver, controlledSubstances: e.target.checked })}
                      />
                      <span>DEA Schedule II Chain of Custody Authorized</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={newDriver.coldChainCertified}
                        onChange={(e) => setNewDriver({ ...newDriver, coldChainCertified: e.target.checked })}
                      />
                      <span>Refrigerated Cold Chain Sensor Protocol Certified</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className="btn btn-secondary" onClick={() => setOnboardModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Verify & Onboard Driver
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Drivers;
