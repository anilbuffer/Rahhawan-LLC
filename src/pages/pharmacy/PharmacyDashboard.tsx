import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowRight,
  AlertTriangle,
  Clock,
  Lock,
  Snowflake,
  Zap,
} from 'lucide-react';
import { PHARMACY_TENANT, PHARMACY_DELIVERIES } from '../../mock/pharmacyMockData';
import type { DeliveryStatus } from '../../types/delivery';
import styles from './PharmacyDashboard.module.css';

const PharmacyDashboard = () => {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate live polling with 30s interval
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTime(new Date());
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Compute KPIs
  const kpis = useMemo(() => {
    const today = PHARMACY_DELIVERIES; // All mock data represents "today"
    return {
      ordersToday: today.length,
      inTransit: today.filter((d) => d.status === 'En Route' || d.status === 'Driver Assigned').length,
      delivered: today.filter((d) => d.status === 'Delivered').length,
      failedCancelled: today.filter((d) => d.status === 'Failed').length,
    };
  }, []);

  // Status pipeline counts
  const pipelineCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Submitted: 0,
      'Driver Assigned': 0,
      'En Route': 0,
      Delivered: 0,
      Failed: 0,
    };
    PHARMACY_DELIVERIES.forEach((d) => {
      if (counts[d.status] !== undefined) counts[d.status]++;
    });
    return counts;
  }, []);

  // Recently updated orders (sorted by timestamp)
  const recentOrders = useMemo(() => {
    return [...PHARMACY_DELIVERIES]
      .sort((a, b) => b.lastUpdatedTimestamp - a.lastUpdatedTimestamp)
      .slice(0, 5);
  }, []);

  // "Needs attention" items
  const attentionItems = useMemo(() => {
    return PHARMACY_DELIVERIES.filter((d) => {
      // Cancellable pre-pickup orders
      if (d.status === 'Submitted') return true;
      // Failed orders
      if (d.status === 'Failed') return true;
      return false;
    });
  }, []);

  const getStatusBadgeClass = (status: DeliveryStatus) => {
    switch (status) {
      case 'Submitted': return 'badge badge-grey';
      case 'Driver Assigned': return 'badge badge-blue';
      case 'En Route': return 'badge badge-amber';
      case 'Delivered': return 'badge badge-teal';
      case 'Failed': return 'badge badge-red';
      case 'Held — Compliance': return 'badge badge-red';
      default: return 'badge badge-grey';
    }
  };

  const getStatusIcon = (status: DeliveryStatus) => {
    switch (status) {
      case 'Submitted': return <Clock size={12} />;
      case 'Driver Assigned': return <Truck size={12} />;
      case 'En Route': return <Truck size={12} />;
      case 'Delivered': return <CheckCircle2 size={12} />;
      case 'Failed': return <XCircle size={12} />;
      default: return <Clock size={12} />;
    }
  };

  const kpiData = [
    { label: 'Orders Today', value: kpis.ordersToday, icon: Package, color: 'teal' as const },
    { label: 'In Transit', value: kpis.inTransit, icon: Truck, color: 'blue' as const },
    { label: 'Delivered Today', value: kpis.delivered, icon: CheckCircle2, color: 'teal' as const },
    { label: 'Failed / Cancelled', value: kpis.failedCancelled, icon: XCircle, color: 'red' as const, highlight: kpis.failedCancelled > 0 },
  ];

  return (
    <div className={styles.pageContainer}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderInfo}>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <p className={styles.pageDescription}>{PHARMACY_TENANT.name} — Today's delivery overview</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.liveIndicator}>
            <span className={styles.liveDot}></span>
            <span className={styles.liveText}>
              Last updated {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
          <button
            className="btn btn-secondary btn-icon"
            title="Refresh Dashboard"
            onClick={handleRefresh}
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className={styles.kpiStrip}>
        {kpiData.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`${styles.kpiCard} ${kpi.highlight ? styles.kpiHighlight : ''}`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className={styles.kpiHeader}>
                <div className={`${styles.kpiIconWrapper} ${styles[kpi.color]}`}>
                  <Icon size={16} />
                </div>
                <div className={styles.kpiValue}>{kpi.value}</div>
              </div>
              <div className={styles.kpiDetails}>
                <div className={styles.kpiLabel}>{kpi.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Zone — Two Columns */}
      <div className={styles.mainZone}>
        {/* Left: Today's Deliveries */}
        <div className={`${styles.card} ${styles.pipelineCard}`}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Today's deliveries</h2>
            <div className={styles.liveIndicatorSmall}>
              <span className={styles.liveDot}></span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Live</span>
            </div>
          </div>

          {/* Pipeline Status Tiles */}
          <div className={styles.statusGrid}>
            {Object.entries(pipelineCounts).map(([status, count]) => (
              <div
                key={status}
                className={`${styles.statusTile} ${status === 'Failed' && count > 0 ? styles.statusTileError : ''}`}
                onClick={() => navigate('/pharmacy/deliveries')}
                role="button"
                tabIndex={0}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.statusCount}>{count}</div>
                <div className={styles.statusLabel}>{status}</div>
              </div>
            ))}
          </div>

          {/* Stacked Progress Bar */}
          <div className={styles.stackedBar}>
            <div className={styles.barSegment} style={{ width: `${(pipelineCounts.Delivered / Math.max(kpis.ordersToday, 1)) * 100}%`, backgroundColor: 'var(--color-teal)' }} title="Delivered"></div>
            <div className={styles.barSegment} style={{ width: `${((pipelineCounts['En Route'] + pipelineCounts['Driver Assigned']) / Math.max(kpis.ordersToday, 1)) * 100}%`, backgroundColor: 'var(--color-blue)' }} title="In Progress"></div>
            <div className={styles.barSegment} style={{ width: `${(pipelineCounts.Submitted / Math.max(kpis.ordersToday, 1)) * 100}%`, backgroundColor: '#E5E7EB' }} title="Submitted"></div>
            <div className={styles.barSegment} style={{ width: `${(pipelineCounts.Failed / Math.max(kpis.ordersToday, 1)) * 100}%`, backgroundColor: 'var(--color-red)' }} title="Failed"></div>
          </div>

          {/* Recent Orders List */}
          <div className={styles.recentOrdersList}>
            <div className={styles.sectionSubtitle}>Recently updated</div>
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className={styles.recentOrderItem}
                onClick={() => navigate('/pharmacy/deliveries')}
              >
                <div className={styles.recentOrderId}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-teal)' }}>{order.id}</span>
                  <span className={styles.recentOrderPatient}>{order.patientInitials}</span>
                </div>
                <div className={styles.recentOrderFlags}>
                  {order.flags.controlled && (
                    <span className={styles.flagIconSmall} style={{ background: '#FEF3C7', color: '#B45309' }}>
                      <Lock size={10} />
                    </span>
                  )}
                  {order.flags.refrigerated && (
                    <span className={styles.flagIconSmall} style={{ background: '#E0F2FE', color: '#0284C7' }}>
                      <Snowflake size={10} />
                    </span>
                  )}
                  {order.flags.rush && (
                    <span className={styles.flagIconSmall} style={{ background: '#FEE2E2', color: '#DC2626' }}>
                      <Zap size={10} />
                    </span>
                  )}
                </div>
                <span className={getStatusBadgeClass(order.status)}>
                  {getStatusIcon(order.status)} {order.status}
                </span>
                <span className={styles.recentOrderTime}>{order.lastUpdated}</span>
              </div>
            ))}
          </div>

          <div className={styles.cardFooter}>
            <Link to="/pharmacy/deliveries" className={styles.footerLink}>
              View all deliveries <ArrowRight size={14} className={styles.arrowIcon} />
            </Link>
          </div>
        </div>

        {/* Right: Needs Your Attention */}
        <div className={`${styles.card} ${styles.attentionCard}`}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Needs your attention</h2>
            {attentionItems.length > 0 && (
              <span className={styles.badgeAmber}>{attentionItems.length} items</span>
            )}
          </div>

          {attentionItems.length === 0 ? (
            <div className={styles.emptyAttention}>
              <CheckCircle2 size={32} color="var(--color-teal)" />
              <p>All clear — no items need attention right now.</p>
            </div>
          ) : (
            <div className={styles.attentionList}>
              {attentionItems.map((item) => (
                <div
                  key={item.id}
                  className={styles.attentionItem}
                  onClick={() => navigate('/pharmacy/deliveries')}
                >
                  <div className={styles.attentionIcon}>
                    {item.status === 'Failed' ? (
                      <AlertTriangle size={16} color="var(--color-red)" />
                    ) : (
                      <Clock size={16} color="var(--color-amber)" />
                    )}
                  </div>
                  <div className={styles.attentionContent}>
                    <div className={styles.attentionTitle}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{item.id}</span>
                      {' — '}
                      {item.patientInitials}
                    </div>
                    <div className={styles.attentionDesc}>
                      {item.status === 'Failed'
                        ? item.attentionReason || 'Delivery failed — action required'
                        : 'Awaiting driver assignment — cancellable'}
                    </div>
                    <span className={getStatusBadgeClass(item.status)} style={{ marginTop: '0.25rem' }}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className={styles.cardFooter}>
            <Link to="/pharmacy/new-order" className={styles.footerLink}>
              Create new delivery order <ArrowRight size={14} className={styles.arrowIcon} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyDashboard;
