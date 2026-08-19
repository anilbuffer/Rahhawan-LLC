import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import {
  Package,
  Search,
  Lock,
  Snowflake,
  Zap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  ChevronRight,
  X,
  FileCheck,
  Truck,
  Building2,
  Phone,
  RefreshCw,
  Plus,
  Radio,
  Navigation,
  Maximize2,
  Activity,
  MapPin,
  Layers,
  Eye
} from 'lucide-react';
import type { DeliveryOrder, DeliveryStatus, DriverOption } from '../types/delivery';
import { INITIAL_DELIVERIES, AVAILABLE_DRIVERS, PHARMACIES_LIST } from '../mock/deliveryData';
import { auditLogService } from '../services/auditLogService';
import styles from './Deliveries.module.css';

export const Deliveries: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>(INITIAL_DELIVERIES);
  
  // Filters
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

  // Track All Full-Window Modal State
  const [trackAllModalOpen, setTrackAllModalOpen] = useState(false);
  const [trackAllFilter, setTrackAllFilter] = useState<'all' | 'En Route' | 'Held — Compliance' | 'Submitted' | 'Delivered'>('all');
  const [selectedTrackOrderId, setSelectedTrackOrderId] = useState<string | null>(null);
  const [showRoutePaths, setShowRoutePaths] = useState(true);
  const [showColdSensors, setShowColdSensors] = useState(true);

  // Create Order Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newOrderForm, setNewOrderForm] = useState({
    pharmacyId: 'PHARM-01',
    patientInitials: 'R.M.',
    patientSafeId: 'PT-99321',
    medicationDesc: 'Oxycodone HCl 10mg Tablets (DEA Form 222 Verified)',
    rxNumbers: 'RX-889021',
    schedule: 'Schedule II (DEA 222 Required)',
    isControlled: true,
    isRefrigerated: false,
    isRush: true,
    street: '420 N Michigan Ave',
    apt: 'Apt 14B',
    city: 'Chicago',
    state: 'IL',
    zip: '60611',
    slaStart: '02:00 PM',
    slaEnd: '04:30 PM',
  });

  // Sync status and new order from URL searchParams
  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam) {
      setSelectedStatus(statusParam);
    }
    const newParam = searchParams.get('new');
    if (newParam === 'true') {
      setCreateModalOpen(true);
    }
  }, [searchParams]);

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

    auditLogService.logEvent({
      actionType: 'DRIVER_ASSIGNED',
      category: 'State Change',
      description: `Dispatched Order #${assigningOrder.id} to Driver ${chosenDriver.name}`,
      actor: { id: 'USR-001', name: 'Sarah Jenkins', role: 'Super Admin' },
      severity: 'info',
      resource: { type: 'order', id: assigningOrder.id, label: `Order #${assigningOrder.id}`, details: { driver: chosenDriver.name, vehicle: chosenDriver.vehicle } }
    });

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

    auditLogService.logEvent({
      actionType: 'COMPLIANCE_OVERRIDE',
      category: 'Compliance',
      description: `DEA Electronic 222 Compliance Override Authorized for Order #${orderId}`,
      actor: { id: 'USR-001', name: 'Sarah Jenkins', role: 'Super Admin' },
      severity: 'critical',
      resource: { type: 'order', id: orderId, label: `Order #${orderId}`, details: { resolution: 'Authorized release for dispatch post cryptographic audit verification.' } }
    });
  };

  // Handle Create New Delivery Order
  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `ORD-${Math.floor(9850 + Math.random() * 100)}`;
    const pharmObj = PHARMACIES_LIST.find((p) => p.id === newOrderForm.pharmacyId) || {
      id: 'PHARM-01',
      name: 'Northgate Infusion Rx'
    };

    const newOrder: DeliveryOrder = {
      id: newId,
      createdAt: 'Just now',
      createdAtTimestamp: Date.now(),
      lastUpdated: 'Just now',
      lastUpdatedTimestamp: Date.now(),
      status: 'Submitted',
      pharmacy: {
        id: pharmObj.id,
        code: pharmObj.id === 'PHARM-01' ? 'NG-INF' : 'PH-HUB',
        name: pharmObj.name,
        location: 'Chicago, IL'
      },
      patientInitials: newOrderForm.patientInitials,
      patientSafeId: newOrderForm.patientSafeId,
      deliveryAddress: {
        street: newOrderForm.street,
        apt: newOrderForm.apt,
        city: newOrderForm.city,
        state: newOrderForm.state,
        zip: newOrderForm.zip
      },
      flags: {
        controlled: newOrderForm.isControlled,
        refrigerated: newOrderForm.isRefrigerated,
        rush: newOrderForm.isRush
      },
      prescriptionSummary: {
        itemCount: 1,
        description: newOrderForm.medicationDesc,
        rxNumbers: newOrderForm.rxNumbers.split(',').map((s) => s.trim()),
        schedule: newOrderForm.schedule
      },
      slaWindow: {
        start: newOrderForm.slaStart,
        end: newOrderForm.slaEnd,
        isNearBreach: false
      },
      timeline: [
        {
          id: `evt-${Date.now()}`,
          status: 'Submitted',
          title: 'Order Created via Central Dispatch Console',
          timestamp: 'Just now',
          actor: 'Sarah Jenkins',
          actorType: 'admin',
          note: `Prescription recorded with ${newOrderForm.schedule}.`
        }
      ]
    };

    setDeliveries((prev) => [newOrder, ...prev]);
    setActiveOrder(newOrder);
    setCreateModalOpen(false);

    auditLogService.logEvent({
      actionType: 'DELIVERY_CREATED',
      category: 'State Change',
      description: `Created Delivery Order #${newId} for ${pharmObj.name}`,
      actor: { id: 'USR-001', name: 'Sarah Jenkins', role: 'Super Admin' },
      severity: 'info',
      resource: { type: 'order', id: newId, label: `Order #${newId}`, details: { patientSafeId: newOrderForm.patientSafeId, flags: newOrder.flags } }
    });
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
            style={{
              background: 'rgba(14, 163, 131, 0.08)',
              color: 'var(--color-teal)',
              borderColor: 'rgba(14, 163, 131, 0.3)',
              fontWeight: 600
            }}
            onClick={() => {
              setSelectedTrackOrderId(null);
              setTrackAllModalOpen(true);
            }}
            title="Open Full Window Screen Multi-Order & Fleet Tracking Radar"
          >
            <Radio size={16} color="var(--color-teal)" />
            <span>Track All Live</span>
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setDeliveries([...INITIAL_DELIVERIES])}
            title="Reset Mock Data"
          >
            <RefreshCw size={16} />
            <span>Reset Demo</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setCreateModalOpen(true)}
          >
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
      {activeOrder && createPortal(
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
                  <span>Prescription & Medication Summary</span>
                </div>
                <div className={styles.detailCard}>
                  <div className={styles.medicationName}>
                    {activeOrder.prescriptionSummary.description}
                  </div>
                  <div className={styles.medicationSchedule}>
                    Classification: {activeOrder.prescriptionSummary.schedule}
                  </div>
                  <div className={styles.rxTags}>
                    {activeOrder.prescriptionSummary.rxNumbers.map((rx) => (
                      <span key={rx} className={styles.rxTag}>
                        Rx #{rx}
                      </span>
                    ))}
                  </div>

                  <div className={styles.flagsRow} style={{ marginTop: '0.75rem' }}>
                    {activeOrder.flags.controlled && (
                      <span className="badge badge-amber">
                        <Lock size={12} /> DEA Controlled
                      </span>
                    )}
                    {activeOrder.flags.refrigerated && (
                      <span className="badge badge-blue">
                        <Snowflake size={12} /> Cold Chain (2°C-8°C)
                      </span>
                    )}
                    {activeOrder.flags.rush && (
                      <span className="badge badge-red">
                        <Zap size={12} /> RUSH Priority
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Destination */}
              <div className={styles.drawerSection}>
                <div className={styles.drawerSectionTitle}>
                  <Building2 size={16} />
                  <span>Dispensing Hub & Destination</span>
                </div>
                <div className={styles.detailCard}>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Dispensing Pharmacy:</span>
                    <span className={styles.infoValue}>
                      {activeOrder.pharmacy.name} ({activeOrder.pharmacy.location})
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Patient Masked Safe ID:</span>
                    <span className={styles.infoValue} style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                      {activeOrder.patientSafeId} ({activeOrder.patientInitials})
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Destination Street:</span>
                    <span className={styles.infoValue}>
                      {activeOrder.deliveryAddress.street}
                      {activeOrder.deliveryAddress.apt ? `, ${activeOrder.deliveryAddress.apt}` : ''}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>City, State, Zip:</span>
                    <span className={styles.infoValue}>
                      {activeOrder.deliveryAddress.city}, {activeOrder.deliveryAddress.state}{' '}
                      {activeOrder.deliveryAddress.zip}
                    </span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>SLA Delivery Window:</span>
                    <span className={styles.infoValue} style={{ color: activeOrder.slaWindow.isNearBreach ? '#DC2626' : 'inherit', fontWeight: 600 }}>
                      {activeOrder.slaWindow.start} – {activeOrder.slaWindow.end}
                    </span>
                  </div>
                </div>
              </div>

              {/* Driver & Telemetry */}
              <div className={styles.drawerSection}>
                <div className={styles.drawerSectionTitle}>
                  <Truck size={16} />
                  <span>Assigned Courier & Live Telemetry</span>
                </div>
                {activeOrder.driver ? (
                  <div className={styles.detailCard}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className={styles.driverAvatar}>
                          {activeOrder.driver.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{activeOrder.driver.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            {activeOrder.driver.vehicle} • ID: {activeOrder.driver.id}
                          </div>
                        </div>
                      </div>
                      <button
                        className="btn btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '0.375rem 0.625rem' }}
                        onClick={() => {
                          setAssigningOrder(activeOrder);
                          setSelectedAssignDriverId(activeOrder.driver?.id || AVAILABLE_DRIVERS[0].id);
                        }}
                      >
                        Reassign
                      </button>
                    </div>

                    <div className={styles.infoRow} style={{ marginTop: '0.75rem' }}>
                      <span className={styles.infoLabel}>Direct Phone:</span>
                      <span className={styles.infoValue} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Phone size={12} color="var(--color-teal)" />
                        {activeOrder.driver.phone}
                      </span>
                    </div>

                    {activeOrder.driver.currentLocation && (
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Current Vehicle Ping:</span>
                        <span className={styles.infoValue} style={{ color: 'var(--color-teal)', fontWeight: 600 }}>
                          {activeOrder.driver.currentLocation}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={styles.detailCard} style={{ textAlign: 'center', padding: '1.25rem' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
                      No medical courier has been dispatched to this order yet.
                    </p>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setAssigningOrder(activeOrder);
                        setSelectedAssignDriverId(AVAILABLE_DRIVERS[0].id);
                      }}
                    >
                      <Truck size={14} />
                      <span>Dispatch Medical Courier</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Temperature Chain Graph if refrigerated */}
              {activeOrder.flags.refrigerated && activeOrder.temperatureLog && (
                <div className={styles.drawerSection}>
                  <div className={styles.drawerSectionTitle}>
                    <Snowflake size={16} />
                    <span>Cold Chain Sensor Log (2.0°C – 8.0°C Target)</span>
                  </div>
                  <div className={styles.tempLogContainer}>
                    <div className={styles.tempLogHeader}>
                      <span>Real-time BLE Sensor Probe #SN-88219</span>
                      <span className={styles.tempValue}>Current: 3.8°C (Nominal)</span>
                    </div>
                    <div className={styles.tempLogList}>
                      {activeOrder.temperatureLog.map((log, idx) => (
                        <div key={idx} className={styles.tempLogRow}>
                          <span style={{ color: 'var(--color-text-muted)' }}>{log.time}</span>
                          <span style={{ fontWeight: 600 }}>{log.temp}°C</span>
                          <span
                            className={`badge badge-${
                              log.status === 'nominal' ? 'teal' : log.status === 'warning' ? 'amber' : 'red'
                            }`}
                          >
                            {log.status.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Chain of Custody Timeline */}
              <div className={styles.drawerSection}>
                <div className={styles.drawerSectionTitle}>
                  <Clock size={16} />
                  <span>Chain of Custody & Audit Trail</span>
                </div>
                <div className={styles.timeline}>
                  {activeOrder.timeline.map((evt) => (
                    <div key={evt.id} className={styles.timelineItem}>
                      <div className={styles.timelinePoint} />
                      <div className={styles.timelineHeader}>
                        <span className={styles.timelineStatus}>{evt.status}</span>
                        <span className={styles.timelineTime}>{evt.timestamp}</span>
                      </div>
                      <span className={styles.timelineActor}>
                        Actor: <strong>{evt.actor}</strong> ({evt.actorType})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Driver Assignment Modal */}
      {assigningOrder && createPortal(
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
        </div>,
        document.body
      )}

      {/* Create Delivery Order Modal */}
      {createModalOpen && createPortal(
        <div className={styles.modalOverlay} onClick={() => setCreateModalOpen(false)}>
          <div className={styles.modalContent} style={{ maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleCreateOrderSubmit}>
              <div className={styles.modalHeader}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>New Prescription Delivery Order</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Dispatch new prescription order to courier network with cryptographic chain of custody.
                  </p>
                </div>
                <button type="button" className={styles.drawerCloseBtn} onClick={() => setCreateModalOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              <div className={styles.modalBody}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                      Dispensing Pharmacy Hub
                    </label>
                    <select
                      className={styles.selectInput}
                      style={{ width: '100%' }}
                      value={newOrderForm.pharmacyId}
                      onChange={(e) => setNewOrderForm({ ...newOrderForm, pharmacyId: e.target.value })}
                    >
                      {PHARMACIES_LIST.filter(p => p.id !== 'all').map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                      Patient Safe ID (HIPAA Masked)
                    </label>
                    <input
                      type="text"
                      className={styles.selectInput}
                      style={{ width: '100%' }}
                      value={newOrderForm.patientSafeId}
                      onChange={(e) => setNewOrderForm({ ...newOrderForm, patientSafeId: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                      Patient Initials
                    </label>
                    <input
                      type="text"
                      className={styles.selectInput}
                      style={{ width: '100%' }}
                      value={newOrderForm.patientInitials}
                      onChange={(e) => setNewOrderForm({ ...newOrderForm, patientInitials: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                      Prescription Rx Numbers (comma-separated)
                    </label>
                    <input
                      type="text"
                      className={styles.selectInput}
                      style={{ width: '100%' }}
                      value={newOrderForm.rxNumbers}
                      onChange={(e) => setNewOrderForm({ ...newOrderForm, rxNumbers: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                    Medication Summary & Dosage Description
                  </label>
                  <input
                    type="text"
                    className={styles.selectInput}
                    style={{ width: '100%' }}
                    value={newOrderForm.medicationDesc}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, medicationDesc: e.target.value })}
                    required
                  />
                </div>

                {/* Delivery Address */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    Patient Destination Address:
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem', marginTop: '0.375rem' }}>
                    <input
                      type="text"
                      placeholder="Street Address"
                      className={styles.selectInput}
                      value={newOrderForm.street}
                      onChange={(e) => setNewOrderForm({ ...newOrderForm, street: e.target.value })}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Apt/Suite"
                      className={styles.selectInput}
                      value={newOrderForm.apt}
                      onChange={(e) => setNewOrderForm({ ...newOrderForm, apt: e.target.value })}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder="City"
                      className={styles.selectInput}
                      value={newOrderForm.city}
                      onChange={(e) => setNewOrderForm({ ...newOrderForm, city: e.target.value })}
                      required
                    />
                    <input
                      type="text"
                      placeholder="State"
                      className={styles.selectInput}
                      value={newOrderForm.state}
                      onChange={(e) => setNewOrderForm({ ...newOrderForm, state: e.target.value })}
                      required
                    />
                    <input
                      type="text"
                      placeholder="ZIP"
                      className={styles.selectInput}
                      value={newOrderForm.zip}
                      onChange={(e) => setNewOrderForm({ ...newOrderForm, zip: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Handling Flags */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                    Special Handling & Compliance Safeguards:
                  </span>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={newOrderForm.isControlled}
                        onChange={(e) => setNewOrderForm({ ...newOrderForm, isControlled: e.target.checked })}
                      />
                      <span>Controlled Rx (DEA C-II)</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={newOrderForm.isRefrigerated}
                        onChange={(e) => setNewOrderForm({ ...newOrderForm, isRefrigerated: e.target.checked })}
                      />
                      <span>Cold Chain (2°C - 8°C)</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={newOrderForm.isRush}
                        onChange={(e) => setNewOrderForm({ ...newOrderForm, isRush: e.target.checked })}
                      />
                      <span>STAT Rush Priority</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className="btn btn-secondary" onClick={() => setCreateModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create & Queue Order
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ==========================================================================
         Full Window Screen "Track All" Live Fleet & Order Radar Modal
         ========================================================================== */}
      {trackAllModalOpen && createPortal(
        <div className={styles.fullScreenModalOverlay} onClick={() => setTrackAllModalOpen(false)}>
          <div className={styles.fullScreenModal} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className={styles.trackAllHeader}>
              <div className={styles.trackAllHeaderLeft}>
                <div className={styles.radarPulseBadge}>
                  <span className={styles.radarDot} />
                  LIVE RADAR ACTIVE
                </div>
                <div>
                  <h2 className={styles.trackAllTitle}>
                    Fleet Dispatch & Multi-Order Tracking Radar
                  </h2>
                  <p className={styles.trackAllSubtitle}>
                    Chicago Metro Operations • {deliveries.length} Total Monitored Orders • Real-time GPS & Chain of Custody Telemetry
                  </p>
                </div>
              </div>

              <div className={styles.trackAllHeaderActions}>
                <button
                  className={`${styles.mapToolBtn} ${showRoutePaths ? styles.mapToolBtnActive : ''}`}
                  onClick={() => setShowRoutePaths(!showRoutePaths)}
                  title="Toggle routing trajectories"
                >
                  <Layers size={14} />
                  <span>{showRoutePaths ? 'Route Vectors ON' : 'Route Vectors OFF'}</span>
                </button>
                <button
                  className={`${styles.mapToolBtn} ${showColdSensors ? styles.mapToolBtnActive : ''}`}
                  onClick={() => setShowColdSensors(!showColdSensors)}
                  title="Toggle IoT temperature sensor readouts"
                >
                  <Snowflake size={14} />
                  <span>{showColdSensors ? 'Sensor Overlays ON' : 'Sensors OFF'}</span>
                </button>
                <button
                  className={styles.btnTrackAction}
                  style={{ background: '#334155', color: '#fff' }}
                  onClick={() => setDeliveries([...INITIAL_DELIVERIES])}
                  title="Refresh radar coordinates"
                >
                  <RefreshCw size={14} />
                  <span>Sync GPS</span>
                </button>
                <button
                  className={styles.drawerCloseBtn}
                  style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.2)' }}
                  onClick={() => setTrackAllModalOpen(false)}
                  title="Close Full Window Radar"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Split Screen Body */}
            <div className={styles.trackAllBody}>
              {/* Left Column: Interactive Vector Radar Canvas */}
              <div className={styles.trackMapSection}>
                <div className={styles.mapToolbar}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700 }}>
                    <Activity size={14} />
                    <span>METRO DISPATCH GRID (ZONE 41 - CHICAGO)</span>
                  </div>
                </div>

                <div className={styles.mapSvgWrapper}>
                  <svg className={styles.mapSvg} viewBox="0 0 900 620" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Background Radar Grid */}
                    <defs>
                      <pattern id="radarGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(51, 65, 85, 0.3)" strokeWidth="1" />
                      </pattern>
                      <radialGradient id="radarSweepGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgba(14, 163, 131, 0.2)" />
                        <stop offset="60%" stopColor="rgba(14, 163, 131, 0.05)" />
                        <stop offset="100%" stopColor="transparent" />
                      </radialGradient>
                    </defs>

                    {/* Grid Fill */}
                    <rect width="900" height="620" fill="url(#radarGrid)" />

                    {/* Concentric Radar Rings */}
                    <circle cx="450" cy="310" r="120" stroke="rgba(14, 163, 131, 0.15)" strokeWidth="1" strokeDasharray="4 4" />
                    <circle cx="450" cy="310" r="220" stroke="rgba(14, 163, 131, 0.2)" strokeWidth="1.5" />
                    <circle cx="450" cy="310" r="320" stroke="rgba(14, 163, 131, 0.1)" strokeWidth="1" strokeDasharray="6 6" />

                    {/* Chicago Metro Simulated Street Network */}
                    <path d="M 100 310 L 800 310" stroke="rgba(71, 85, 105, 0.4)" strokeWidth="2" />
                    <path d="M 450 60 L 450 560" stroke="rgba(71, 85, 105, 0.4)" strokeWidth="2" />
                    <path d="M 220 120 L 680 500" stroke="rgba(71, 85, 105, 0.25)" strokeWidth="1.5" />
                    <path d="M 220 500 L 680 120" stroke="rgba(71, 85, 105, 0.25)" strokeWidth="1.5" />

                    {/* Lake Michigan Shoreline Contour */}
                    <path d="M 720 40 Q 670 200 690 380 T 780 580" fill="none" stroke="rgba(2, 132, 199, 0.4)" strokeWidth="3" strokeDasharray="8 4" />
                    <text x="730" y="240" fill="rgba(2, 132, 199, 0.5)" fontSize="11" fontWeight="700" letterSpacing="0.1em">
                      LAKE MICHIGAN SHORE
                    </text>

                    {/* Active Route Vector Paths */}
                    {showRoutePaths && (
                      <g>
                        {/* Route 1: Northgate (300, 240) -> Driver James Chen (400, 280) -> ORD-9821 (520, 310) */}
                        <path
                          d="M 300 240 L 400 280 L 520 310"
                          stroke="#38bdf8"
                          strokeWidth="2.5"
                          strokeDasharray="6 6"
                          strokeLinecap="round"
                          opacity="0.8"
                        />
                        {/* Route 2: PharmaHub (580, 200) -> Driver Maya Lin (510, 360) -> ORD-9822 (460, 480) */}
                        <path
                          d="M 580 200 L 510 360 L 460 480"
                          stroke="#34d399"
                          strokeWidth="2.5"
                          strokeDasharray="6 6"
                          strokeLinecap="round"
                          opacity="0.8"
                        />
                        {/* Route 3: Northgate (300, 240) -> Driver Marcus Vance (320, 420) -> ORD-9823 (240, 490) */}
                        <path
                          d="M 300 240 L 320 420 L 240 490"
                          stroke="#fb7185"
                          strokeWidth="2.5"
                          strokeDasharray="6 6"
                          strokeLinecap="round"
                          opacity="0.8"
                        />
                      </g>
                    )}

                    {/* Pharmacy Dispatch Hubs */}
                    {/* Hub 1: Northgate Infusion Rx */}
                    <g transform="translate(300, 240)">
                      <circle r="22" fill="rgba(14, 163, 131, 0.15)" stroke="#0ea5e9" strokeWidth="2" />
                      <circle r="12" fill="#0284c7" />
                      <text x="0" y="4" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">RX1</text>
                      <rect x="-70" y="-36" width="140" height="20" rx="4" fill="rgba(15, 23, 42, 0.9)" stroke="#0284c7" strokeWidth="1" />
                      <text x="0" y="-22" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="700">
                        Northgate Infusion Hub
                      </text>
                    </g>

                    {/* Hub 2: PharmaHub Central */}
                    <g transform="translate(580, 200)">
                      <circle r="22" fill="rgba(14, 163, 131, 0.15)" stroke="#10b981" strokeWidth="2" />
                      <circle r="12" fill="#059669" />
                      <text x="0" y="4" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">RX2</text>
                      <rect x="-70" y="-36" width="140" height="20" rx="4" fill="rgba(15, 23, 42, 0.9)" stroke="#10b981" strokeWidth="1" />
                      <text x="0" y="-22" textAnchor="middle" fill="#34d399" fontSize="9" fontWeight="700">
                        PharmaHub Central
                      </text>
                    </g>

                    {/* Courier 1: James Chen (En Route - Cold Chain) */}
                    <g
                      transform="translate(400, 280)"
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        const order = deliveries.find(d => d.id === 'ORD-9821');
                        if (order) setSelectedTrackOrderId(order.id);
                      }}
                    >
                      <circle r="18" fill="rgba(56, 189, 248, 0.2)" stroke="#38bdf8" strokeWidth="1.5">
                        <animate attributeName="r" values="16;24;16" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <circle r="10" fill="#0284c7" stroke="#fff" strokeWidth="1.5" />
                      <rect x="16" y="-14" width="130" height="34" rx="6" fill="rgba(15, 23, 42, 0.95)" stroke="#38bdf8" strokeWidth="1" />
                      <text x="24" y="0" fill="#f8fafc" fontSize="10" fontWeight="700">🚐 James Chen</text>
                      <text x="24" y="14" fill="#38bdf8" fontSize="8.5" fontWeight="600">
                        {showColdSensors ? '3.8°C NOMINAL • 28 mph' : 'ORD-9821 • ETA 14:15'}
                      </text>
                    </g>

                    {/* Courier 2: Maya Lin (En Route - STAT Rush) */}
                    <g
                      transform="translate(510, 360)"
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        const order = deliveries.find(d => d.id === 'ORD-9822');
                        if (order) setSelectedTrackOrderId(order.id);
                      }}
                    >
                      <circle r="18" fill="rgba(251, 113, 133, 0.2)" stroke="#fb7185" strokeWidth="1.5">
                        <animate attributeName="r" values="16;24;16" dur="1.8s" repeatCount="indefinite" />
                      </circle>
                      <circle r="10" fill="#e11d48" stroke="#fff" strokeWidth="1.5" />
                      <rect x="16" y="-14" width="130" height="34" rx="6" fill="rgba(15, 23, 42, 0.95)" stroke="#fb7185" strokeWidth="1" />
                      <text x="24" y="0" fill="#f8fafc" fontSize="10" fontWeight="700">⚡ Maya Lin (STAT)</text>
                      <text x="24" y="14" fill="#fb7185" fontSize="8.5" fontWeight="600">
                        ORD-9822 • ETA 13:45
                      </text>
                    </g>

                    {/* Courier 3: Marcus Vance (En Route - Controlled C-II) */}
                    <g
                      transform="translate(320, 420)"
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        const order = deliveries.find(d => d.id === 'ORD-9823');
                        if (order) setSelectedTrackOrderId(order.id);
                      }}
                    >
                      <circle r="18" fill="rgba(192, 132, 252, 0.2)" stroke="#c084fc" strokeWidth="1.5" />
                      <circle r="10" fill="#9333ea" stroke="#fff" strokeWidth="1.5" />
                      <rect x="16" y="-14" width="130" height="34" rx="6" fill="rgba(15, 23, 42, 0.95)" stroke="#c084fc" strokeWidth="1" />
                      <text x="24" y="0" fill="#f8fafc" fontSize="10" fontWeight="700">🔒 Marcus Vance</text>
                      <text x="24" y="14" fill="#c084fc" fontSize="8.5" fontWeight="600">
                        DEA Schedule II • In Transit
                      </text>
                    </g>

                    {/* Delivery Destination Dropoff Pins */}
                    {/* Pin 1 (Michigan Ave) */}
                    <g transform="translate(520, 310)">
                      <circle r="8" fill="#10b981" stroke="#fff" strokeWidth="1.5" />
                      <rect x="-40" y="12" width="80" height="18" rx="4" fill="rgba(15, 23, 42, 0.9)" stroke="#10b981" strokeWidth="1" />
                      <text x="0" y="24" textAnchor="middle" fill="#34d399" fontSize="8" fontWeight="700">
                        PT-88319 (J.D.)
                      </text>
                    </g>

                    {/* Pin 2 (State St) */}
                    <g transform="translate(460, 480)">
                      <circle r="8" fill="#fb7185" stroke="#fff" strokeWidth="1.5" />
                      <rect x="-40" y="12" width="80" height="18" rx="4" fill="rgba(15, 23, 42, 0.9)" stroke="#fb7185" strokeWidth="1" />
                      <text x="0" y="24" textAnchor="middle" fill="#fb7185" fontSize="8" fontWeight="700">
                        PT-99412 (M.S.)
                      </text>
                    </g>

                    {/* Pin 3 (Clark St) */}
                    <g transform="translate(240, 490)">
                      <circle r="8" fill="#c084fc" stroke="#fff" strokeWidth="1.5" />
                      <rect x="-40" y="12" width="80" height="18" rx="4" fill="rgba(15, 23, 42, 0.9)" stroke="#c084fc" strokeWidth="1" />
                      <text x="0" y="24" textAnchor="middle" fill="#c084fc" fontSize="8" fontWeight="700">
                        PT-77291 (R.K.)
                      </text>
                    </g>
                  </svg>

                  {/* Map Legend */}
                  <div className={styles.mapLegend}>
                    <div className={styles.legendItem}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#0284c7', display: 'inline-block' }} />
                      <span>Dispensing Hubs</span>
                    </div>
                    <div className={styles.legendItem}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#38bdf8', display: 'inline-block' }} />
                      <span>Cold Chain Couriers</span>
                    </div>
                    <div className={styles.legendItem}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#fb7185', display: 'inline-block' }} />
                      <span>STAT Rush</span>
                    </div>
                    <div className={styles.legendItem}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#c084fc', display: 'inline-block' }} />
                      <span>DEA Controlled</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Order Stream & Telemetry Feed */}
              <div className={styles.trackSidebarSection}>
                <div className={styles.trackSidebarHeader}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Navigation size={15} color="var(--color-teal)" />
                    <span>Real-time Order Feed</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {deliveries.filter(d => trackAllFilter === 'all' || d.status === trackAllFilter).length} Orders Shown
                  </span>
                </div>

                {/* Filter Tabs */}
                <div className={styles.trackFilterTabs}>
                  {(['all', 'En Route', 'Held — Compliance', 'Submitted', 'Delivered'] as const).map((filterVal) => {
                    const count = filterVal === 'all' ? deliveries.length : deliveries.filter(d => d.status === filterVal).length;
                    return (
                      <button
                        key={filterVal}
                        className={`${styles.trackTabBtn} ${trackAllFilter === filterVal ? styles.trackTabBtnActive : ''}`}
                        onClick={() => setTrackAllFilter(filterVal)}
                      >
                        {filterVal === 'all' ? 'All' : filterVal} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* Order Feed Cards */}
                <div className={styles.trackOrdersList}>
                  {deliveries
                    .filter((order) => trackAllFilter === 'all' || order.status === trackAllFilter)
                    .map((order) => {
                      const isSelected = selectedTrackOrderId === order.id;
                      return (
                        <div
                          key={order.id}
                          className={`${styles.trackOrderCard} ${isSelected ? styles.trackOrderCardSelected : ''}`}
                          onClick={() => setSelectedTrackOrderId(order.id)}
                        >
                          <div className={styles.trackCardTop}>
                            <span className={styles.trackOrderId}>#{order.id}</span>
                            <span
                              className={`badge badge-${
                                order.status === 'Delivered'
                                  ? 'teal'
                                  : order.status === 'En Route'
                                  ? 'blue'
                                  : order.status === 'Held — Compliance'
                                  ? 'red'
                                  : 'amber'
                              }`}
                              style={{ fontSize: '0.6875rem', padding: '0.2rem 0.5rem' }}
                            >
                              {order.status}
                            </span>
                          </div>

                          <div className={styles.trackCardMeta}>
                            <div className={styles.trackCardRow}>
                              <span>Dispensing Hub:</span>
                              <strong style={{ color: '#cbd5e1' }}>{order.pharmacy.name}</strong>
                            </div>
                            <div className={styles.trackCardRow}>
                              <span>Patient / Safe ID:</span>
                              <strong style={{ color: '#cbd5e1', fontFamily: 'monospace' }}>
                                {order.patientSafeId} ({order.patientInitials})
                              </strong>
                            </div>
                            <div className={styles.trackCardRow}>
                              <span>Courier:</span>
                              <strong style={{ color: order.driver ? '#38bdf8' : '#94a3b8' }}>
                                {order.driver ? order.driver.name : 'Unassigned'}
                              </strong>
                            </div>
                            <div className={styles.trackCardRow}>
                              <span>SLA Window:</span>
                              <strong style={{ color: order.slaWindow.isNearBreach ? '#fb7185' : '#cbd5e1' }}>
                                {order.slaWindow.start} - {order.slaWindow.end}
                              </strong>
                            </div>
                          </div>

                          {/* Telemetry Badges */}
                          <div className={styles.trackTelemetryPills}>
                            {order.flags.refrigerated && (
                              <span className={`${styles.telemetryPill} ${styles.pillCold}`}>
                                <Snowflake size={11} /> 3.8°C Sensor Nominal
                              </span>
                            )}
                            {order.flags.controlled && (
                              <span className={`${styles.telemetryPill} ${styles.pillControlled}`}>
                                <Lock size={11} /> DEA C-II Locked
                              </span>
                            )}
                            {order.flags.rush && (
                              <span className={`${styles.telemetryPill} ${styles.pillRush}`}>
                                <Zap size={11} /> STAT Rush
                              </span>
                            )}
                          </div>

                          {/* Card Action Buttons */}
                          <div className={styles.trackCardActions}>
                            {order.isHeldCompliance && (
                              <button
                                className="btn btn-primary"
                                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', background: '#dc2626', borderColor: '#dc2626' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleResolveCompliance(order.id);
                                }}
                              >
                                <FileCheck size={13} />
                                <span>DEA Release</span>
                              </button>
                            )}

                            {!order.driver && (
                              <button
                                className="btn btn-primary"
                                style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAssigningOrder(order);
                                  setSelectedAssignDriverId(AVAILABLE_DRIVERS[0].id);
                                }}
                              >
                                <Truck size={13} />
                                <span>Assign</span>
                              </button>
                            )}

                            <button
                              className={styles.btnTrackAction}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveOrder(order);
                              }}
                              title="View Full Chain of Custody"
                            >
                              <Eye size={13} />
                              <span>Inspect Order</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Deliveries;
