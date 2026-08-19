import React from 'react';
import { Package, CheckCircle2, Clock, MapPin, Navigation, Thermometer, ShieldAlert } from 'lucide-react';
import styles from './DriverDashboard.module.css';

const DRIVER_STOPS = [
  {
    id: 'ORD-9842',
    stopNumber: 1,
    patientName: 'Patient J.D. (PT-88210)',
    address: '1420 N University Ave, Little Rock, AR',
    medication: 'Morphine Sulfate Infusion (C-II)',
    eta: '10:45 AM',
    status: 'In Transit',
    isColdChain: false,
    isDea: true,
  },
  {
    id: 'ORD-9840',
    stopNumber: 2,
    patientName: 'Patient R.S. (PT-44910)',
    address: '8801 Kanis Rd, Little Rock, AR',
    medication: 'Insulin Glargine 100U/mL',
    eta: '11:20 AM',
    status: 'Pending',
    isColdChain: true,
    isDea: false,
  },
  {
    id: 'ORD-9838',
    stopNumber: 3,
    patientName: 'Patient A.W. (PT-33019)',
    address: '2200 E 6th St, North Little Rock, AR',
    medication: 'Tacrolimus 0.5mg Compounded',
    eta: '12:05 PM',
    status: 'Pending',
    isColdChain: false,
    isDea: false,
  },
];

const DriverDashboard: React.FC = () => {
  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerSection}>
        <div>
          <h1 className={styles.title}>Active Manifest & Route</h1>
          <p className={styles.subtitle}>Vehicle: Toyota Prius (Cold-Chain Equipped) • Shift started at 08:30 AM</p>
        </div>
        <div className={styles.statusPill}>
          <div className={styles.statusDot} />
          <span>Active Shift — On Route</span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span>Assigned Stops</span>
            <Package size={16} color="#F59E0B" />
          </div>
          <div className={styles.kpiValue}>6</div>
          <div className={styles.kpiSub}>3 delivered, 3 remaining</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span>Completed</span>
            <CheckCircle2 size={16} color="#0EA383" />
          </div>
          <div className={styles.kpiValue}>3</div>
          <div className={styles.kpiSub}>100% on-time rate today</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span>Next ETA</span>
            <Clock size={16} color="#3B82F6" />
          </div>
          <div className={styles.kpiValue}>14 min</div>
          <div className={styles.kpiSub}>Stop #1 — ORD-9842</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span>Cold-Chain Temp</span>
            <Thermometer size={16} color="#60A5FA" />
          </div>
          <div className={styles.kpiValue}>3.8°C</div>
          <div className={styles.kpiSub}>Safe range (2.0°C - 8.0°C)</div>
        </div>
      </div>

      {/* Route Stops List */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitle}>Upcoming Route Deliveries</div>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              background: '#F59E0B',
              color: '#000',
              fontWeight: 600,
              padding: '0.4rem 0.875rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.8125rem',
            }}
          >
            <Navigation size={14} />
            Start Turn-by-Turn GPS
          </button>
        </div>

        <div className={styles.stopsList}>
          {DRIVER_STOPS.map((stop) => (
            <div key={stop.id} className={styles.stopItem}>
              <div className={styles.stopLeft}>
                <div className={styles.stopNumber}>{stop.stopNumber}</div>
                <div className={styles.stopInfo}>
                  <div className={styles.stopTitle}>
                    {stop.id} — {stop.patientName}
                  </div>
                  <div className={styles.stopSubtitle}>
                    <MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />
                    {stop.address} • {stop.medication}
                  </div>
                  <div className={styles.tagGroup}>
                    {stop.isDea && (
                      <span className={`${styles.tag} ${styles.tagDea}`}>
                        <ShieldAlert size={10} style={{ display: 'inline', marginRight: 2 }} />
                        DEA Form 222 Req.
                      </span>
                    )}
                    {stop.isColdChain && (
                      <span className={`${styles.tag} ${styles.tagCold}`}>
                        <Thermometer size={10} style={{ display: 'inline', marginRight: 2 }} />
                        Cold Chain Monitored
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.375rem' }}>
                <span
                  className={`${styles.statusBadge} ${
                    stop.status === 'In Transit' ? styles.badgeInTransit : styles.badgePending
                  }`}
                >
                  {stop.status}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.45)' }}>
                  ETA: {stop.eta}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
