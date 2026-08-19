import { Users as UsersIcon, Calendar, Activity, AlertCircle, ShieldAlert, DollarSign, MapPin, Sparkles, TrendingUp, ChevronRight, AlertTriangle } from 'lucide-react';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  return (
    <div>
      <div className={styles.dashboardHeader}>
        <div>
          <h1 className={styles.greeting}>Good morning, Sarah!</h1>
          <p className={styles.dateText}>Wednesday, August 19</p>
        </div>
        <div className={styles.headerButtons}>
          <button className="btn btn-secondary">
            <MapPin size={16} />
            Track Caregivers
          </button>
          <button className="btn btn-primary">
            <Sparkles size={16} />
            AI Briefing
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className={styles.grid}>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Active Patients</span>
            <div className={styles.metricIcon} style={{ background: 'hsla(165, 100%, 32%, 0.1)', color: 'var(--color-primary)' }}>
              <UsersIcon size={14} />
            </div>
          </div>
          <div>
            <div className={styles.metricValue}>247</div>
            <div className={`${styles.metricTrend} ${styles.trendUp}`}>
              <span>+ 12 this month</span>
            </div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Active Caregivers</span>
            <div className={styles.metricIcon} style={{ background: 'hsla(252, 87%, 67%, 0.1)', color: 'var(--color-secondary)' }}>
              <UsersIcon size={14} />
            </div>
          </div>
          <div>
            <div className={styles.metricValue}>84</div>
            <div className={styles.metricTrend} style={{ color: 'var(--color-secondary)' }}>
              <span>5 onboarding</span>
            </div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Today's Visits</span>
            <div className={styles.metricIcon} style={{ background: 'hsla(210, 100%, 50%, 0.1)', color: '#3b82f6' }}>
              <Calendar size={14} />
            </div>
          </div>
          <div>
            <div className={styles.metricValue}>142</div>
            <div className={styles.metricTrend} style={{ color: 'var(--color-text-muted)' }}>
              <span>98 completed · 44 upcoming</span>
            </div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>EVV Compliance</span>
            <div className={styles.metricIcon} style={{ background: 'hsla(165, 100%, 32%, 0.1)', color: 'var(--color-primary)' }}>
              <Activity size={14} />
            </div>
          </div>
          <div>
            <div className={styles.metricValue}>96.4%</div>
            <div className={`${styles.metricTrend} ${styles.trendWarning}`}>
              <span>9 exceptions today</span>
            </div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Open Unfilled Shifts</span>
            <div className={styles.metricIcon} style={{ background: 'hsla(38, 92%, 50%, 0.1)', color: 'var(--color-warning)' }}>
              <AlertCircle size={14} />
            </div>
          </div>
          <div>
            <div className={styles.metricValue}>8</div>
            <div className={`${styles.metricTrend} ${styles.trendDown}`}>
              <span>5 urgent (within 4 hrs)</span>
            </div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <span className={styles.metricTitle}>Monthly Revenue</span>
            <div className={styles.metricIcon} style={{ background: 'hsla(165, 100%, 32%, 0.1)', color: 'var(--color-primary)' }}>
              <DollarSign size={14} />
            </div>
          </div>
          <div>
            <div className={styles.metricValue}>$486k</div>
            <div className={`${styles.metricTrend} ${styles.trendUp}`}>
              <span>+ 4.4% vs last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Charts */}
      <div className={styles.chartsGrid}>
        <div className={styles.cardWhite}>
          <div className={styles.sectionTitle}>
            <span>Visits this week</span>
            <span className="badge badge-success">96% Completion</span>
          </div>
          <div className={styles.chartPlaceholder}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
              const h1 = 50 + Math.random() * 50;
              const h2 = h1 * (0.8 + Math.random() * 0.2);
              return (
                <div key={day} className={styles.barCol}>
                  <div className={styles.barPair} style={{ height: '160px' }}>
                    <div className={styles.barSchedule} style={{ height: `${h1}%` }}></div>
                    <div className={styles.barComplete} style={{ height: `${h2}%` }}></div>
                  </div>
                  <span className={styles.barLabel}>{day}</span>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)' }}></div> Completed</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E2E8F0' }}></div> Scheduled</span>
          </div>
        </div>

        <div className={styles.cardWhite}>
          <div className={styles.sectionTitle}>
            <span>Patient Satisfaction</span>
            <a href="#" style={{ fontSize: '0.875rem', fontWeight: 500 }}>View all &rarr;</a>
          </div>
          <div className={styles.gaugeContainer}>
            <div className={styles.gauge}>
              <div className={styles.gaugeValue}>
                4.8
                <div className={styles.gaugeStars}>★★★★★</div>
                <div className={styles.gaugeLabel}>out of 5.0</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '2rem' }}>
            {['Punctuality:4.9', 'Care Quality:4.8', 'Communication:4.6'].map((item) => {
              const [label, score] = item.split(':');
              const percent = (parseFloat(score) / 5) * 100;
              return (
                <div key={label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                    <span>{label}</span>
                    <strong>{score}</strong>
                  </div>
                  <div style={{ height: '4px', background: '#E2E8F0', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${percent}%`, height: '100%', background: label === 'Communication' ? 'var(--color-warning)' : 'var(--color-primary)' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className={styles.bottomGrid}>
        <div className={styles.cardWhite}>
          <div className={styles.sectionTitle}>
            <span>EVV Compliance</span>
            <a href="#" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Exceptions &rarr;</a>
          </div>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginTop: '1rem' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: '16px solid var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700 }}>
              98.2%
            </div>
            <div style={{ flex: 1, background: 'hsla(348, 83%, 47%, 0.1)', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', gap: '0.75rem', color: 'var(--color-danger)' }}>
              <AlertTriangle size={20} style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>14 Visits at Risk</div>
                <div style={{ fontSize: '0.75rem' }}>Missing EVV data may block billing.</div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.cardWhite}>
          <div className={styles.sectionTitle}>
            <span>Wasted Hours</span>
            <span className="badge badge-warning">Cost leakage</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Schedule vs actual EVV — this week</p>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-warning)' }}>14.6 <span style={{ fontSize: '1rem' }}>hrs</span></div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Est. cost impact <strong>$467</strong></div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1, padding: '1rem', background: '#F8FAFC', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>LATE CLOCK-INS</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>9.2 hrs</div>
            </div>
            <div style={{ flex: 1, padding: '1rem', background: '#F8FAFC', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>EARLY CLOCK-OUTS</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>3.1 hrs</div>
            </div>
            <div style={{ flex: 1, padding: '1rem', background: '#F8FAFC', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '0.25rem' }}>LATE CLOCK-OUTS</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>2.3 hrs</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
