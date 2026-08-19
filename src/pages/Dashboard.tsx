import { Activity, Users as UsersIcon, Building2, TrendingUp, AlertCircle } from 'lucide-react';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem' }}>Platform Overview</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
          Real-time metrics across all Rahhawan LLC tenants.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className={styles.grid}>
        <div className={`card ${styles.metricCard}`}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Active Tenants</span>
            <div className={styles.metricIcon}>
              <Building2 size={20} />
            </div>
          </div>
          <div>
            <div className={styles.metricValue}>142</div>
            <div className={`${styles.metricTrend} ${styles.trendUp}`}>
              <TrendingUp size={16} />
              <span>+12 this month</span>
            </div>
          </div>
        </div>

        <div className={`card ${styles.metricCard}`}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Total Users</span>
            <div className={styles.metricIcon} style={{ background: 'hsla(199, 89%, 48%, 0.1)', color: 'var(--color-secondary)' }}>
              <UsersIcon size={20} />
            </div>
          </div>
          <div>
            <div className={styles.metricValue}>8,409</div>
            <div className={`${styles.metricTrend} ${styles.trendUp}`}>
              <TrendingUp size={16} />
              <span>+142 this week</span>
            </div>
          </div>
        </div>

        <div className={`card ${styles.metricCard}`}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>System Health</span>
            <div className={styles.metricIcon} style={{ background: 'hsla(142, 71%, 45%, 0.1)', color: 'var(--color-success)' }}>
              <Activity size={20} />
            </div>
          </div>
          <div>
            <div className={styles.metricValue}>99.9%</div>
            <div className={styles.metricTrend} style={{ color: 'var(--color-text-muted)' }}>
              <span>All systems operational</span>
            </div>
          </div>
        </div>

        <div className={`card ${styles.metricCard}`}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Compliance Alerts</span>
            <div className={styles.metricIcon} style={{ background: 'hsla(348, 83%, 47%, 0.1)', color: 'var(--color-danger)' }}>
              <AlertCircle size={20} />
            </div>
          </div>
          <div>
            <div className={styles.metricValue}>3</div>
            <div className={`${styles.metricTrend} ${styles.trendDown}`}>
              <span>Requires immediate review</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts / Data area */}
      <div className={styles.chartsGrid}>
        <div className="card">
          <h2 className={styles.sectionTitle}>Transaction Volume (30 Days)</h2>
          <div className={styles.emptyState}>
            <Activity size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>Chart data will load here</p>
          </div>
        </div>

        <div className="card">
          <h2 className={styles.sectionTitle}>Recent Activity</h2>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { id: 1, action: 'Tenant "PharmaPlus" created', time: '10 mins ago', status: 'success' },
              { id: 2, action: 'Compliance check failed for "HealthHub"', time: '1 hour ago', status: 'danger' },
              { id: 3, action: 'System update completed', time: '3 hours ago', status: 'primary' },
              { id: 4, action: 'New Driver registered', time: '5 hours ago', status: 'secondary' },
            ].map(item => (
              <li key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  background: `var(--color-${item.status})` 
                }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{item.action}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{item.time}</p>
                </div>
              </li>
            ))}
          </ul>
          <button className="btn btn-secondary" style={{ width: '100%', marginTop: '1.5rem' }}>
            View Full Audit Log
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
