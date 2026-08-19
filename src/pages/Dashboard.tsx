import { useState } from 'react';
import { 
  Download, 
  Filter, 
  Store, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2,
  Clock,
  MoreHorizontal
} from 'lucide-react';
import styles from './Dashboard.module.css';

// Mock Data
const kpiData = [
  { label: 'Active Pharmacies', value: '142', icon: Store, color: 'teal' },
  { label: 'Pending Approvals', value: '8', icon: Clock, color: 'blue' },
  { label: 'Expiring Licenses', value: '12', icon: AlertTriangle, color: 'amber' },
  { label: 'Non-Compliant', value: '3', icon: ShieldAlert, color: 'red' },
];

const mockTenants = [
  { id: 'PHA-8492', name: 'Meridian Family Pharmacy', status: 'Compliant', expireDate: '2026-12-01', orders: 1250 },
  { id: 'PHA-1023', name: 'Oak Street Apothecary', status: 'Expiring Soon', expireDate: '2026-09-15', orders: 840 },
  { id: 'PHA-4491', name: 'Westside Delivery Rx', status: 'Non-Compliant', expireDate: '2026-08-10', orders: 0 },
  { id: 'PHA-7720', name: 'Downtown Health', status: 'Under Review', expireDate: 'Pending', orders: 0 },
];

const Dashboard = () => {
  const [activeFilter, setActiveFilter] = useState('All');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Compliant':
        return <span className="badge badge-teal"><CheckCircle2 size={12} /> Compliant</span>;
      case 'Expiring Soon':
        return <span className="badge badge-amber"><AlertTriangle size={12} /> Expiring Soon</span>;
      case 'Non-Compliant':
        return <span className="badge badge-red"><ShieldAlert size={12} /> Non-Compliant</span>;
      case 'Under Review':
        return <span className="badge badge-blue"><Clock size={12} /> Under Review</span>;
      default:
        return <span className="badge badge-grey">{status}</span>;
    }
  };

  return (
    <div className={styles.pageContainer}>
      
      {/* Page Header Row */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderInfo}>
          <h1 className={styles.pageTitle}>Compliance Command Center</h1>
          <p className={styles.pageDescription}>Master overview of all tenant compliance states and network health.</p>
        </div>
        <button className="btn btn-primary">
          <Download size={16} />
          <span>Export Report</span>
        </button>
      </div>

      {/* KPI Strip */}
      <div className={`${styles.kpiStrip} stagger-1`}>
        {kpiData.map((kpi, index) => (
          <div key={index} className={`card ${styles.kpiCard}`}>
            <div className={styles.kpiHeader}>
              <span className={styles.kpiLabel}>{kpi.label}</span>
              <div className={`${styles.kpiIconWrapper} ${styles[kpi.color]}`}>
                <kpi.icon size={18} />
              </div>
            </div>
            <div className={`${styles.kpiValue} tnum`}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Filter / Utility Bar */}
      <div className={`${styles.filterBar} stagger-2`}>
        <div className={styles.filterGroup}>
          <div className="input" style={{ width: '240px' }}>
            <Filter size={14} color="var(--color-text-muted)" />
            <input type="text" placeholder="Filter by name or ID..." />
          </div>
          <button 
            className={`${styles.filterChip} ${activeFilter === 'All' ? styles.active : ''}`}
            onClick={() => setActiveFilter('All')}
          >
            All Tenants
          </button>
          <button 
            className={`${styles.filterChip} ${activeFilter === 'At Risk' ? styles.active : ''}`}
            onClick={() => setActiveFilter('At Risk')}
          >
            At Risk
          </button>
        </div>
      </div>

      {/* Primary Content Region (Table Card) */}
      <div className={`card card-interactive stagger-3`} style={{ padding: 0, overflow: 'hidden' }}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tenant</th>
                <th>Compliance Status</th>
                <th>Next Expiration</th>
                <th className="tnum" style={{ textAlign: 'right' }}>30d Volume</th>
                <th style={{ width: '40px' }}></th>
              </tr>
            </thead>
            <tbody>
              {mockTenants.map((tenant, idx) => (
                <tr key={idx} className={styles.tableRow}>
                  <td>
                    <div className={styles.tenantInfo}>
                      <span className={styles.tenantName}>{tenant.name}</span>
                      <span className={`${styles.tenantId} tnum`}>{tenant.id}</span>
                    </div>
                  </td>
                  <td>{getStatusBadge(tenant.status)}</td>
                  <td className="tnum">{tenant.expireDate}</td>
                  <td className="tnum" style={{ textAlign: 'right' }}>{tenant.orders.toLocaleString()}</td>
                  <td>
                    <button className="btn" style={{ padding: '0.25rem', color: 'var(--color-text-muted)' }}>
                      <MoreHorizontal size={16} />
                    </button>
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

export default Dashboard;
