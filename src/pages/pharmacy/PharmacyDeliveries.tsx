import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import type { DeliveryOrder, DeliveryStatus } from '../../types/delivery';
import { PHARMACY_DELIVERIES } from '../../mock/pharmacyMockData';
import styles from './PharmacyDeliveries.module.css';

const PharmacyDeliveries: React.FC = () => {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>(PHARMACY_DELIVERIES);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterControlled, setFilterControlled] = useState(false);
  const [filterCold, setFilterCold] = useState(false);
  const [filterRush, setFilterRush] = useState(false);

  // Drawer state
  const [activeOrder, setActiveOrder] = useState<DeliveryOrder | null>(null);

  // Cancel confirm
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);

  // Status counts
  const statusCounts = useMemo(() => ({
    all: deliveries.length,
    Submitted: deliveries.filter((d) => d.status === 'Submitted').length,
    'Driver Assigned': deliveries.filter((d) => d.status === 'Driver Assigned').length,
    'En Route': deliveries.filter((d) => d.status === 'En Route').length,
    Delivered: deliveries.filter((d) => d.status === 'Delivered').length,
    Failed: deliveries.filter((d) => d.status === 'Failed').length,
  }), [deliveries]);

  // Filtered deliveries
  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((item) => {
      if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
      if (filterControlled && !item.flags.controlled) return false;
      if (filterCold && !item.flags.refrigerated) return false;
      if (filterRush && !item.flags.rush) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = item.id.toLowerCase().includes(q);
        const matchPatient = item.patientInitials.toLowerCase().includes(q) || item.patientSafeId.toLowerCase().includes(q);
        const matchDriver = item.driver?.name.toLowerCase().includes(q);
        if (!matchId && !matchPatient && !matchDriver) return false;
      }
      return true;
    });
  }, [deliveries, selectedStatus, searchQuery, filterControlled, filterCold, filterRush]);

  const getStatusBadgeClass = (status: DeliveryStatus) => {
    switch (status) {
      case 'Submitted': return styles.statusSubmitted;
      case 'Driver Assigned': return styles.statusAssigned;
      case 'En Route': return styles.statusEnRoute;
      case 'Delivered': return styles.statusDelivered;
      case 'Failed': return styles.statusFailed;
      case 'Held — Compliance': return styles.statusHeld;
      default: return styles.statusSubmitted;
    }
  };

  const getStatusIcon = (status: DeliveryStatus) => {
    switch (status) {
      case 'Submitted': return <Clock size={12} />;
      case 'Driver Assigned': return <Truck size={12} />;
      case 'En Route': return <Truck size={12} />;
      case 'Delivered': return <CheckCircle2 size={12} />;
      case 'Failed': return <AlertTriangle size={12} />;
      default: return <Clock size={12} />;
    }
  };

  const canCancel = (status: DeliveryStatus) => {
    return status === 'Submitted' || status === 'Driver Assigned';
  };

  const handleCancelOrder = (orderId: string) => {
    setDeliveries((prev) =>
      prev.map((d) => {
        if (d.id === orderId) {
          const updated: DeliveryOrder = {
            ...d,
            status: 'Failed' as DeliveryStatus,
            lastUpdated: 'Just now',
            lastUpdatedTimestamp: Date.now(),
            cancellationReason: 'Cancelled by pharmacy',
            timeline: [
              {
                id: `evt-${Date.now()}`,
                status: 'Cancelled',
                title: 'Order cancelled by pharmacy',
                timestamp: 'Just now',
                actor: 'Dr. James Hartwell',
                actorType: 'pharmacy',
                note: 'Pharmacy staff cancelled this order before pickup.',
              },
              ...d.timeline,
            ],
          };
          if (activeOrder?.id === d.id) setActiveOrder(updated);
          return updated;
        }
        return d;
      })
    );
    setCancelConfirm(null);
  };

  return (
    <div className={styles.deliveriesContainer}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Deliveries</h1>
          <p className={styles.pageSubtitle}>Your pharmacy's orders</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.liveIndicatorSmall}>
            <span className={styles.liveDot}></span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Live</span>
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
          { key: 'all', label: 'Total Orders', icon: Package, iconClass: styles.iconTeal },
          { key: 'Submitted', label: 'Awaiting Pickup', icon: Clock, iconClass: styles.iconAmber },
          { key: 'En Route', label: 'In Transit', icon: Truck, iconClass: styles.iconBlue },
          { key: 'Delivered', label: 'Delivered', icon: CheckCircle2, iconClass: styles.iconTeal },
          { key: 'Failed', label: 'Failed', icon: AlertTriangle, iconClass: styles.iconRed },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.key}
              className={`${styles.metricCard} ${selectedStatus === metric.key ? styles.metricCardActive : ''}`}
              onClick={() => setSelectedStatus(metric.key)}
            >
              <div className={styles.metricInfo}>
                <span className={styles.metricLabel}>{metric.label}</span>
                <span className={styles.metricValue}>{statusCounts[metric.key as keyof typeof statusCounts]}</span>
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
              placeholder="Search by Order ID, patient, driver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={14} color="var(--color-text-muted)" />
              </button>
            )}
          </div>
          <div className={styles.flagToggles}>
            <button
              className={`${styles.flagPill} ${filterControlled ? styles.flagPillControlledActive : ''}`}
              onClick={() => setFilterControlled(!filterControlled)}
            >
              <Lock size={12} /> Controlled
            </button>
            <button
              className={`${styles.flagPill} ${filterCold ? styles.flagPillColdActive : ''}`}
              onClick={() => setFilterCold(!filterCold)}
            >
              <Snowflake size={12} /> Refrigerated
            </button>
            <button
              className={`${styles.flagPill} ${filterRush ? styles.flagPillRushActive : ''}`}
              onClick={() => setFilterRush(!filterRush)}
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
            <p style={{ fontWeight: 500 }}>No orders found</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              {deliveries.length === 0
                ? 'You haven\'t created any delivery orders yet.'
                : 'Try adjusting your filters or search query.'}
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
                  <th></th>
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
                        <span style={{ fontWeight: 500 }}>{order.patientInitials}</span>
                        <div className={styles.patientId}>{order.patientSafeId}</div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.flagIcons}>
                        {order.flags.controlled && (
                          <span className={`${styles.flagIcon} ${styles.flagIconLock}`}>
                            <Lock size={12} />
                          </span>
                        )}
                        {order.flags.refrigerated && (
                          <span className={`${styles.flagIcon} ${styles.flagIconCold}`}>
                            <Snowflake size={12} />
                          </span>
                        )}
                        {order.flags.rush && (
                          <span className={`${styles.flagIcon} ${styles.flagIconRush}`}>
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
                        <span className={styles.unassignedBadge}>Unassigned</span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                        {order.createdAt}
                      </span>
                    </td>
                    <td>
                      <ChevronRight size={16} color="var(--color-text-muted)" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-over Drawer */}
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
                  {activeOrder.status}
                </span>
              </div>
              <button className={styles.drawerCloseBtn} onClick={() => { setActiveOrder(null); setCancelConfirm(null); }}>
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className={styles.drawerBody}>
              {/* Order Details */}
              <div className={styles.drawerSection}>
                <div className={styles.drawerSectionTitle}>
                  <Package size={14} /> Order Details
                </div>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Patient</span>
                    <span className={styles.infoValue}>{activeOrder.patientInitials} ({activeOrder.patientSafeId})</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Prescriptions</span>
                    <span className={styles.infoValue}>{activeOrder.prescriptionSummary.itemCount} item(s)</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Address</span>
                    <span className={styles.infoValue}>
                      {activeOrder.deliveryAddress.street}
                      {activeOrder.deliveryAddress.apt ? `, ${activeOrder.deliveryAddress.apt}` : ''}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>SLA Window</span>
                    <span className={styles.infoValue}>{activeOrder.slaWindow.start} – {activeOrder.slaWindow.end}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.25rem' }}>
                  {activeOrder.flags.controlled && (
                    <span className={`${styles.flagIcon} ${styles.flagIconLock}`} style={{ display: 'inline-flex', gap: '0.25rem', padding: '0.25rem 0.5rem', fontSize: '0.7rem', fontWeight: 600, width: 'auto' }}>
                      <Lock size={11} /> Controlled
                    </span>
                  )}
                  {activeOrder.flags.refrigerated && (
                    <span className={`${styles.flagIcon} ${styles.flagIconCold}`} style={{ display: 'inline-flex', gap: '0.25rem', padding: '0.25rem 0.5rem', fontSize: '0.7rem', fontWeight: 600, width: 'auto' }}>
                      <Snowflake size={11} /> Refrigerated
                    </span>
                  )}
                  {activeOrder.flags.rush && (
                    <span className={`${styles.flagIcon} ${styles.flagIconRush}`} style={{ display: 'inline-flex', gap: '0.25rem', padding: '0.25rem 0.5rem', fontSize: '0.7rem', fontWeight: 600, width: 'auto' }}>
                      <Zap size={11} /> Rush
                    </span>
                  )}
                </div>
              </div>

              {/* Driver Info */}
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

              {/* Delivery Proof — prominent section for compliance */}
              {activeOrder.proofOfDelivery && (
                <div className={styles.drawerSection} style={{ border: '2px solid var(--color-teal)', background: 'rgba(14, 163, 131, 0.02)' }}>
                  <div className={styles.drawerSectionTitle} style={{ color: 'var(--color-teal)' }}>
                    <FileCheck size={14} /> Proof of Delivery
                  </div>

                  {/* Signature */}
                  <div className={styles.proofBlock}>
                    <div className={styles.proofLabel}>
                      <PenTool size={14} /> Signature
                    </div>
                    <div className={styles.signatureBox}>
                      <svg viewBox="0 0 200 100" className={styles.signatureSvg}>
                        <path
                          d={activeOrder.proofOfDelivery.signatureSvgPath}
                          fill="none"
                          stroke="#111827"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className={styles.signatureInfo}>
                        <span>Signed by: {activeOrder.proofOfDelivery.recipientName}</span>
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
                      <div className={styles.photoPlaceholder}>
                        <Camera size={20} color="var(--color-text-muted)" />
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {activeOrder.proofOfDelivery.photoCaption || 'Photo captured at delivery'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Temperature */}
                  {activeOrder.proofOfDelivery.temperatureCelsius !== undefined && (
                    <div className={styles.proofBlock}>
                      <div className={styles.proofLabel}>
                        <Thermometer size={14} /> Temperature Reading
                      </div>
                      <div className={styles.tempReading}>
                        <div className={styles.tempValue}>
                          {activeOrder.proofOfDelivery.temperatureCelsius}°C
                        </div>
                        <div className={styles.tempRange}>
                          Safe range: {activeOrder.proofOfDelivery.tempSafeMin}°C – {activeOrder.proofOfDelivery.tempSafeMax}°C
                        </div>
                        {activeOrder.proofOfDelivery.temperatureCelsius >= activeOrder.proofOfDelivery.tempSafeMin &&
                          activeOrder.proofOfDelivery.temperatureCelsius <= activeOrder.proofOfDelivery.tempSafeMax && (
                            <span className="badge badge-teal" style={{ marginTop: '0.25rem' }}>
                              <CheckCircle2 size={12} /> Within Range
                            </span>
                          )}
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

                  {/* CoC Hash */}
                  {activeOrder.proofOfDelivery.cocHash && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontFamily: 'monospace', padding: '0.5rem', background: '#F9FAFB', borderRadius: '6px' }}>
                      CoC Hash: {activeOrder.proofOfDelivery.cocHash}
                    </div>
                  )}
                </div>
              )}

              {/* Temperature Log (for in-transit orders) */}
              {activeOrder.temperatureLog && !activeOrder.proofOfDelivery && (
                <div className={styles.drawerSection}>
                  <div className={styles.drawerSectionTitle}>
                    <Thermometer size={14} /> Live Temperature Log
                  </div>
                  <div className={styles.tempLogGrid}>
                    {activeOrder.temperatureLog.map((entry, idx) => (
                      <div key={idx} className={styles.tempLogEntry}>
                        <span className={styles.tempLogTime}>{entry.time}</span>
                        <span className={styles.tempLogValue}>{entry.temp}°C</span>
                        <span className={`badge badge-${entry.status === 'nominal' ? 'teal' : entry.status === 'warning' ? 'amber' : 'red'}`} style={{ fontSize: '0.625rem' }}>
                          {entry.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Timeline */}
              <div className={styles.drawerSection}>
                <div className={styles.drawerSectionTitle}>
                  <Clock size={14} /> Status Timeline
                </div>
                <div className={styles.timeline}>
                  {activeOrder.timeline.map((event, idx) => (
                    <div key={event.id} className={styles.timelineItem}>
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

              {/* Cancel Action */}
              {canCancel(activeOrder.status) && (
                <div className={styles.drawerSection}>
                  {cancelConfirm === activeOrder.id ? (
                    <div className={styles.cancelConfirmPanel}>
                      <AlertTriangle size={18} color="var(--color-red)" />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--color-red)' }}>Cancel this order?</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.125rem' }}>
                          This action cannot be undone.
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                        <button className="btn btn-secondary" onClick={() => setCancelConfirm(null)} style={{ fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }}>
                          Keep Order
                        </button>
                        <button
                          className="btn"
                          style={{ background: 'var(--color-red)', color: 'white', fontSize: '0.8125rem', padding: '0.375rem 0.75rem' }}
                          onClick={() => handleCancelOrder(activeOrder.id)}
                        >
                          Confirm Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="btn btn-secondary"
                      style={{ width: '100%', color: 'var(--color-red)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                      onClick={() => setCancelConfirm(activeOrder.id)}
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              )}

              {/* Non-cancellable tooltip */}
              {!canCancel(activeOrder.status) && activeOrder.status !== 'Failed' && (
                <div className={styles.drawerSection} style={{ opacity: 0.6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                    <Lock size={14} />
                    <span>This order cannot be cancelled — it has already been picked up by the driver.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default PharmacyDeliveries;
