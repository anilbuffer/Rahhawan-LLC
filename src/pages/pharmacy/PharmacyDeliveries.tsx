import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Package,
  Search,
  Lock,
  Snowflake,
  Zap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  X,
  Truck,
  Phone,
  Plus,
  Thermometer,
  PenTool,
  Camera,
  FileCheck,
  ShieldCheck,
  Ban,
  CheckCheck,
  Copy,
  Calendar,
  Sparkles,
  Info,
} from 'lucide-react';
import type { DeliveryOrder, DeliveryStatus } from '../../types/delivery';
import { pharmacyDeliveryService } from '../../services/pharmacyDeliveryService';
import styles from './PharmacyDeliveries.module.css';

const PharmacyDeliveries: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>(pharmacyDeliveryService.getDeliveries());

  // Filters
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterControlled, setFilterControlled] = useState(false);
  const [filterCold, setFilterCold] = useState(false);
  const [filterRush, setFilterRush] = useState(false);

  // Drawer & Modal state
  const [activeOrder, setActiveOrder] = useState<DeliveryOrder | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);
  const [duplicateModalOrder, setDuplicateModalOrder] = useState<DeliveryOrder | null>(null);

  // Subscribe to service updates
  useEffect(() => {
    const unsubscribe = pharmacyDeliveryService.subscribe(() => {
      const updated = pharmacyDeliveryService.getDeliveries();
      setDeliveries(updated);
      if (activeOrder) {
        const fresh = updated.find((d) => d.id === activeOrder.id);
        if (fresh) setActiveOrder(fresh);
      }
    });
    return () => unsubscribe();
  }, [activeOrder]);

  // Sync status filter with URL searchParams
  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam) {
      setSelectedStatus(statusParam);
    }
  }, [searchParams]);

  // Status counts for metric cards
  const statusCounts = useMemo(() => ({
    all: deliveries.length,
    Submitted: deliveries.filter((d) => d.status === 'Submitted' || d.status === 'Accepted').length,
    'Driver Assigned': deliveries.filter((d) => d.status === 'Driver Assigned').length,
    'En Route': deliveries.filter((d) => d.status === 'En Route' || d.status === 'Picked Up').length,
    Delivered: deliveries.filter((d) => d.status === 'Delivered' || d.status === 'Chain of Custody Confirmed' || d.status === 'Completed').length,
    Failed: deliveries.filter((d) => d.status === 'Failed' || d.status === 'Cancelled').length,
  }), [deliveries]);

  // Filtered deliveries
  const filteredDeliveries = useMemo(() => {
    const now = Date.now();
    return deliveries.filter((item) => {
      // Status filter
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'Submitted') {
          if (item.status !== 'Submitted' && item.status !== 'Accepted') return false;
        } else if (selectedStatus === 'In Transit') {
          if (item.status !== 'En Route' && item.status !== 'Picked Up') return false;
        } else if (selectedStatus === 'Delivered') {
          if (item.status !== 'Delivered' && item.status !== 'Chain of Custody Confirmed' && item.status !== 'Completed') return false;
        } else if (item.status !== selectedStatus) {
          return false;
        }
      }

      // Date range filter
      if (selectedDateRange !== 'all') {
        const itemTime = item.createdAtTimestamp || now;
        const diffHours = (now - itemTime) / (1000 * 60 * 60);
        if (selectedDateRange === 'today' && diffHours > 24) return false;
        if (selectedDateRange === 'yesterday' && (diffHours < 24 || diffHours > 48)) return false;
        if (selectedDateRange === '7days' && diffHours > 24 * 7) return false;
        if (selectedDateRange === '30days' && diffHours > 24 * 30) return false;
      }

      // Flag toggles
      if (filterControlled && !item.flags.controlled) return false;
      if (filterCold && !item.flags.refrigerated) return false;
      if (filterRush && !item.flags.rush) return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = item.id.toLowerCase().includes(q);
        const matchPatient = (item.patientName || '').toLowerCase().includes(q) ||
          item.patientInitials.toLowerCase().includes(q) ||
          item.patientSafeId.toLowerCase().includes(q);
        const matchDriver = item.driver?.name.toLowerCase().includes(q);
        const matchAddress = item.deliveryAddress.street.toLowerCase().includes(q) ||
          item.deliveryAddress.city.toLowerCase().includes(q);
        if (!matchId && !matchPatient && !matchDriver && !matchAddress) return false;
      }

      return true;
    });
  }, [deliveries, selectedStatus, selectedDateRange, searchQuery, filterControlled, filterCold, filterRush]);

  const getStatusBadgeClass = (status: DeliveryStatus) => {
    switch (status) {
      case 'Submitted': return styles.statusSubmitted;
      case 'Accepted': return styles.statusAssigned;
      case 'Driver Assigned': return styles.statusAssigned;
      case 'Picked Up': return styles.statusEnRoute;
      case 'En Route': return styles.statusEnRoute;
      case 'Delivered': return styles.statusDelivered;
      case 'Chain of Custody Confirmed': return styles.statusDelivered;
      case 'Completed': return styles.statusDelivered;
      case 'Failed': return styles.statusFailed;
      case 'Cancelled': return styles.statusSubmitted;
      case 'Held — Compliance': return styles.statusHeld;
      default: return styles.statusSubmitted;
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
      case 'Failed': return <AlertTriangle size={12} />;
      case 'Cancelled': return <Ban size={12} />;
      default: return <Clock size={12} />;
    }
  };

  // Order can only be cancelled before driver pickup
  const canCancel = (status: DeliveryStatus) => {
    return status === 'Submitted' || status === 'Accepted' || status === 'Driver Assigned';
  };

  const handleCancelOrder = (orderId: string) => {
    pharmacyDeliveryService.cancelOrder(orderId, 'Cancelled by pharmacy staff before driver pickup');
    setCancelConfirm(null);
  };

  const handleDuplicateClick = (order: DeliveryOrder, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDuplicateModalOrder(order);
  };

  const handleProceedDuplicate = () => {
    if (!duplicateModalOrder) return;
    const orderToDuplicate = duplicateModalOrder;
    setDuplicateModalOrder(null);
    setActiveOrder(null);
    navigate('/pharmacy/new-order', {
      state: {
        prefillOrder: {
          patientName: orderToDuplicate.patientName || `Patient (${orderToDuplicate.patientInitials})`,
          phone: orderToDuplicate.phone || '+1 (312) 555-0100',
          deliveryAddress: orderToDuplicate.deliveryAddress,
          prescriptionSummary: orderToDuplicate.prescriptionSummary,
          flags: orderToDuplicate.flags,
          specialInstructions: orderToDuplicate.specialInstructions || '',
        },
      },
    });
  };

  return (
    <div className={styles.deliveriesContainer}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Deliveries</h1>
          <p className={styles.pageSubtitle}>Real-time delivery management & chain-of-custody tracking</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.liveIndicatorSmall}>
            <span className={styles.liveDot}></span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Live Sync</span>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/pharmacy/new-order')}>
            <Plus size={16} />
            <span>New Order</span>
          </button>
        </div>
      </div>

      {/* Status Metrics */}
      <div className={styles.metricsGrid}>
        {[
          { key: 'all', label: 'All Orders', count: statusCounts.all, icon: Package, iconClass: styles.iconTeal },
          { key: 'Submitted', label: 'Awaiting Pickup', count: statusCounts.Submitted, icon: Clock, iconClass: styles.iconAmber },
          { key: 'Driver Assigned', label: 'Driver Dispatched', count: statusCounts['Driver Assigned'], icon: Truck, iconClass: styles.iconBlue },
          { key: 'En Route', label: 'In Transit', count: statusCounts['En Route'], icon: Truck, iconClass: styles.iconAmber },
          { key: 'Delivered', label: 'Delivered / CoC', count: statusCounts.Delivered, icon: CheckCircle2, iconClass: styles.iconTeal },
          { key: 'Failed', label: 'Failed / Cancelled', count: statusCounts.Failed, icon: AlertTriangle, iconClass: styles.iconRed },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.key}
              className={`${styles.metricCard} ${selectedStatus === metric.key ? styles.metricCardActive : ''}`}
              onClick={() => {
                setSelectedStatus(metric.key);
                setSearchParams(metric.key === 'all' ? {} : { status: metric.key });
              }}
            >
              <div className={styles.metricInfo}>
                <span className={styles.metricLabel}>{metric.label}</span>
                <span className={styles.metricValue}>{metric.count}</span>
              </div>
              <div className={`${styles.metricIconWrapper} ${metric.iconClass}`}>
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className={styles.filterCard}>
        <div className={styles.filterRowPrimary}>
          <div className={`${styles.searchBox} input`}>
            <Search size={16} color="var(--color-text-muted)" />
            <input
              type="text"
              placeholder="Search Order ID, patient name, Safe ID, street..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={14} color="var(--color-text-muted)" />
              </button>
            )}
          </div>

          {/* Date Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Calendar size={14} color="var(--color-text-muted)" />
            <select
              className={styles.dateSelect}
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <select
            className={styles.dateSelect}
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setSearchParams(e.target.value === 'all' ? {} : { status: e.target.value });
            }}
          >
            <option value="all">All Statuses</option>
            <option value="Submitted">Submitted / Accepted</option>
            <option value="Driver Assigned">Driver Assigned</option>
            <option value="Picked Up">Picked Up</option>
            <option value="En Route">En Route</option>
            <option value="Delivered">Delivered</option>
            <option value="Chain of Custody Confirmed">Chain of Custody Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Failed">Failed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Flag Toggle Pills */}
          <div className={styles.flagToggles}>
            <button
              className={`${styles.flagPill} ${filterControlled ? styles.flagPillControlledActive : ''}`}
              onClick={() => setFilterControlled(!filterControlled)}
              title="Filter Controlled Substances"
            >
              <Lock size={12} /> Controlled
            </button>
            <button
              className={`${styles.flagPill} ${filterCold ? styles.flagPillColdActive : ''}`}
              onClick={() => setFilterCold(!filterCold)}
              title="Filter Refrigerated Orders"
            >
              <Snowflake size={12} /> Refrigerated
            </button>
            <button
              className={`${styles.flagPill} ${filterRush ? styles.flagPillRushActive : ''}`}
              onClick={() => setFilterRush(!filterRush)}
              title="Filter Rush Priority Orders"
            >
              <Zap size={12} /> Rush
            </button>
          </div>
        </div>
        <div className={styles.resultCount}>
          Showing {filteredDeliveries.length} of {deliveries.length} orders
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        {filteredDeliveries.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Package size={28} />
            </div>
            <p style={{ fontWeight: 500 }}>No matching delivery orders found</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              {deliveries.length === 0
                ? 'You haven\'t created any delivery orders yet.'
                : 'Try adjusting your filters, date range, or search query.'}
            </p>
            {deliveries.length === 0 && (
              <button className="btn btn-primary" onClick={() => navigate('/pharmacy/new-order')} style={{ marginTop: '0.5rem' }}>
                <Plus size={16} /> Create First Order
              </button>
            )}
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Patient</th>
                  <th>Flags</th>
                  <th>Status</th>
                  <th>Driver</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeliveries.map((order) => (
                  <tr
                    key={order.id}
                    className={`${styles.tableRow} ${activeOrder?.id === order.id ? styles.tableRowSelected : ''}`}
                    onClick={() => setActiveOrder(order)}
                  >
                    <td>
                      <div className={styles.orderIdBlock}>
                        <span className={styles.orderId}>{order.id}</span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <span style={{ fontWeight: 600 }}>{order.patientName || order.patientInitials}</span>
                        <div className={styles.patientId}>{order.patientSafeId} • {order.deliveryAddress.city}, {order.deliveryAddress.state}</div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.flagIcons}>
                        {order.flags.controlled && (
                          <span className={`${styles.flagIcon} ${styles.flagIconLock}`} title="Controlled Substance (Schedule II-V)">
                            <Lock size={12} />
                          </span>
                        )}
                        {order.flags.refrigerated && (
                          <span className={`${styles.flagIcon} ${styles.flagIconCold}`} title="Refrigerated Cold Chain (2°C - 8°C)">
                            <Snowflake size={12} />
                          </span>
                        )}
                        {order.flags.rush && (
                          <span className={`${styles.flagIcon} ${styles.flagIconRush}`} title="Rush Priority Delivery">
                            <Zap size={12} />
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.statusPill} ${getStatusBadgeClass(order.status)}`}>
                        <span className={styles.liveDotStatus}></span>
                        {getStatusIcon(order.status)} {order.status}
                      </span>
                    </td>
                    <td>
                      {order.driver ? (
                        <div className={styles.driverBlock}>
                          <div className={styles.driverAvatar}>
                            {order.driver.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div className={styles.driverDetails}>
                            <span className={styles.driverName}>{order.driver.name}</span>
                            <span className={styles.driverVehicle}>{order.driver.vehicle}</span>
                          </div>
                        </div>
                      ) : (
                        <span className={styles.unassignedBadge}>Dispatching</span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                        {order.createdAt}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}
                          title="Duplicate Previous Order (Future Scope v2.0)"
                          onClick={(e) => handleDuplicateClick(order, e)}
                        >
                          <Copy size={12} />
                          <span>Duplicate</span>
                        </button>
                        <ChevronRight size={16} color="var(--color-text-muted)" style={{ cursor: 'pointer' }} onClick={() => setActiveOrder(order)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-over Drawer for Order Detail */}
      {activeOrder && createPortal(
        <div className={styles.drawerOverlay} onClick={() => { setActiveOrder(null); setCancelConfirm(null); }}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            {/* Drawer Header */}
            <div className={styles.drawerHeader}>
              <div className={styles.drawerTitleBlock}>
                <span className={styles.drawerTitle}>
                  <span style={{ fontFamily: 'monospace', color: 'var(--color-teal)' }}>{activeOrder.id}</span>
                </span>
                <span className={`${styles.statusPill} ${getStatusBadgeClass(activeOrder.status)}`}>
                  <span className={styles.liveDotStatus}></span>
                  {getStatusIcon(activeOrder.status)} {activeOrder.status}
                </span>
              </div>
              <button className={styles.drawerCloseBtn} onClick={() => { setActiveOrder(null); setCancelConfirm(null); }}>
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className={styles.drawerBody}>
              {/* Order Details Section */}
              <div className={styles.drawerSection}>
                <div className={styles.drawerSectionTitle}>
                  <Package size={14} /> Order Information
                </div>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Patient</span>
                    <span className={styles.infoValue}>
                      {activeOrder.patientName || activeOrder.patientInitials} ({activeOrder.patientSafeId})
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Phone</span>
                    <span className={styles.infoValue}>{activeOrder.phone || '+1 (312) 555-0100'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Delivery Address</span>
                    <span className={styles.infoValue}>
                      {activeOrder.deliveryAddress.street}
                      {activeOrder.deliveryAddress.apt ? `, ${activeOrder.deliveryAddress.apt}` : ''}
                      <br />
                      {activeOrder.deliveryAddress.city}, {activeOrder.deliveryAddress.state} {activeOrder.deliveryAddress.zip}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>SLA Window</span>
                    <span className={styles.infoValue}>{activeOrder.slaWindow.start} – {activeOrder.slaWindow.end}</span>
                  </div>
                  <div className={styles.infoItem} style={{ gridColumn: 'span 2' }}>
                    <span className={styles.infoLabel}>Prescription Summary</span>
                    <span className={styles.infoValue} style={{ fontWeight: 600 }}>
                      {activeOrder.prescriptionSummary.itemCount} Item(s) — {activeOrder.prescriptionSummary.description}
                    </span>
                  </div>
                  {activeOrder.specialInstructions && (
                    <div className={styles.infoItem} style={{ gridColumn: 'span 2' }}>
                      <span className={styles.infoLabel}>Special Instructions</span>
                      <span className={styles.infoValue} style={{ fontStyle: 'italic', color: 'var(--color-text-secondary)' }}>
                        "{activeOrder.specialInstructions}"
                      </span>
                    </div>
                  )}
                </div>

                {/* Flags display */}
                <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                  {activeOrder.flags.controlled && (
                    <span className={`${styles.flagIcon} ${styles.flagIconLock}`} style={{ display: 'inline-flex', gap: '0.25rem', padding: '0.25rem 0.5rem', fontSize: '0.7rem', fontWeight: 600, width: 'auto' }}>
                      <Lock size={11} /> Controlled (Schedule II-V)
                    </span>
                  )}
                  {activeOrder.flags.refrigerated && (
                    <span className={`${styles.flagIcon} ${styles.flagIconCold}`} style={{ display: 'inline-flex', gap: '0.25rem', padding: '0.25rem 0.5rem', fontSize: '0.7rem', fontWeight: 600, width: 'auto' }}>
                      <Snowflake size={11} /> Refrigerated (2°C – 8°C)
                    </span>
                  )}
                  {activeOrder.flags.rush && (
                    <span className={`${styles.flagIcon} ${styles.flagIconRush}`} style={{ display: 'inline-flex', gap: '0.25rem', padding: '0.25rem 0.5rem', fontSize: '0.7rem', fontWeight: 600, width: 'auto' }}>
                      <Zap size={11} /> Rush Priority
                    </span>
                  )}
                </div>
              </div>

              {/* Assigned Driver Section */}
              {activeOrder.driver && (
                <div className={styles.drawerSection}>
                  <div className={styles.drawerSectionTitle}>
                    <Truck size={14} /> Assigned Driver
                  </div>
                  <div className={styles.driverInfoBlock}>
                    <div className={styles.driverAvatar} style={{ width: 40, height: 40, fontSize: '0.875rem' }}>
                      {activeOrder.driver.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{activeOrder.driver.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{activeOrder.driver.vehicle}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.125rem' }}>
                        <Phone size={10} /> {activeOrder.driver.phone}
                      </div>
                    </div>
                    {activeOrder.driver.eta && (
                      <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>ETA</div>
                        <div style={{ fontWeight: 600, color: 'var(--color-blue)' }}>{activeOrder.driver.eta}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Proof of Delivery Section (when delivered) */}
              {activeOrder.proofOfDelivery && (
                <div className={styles.drawerSection} style={{ border: '2px solid var(--color-teal)', background: 'rgba(14, 163, 131, 0.02)' }}>
                  <div className={styles.drawerSectionTitle} style={{ color: 'var(--color-teal)' }}>
                    <FileCheck size={14} /> Proof of Delivery & Chain of Custody
                  </div>

                  {/* Recipient Signature */}
                  <div className={styles.proofBlock}>
                    <div className={styles.proofLabel}>
                      <PenTool size={14} /> Recipient Signature
                    </div>
                    <div className={styles.signatureBox}>
                      <svg viewBox="0 0 200 100" className={styles.signatureSvg}>
                        <path
                          d={activeOrder.proofOfDelivery.signatureSvgPath || 'M10,80 Q52,10 95,80 T180,80'}
                          fill="none"
                          stroke="#0F766E"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className={styles.signatureInfo}>
                        <span>Signed by: <strong>{activeOrder.proofOfDelivery.recipientName}</strong></span>
                        <span style={{ color: 'var(--color-text-muted)' }}>{activeOrder.proofOfDelivery.signedAt}</span>
                      </div>
                    </div>
                  </div>

                  {/* Photo Proof */}
                  <div className={styles.proofBlock}>
                    <div className={styles.proofLabel}>
                      <Camera size={14} /> Photo Proof
                    </div>
                    <div className={styles.photoProof}>
                      {activeOrder.proofOfDelivery.photoUrl ? (
                        <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-color)', width: '100%' }}>
                          <img
                            src={activeOrder.proofOfDelivery.photoUrl}
                            alt="Proof of delivery capture"
                            style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                          />
                          <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', background: '#F9FAFB' }}>
                            {activeOrder.proofOfDelivery.photoCaption || 'Geotagged handoff photo captured on driver device.'}
                          </div>
                        </div>
                      ) : (
                        <div className={styles.photoPlaceholder}>
                          <Camera size={20} color="var(--color-text-muted)" />
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            {activeOrder.proofOfDelivery.photoCaption || 'Photo captured at recipient handoff'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Temperature Readings */}
                  {activeOrder.proofOfDelivery.temperatureCelsius !== undefined && (
                    <div className={styles.proofBlock}>
                      <div className={styles.proofLabel}>
                        <Thermometer size={14} /> Verified Temperature Reading
                      </div>
                      <div className={styles.tempReading}>
                        <div className={styles.tempValue}>
                          {activeOrder.proofOfDelivery.temperatureCelsius}°C
                        </div>
                        <div className={styles.tempRange}>
                          Safe compliance range: {activeOrder.proofOfDelivery.tempSafeMin}°C – {activeOrder.proofOfDelivery.tempSafeMax}°C
                        </div>
                        <span className="badge badge-teal" style={{ marginTop: '0.25rem', width: 'fit-content' }}>
                          <CheckCircle2 size={12} /> Within Safe Cold-Chain Range
                        </span>
                      </div>
                      {activeOrder.proofOfDelivery.tempLog && activeOrder.proofOfDelivery.tempLog.length > 0 && (
                        <div className={styles.tempLogGrid}>
                          {activeOrder.proofOfDelivery.tempLog.map((entry, idx) => (
                            <div key={idx} className={styles.tempLogEntry}>
                              <span className={styles.tempLogTime}>{entry.time}</span>
                              <span className={styles.tempLogValue}>{entry.temp}°C</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* CoC Cryptographic Hash */}
                  {activeOrder.proofOfDelivery.cocHash && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-teal)', fontFamily: 'monospace', padding: '0.5rem 0.75rem', background: '#F0FDFA', borderRadius: '8px', border: '1px solid #99F6E4' }}>
                      <div style={{ fontWeight: 600, marginBottom: '0.125rem' }}>DEA Chain of Custody Confirmed:</div>
                      {activeOrder.proofOfDelivery.cocHash}
                    </div>
                  )}
                </div>
              )}

              {/* In-Transit Temperature Log */}
              {activeOrder.temperatureLog && !activeOrder.proofOfDelivery && (
                <div className={styles.drawerSection}>
                  <div className={styles.drawerSectionTitle}>
                    <Thermometer size={14} /> Live Cold-Chain Telemetry
                  </div>
                  <div className={styles.tempLogGrid}>
                    {activeOrder.temperatureLog.map((entry, idx) => (
                      <div key={idx} className={styles.tempLogEntry}>
                        <span className={styles.tempLogTime}>{entry.time}</span>
                        <span className={styles.tempLogValue}>{entry.temp}°C</span>
                        <span className={`badge badge-${entry.status === 'nominal' ? 'teal' : entry.status === 'warning' ? 'amber' : 'red'}`} style={{ fontSize: '0.625rem', width: 'fit-content' }}>
                          {entry.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Lifecycle Timeline */}
              <div className={styles.drawerSection}>
                <div className={styles.drawerSectionTitle}>
                  <Clock size={14} /> Status Timeline
                </div>
                <div className={styles.timeline}>
                  {activeOrder.timeline.map((event, idx) => (
                    <div key={event.id || idx} className={styles.timelineItem}>
                      <div
                        className={styles.timelineDot}
                        style={{
                          borderColor: idx === 0 ? 'var(--color-teal)' : '#D1D5DB',
                          backgroundColor: idx === 0 ? 'var(--color-teal)' : 'white',
                        }}
                      />
                      <div className={styles.timelineHeader}>
                        <span className={styles.timelineTitle}>{event.title}</span>
                        <span className={styles.timelineTime}>{event.timestamp}</span>
                      </div>
                      <div className={styles.timelineActor}>
                        {event.actor} • {event.actorType}
                      </div>
                      {event.note && (
                        <div className={styles.timelineNote}>{event.note}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Actions */}
              <div className={styles.drawerSection} style={{ gap: '0.75rem' }}>
                <div className={styles.drawerSectionTitle}>
                  <Sparkles size={14} /> Order Actions
                </div>

                {/* Duplicate Order Button with Future Scope Suggestion Flag */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button
                    className="btn btn-secondary"
                    style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    onClick={() => handleDuplicateClick(activeOrder)}
                  >
                    <Copy size={15} />
                    <span>Duplicate Order</span>
                    <span className={styles.futureScopeTag}>Future v2.0 Scope</span>
                  </button>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                    1-click re-order pre-fills patient details, address, and prescription settings.
                  </span>
                </div>

                {/* Cancel Action (Only before pickup) */}
                {canCancel(activeOrder.status) ? (
                  <div style={{ marginTop: '0.5rem' }}>
                    {cancelConfirm === activeOrder.id ? (
                      <div className={styles.cancelConfirmPanel}>
                        <AlertTriangle size={18} color="var(--color-red)" />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, color: 'var(--color-red)', fontSize: '0.875rem' }}>Confirm Order Cancellation?</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.125rem' }}>
                            Cancelling will notify dispatch and release the assigned driver.
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', width: '100%', marginTop: '0.375rem', justifyContent: 'flex-end' }}>
                          <button className="btn btn-secondary" onClick={() => setCancelConfirm(null)} style={{ fontSize: '0.8125rem', padding: '0.35rem 0.75rem' }}>
                            Keep Order
                          </button>
                          <button
                            className="btn"
                            style={{ background: 'var(--color-red)', color: 'white', fontSize: '0.8125rem', padding: '0.35rem 0.75rem' }}
                            onClick={() => handleCancelOrder(activeOrder.id)}
                          >
                            Yes, Cancel Order
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className="btn btn-secondary"
                        style={{ width: '100%', color: 'var(--color-red)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                        onClick={() => setCancelConfirm(activeOrder.id)}
                      >
                        Cancel Order (Pre-Pickup Only)
                      </button>
                    )}
                  </div>
                ) : activeOrder.status !== 'Failed' && activeOrder.status !== 'Cancelled' ? (
                  <div style={{ padding: '0.75rem', background: '#F9FAFB', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    <Lock size={14} color="var(--color-text-muted)" />
                    <span>This order cannot be cancelled — it has already been picked up by the driver. Contact Super Admin operations for emergency returns.</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Duplicate Order Informational Modal (Future Scope Suggestion Flagged) */}
      {duplicateModalOrder && createPortal(
        <div className={styles.duplicateModalOverlay} onClick={() => setDuplicateModalOrder(null)}>
          <div className={styles.duplicateModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.duplicateModalHeader}>
              <div className={styles.duplicateModalTitle}>
                <Sparkles size={18} color="var(--color-teal)" />
                <span>Duplicate Order Suggestion</span>
              </div>
              <button className={styles.drawerCloseBtn} onClick={() => setDuplicateModalOrder(null)}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.duplicateModalBody}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.75rem', background: '#EEF2FF', borderRadius: '8px', marginBottom: '0.75rem' }}>
                <Info size={18} color="#4F46E5" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '0.8125rem', color: '#3730A3' }}>
                  <strong>Future Scope Suggestion (v2.0):</strong> Automated 1-click recurring refill schedule is flagged for future release. Would you like to pre-fill a new order form with this patient's details now?
                </span>
              </div>

              <div className={styles.duplicateModalBox}>
                <div><strong>Source Order:</strong> {duplicateModalOrder.id} ({duplicateModalOrder.patientSafeId})</div>
                <div><strong>Patient:</strong> {duplicateModalOrder.patientName || duplicateModalOrder.patientInitials}</div>
                <div><strong>Address:</strong> {duplicateModalOrder.deliveryAddress.street}, {duplicateModalOrder.deliveryAddress.city}</div>
                <div><strong>Items:</strong> {duplicateModalOrder.prescriptionSummary.itemCount} item(s) — {duplicateModalOrder.prescriptionSummary.description}</div>
              </div>
            </div>

            <div className={styles.duplicateModalActions}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setDuplicateModalOrder(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleProceedDuplicate}>
                Pre-Fill New Order
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default PharmacyDeliveries;

