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
  ShieldCheck,
  Ban,
  CheckCheck,
} from 'lucide-react';
import { PHARMACY_TENANT } from '../../mock/pharmacyMockData';
import { pharmacyDeliveryService } from '../../services/pharmacyDeliveryService';
import type { DeliveryOrder, DeliveryStatus } from '../../types/delivery';
import styles from './PharmacyDashboard.module.css';

const PharmacyDashboard = () => {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>(pharmacyDeliveryService.getDeliveries());
  const [time, setTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Subscribe to pharmacyDeliveryService live updates
  useEffect(() => {
    const unsubscribe = pharmacyDeliveryService.subscribe(() => {
      setDeliveries(pharmacyDeliveryService.getDeliveries());
    });
    return () => unsubscribe();
  }, []);

  // Periodic clock update
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setDeliveries(pharmacyDeliveryService.getDeliveries());
    setTime(new Date());
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Compute KPIs
  const kpis = useMemo(() => {
    return {
      ordersToday: deliveries.length,
      inTransit: deliveries.filter((d) => d.status === 'En Route' || d.status === 'Picked Up' || d.status === 'Driver Assigned').length,
      deliveredCompleted: deliveries.filter((d) => d.status === 'Delivered' || d.status === 'Chain of Custody Confirmed' || d.status === 'Completed').length,
      failedCancelled: deliveries.filter((d) => d.status === 'Failed' || d.status === 'Cancelled').length,
    };
  }, [deliveries]);

  // Full status pipeline counts
  const pipelineCounts = useMemo(() => {
    const counts: Record<DeliveryStatus, number> = {
      Submitted: 0,
      Accepted: 0,
      'Driver Assigned': 0,
      'Picked Up': 0,
      'En Route': 0,
      Delivered: 0,
      'Chain of Custody Confirmed': 0,
      Completed: 0,
      Failed: 0,
      Cancelled: 0,
      'Held — Compliance': 0,
    };
    deliveries.forEach((d) => {
      if (counts[d.status] !== undefined) counts[d.status]++;
    });
    return counts;
  }, [deliveries]);

  // Recently updated orders
  const recentOrders = useMemo(() => {
    return [...deliveries]
      .sort((a, b) => b.lastUpdatedTimestamp - a.lastUpdatedTimestamp)
      .slice(0, 6);
  }, [deliveries]);

  // "Needs attention" items
  const attentionItems = useMemo(() => {
    return deliveries.filter((d) => {
      if (d.status === 'Failed') return true;
      if (d.status === 'Submitted' || d.status === 'Accepted') return true;
      if (d.slaWindow?.isNearBreach) return true;
      return false;
    });
  }, [deliveries]);

  const getStatusBadgeClass = (status: DeliveryStatus) => {
    switch (status) {
      case 'Submitted': return 'badge badge-grey';
      case 'Accepted': return 'badge badge-blue';
      case 'Driver Assigned': return 'badge badge-blue';
      case 'Picked Up': return 'badge badge-amber';
      case 'En Route': return 'badge badge-amber';
      case 'Delivered': return 'badge badge-teal';
      case 'Chain of Custody Confirmed': return 'badge badge-teal';
      case 'Completed': return 'badge badge-teal';
      case 'Failed': return 'badge badge-red';
      case 'Cancelled': return 'badge badge-grey';
      case 'Held — Compliance': return 'badge badge-red';
      default: return 'badge badge-grey';
    }
  };

  const getStatusIcon = (status: DeliveryStatus) => {
    switch (status) {
      case 'Submitted': return <Clock size={12} />;
      case 'Accepted': return <CheckCheck size={12} />;
      case 'Driver Assigned': return <Truck size={12} />;
      case 'Picked Up': return <Package size={12} />;
      case 'En Route': return <Truck size={12} />;
      case 'Delivered': return <CheckCircle2 size={12} />;
      case 'Chain of Custody Confirmed': return <ShieldCheck size={12} />;
      case 'Completed': return <CheckCircle2 size={12} />;
      case 'Failed': return <XCircle size={12} />;
      case 'Cancelled': return <Ban size={12} />;
      default: return <Clock size={12} />;
    }
  };

  const kpiData = [
    { label: 'Total Orders', value: kpis.ordersToday, icon: Package, color: 'teal' as const },
    { label: 'Active in Transit', value: kpis.inTransit, icon: Truck, color: 'blue' as const },
    { label: 'Delivered / Confirmed', value: kpis.deliveredCompleted, icon: CheckCircle2, color: 'teal' as const },
    { label: 'Failed / Cancelled', value: kpis.failedCancelled, icon: XCircle, color: 'red' as const, highlight: kpis.failedCancelled > 0 },
  ];

  const primaryPipelineSteps: { key: DeliveryStatus; label: string; icon: any }[] = [
    { key: 'Submitted', label: 'Submitted', icon: Clock },
    { key: 'Accepted', label: 'Accepted', icon: CheckCheck },
    { key: 'Driver Assigned', label: 'Assigned', icon: Truck },
    { key: 'Picked Up', label: 'Picked Up', icon: Package },
    { key: 'En Route', label: 'En Route', icon: Truck },
    { key: 'Delivered', label: 'Delivered', icon: CheckCircle2 },
    { key: 'Chain of Custody Confirmed', label: 'CoC Confirmed', icon: ShieldCheck },
    { key: 'Completed', label: 'Completed', icon: CheckCircle2 },
    { key: 'Failed', label: 'Failed', icon: AlertTriangle },
    { key: 'Cancelled', label: 'Cancelled', icon: Ban },
  ];

  return (
    <div className={styles.pageContainer}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderInfo}>
          <h1 className={styles.pageTitle}>Pharmacy Dashboard</h1>
          <p className={styles.pageDescription}>{PHARMACY_TENANT.name} ({PHARMACY_TENANT.code}) — Real-time delivery overview</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.liveIndicator}>
            <span className={styles.liveDot}></span>
            <span className={styles.liveText}>
              Live sync {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
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
        {/* Left: Deliveries Pipeline & Live Feed */}
        <div className={`${styles.card} ${styles.pipelineCard}`}>
          <div className={styles.cardHeader}>
            <div>
              <h2 className={styles.cardTitle}>Deliveries Pipeline</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Full lifecycle tracking for pharmacy orders</span>
            </div>
            <div className={styles.liveIndicatorSmall}>
              <span className={styles.liveDot}></span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Live</span>
            </div>
          </div>

          {/* Pipeline Status Tiles (Full status set) */}
          <div className={styles.statusGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))' }}>
            {primaryPipelineSteps.map((step) => {
              const count = pipelineCounts[step.key] || 0;
              const isError = step.key === 'Failed' && count > 0;
              return (
                <div
                  key={step.key}
                  className={`${styles.statusTile} ${isError ? styles.statusTileError : ''}`}
                  onClick={() => navigate(`/pharmacy/deliveries?status=${encodeURIComponent(step.key)}`)}
                  role="button"
                  tabIndex={0}
                  style={{ cursor: 'pointer' }}
                  title={`View ${step.label} orders`}
                >
                  <div className={styles.statusCount}>{count}</div>
                  <div className={styles.statusLabel} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <step.icon size={11} /> {step.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stacked Progress Bar */}
          <div className={styles.stackedBar}>
            <div className={styles.barSegment} style={{ width: `${((pipelineCounts.Delivered + pipelineCounts['Chain of Custody Confirmed'] + pipelineCounts.Completed) / Math.max(kpis.ordersToday, 1)) * 100}%`, backgroundColor: 'var(--color-teal)' }} title="Delivered & Completed"></div>
            <div className={styles.barSegment} style={{ width: `${((pipelineCounts['En Route'] + pipelineCounts['Picked Up'] + pipelineCounts['Driver Assigned']) / Math.max(kpis.ordersToday, 1)) * 100}%`, backgroundColor: 'var(--color-blue)' }} title="In Transit & Assigned"></div>
            <div className={styles.barSegment} style={{ width: `${((pipelineCounts.Submitted + pipelineCounts.Accepted) / Math.max(kpis.ordersToday, 1)) * 100}%`, backgroundColor: '#CBD5E1' }} title="Submitted & Accepted"></div>
            <div className={styles.barSegment} style={{ width: `${((pipelineCounts.Failed + pipelineCounts.Cancelled) / Math.max(kpis.ordersToday, 1)) * 100}%`, backgroundColor: 'var(--color-red)' }} title="Failed / Cancelled"></div>
          </div>

          {/* Recent Orders List */}
          <div className={styles.recentOrdersList}>
            <div className={styles.sectionSubtitle}>Recently updated orders</div>
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className={styles.recentOrderItem}
                onClick={() => navigate('/pharmacy/deliveries')}
              >
                <div className={styles.recentOrderId}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-teal)' }}>{order.id}</span>
                  <span className={styles.recentOrderPatient}>{order.patientInitials} ({order.patientSafeId})</span>
                </div>
                <div className={styles.recentOrderFlags}>
                  {order.flags.controlled && (
                    <span className={styles.flagIconSmall} style={{ background: '#FEF3C7', color: '#B45309' }} title="Controlled Substance">
                      <Lock size={11} />
                    </span>
                  )}
                  {order.flags.refrigerated && (
                    <span className={styles.flagIconSmall} style={{ background: '#E0F2FE', color: '#0284C7' }} title="Refrigerated Cold Chain">
                      <Snowflake size={11} />
                    </span>
                  )}
                  {order.flags.rush && (
                    <span className={styles.flagIconSmall} style={{ background: '#FEE2E2', color: '#DC2626' }} title="Rush Priority">
                      <Zap size={11} />
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
              View all deliveries table <ArrowRight size={14} className={styles.arrowIcon} />
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
              <p>All clear — no orders need immediate attention.</p>
            </div>
          ) : (
            <div className={styles.attentionList}>
              {attentionItems.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className={styles.attentionItem}
                  onClick={() => navigate('/pharmacy/deliveries')}
                >
                  <div className={styles.attentionIcon}>
                    {item.status === 'Failed' ? (
                      <AlertTriangle size={16} color="var(--color-red)" />
                    ) : item.slaWindow?.isNearBreach ? (
                      <Zap size={16} color="var(--color-red)" />
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
                        ? item.attentionReason || 'Delivery failed — returned to depot'
                        : item.slaWindow?.isNearBreach
                        ? `SLA Urgent: ${item.slaWindow.urgentTimeLeft || 'near breach'}`
                        : 'Awaiting driver pickup — cancellable before dispatch'}
                    </div>
                    <span className={getStatusBadgeClass(item.status)} style={{ marginTop: '0.25rem', width: 'fit-content' }}>
                      {getStatusIcon(item.status)} {item.status}
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

