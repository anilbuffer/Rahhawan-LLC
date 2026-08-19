import React, { useState, useMemo } from 'react';
import {
  Package,
  Search,
  Lock,
  Snowflake,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  ChevronRight,
  X,
  FileCheck,
  Truck,
  Building2,
  Phone,
  RefreshCw,
  Plus
} from 'lucide-react';
import { DeliveryOrder, DeliveryStatus, DriverOption } from '../types/delivery';
import { INITIAL_DELIVERIES, AVAILABLE_DRIVERS } from '../mock/deliveryData';
import styles from './Deliveries.module.css';

export const Deliveries: React.FC = () => {
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>(INITIAL_DELIVERIES);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPharmacy, setSelectedPharmacy] = useState<string>('all');
  const [selectedDriver, setSelectedDriver] = useState<string>('all');
  
  // Flag filters
  const [filterControlled, setFilterControlled] = useState(false);
  const [filterCold, setFilterCold] = useState(false);
  const [filterRush, setFilterRush] = useState(false);

  // Drawer and Modal state
  const [activeOrder, setActiveOrder] = useState<DeliveryOrder | null>(null);
  const [assigningOrder, setAssigningOrder] = useState<DeliveryOrder | null>(null);
  const [selectedAssignDriverId, setSelectedAssignDriverId] = useState<string>('');

  // Extract unique pharmacies
  const pharmacies = useMemo(() => {
    const map = new Map<string, string>();
    deliveries.forEach((d) => map.set(d.pharmacy.id, d.pharmacy.name));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [deliveries]);

  // Filtered deliveries
  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((item) => {
      // Status filter
      if (selectedStatus !== 'all' && item.status !== selectedStatus) {
        return false;
      }
      // Pharmacy filter
      if (selectedPharmacy !== 'all' && item.pharmacy.id !== selectedPharmacy) {
        return false;
      }
      // Driver filter
      if (selectedDriver === 'unassigned' && item.driver) return false;
      if (selectedDriver !== 'all' && selectedDriver !== 'unassigned' && item.driver?.id !== selectedDriver) {
        return false;
      }
      // Flags
      if (filterControlled && !item.flags.controlled) return false;
      if (filterCold && !item.flags.refrigerated) return false;
      if (filterRush && !item.flags.rush) return false;

      // Search Query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesId = item.id.toLowerCase().includes(q);
        const matchesPatient = item.patientSafeId.toLowerCase().includes(q) || item.patientInitials.toLowerCase().includes(q);
        const matchesPharm = item.pharmacy.name.toLowerCase().includes(q);
        const matchesRx = item.prescriptionSummary.rxNumbers.some((rx) => rx.toLowerCase().includes(q));
        const matchesDriver = item.driver?.name.toLowerCase().includes(q);
        if (!matchesId && !matchesPatient && !matchesPharm && !matchesRx && !matchesDriver) {
          return false;
        }
      }

      return true;
    });
  }, [
    deliveries,
    selectedStatus,
    selectedPharmacy,
    selectedDriver,
    filterControlled,
    filterCold,
    filterRush,
    searchQuery,
  ]);

  // Status metrics
  const statusCounts = useMemo(() => {
    return {
      all: deliveries.length,
      'Held — Compliance': deliveries.filter((d) => d.status === 'Held — Compliance').length,
      Submitted: deliveries.filter((d) => d.status === 'Submitted').length,
      'Driver Assigned': deliveries.filter((d) => d.status === 'Driver Assigned').length,
      'En Route': deliveries.filter((d) => d.status === 'En Route').length,
      Delivered: deliveries.filter((d) => d.status === 'Delivered').length,
      Failed: deliveries.filter((d) => d.status === 'Failed').length,
    };
  }, [deliveries]);

  // Handle Driver Assignment
  const handleConfirmAssignment = () => {
    if (!assigningOrder || !selectedAssignDriverId) return;

    const chosenDriver = AVAILABLE_DRIVERS.find((d) => d.id === selectedAssignDriverId);
    if (!chosenDriver) return;

    setDeliveries((prev) =>
      prev.map((d) => {
        if (d.id === assigningOrder.id) {
          const updated: DeliveryOrder = {
            ...d,
            status: 'Driver Assigned' as DeliveryStatus,
            driver: {
              id: chosenDriver.id,
              name: chosenDriver.name,
              phone: chosenDriver.phone,
              vehicle: chosenDriver.vehicle,
              eta: '18 mins',
              status: 'delivering',
            },
            lastUpdated: 'Just now',
            lastUpdatedTimestamp: Date.now(),
            timeline: [
              {
                id: `evt-${Date.now()}`,
                status: 'Driver Assigned',
                title: `Dispatched to ${chosenDriver.name}`,
                timestamp: 'Just now',
                actor: 'Super Admin',
                actorType: 'admin',
                note: `Driver assigned via Dispatch Console. Vehicle: ${chosenDriver.vehicle}`,
              },
              ...d.timeline,
            ],
          };
          if (activeOrder?.id === d.id) {
            setActiveOrder(updated);
          }
          return updated;
        }
        return d;
      })
    );

    setAssigningOrder(null);
    setSelectedAssignDriverId('');
  };

  // Handle Resolve Compliance Hold
  const handleResolveCompliance = (orderId: string) => {
    setDeliveries((prev) =>
      prev.map((d) => {
        if (d.id === orderId) {
          const updated: DeliveryOrder = {
            ...d,
            status: 'Submitted' as DeliveryStatus,
            isHeldCompliance: false,
            heldReason: undefined,
            attentionReason: undefined,
            lastUpdated: 'Just now',
            lastUpdatedTimestamp: Date.now(),
            timeline: [
              {
                id: `evt-${Date.now()}`,
                status: 'Compliance Verified',
                title: 'Compliance Override & DEA 222 Clearance Granted',
                timestamp: 'Just now',
                actor: 'Super Admin',
                actorType: 'admin',
                note: 'Verified electronic audit trail and authorized release for dispatch.',
              },
              ...d.timeline,
            ],
          };
          if (activeOrder?.id === d.id) {
            setActiveOrder(updated);
          }
          return updated;
        }
        return d;
      })
    );
  };

  const getStatusBadgeClass = (status: DeliveryStatus) => {
    switch (status) {
      case 'Submitted':
        return styles.statusSubmitted;
      case 'Driver Assigned':
        return styles.statusAssigned;
      case 'En Route':
        return styles.statusEnRoute;
      case 'Delivered':
        return styles.statusDelivered;
      case 'Failed':
        return styles.statusFailed;
      case 'Held — Compliance':
        return styles.statusHeld;
      default:
        return styles.statusSubmitted;
    }
  };

  return (
    <div className={styles.deliveriesContainer}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Deliveries & Dispatch</h1>
          <p className={styles.pageSubtitle}>
            Live order tracking, real-time chain of custody, and SLA compliance monitoring.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            className="btn btn-secondary"
            onClick={() => setDeliveries([...INITIAL_DELIVERIES])}
            title="Reset Mock Data"
          >
            <RefreshCw size={16} />
            <span>Reset Demo</span>
          </button>
          <button className="btn btn-primary">
            <Plus size={16} />
            <span>New Delivery Order</span>
          </button>
        </div>
      </div>

      {/* Pipeline Status Summary Strip */}
      <div className={styles.metricsGrid}>
        <div
          className={`${styles.metricCard} ${selectedStatus === 'all' ? styles.metricCardActive : ''}`}
          onClick={() => setSelectedStatus('all')}
        >
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Total Orders</span>
            <span className={styles.metricValue}>{statusCounts.all}</span>
          </div>
          <div className={`${styles.metricIconWrapper} ${styles.iconTeal}`}>
            <Package size={20} />
          </div>
        </div>

        <div
          className={`${styles.metricCard} ${selectedStatus === 'Held — Compliance' ? styles.metricCardActive : ''}`}
          onClick={() => setSelectedStatus('Held — Compliance')}
        >
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Compliance Held</span>
            <span className={styles.metricValue}>{statusCounts['Held — Compliance']}</span>
          </div>
          <div className={`${styles.metricIconWrapper} ${styles.iconRed}`}>
            <AlertTriangle size={20} />
          </div>
        </div>

        <div
          className={`${styles.metricCard} ${selectedStatus === 'Submitted' ? styles.metricCardActive : ''}`}
          onClick={() => setSelectedStatus('Submitted')}
        >
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Ready / Unassigned</span>
            <span className={styles.metricValue}>{statusCounts.Submitted}</span>
          </div>
          <div className={`${styles.metricIconWrapper} ${styles.iconAmber}`}>
            <Clock size={20} />
          </div>
        </div>

        <div
          className={`${styles.metricCard} ${selectedStatus === 'En Route' ? styles.metricCardActive : ''}`}
          onClick={() => setSelectedStatus('En Route')}
        >
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>In Transit (En Route)</span>
            <span className={styles.metricValue}>{statusCounts['En Route']}</span>
          </div>
          <div className={`${styles.metricIconWrapper} ${styles.iconBlue}`}>
            <Truck size={20} />
          </div>
        </div>

        <div
          className={`${styles.metricCard} ${selectedStatus === 'Delivered' ? styles.metricCardActive : ''}`}
          onClick={() => setSelectedStatus('Delivered')}
        >
          <div className={styles.metricInfo}>
            <span className={styles.metricLabel}>Delivered (CoC Signed)</span>
            <span className={styles.metricValue}>{statusCounts.Delivered}</span>
          </div>
          <div className={`${styles.metricIconWrapper} ${styles.iconTeal}`}>
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={styles.filterCard}>
        <div className={styles.filterRowPrimary}>
          <div className={`${styles.searchBox} input`}>
            <Search size={16} color="var(--color-text-muted)" />
            <input
              type="text"
              placeholder="Search by Order #, Patient Safe ID, Rx #, Driver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={14} color="var(--color-text-muted)" />
              </button>
            )}
          </div>

          <div className={styles.filterControls}>
            <select
              className={styles.selectInput}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Statuses ({statusCounts.all})</option>
              <option value="Held — Compliance">Held — Compliance ({statusCounts['Held — Compliance']})</option>
              <option value="Submitted">Submitted / Ready ({statusCounts.Submitted})</option>
              <option value="Driver Assigned">Driver Assigned ({statusCounts['Driver Assigned']})</option>
              <option value="En Route">En Route ({statusCounts['En Route']})</option>
              <option value="Delivered">Delivered ({statusCounts.Delivered})</option>
              <option value="Failed">Failed ({statusCounts.Failed})</option>
            </select>

            <select
              className={styles.selectInput}
              value={selectedPharmacy}
              onChange={(e) => setSelectedPharmacy(e.target.value)}
            >
              <option value="all">All Pharmacies</option>
              {pharmacies.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              className={styles.selectInput}
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
            >
              <option value="all">All Drivers</option>
              <option value="unassigned">Unassigned Only</option>
              {AVAILABLE_DRIVERS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.filterRowSecondary}>
          <div className={styles.flagToggles}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
              SPECIAL HANDLING:
            </span>
            <button
              className={`${styles.flagPill} ${filterControlled ? styles.flagPillControlledActive : ''}`}
              onClick={() => setFilterControlled(!filterControlled)}
            >
              <Lock size={12} />
              <span>Controlled Rx (DEA)</span>
            </button>
            <button
              className={`${styles.flagPill} ${filterCold ? styles.flagPillColdActive : ''}`}
              onClick={() => setFilterCold(!filterCold)}
            >
              <Snowflake size={12} />
              <span>Refrigerated / Cold-Chain</span>
            </button>
            <button
              className={`${styles.flagPill} ${filterRush ? styles.flagPillRushActive : ''}`}
              onClick={() => setFilterRush(!filterRush)}
            >
              <Zap size={12} />
              <span>Rush / STAT</span>
            </button>
          </div>

          <div className={styles.resultCount}>
            Showing <strong>{filteredDeliveries.length}</strong> of {deliveries.length} orders
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order ID & Patient</th>
                <th>Pharmacy Hub</th>
                <th>Handling Flags</th>
                <th>Driver Assignment</th>
                <th>SLA & Window</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIcon}>
                        <Package size={28} />
                      </div>
                      <h3>No delivery orders match your filters</h3>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                        Try clearing some search terms or selected filters.
                      </p>
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          setSelectedStatus('all');
                          setSelectedPharmacy('all');
                          setSelectedDriver('all');
                          setFilterControlled(false);
                          setFilterCold(false);
                          setFilterRush(false);
                          setSearchQuery('');
                        }}
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map((order) => {
                  const isSelected = activeOrder?.id === order.id;
                  return (
                    <tr
                      key={order.id}
                      className={`${styles.tableRow} ${isSelected ? styles.tableRowSelected : ''}`}
                      onClick={() => setActiveOrder(order)}
                    >
                      <td>
                        <div className={styles.orderIdBlock}>
                          <span className={styles.orderId}>{order.id}</span>
                          <span className={styles.patientInitials}>
                            Patient {order.patientInitials} ({order.patientSafeId})
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className={styles.pharmacyName}>{order.pharmacy.name}</div>
                        <div className={styles.pharmacyLocation}>{order.pharmacy.location.split(',')[0]}</div>
                      </td>

                      <td>
                        <div className={styles.flagIcons}>
                          {order.flags.controlled && (
                            <span className={`${styles.flagIcon} ${styles.flagIconLock}`} title="Controlled Substance (DEA Audit Trail)">
                              <Lock size={13} />
                            </span>
                          )}
                          {order.flags.refrigerated && (
                            <span className={`${styles.flagIcon} ${styles.flagIconCold}`} title="Cold Chain Monitoring (2°C - 8°C)">
                              <Snowflake size={13} />
                            </span>
                          )}
                          {order.flags.rush && (
                            <span className={`${styles.flagIcon} ${styles.flagIconRush}`} title="Rush Priority Delivery">
                              <Zap size={13} />
                            </span>
                          )}
                          {!order.flags.controlled && !order.flags.refrigerated && !order.flags.rush && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Standard</span>
                          )}
                        </div>
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
                        <div className={styles.slaBlock}>
                          <span className={styles.slaTime}>
                            {order.slaWindow.start} - {order.slaWindow.end}
                          </span>
                          {order.slaWindow.isNearBreach ? (
                            <span className={styles.slaBreach}>
                              <AlertTriangle size={12} /> Near Breach ({order.slaWindow.urgentTimeLeft || '< 30m'})
                            </span>
                          ) : (
                            <span className={styles.slaOk}>On Schedule</span>
                          )}
                        </div>
                      </td>

                      <td>
                        <span className={`${styles.statusPill} ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div className={styles.actionsCell} onClick={(e) => e.stopPropagation()}>
                          {order.status === 'Held — Compliance' ? (
                            <button
                              className={`${styles.btnAction} ${styles.btnActionPrimary}`}
                              onClick={() => handleResolveCompliance(order.id)}
                              title="Resolve DEA / Compliance Hold"
                            >
                              <FileCheck size={14} />
                              <span>Resolve</span>
                            </button>
                          ) : !order.driver ? (
                            <button
                              className={`${styles.btnAction} ${styles.btnActionPrimary}`}
                              onClick={() => {
                                setAssigningOrder(order);
                                setSelectedAssignDriverId(AVAILABLE_DRIVERS[0].id);
                              }}
                            >
                              <Truck size={14} />
                              <span>Assign</span>
                            </button>
                          ) : (
                            <button
                              className={styles.btnAction}
                              onClick={() => {
                                setAssigningOrder(order);
                                setSelectedAssignDriverId(order.driver?.id || AVAILABLE_DRIVERS[0].id);
                              }}
                            >
                              <UserCheck size={14} />
                              <span>Reassign</span>
                            </button>
                          )}
                          <button
                            className={styles.btnAction}
                            onClick={() => setActiveOrder(order)}
                            title="View Full Details"
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Detail Drawer */}
      {activeOrder && (
        <div className={styles.drawerOverlay} onClick={() => setActiveOrder(null)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div className={styles.drawerTitleBlock}>
                <Package size={22} color="var(--color-teal)" />
                <div>
                  <h2 className={styles.drawerTitle}>Order #{activeOrder.id}</h2>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Created {activeOrder.createdAt} • Updated {activeOrder.lastUpdated}
                  </span>
                </div>
              </div>
              <button className={styles.drawerCloseBtn} onClick={() => setActiveOrder(null)}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.drawerBody}>
              {/* Compliance Hold Alert if applicable */}
              {activeOrder.isHeldCompliance && (
                <div className={styles.complianceBanner}>
                  <div className={styles.complianceBannerHeader}>
                    <AlertTriangle size={18} />
                    <span>Compliance Hold Active</span>
                  </div>
                  <p className={styles.complianceBannerText}>
                    {activeOrder.heldReason || activeOrder.attentionReason}
                  </p>
                  <button
                    className="btn btn-primary"
                    style={{ alignSelf: 'flex-start', marginTop: '0.5rem', fontSize: '0.8125rem' }}
                    onClick={() => handleResolveCompliance(activeOrder.id)}
                  >
                    <FileCheck size={14} />
                    <span>Authorize DEA Override & Release</span>
                  </button>
                </div>
              )}

              {/* Order & Prescription Summary */}
              <div className={styles.drawerSection}>
                <div className={styles.drawerSectionTitle}>
                  <Package size={16} />
                  <span>Prescription Details (HIPAA Safe)</span>
                </div>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Patient Identifier</span>
                    <span className={styles.infoValue}>
                      {activeOrder.patientInitials} ({activeOrder.patientSafeId})
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Status</span>
                    <span className={styles.infoValue}>
                      <span className={`${styles.statusPill} ${getStatusBadgeClass(activeOrder.status)}`}>
                        {activeOrder.status}
                      </span>
                    </span>
                  </div>
                  <div className={styles.infoItem} style={{ gridColumn: '1 / -1' }}>
                    <span className={styles.infoLabel}>Medications ({activeOrder.prescriptionSummary.itemCount} items)</span>
                    <span className={styles.infoValue}>{activeOrder.prescriptionSummary.description}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Rx Numbers</span>
                    <span className={styles.infoValue}>
                      {activeOrder.prescriptionSummary.rxNumbers.join(', ')}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Schedule Tier</span>
                    <span className={styles.infoValue}>
                      {activeOrder.prescriptionSummary.schedule || 'Standard Prescription'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Destination & Pharmacy Hub */}
              <div className={styles.drawerSection}>
                <div className={styles.drawerSectionTitle}>
                  <Building2 size={16} />
                  <span>Logistics & Route</span>
                </div>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Dispensing Pharmacy</span>
                    <span className={styles.infoValue}>{activeOrder.pharmacy.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {activeOrder.pharmacy.location}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Destination Address</span>
                    <span className={styles.infoValue}>
                      {activeOrder.deliveryAddress.street} {activeOrder.deliveryAddress.apt}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {activeOrder.deliveryAddress.city}, {activeOrder.deliveryAddress.state} {activeOrder.deliveryAddress.zip}
                    </span>
                  </div>
                </div>
              </div>

              {/* Assigned Driver Details */}
              <div className={styles.drawerSection}>
                <div className={styles.drawerSectionTitle}>
                  <Truck size={16} />
                  <span>Assigned Driver</span>
                </div>
                {activeOrder.driver ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className={styles.driverAvatar} style={{ width: 42, height: 42, fontSize: '0.875rem' }}>
                        {activeOrder.driver.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{activeOrder.driver.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {activeOrder.driver.vehicle} • {activeOrder.driver.phone}
                        </div>
                      </div>
                    </div>
                    <button
                      className="btn btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.625rem' }}
                      onClick={() => {
                        setAssigningOrder(activeOrder);
                        setSelectedAssignDriverId(activeOrder.driver?.id || AVAILABLE_DRIVERS[0].id);
                      }}
                    >
                      Change Driver
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                      No driver assigned yet.
                    </span>
                    <button
                      className="btn btn-primary"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                      onClick={() => {
                        setAssigningOrder(activeOrder);
                        setSelectedAssignDriverId(AVAILABLE_DRIVERS[0].id);
                      }}
                    >
                      Assign Driver Now
                    </button>
                  </div>
                )}
              </div>

              {/* Proof of Delivery & Chain of Custody (if delivered) */}
              {activeOrder.proofOfDelivery && (
                <div className={styles.drawerSection}>
                  <div className={styles.drawerSectionTitle}>
                    <FileCheck size={16} />
                    <span>Cryptographic Chain of Custody & POD</span>
                  </div>
                  <div className={styles.cocCard}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                      CHAIN OF CUSTODY SHA-256 DIGITAL DIGEST
                    </div>
                    <div className={styles.cocHash}>{activeOrder.proofOfDelivery.cocHash}</div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                      <div>
                        <span className={styles.infoLabel}>Recipient Signature</span>
                        <div className={styles.signaturePreview}>
                          {activeOrder.proofOfDelivery.recipientName}
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                          Signed at {activeOrder.proofOfDelivery.signedAt}
                        </span>
                      </div>
                      <div>
                        <span className={styles.infoLabel}>Temperature at Handoff</span>
                        <div className={styles.tempGauge} style={{ height: 70 }}>
                          <div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Continuous Sensor</span>
                            <div className={styles.tempValue}>
                              {activeOrder.proofOfDelivery.temperatureCelsius}°C
                            </div>
                          </div>
                          <span className="badge badge-teal">Safe (2°C-8°C)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Audit Timeline */}
              <div className={styles.drawerSection}>
                <div className={styles.drawerSectionTitle}>
                  <Clock size={16} />
                  <span>Audit Trail & Event Timeline</span>
                </div>
                <div className={styles.timeline}>
                  {activeOrder.timeline.map((evt) => (
                    <div key={evt.id} className={styles.timelineItem}>
                      <div className={styles.timelineDot} />
                      <div className={styles.timelineHeader}>
                        <span className={styles.timelineTitle}>{evt.title}</span>
                        <span className={styles.timelineTime}>{evt.timestamp}</span>
                      </div>
                      <span className={styles.timelineActor}>
                        Actor: <strong>{evt.actor}</strong> ({evt.actorType})
                      </span>
                      {evt.note && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', background: '#F3F4F6', padding: '0.375rem 0.5rem', borderRadius: 4 }}>
                          {evt.note}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Driver Assignment Modal */}
      {assigningOrder && (
        <div className={styles.modalOverlay} onClick={() => setAssigningOrder(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Dispatch Driver</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  Assigning driver for Order #{assigningOrder.id} ({assigningOrder.pharmacy.name})
                </p>
              </div>
              <button className={styles.drawerCloseBtn} onClick={() => setAssigningOrder(null)}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                SELECT ACTIVE DRIVER:
              </span>
              {AVAILABLE_DRIVERS.map((driver) => {
                const isSelected = selectedAssignDriverId === driver.id;
                return (
                  <div
                    key={driver.id}
                    className={`${styles.driverSelectCard} ${isSelected ? styles.driverSelectCardActive : ''}`}
                    onClick={() => setSelectedAssignDriverId(driver.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className={styles.driverAvatar}>
                        {driver.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{driver.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {driver.vehicle} • {driver.rating} ★
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span
                        className={`badge badge-${
                          driver.status === 'on_shift' ? 'teal' : driver.status === 'busy' ? 'amber' : 'grey'
                        }`}
                      >
                        {driver.status === 'on_shift' ? 'Available' : driver.status === 'busy' ? 'Active Route' : 'Offline'}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                        {driver.currentDeliveries} active loads
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.modalFooter}>
              <button className="btn btn-secondary" onClick={() => setAssigningOrder(null)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                disabled={!selectedAssignDriverId}
                onClick={handleConfirmAssignment}
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deliveries;
