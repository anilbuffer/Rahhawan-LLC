import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Snowflake,
  Lock,
  RotateCcw,
  Sparkles,
  Send,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Clock,
  MapPin,
  Building2,
  User,
  ShieldCheck,
  Download,
  FileSpreadsheet,
  X,
  Check,
  Search,
  SlidersHorizontal,
  Navigation,
  MoveUp,
  MoveDown,
  Truck
} from 'lucide-react';
import {
  INITIAL_ROUTE_STOPS,
  AVAILABLE_UNASSIGNED_ORDERS,
  ROUTE_DRIVERS,
  type RouteStop,
  type DriverPlannerOption,
  DEPOT_LOCATION,
} from '../mock/route4meData';
import RouteMapCanvas from '../components/route4me/RouteMapCanvas';
import { auditLogService } from '../services/auditLogService';
import styles from './Route4MePlanner.module.css';

export const Route4MePlanner: React.FC = () => {
  // Main route stops state
  const [stops, setStops] = useState<RouteStop[]>(INITIAL_ROUTE_STOPS);
  const [unassignedPool, setUnassignedPool] = useState<RouteStop[]>(AVAILABLE_UNASSIGNED_ORDERS);
  
  // Selected driver
  const [selectedDriverId, setSelectedDriverId] = useState<string>('DRV-MJ');
  const activeDriver = useMemo(
    () => ROUTE_DRIVERS.find((d) => d.id === selectedDriverId) || ROUTE_DRIVERS[0],
    [selectedDriverId]
  );

  // Selected stop for popup & drawer
  const [selectedStopId, setSelectedStopId] = useState<string | null>('STOP-07');
  const [drawerStop, setDrawerStop] = useState<RouteStop | null>(null);

  // Route status
  const [routeStatus, setRouteStatus] = useState<'Ready' | 'Optimizing' | 'Dispatched' | 'In Progress'>('Ready');
  const [isOptimized, setIsOptimized] = useState<boolean>(false);
  const [isModified, setIsModified] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  // Filter tag for map and stop list
  const [filterFlag, setFilterFlag] = useState<'all' | 'controlled' | 'refrigerated' | 'rush'>('all');

  // Modals state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showRemoveModal, setShowRemoveModal] = useState<RouteStop | null>(null);
  const [showCapacityWarning, setShowCapacityWarning] = useState<boolean>(false);
  const [showDispatchModal, setShowDispatchModal] = useState<boolean>(false);
  const [dispatchSuccess, setDispatchSuccess] = useState<boolean>(false);

  // Add stop modal selection state
  const [selectedToAddIds, setSelectedToAddIds] = useState<Set<string>>(new Set());
  const [addSearchQuery, setAddSearchQuery] = useState<string>('');
  const [addFlagFilter, setAddFlagFilter] = useState<'all' | 'rush' | 'controlled' | 'refrigerated'>('all');

  // Mobile Bottom Sheet state
  const [mobileSheetExpanded, setMobileSheetExpanded] = useState<boolean>(false);
  const [holdProgress, setHoldProgress] = useState<number>(0);
  const holdTimerRef = useRef<number | null>(null);

  // Distance and Duration calculations
  const routeStats = useMemo(() => {
    const totalStops = stops.length;
    const distance = isOptimized ? (24.8 + (stops.length - 15) * 1.3).toFixed(1) : (32.4 + (stops.length - 15) * 1.8).toFixed(1);
    const hours = isOptimized ? '2h 17m' : '2h 43m';
    const controlledCount = stops.filter((s) => s.flags.controlled).length;
    const refrigeratedCount = stops.filter((s) => s.flags.refrigerated).length;
    const rushCount = stops.filter((s) => s.flags.rush).length;

    return {
      totalStops,
      distance,
      hours,
      controlledCount,
      refrigeratedCount,
      rushCount,
    };
  }, [stops, isOptimized]);

  // Check driver capacity
  const isOverCapacity = stops.length > activeDriver.maxCapacity;

  // Optimize Route Sequence
  const handleOptimizeRoute = () => {
    setRouteStatus('Optimizing');
    setSelectedStopId(null);

    setTimeout(() => {
      // Re-order stops geographically (sorted North to South for optimal Manhattan flow)
      const sorted = [...stops].sort((a, b) => a.mapY - b.mapY);
      const renumbered = sorted.map((s, idx) => ({
        ...s,
        stopNumber: idx + 1,
        distanceFromPrevMi: Number((0.8 + (idx % 3) * 0.4).toFixed(1)),
        driveTimeMin: 4 + (idx % 4) * 2,
      }));

      setStops(renumbered);
      setIsOptimized(true);
      setRouteStatus('Ready');
      setIsModified(false);

      auditLogService.logEvent({
        actionType: 'ROUTE4ME_EXPORT',
        category: 'Route & Export',
        resource: {
          type: 'delivery_batch',
          id: 'ROUTE-NYC-01',
          label: `Route Optimized (${renumbered.length} Stops)`,
        },
        severity: 'info',
        description: `Route sequence optimized for ${activeDriver.name}: 15 stops reduced from 32.4 mi to 24.8 mi.`,
      });
    }, 1100);
  };

  // Undo Optimization
  const handleUndoOptimize = () => {
    const restored = [...stops].sort((a, b) => a.originalSequence - b.originalSequence);
    const renumbered = restored.map((s, idx) => ({
      ...s,
      stopNumber: idx + 1,
    }));
    setStops(renumbered);
    setIsOptimized(false);
  };

  // Reorder stop manually (up/down)
  const handleMoveStop = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === stops.length - 1) return;

    const newStops = [...stops];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newStops[index];
    newStops[index] = newStops[targetIndex];
    newStops[targetIndex] = temp;

    // Renumber
    const renumbered = newStops.map((s, idx) => ({
      ...s,
      stopNumber: idx + 1,
    }));

    setStops(renumbered);
    setIsModified(true);
    setIsOptimized(false);
  };

  // Drag-and-drop reordering
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (idx: number) => {
    setDraggedIndex(idx);
  };

  const handleDragOver = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIdx) return;

    const newStops = [...stops];
    const draggedItem = newStops[draggedIndex];
    newStops.splice(draggedIndex, 1);
    newStops.splice(targetIdx, 0, draggedItem);

    const renumbered = newStops.map((s, idx) => ({
      ...s,
      stopNumber: idx + 1,
    }));

    setStops(renumbered);
    setDraggedIndex(targetIdx);
    setIsModified(true);
    setIsOptimized(false);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Remove Stop
  const handleConfirmRemoveStop = () => {
    if (!showRemoveModal) return;
    const toRemove = showRemoveModal;
    setStops((prev) =>
      prev.filter((s) => s.id !== toRemove.id).map((s, idx) => ({ ...s, stopNumber: idx + 1 }))
    );
    setUnassignedPool((prev) => [toRemove, ...prev]);
    if (selectedStopId === toRemove.id) setSelectedStopId(null);
    if (drawerStop?.id === toRemove.id) setDrawerStop(null);
    setShowRemoveModal(null);
    setIsModified(true);
  };

  // Add Stops
  const handleConfirmAddStops = () => {
    const toAdd = unassignedPool.filter((item) => selectedToAddIds.has(item.id));
    if (toAdd.length === 0) return;

    const assigned = toAdd.map((item) => ({
      ...item,
      driverName: activeDriver.name,
    }));

    const newStopsList = [...stops, ...assigned].map((s, idx) => ({
      ...s,
      stopNumber: idx + 1,
    }));

    setStops(newStopsList);
    setUnassignedPool((prev) => prev.filter((item) => !selectedToAddIds.has(item.id)));
    setSelectedToAddIds(new Set());
    setShowAddModal(false);
    setIsModified(true);

    if (newStopsList.length > activeDriver.maxCapacity) {
      setShowCapacityWarning(true);
    }
  };

  // Dispatch Route Action
  const handleConfirmDispatch = () => {
    setRouteStatus('Dispatched');
    setShowDispatchModal(false);
    setDispatchSuccess(true);

    auditLogService.logEvent({
      actionType: 'DRIVER_ASSIGNED',
      category: 'State Change',
      resource: {
        type: 'delivery_batch',
        id: 'ROUTE-NYC-01',
        label: `Route Dispatched to ${activeDriver.name}`,
      },
      severity: 'success',
      description: `Route dispatched to ${activeDriver.name} with ${stops.length} stops (${routeStats.distance} mi, ${routeStats.hours}).`,
    });
  };

  // Mobile Hold to Start Logic
  const handleHoldStart = () => {
    if (routeStatus === 'Dispatched') return;
    let current = 0;
    holdTimerRef.current = window.setInterval(() => {
      current += 8;
      setHoldProgress(current);
      if (current >= 100) {
        if (holdTimerRef.current) clearInterval(holdTimerRef.current);
        handleConfirmDispatch();
      }
    }, 60);
  };

  const handleHoldEnd = () => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (holdProgress < 100) {
      setHoldProgress(0);
    }
  };

  return (
    <div className={styles.workspaceContainer}>
      {/* 1. TOP HEADER */}
      <header className={styles.topHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.breadcrumb}>
            <span>Operations</span> / <span className={styles.breadcrumbActive}>Route Planner</span>
          </div>
          <div className={styles.titleRow}>
            <h1 className={styles.pageTitle}>Route Planner</h1>
            <span className={styles.routeCodeBadge}>NYC-METRO-01</span>
            <span
              className={`${styles.statusPill} ${
                routeStatus === 'Dispatched'
                  ? styles.statusDispatched
                  : routeStatus === 'Optimizing'
                  ? styles.statusOptimizing
                  : styles.statusReady
              }`}
            >
              {routeStatus === 'Optimizing' ? 'Optimizing Sequence...' : routeStatus === 'Dispatched' ? 'Dispatched' : 'Ready to Dispatch'}
            </span>
          </div>
          <p className={styles.headerSubtitle}>
            Plan, optimize, and dispatch multi-stop prescription delivery routes for couriers.
          </p>
        </div>

        <div className={styles.headerRight}>
          {/* Driver Selector */}
          <div className={styles.driverSelectWrapper}>
            <label className={styles.driverLabel}>Assigned Driver</label>
            <div className={styles.driverSelectBox}>
              <User size={15} className={styles.driverIcon} />
              <select
                className={styles.driverSelect}
                value={selectedDriverId}
                onChange={(e) => {
                  setSelectedDriverId(e.target.value);
                  const d = ROUTE_DRIVERS.find((drv) => drv.id === e.target.value);
                  if (d && stops.length > d.maxCapacity) {
                    setShowCapacityWarning(true);
                  }
                }}
              >
                {ROUTE_DRIVERS.map((drv) => (
                  <option key={drv.id} value={drv.id}>
                    {drv.name} ({drv.assignedStops}/{drv.maxCapacity} stops · {drv.vehicle.slice(0, 16)}...)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Primary Optimize CTA */}
          <button
            className={`btn btn-primary ${styles.optimizeMainBtn}`}
            onClick={handleOptimizeRoute}
            disabled={routeStatus === 'Optimizing' || stops.length === 0}
          >
            <Sparkles size={16} />
            {routeStatus === 'Optimizing' ? 'Optimizing Route...' : 'Optimize Route'}
          </button>
        </div>
      </header>

      {/* 2. DATE & COMPACT ROUTE CONTROLS TOOLBAR */}
      <div className={styles.compactToolbar}>
        <div className={styles.toolbarStatsGroup}>
          <div className={styles.toolbarItem}>
            <span className={styles.statLabel}>Route Date</span>
            <span className={styles.statValue}>Today — Aug 19, 2026</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.toolbarItem}>
            <span className={styles.statLabel}>Driver</span>
            <span className={styles.statValue}>{activeDriver.name}</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.toolbarItem}>
            <span className={styles.statLabel}>Total Stops</span>
            <span className={styles.statValue}>
              {routeStats.totalStops} Stops
              {isOverCapacity && (
                <span className={styles.capacityBadge} title="Exceeds driver standard capacity">
                  ⚠️ Over Cap
                </span>
              )}
            </span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.toolbarItem}>
            <span className={styles.statLabel}>Route Distance</span>
            <span className={styles.statValueHighlight}>{routeStats.distance} mi</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.toolbarItem}>
            <span className={styles.statLabel}>Est. Duration</span>
            <span className={styles.statValueHighlight}>{routeStats.hours}</span>
          </div>
        </div>

        {/* Operational Filter Chips */}
        <div className={styles.filterChipsGroup}>
          <button
            className={`${styles.filterChip} ${filterFlag === 'all' ? styles.chipActive : ''}`}
            onClick={() => setFilterFlag('all')}
          >
            All Stops ({stops.length})
          </button>
          <button
            className={`${styles.filterChip} ${filterFlag === 'controlled' ? styles.chipActiveControlled : ''}`}
            onClick={() => setFilterFlag(filterFlag === 'controlled' ? 'all' : 'controlled')}
          >
            <Lock size={12} /> {routeStats.controlledCount} Controlled
          </button>
          <button
            className={`${styles.filterChip} ${filterFlag === 'refrigerated' ? styles.chipActiveCold : ''}`}
            onClick={() => setFilterFlag(filterFlag === 'refrigerated' ? 'all' : 'refrigerated')}
          >
            <Snowflake size={12} /> {routeStats.refrigeratedCount} Refrigerated
          </button>
          <button
            className={`${styles.filterChip} ${filterFlag === 'rush' ? styles.chipActiveRush : ''}`}
            onClick={() => setFilterFlag(filterFlag === 'rush' ? 'all' : 'rush')}
          >
            <Zap size={12} /> {routeStats.rushCount} Rush
          </button>
        </div>
      </div>

      {/* Optimization Banner Feedback */}
      {isOptimized && (
        <div className={styles.optimizeSuccessBanner}>
          <div className={styles.optBannerLeft}>
            <Sparkles size={18} className={styles.optSparkle} />
            <div>
              <strong>Route Optimized!</strong> Sequences reordered for maximum efficiency:{' '}
              <span className={styles.optSaving}>32.4 mi → {routeStats.distance} mi</span> (Saved 7.6 mi · 26 min).
            </div>
          </div>
          <div className={styles.optBannerActions}>
            <button className={styles.btnBannerSave} onClick={() => setIsOptimized(false)}>
              Keep Optimized Route
            </button>
            <button className={styles.btnBannerUndo} onClick={handleUndoOptimize}>
              <RotateCcw size={13} /> Undo
            </button>
          </div>
        </div>
      )}

      {/* Route Modified Alert */}
      {isModified && !isOptimized && (
        <div className={styles.modifiedBanner}>
          <div className={styles.modLeft}>
            <AlertTriangle size={16} />
            <span>Stop sequence was manually altered. Route distance and ETAs recalculated.</span>
          </div>
          <button className={styles.btnRecalc} onClick={handleOptimizeRoute}>
            <Sparkles size={13} /> Recalculate & Optimize
          </button>
        </div>
      )}

      {/* 3. MAIN WORKSPACE: STOPS PANEL + MAP */}
      <div className={styles.workspaceBody}>
        {/* LEFT PANEL: ROUTE STOPS LIST */}
        <aside className={styles.stopsPanel}>
          <div className={styles.panelHeader}>
            <div>
              <div className={styles.panelTitle}>Route Stops</div>
              <div className={styles.panelSubtext}>
                {stops.length} Stops · {routeStats.hours} · {routeStats.distance} mi
              </div>
            </div>
            <div className={styles.panelHeaderActions}>
              <button
                className={`btn btn-secondary ${styles.btnSmall} ${isEditMode ? styles.btnEditActive : ''}`}
                onClick={() => setIsEditMode(!isEditMode)}
                title="Toggle reorder mode"
              >
                <ArrowUpDown size={13} />
                {isEditMode ? 'Done' : 'Edit Route'}
              </button>
              <button
                className={`btn btn-secondary ${styles.btnSmall}`}
                onClick={() => setShowAddModal(true)}
              >
                <Plus size={13} /> Add
              </button>
            </div>
          </div>

          {/* Depot Starting Hub Block */}
          <div className={styles.depotListRow}>
            <div className={styles.depotIconBox}>
              <Building2 size={16} />
            </div>
            <div className={styles.depotInfo}>
              <div className={styles.depotTitle}>Start: West Metro Hub (Depot)</div>
              <div className={styles.depotAddress}>620 12th Ave, New York, NY 10036 · 09:45 AM Departure</div>
            </div>
          </div>

          {/* Draggable Stops List */}
          <div className={styles.stopsListScroll}>
            {stops.map((stop, index) => {
              const isSelected = selectedStopId === stop.id;
              const isMatchFilter =
                filterFlag === 'all' ||
                (filterFlag === 'controlled' && stop.flags.controlled) ||
                (filterFlag === 'refrigerated' && stop.flags.refrigerated) ||
                (filterFlag === 'rush' && stop.flags.rush);

              return (
                <div
                  key={stop.id}
                  draggable={isEditMode}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`${styles.stopCard} ${isSelected ? styles.stopCardSelected : ''} ${
                    !isMatchFilter ? styles.stopDimmed : ''
                  }`}
                  onClick={() => {
                    setSelectedStopId(stop.id);
                    setDrawerStop(stop);
                  }}
                >
                  <div className={styles.stopCardLeft}>
                    {/* Stop Number Badge */}
                    <div
                      className={`${styles.stopBadge} ${
                        stop.flags.rush ? styles.stopBadgeRush : stop.flags.controlled ? styles.stopBadgeControlled : ''
                      }`}
                    >
                      {stop.stopNumber}
                    </div>

                    <div className={styles.stopContent}>
                      <div className={styles.stopRow1}>
                        <span className={styles.stopAddress}>
                          {stop.address.street}
                          {stop.address.apt ? `, ${stop.address.apt}` : ''}
                        </span>
                        <span className={styles.stopOrderId}>{stop.orderId}</span>
                      </div>

                      <div className={styles.stopRow2}>
                        <span className={styles.stopCity}>
                          {stop.address.city}, {stop.address.zip} · {stop.address.neighborhood}
                        </span>
                      </div>

                      <div className={styles.stopRow3}>
                        <span className={styles.stopWindow}>
                          <Clock size={11} /> {stop.deliveryWindow.start} – {stop.deliveryWindow.end}
                        </span>
                        <span className={styles.stopEta}>ETA {stop.estimatedArrival}</span>
                      </div>

                      {/* Pill Tags */}
                      <div className={styles.stopPills}>
                        {stop.flags.controlled && (
                          <span className={styles.pillTagControlled}>
                            <Lock size={10} /> Controlled
                          </span>
                        )}
                        {stop.flags.refrigerated && (
                          <span className={styles.pillTagCold}>
                            <Snowflake size={10} /> Cold-Chain
                          </span>
                        )}
                        {stop.flags.rush && (
                          <span className={styles.pillTagRush}>
                            <Zap size={10} /> RUSH
                          </span>
                        )}
                        <span className={styles.pillPharmacy}>{stop.pharmacy.code}</span>
                      </div>
                    </div>
                  </div>

                  {/* Move Up/Down / Remove Actions */}
                  {isEditMode && (
                    <div className={styles.reorderControls} onClick={(e) => e.stopPropagation()}>
                      <button
                        className={styles.btnMove}
                        onClick={() => handleMoveStop(index, 'up')}
                        disabled={index === 0}
                        title="Move Stop Up"
                      >
                        <MoveUp size={12} />
                      </button>
                      <button
                        className={styles.btnMove}
                        onClick={() => handleMoveStop(index, 'down')}
                        disabled={index === stops.length - 1}
                        title="Move Stop Down"
                      >
                        <MoveDown size={12} />
                      </button>
                      <button
                        className={styles.btnRemoveDirect}
                        onClick={() => setShowRemoveModal(stop)}
                        title="Remove Stop"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Panel Bottom Route Summary Bar */}
          <div className={styles.panelSummaryFooter}>
            <div className={styles.summaryMetaRow}>
              <div>
                <div className={styles.summaryTitle}>Route Ready</div>
                <div className={styles.summaryDetails}>
                  1st Stop: 10:00 AM · Last: 02:04 PM
                </div>
              </div>
              <div className={styles.summaryDriver}>{activeDriver.name}</div>
            </div>

            <div className={styles.summaryActionsRow}>
              <button
                className={`btn btn-primary ${styles.dispatchBtn}`}
                onClick={() => setShowDispatchModal(true)}
                disabled={routeStatus === 'Dispatched'}
              >
                <Send size={15} />
                {routeStatus === 'Dispatched' ? 'Dispatched to Driver' : 'Dispatch Route'}
              </button>
            </div>
          </div>
        </aside>

        {/* RIGHT AREA: HIGH-FIDELITY MAP CANVAS */}
        <main className={styles.mapArea}>
          <RouteMapCanvas
            stops={stops}
            selectedStopId={selectedStopId}
            onSelectStop={(id) => setSelectedStopId(id)}
            onOpenStopDetail={(stop) => setDrawerStop(stop)}
            onRemoveStop={(stop) => setShowRemoveModal(stop)}
            filterFlag={filterFlag}
            isOptimizing={routeStatus === 'Optimizing'}
            assignedDriverName={activeDriver.name}
          />
        </main>
      </div>

      {/* 4. STOP DETAIL DRAWER */}
      {drawerStop && (
        <div className={styles.drawerBackdrop} onClick={() => setDrawerStop(null)}>
          <div className={styles.detailDrawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div>
                <div className={styles.drawerStopNum}>Stop {drawerStop.stopNumber}</div>
                <h2 className={styles.drawerOrderId}>{drawerStop.orderId}</h2>
              </div>
              <button className={styles.drawerCloseBtn} onClick={() => setDrawerStop(null)}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.drawerBody}>
              {/* Address Section */}
              <div className={styles.drawerSection}>
                <div className={styles.drawerSectionTitle}>
                  <MapPin size={15} /> Delivery Address
                </div>
                <div className={styles.drawerAddressBox}>
                  <strong>{drawerStop.address.street}</strong>
                  {drawerStop.address.apt && <span>, {drawerStop.address.apt}</span>}
                  <div>
                    {drawerStop.address.city}, {drawerStop.address.state} {drawerStop.address.zip}
                  </div>
                  <div className={styles.neighborhoodTag}>{drawerStop.address.neighborhood}</div>
                </div>
              </div>

              {/* Recipient & Prescription */}
              <div className={styles.drawerSection}>
                <div className={styles.drawerSectionTitle}>
                  <User size={15} /> Patient & Medication Summary
                </div>
                <div className={styles.drawerFieldRow}>
                  <span className={styles.drawerFieldLabel}>Recipient:</span>
                  <span className={styles.drawerFieldValue}>
                    {drawerStop.recipientName} ({drawerStop.patientSafeId})
                  </span>
                </div>
                <div className={styles.drawerFieldRow}>
                  <span className={styles.drawerFieldLabel}>Phone:</span>
                  <span className={styles.drawerFieldValue}>{drawerStop.recipientPhone}</span>
                </div>
                <div className={styles.drawerFieldRow}>
                  <span className={styles.drawerFieldLabel}>Rx Items:</span>
                  <span className={styles.drawerFieldValue}>{drawerStop.rxSummary}</span>
                </div>
                <div className={styles.drawerFieldRow}>
                  <span className={styles.drawerFieldLabel}>Packages:</span>
                  <span className={styles.drawerFieldValue}>{drawerStop.packageCount} Package(s)</span>
                </div>
              </div>

              {/* Dispensing Pharmacy */}
              <div className={styles.drawerSection}>
                <div className={styles.drawerSectionTitle}>
                  <Building2 size={15} /> Dispensing Pharmacy
                </div>
                <div className={styles.drawerFieldValue}>
                  <strong>{drawerStop.pharmacy.name}</strong> ({drawerStop.pharmacy.code})
                </div>
              </div>

              {/* SLA Delivery Window */}
              <div className={styles.drawerSection}>
                <div className={styles.drawerSectionTitle}>
                  <Clock size={15} /> SLA Delivery Window & Arrival
                </div>
                <div className={styles.drawerFieldRow}>
                  <span className={styles.drawerFieldLabel}>Window:</span>
                  <span className={styles.drawerFieldValue}>
                    {drawerStop.deliveryWindow.start} – {drawerStop.deliveryWindow.end}
                  </span>
                </div>
                <div className={styles.drawerFieldRow}>
                  <span className={styles.drawerFieldLabel}>Est. Arrival:</span>
                  <span className={styles.drawerFieldValueHighlight}>{drawerStop.estimatedArrival}</span>
                </div>
              </div>

              {/* Compliance & Flags */}
              <div className={styles.drawerSection}>
                <div className={styles.drawerSectionTitle}>
                  <ShieldCheck size={15} /> Operational Flags & Requirements
                </div>
                <div className={styles.drawerFlagsList}>
                  {drawerStop.flags.controlled && (
                    <div className={styles.flagBadgeItemControlled}>
                      <Lock size={13} />
                      <div>
                        <strong>DEA Schedule II Controlled Medication</strong>
                        <div className={styles.flagSub}>Electronic DEA 222 signature token required upon handover</div>
                      </div>
                    </div>
                  )}
                  {drawerStop.flags.refrigerated && (
                    <div className={styles.flagBadgeItemCold}>
                      <Snowflake size={13} />
                      <div>
                        <strong>Cold-Chain Monitored (2-8°C)</strong>
                        <div className={styles.flagSub}>Validated temperature-controlled cooler box</div>
                      </div>
                    </div>
                  )}
                  {drawerStop.flags.rush && (
                    <div className={styles.flagBadgeItemRush}>
                      <Zap size={13} />
                      <div>
                        <strong>STAT Urgent Priority Delivery</strong>
                        <div className={styles.flagSub}>High priority patient delivery SLA</div>
                      </div>
                    </div>
                  )}
                  {!drawerStop.flags.controlled && !drawerStop.flags.refrigerated && !drawerStop.flags.rush && (
                    <div className={styles.flagStandard}>Standard Ambient Delivery</div>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.drawerFooter}>
              <button
                className="btn btn-secondary"
                style={{ color: '#DC2626' }}
                onClick={() => {
                  setShowRemoveModal(drawerStop);
                }}
              >
                <Trash2 size={14} /> Remove From Route
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setDrawerStop(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. ADD STOPS MODAL */}
      {showAddModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowAddModal(false)}>
          <div className={styles.addStopsModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <Plus size={18} /> Add Eligible Deliveries to Route
              </div>
              <button className={styles.modalCloseBtn} onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Search and Filters */}
            <div className={styles.modalFilterRow}>
              <div className={styles.modalSearchWrapper}>
                <Search size={15} className={styles.modalSearchIcon} />
                <input
                  type="text"
                  placeholder="Search Order ID, address, patient..."
                  value={addSearchQuery}
                  onChange={(e) => setAddSearchQuery(e.target.value)}
                  className={styles.modalSearchInput}
                />
              </div>

              <div className={styles.modalFilterTags}>
                <button
                  className={`${styles.tagBtn} ${addFlagFilter === 'all' ? styles.tagBtnActive : ''}`}
                  onClick={() => setAddFlagFilter('all')}
                >
                  All ({unassignedPool.length})
                </button>
                <button
                  className={`${styles.tagBtn} ${addFlagFilter === 'rush' ? styles.tagBtnActive : ''}`}
                  onClick={() => setAddFlagFilter(addFlagFilter === 'rush' ? 'all' : 'rush')}
                >
                  <Zap size={11} /> Rush
                </button>
                <button
                  className={`${styles.tagBtn} ${addFlagFilter === 'controlled' ? styles.tagBtnActive : ''}`}
                  onClick={() => setAddFlagFilter(addFlagFilter === 'controlled' ? 'all' : 'controlled')}
                >
                  <Lock size={11} /> Controlled
                </button>
                <button
                  className={`${styles.tagBtn} ${addFlagFilter === 'refrigerated' ? styles.tagBtnActive : ''}`}
                  onClick={() => setAddFlagFilter(addFlagFilter === 'refrigerated' ? 'all' : 'refrigerated')}
                >
                  <Snowflake size={11} /> Cold
                </button>
              </div>
            </div>

            {/* Eligible List */}
            <div className={styles.modalListContainer}>
              {unassignedPool.length === 0 ? (
                <div className={styles.modalEmpty}>No unassigned deliveries available at this hub.</div>
              ) : (
                unassignedPool
                  .filter((item) => {
                    if (addFlagFilter === 'rush' && !item.flags.rush) return false;
                    if (addFlagFilter === 'controlled' && !item.flags.controlled) return false;
                    if (addFlagFilter === 'refrigerated' && !item.flags.refrigerated) return false;
                    if (addSearchQuery.trim() !== '') {
                      const q = addSearchQuery.toLowerCase();
                      return (
                        item.orderId.toLowerCase().includes(q) ||
                        item.address.street.toLowerCase().includes(q) ||
                        item.recipientName.toLowerCase().includes(q)
                      );
                    }
                    return true;
                  })
                  .map((item) => {
                    const isChecked = selectedToAddIds.has(item.id);
                    return (
                      <div
                        key={item.id}
                        className={`${styles.addStopRow} ${isChecked ? styles.addStopRowSelected : ''}`}
                        onClick={() => {
                          setSelectedToAddIds((prev) => {
                            const next = new Set(prev);
                            if (next.has(item.id)) next.delete(item.id);
                            else next.add(item.id);
                            return next;
                          });
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className={styles.addCheckbox}
                        />
                        <div className={styles.addStopMain}>
                          <div className={styles.addStopHeader}>
                            <strong>{item.orderId}</strong> · {item.address.street} ({item.address.neighborhood})
                          </div>
                          <div className={styles.addStopSub}>
                            {item.pharmacy.name} · Window: {item.deliveryWindow.start} - {item.deliveryWindow.end}
                          </div>
                          <div className={styles.addStopPills}>
                            {item.flags.controlled && <span className={styles.pillTagControlled}><Lock size={9} /> Controlled</span>}
                            {item.flags.refrigerated && <span className={styles.pillTagCold}><Snowflake size={9} /> Cold-Chain</span>}
                            {item.flags.rush && <span className={styles.pillTagRush}><Zap size={9} /> STAT</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            <div className={styles.modalFooter}>
              <div className={styles.selectedAddCount}>
                <strong>{selectedToAddIds.size}</strong> stops selected
              </div>
              <div className={styles.modalFooterBtns}>
                <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleConfirmAddStops}
                  disabled={selectedToAddIds.size === 0}
                >
                  Add {selectedToAddIds.size} Stops to Route
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. REMOVE STOP CONFIRMATION MODAL */}
      {showRemoveModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowRemoveModal(null)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmIconBox}>
              <Trash2 size={24} color="#DC2626" />
            </div>
            <h3 className={styles.confirmTitle}>Remove Stop From Route?</h3>
            <p className={styles.confirmText}>
              Are you sure you want to remove <strong>Stop {showRemoveModal.stopNumber} ({showRemoveModal.orderId})</strong> at {showRemoveModal.address.street} from this route?
            </p>
            <p className={styles.confirmSubtext}>
              The delivery will return to the unassigned order pool and remain available for reassignment.
            </p>
            <div className={styles.confirmActions}>
              <button className="btn btn-secondary" onClick={() => setShowRemoveModal(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleConfirmRemoveStop}>
                Remove Stop
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. DRIVER CAPACITY WARNING MODAL */}
      {showCapacityWarning && (
        <div className={styles.modalBackdrop} onClick={() => setShowCapacityWarning(false)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.warnIconBox}>
              <AlertTriangle size={26} color="#D97706" />
            </div>
            <h3 className={styles.confirmTitle}>Driver Capacity Warning</h3>
            <p className={styles.confirmText}>
              This route contains <strong>{stops.length} stops</strong>.
            </p>
            <p className={styles.confirmSubtext}>
              {activeDriver.name} currently has a recommended capacity of <strong>{activeDriver.maxCapacity} stops</strong> for their shift ({activeDriver.shiftHours}).
            </p>
            <div className={styles.confirmActions}>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowCapacityWarning(false);
                  setSelectedDriverId('DRV-MB'); // Switch to Michael Brown (cap 20)
                }}
              >
                Assign Higher Capacity Driver (Michael Brown)
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setShowCapacityWarning(false)}
              >
                Continue Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. DISPATCH CONFIRMATION MODAL */}
      {showDispatchModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowDispatchModal(false)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.dispatchIconBox}>
              <Send size={24} color="#0F766E" />
            </div>
            <h3 className={styles.confirmTitle}>Dispatch Route to Driver?</h3>
            <p className={styles.confirmText}>
              Send finalized route manifest directly to <strong>{activeDriver.name}</strong>'s mobile driver portal.
            </p>

            <div className={styles.dispatchSummaryBox}>
              <div className={styles.dispatchStat}>
                <span>Stops:</span> <strong>{stops.length} Deliveries</strong>
              </div>
              <div className={styles.dispatchStat}>
                <span>Distance:</span> <strong>{routeStats.distance} miles</strong>
              </div>
              <div className={styles.dispatchStat}>
                <span>Est. Duration:</span> <strong>{routeStats.hours}</strong>
              </div>
              <div className={styles.dispatchStat}>
                <span>Vehicle:</span> <strong>{activeDriver.vehicle}</strong>
              </div>
            </div>

            <div className={styles.confirmActions}>
              <button className="btn btn-secondary" onClick={() => setShowDispatchModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleConfirmDispatch}>
                Confirm & Dispatch Route
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. DISPATCH SUCCESS NOTIFICATION MODAL */}
      {dispatchSuccess && (
        <div className={styles.modalBackdrop} onClick={() => setDispatchSuccess(false)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.successIconBox}>
              <CheckCircle2 size={32} color="#10B981" />
            </div>
            <h3 className={styles.confirmTitle}>Route Dispatched Successfully!</h3>
            <p className={styles.confirmText}>
              <strong>{activeDriver.name}</strong> has received the optimized route notification and live turn-by-turn stop sequence.
            </p>
            <div className={styles.dispatchSuccessDetails}>
              <span>{stops.length} Stops</span> · <span>{routeStats.distance} Miles</span> · <span>{routeStats.hours}</span>
            </div>
            <div className={styles.confirmActions}>
              <Link to="/audit-logs" className="btn btn-secondary">
                View Audit Ledger
              </Link>
              <button className="btn btn-primary" onClick={() => setDispatchSuccess(false)}>
                Close & View Map
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. MOBILE VIEW BOTTOM SHEET (AS IN ROUTE4ME MOBILE EXPERIENCE) */}
      <div
        className={`${styles.mobileBottomSheet} ${
          mobileSheetExpanded ? styles.mobileSheetExpanded : styles.mobileSheetCollapsed
        }`}
      >
        {/* Drag Handle */}
        <div
          className={styles.mobileSheetHandle}
          onClick={() => setMobileSheetExpanded(!mobileSheetExpanded)}
        >
          <div className={styles.handleBar} />
          <div className={styles.mobileSheetHeaderRow}>
            <div>
              <div className={styles.mobileStopCount}>
                <strong>{stops.length} Stops</strong> · {routeStats.hours} · {routeStats.distance} mi
              </div>
              <div className={styles.mobileDriverName}>
                Driver: {activeDriver.name}
              </div>
            </div>
            <button className={styles.mobileToggleBtn}>
              {mobileSheetExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </button>
          </div>
        </div>

        {/* Expanded Stops List */}
        {mobileSheetExpanded && (
          <div className={styles.mobileStopsScroll}>
            {stops.map((stop) => (
              <div
                key={stop.id}
                className={styles.mobileStopItem}
                onClick={() => {
                  setSelectedStopId(stop.id);
                  setDrawerStop(stop);
                }}
              >
                <div className={styles.mobileStopNum}>{stop.stopNumber}</div>
                <div className={styles.mobileStopDetails}>
                  <div className={styles.mobileStopAddr}>{stop.address.street}</div>
                  <div className={styles.mobileStopMeta}>
                    {stop.orderId} · {stop.deliveryWindow.start}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* HOLD TO START ROUTE BUTTON */}
        <div className={styles.holdToStartWrapper}>
          <button
            className={styles.holdToStartBtn}
            onMouseDown={handleHoldStart}
            onMouseUp={handleHoldEnd}
            onTouchStart={handleHoldStart}
            onTouchEnd={handleHoldEnd}
          >
            <div
              className={styles.holdProgressBar}
              style={{ width: `${holdProgress}%` }}
            />
            <span className={styles.holdBtnText}>
              {routeStatus === 'Dispatched'
                ? 'ROUTE IN PROGRESS'
                : holdProgress > 0
                ? `HOLDING... (${holdProgress}%)`
                : 'HOLD TO START ROUTE'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Route4MePlanner;
