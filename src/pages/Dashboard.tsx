import { useState, useEffect } from 'react';
import {
  Store,
  Truck,
  Package,
  ShieldAlert,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import styles from './Dashboard.module.css';

const kpiData = [
  { label: 'Active Pharmacies', value: '142', subLine: '+2 this month', icon: Store, color: 'teal' },
  { label: 'Drivers On Shift', value: '38', subLine: '4 pending verification', icon: Truck, color: 'blue' },
  { label: 'Orders In Flight', value: '86', subLine: 'Across all active statuses', icon: Package, color: 'blue' },
  { label: 'Compliance At Risk', value: '15', subLine: '3 non-compliant, 12 expiring', icon: ShieldAlert, color: 'amber', highlight: true },
];

const deliveryStatuses = [
  { label: 'Submitted', count: 12 },
  { label: 'Accepted', count: 18 },
  { label: 'Driver Assigned', count: 24 },
  { label: 'Picked Up', count: 15 },
  { label: 'En Route', count: 17 },
  { label: 'Delivered', count: 140 },
  { label: 'CoC Confirmed', count: 138 },
  { label: 'Completed', count: 135 },
  { label: 'Failed', count: 2, isError: true },
  { label: 'Cancelled', count: 4 },
];

const complianceItems = [
  { entity: 'Northgate Infusion Pharmacy', req: 'DEA Registration', status: 'Non-Compliant', color: 'red' },
  { entity: 'Westside Delivery Rx', req: 'Driver Insurance', status: 'Expiring Soon', color: 'amber' },
  { entity: 'Oak Street Apothecary', req: 'State License', status: 'Expiring Soon', color: 'amber' },
];

const adminActions = [
  { action: 'Approved driver onboarding', target: 'John D.', actor: 'Sarah W.', time: '10m ago', type: 'admin' },
  { action: 'Automated compliance check', target: '142 Pharmacies', actor: 'System', time: '1h ago', type: 'system' },
  { action: 'Overrode delivery failure', target: 'ORD-9921', actor: 'Mike T.', time: '2h ago', type: 'admin' },
  { action: 'Updated fee schedule', target: 'Standard Tier', actor: 'Sarah W.', time: '4h ago', type: 'admin' },
];

const alerts = [
  { desc: 'Northgate DEA Registration expired', urgency: 'Critical', time: '1h ago' },
  { desc: '2 drivers pending background check > 48h', urgency: 'High', time: '3h ago' },
  { desc: 'Unusually high cancellation rate (Westside)', urgency: 'High', time: '5h ago' },
  { desc: 'Scheduled maintenance this weekend', urgency: 'Medium', time: '1d ago' },
];

const Dashboard = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.pageContainer}>

      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderInfo}>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.pageDescription}>Network overview across all pharmacies, drivers, and deliveries.</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.liveIndicator}>
            <span className={styles.liveDot}></span>
            <span className={styles.liveText}>Last updated {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <button className="btn btn-secondary btn-icon" title="Refresh">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className={styles.kpiStrip}>
        {kpiData.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className={`${styles.kpiCard} ${kpi.highlight ? styles.kpiHighlight : ''}`} style={{ animationDelay: `${idx * 50}ms` }}>
              <div className={styles.kpiHeader}>
                <div className={`${styles.kpiIconWrapper} ${styles[kpi.color]}`}>
                  <Icon size={16} />
                </div>
                <div className={styles.kpiValue}>{kpi.value}</div>
              </div>
              <div className={styles.kpiDetails}>
                <div className={styles.kpiLabel}>{kpi.label}</div>
                <div className={styles.kpiSubLine}>{kpi.subLine}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Zone */}
      <div className={styles.mainZone}>
        {/* Delivery Pipeline */}
        <div className={`${styles.card} ${styles.pipelineCard}`}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Delivery status summary</h2>
          </div>
          <div className={styles.statusGrid}>
            {deliveryStatuses.map((status, idx) => (
              <div key={idx} className={`${styles.statusTile} ${status.isError && status.count > 0 ? styles.statusTileError : ''}`}>
                <div className={styles.statusCount}>{status.count}</div>
                <div className={styles.statusLabel}>{status.label}</div>
              </div>
            ))}
          </div>
          <div className={styles.stackedBar}>
            <div className={styles.barSegment} style={{ width: '65%', backgroundColor: 'var(--color-teal)' }} title="Completed/Healthy"></div>
            <div className={styles.barSegment} style={{ width: '30%', backgroundColor: 'var(--color-blue)' }} title="In Progress"></div>
            <div className={styles.barSegment} style={{ width: '5%', backgroundColor: 'var(--color-red)' }} title="Failed/Cancelled"></div>
          </div>
          <div className={styles.cardFooter}>
            <a href="#" className={styles.footerLink}>View all deliveries <ArrowRight size={14} className={styles.arrowIcon} /></a>
          </div>
        </div>

        {/* Compliance Snapshot */}
        <div className={`${styles.card} ${styles.complianceCard}`}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Compliance snapshot</h2>
            <span className={styles.badgeAmber}>15 At Risk</span>
          </div>

          <div className={styles.expiryHorizon}>
            {/* Condensed Expiry Horizon visual */}
            <div className={styles.horizonTrack}>
              <div className={styles.horizonLabel}>Today</div>
              <div className={styles.horizonLine}>
                <div className={styles.horizonDot} style={{ left: '10%', backgroundColor: 'var(--color-red)' }} title="Northgate Infusion Pharmacy"></div>
                <div className={styles.horizonDot} style={{ left: '30%', backgroundColor: 'var(--color-amber)' }} title="Westside Delivery Rx"></div>
                <div className={styles.horizonDot} style={{ left: '60%', backgroundColor: 'var(--color-amber)' }} title="Oak Street Apothecary"></div>
              </div>
              <div className={styles.horizonLabel}>90d</div>
            </div>
          </div>

          <div className={styles.complianceList}>
            {complianceItems.map((item, idx) => (
              <div key={idx} className={styles.complianceItem}>
                <div className={styles.complianceItemInfo}>
                  <div className={styles.complianceEntity}>{item.entity}</div>
                  <div className={styles.complianceReq}>{item.req}</div>
                </div>
                <span className={`badge badge-${item.color}`}>{item.status}</span>
              </div>
            ))}
          </div>
          <div className={styles.cardFooter}>
            <a href="#" className={styles.footerLink}>Open Compliance Command Center <ArrowRight size={14} className={styles.arrowIcon} /></a>
          </div>
        </div>
      </div>

      {/* Secondary Row */}
      <div className={styles.secondaryRow}>
        {/* Admin Actions */}
        <div className={`${styles.card} ${styles.actionsCard}`}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Recent admin actions</h2>
          </div>
          <div className={styles.actionList}>
            {adminActions.map((action, idx) => (
              <div key={idx} className={`${styles.actionItem} ${action.type === 'admin' ? styles.actionAdmin : styles.actionSystem}`}>
                <div className={styles.actionMain}>
                  <span className={styles.actionDesc}>{action.action}</span>
                  <span className={styles.actionTarget}> • {action.target}</span>
                </div>
                <div className={styles.actionMeta}>
                  <span className={styles.actionActor}>{action.actor}</span>
                  <span className={styles.actionTime}>{action.time}</span>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.cardFooter}>
            <a href="#" className={styles.footerLink}>View full audit log <ArrowRight size={14} className={styles.arrowIcon} /></a>
          </div>
        </div>

        {/* Alerts */}
        <div className={`${styles.card} ${styles.alertsCard}`}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Alerts</h2>
            <span className={styles.badgeRed}>3 Unread</span>
          </div>
          <div className={styles.alertList}>
            {alerts.map((alert, idx) => (
              <div key={idx} className={styles.alertItem}>
                <div className={`${styles.alertUrgency} ${styles['urgency' + alert.urgency]}`}></div>
                <div className={styles.alertContent}>
                  <div className={styles.alertDesc}>{alert.desc}</div>
                  <div className={styles.alertTime}>{alert.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.cardFooter}>
            <a href="#" className={styles.footerLink}>View all alerts <ArrowRight size={14} className={styles.arrowIcon} /></a>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
