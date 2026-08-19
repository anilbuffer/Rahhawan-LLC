import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  X,
  Lock,
  Snowflake,
  Zap,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  PackageCheck,
  Check,
  Package,
  TrendingUp,
  ArrowRight,
  Filter,
  Navigation,
} from 'lucide-react';
import { driverSyncService, type DriverDeliveryOrder } from '../../services/driverSyncService';
import styles from './DriverDashboard.module.css';

export const DriverDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const [deliveries, setDeliveries] = useState<DriverDeliveryOrder[]>(driverSyncService.getDeliveries());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'DELIVERED' | 'CONTROLLED' | 'COLD'>('ALL');
  const [sortBy, setSortBy] = useState<'sequence' | 'status'>('sequence');

  const isSearchTab = location.pathname.includes('/driver/search');

  useEffect(() => {
    const unsub = driverSyncService.subscribe(() => {
      setDeliveries(driverSyncService.getDeliveries());
    });
    return unsub;
  }, []);

  // Auto focus search input when entering via search route
  useEffect(() => {
    if (isSearchTab && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchTab]);

  // Derived metrics
  const totalStops = deliveries.length;
  const completedStops = deliveries.filter((d) => d.status === 'Delivered').length;
  const remainingStops = totalStops - completedStops;
  const controlledStops = deliveries.filter((d) => d.flags.controlled).length;
  const coldStops = deliveries.filter((d) => d.flags.refrigerated).length;
  const isShiftComplete = totalStops > 0 && remainingStops === 0;

  // Filtered & Sorted Deliveries
  const filteredDeliveries = useMemo(() => {
    let list = [...deliveries];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (d) =>
          d.id.toLowerCase().includes(q) ||
          d.patientSafeId.toLowerCase().includes(q) ||
          d.deliveryAddress.street.toLowerCase().includes(q) ||
          d.deliveryAddress.city.toLowerCase().includes(q) ||
          d.prescriptionSummary.description.toLowerCase().includes(q)
      );
    }

    // Filter by status category
    if (statusFilter === 'ACTIVE') {
      list = list.filter((d) => d.status !== 'Delivered' && d.status !== 'Failed');
    } else if (statusFilter === 'DELIVERED') {
      list = list.filter((d) => d.status === 'Delivered');
    } else if (statusFilter === 'CONTROLLED') {
      list = list.filter((d) => d.flags.controlled);
    } else if (statusFilter === 'COLD') {
      list = list.filter((d) => d.flags.refrigerated);
    }

    // Sort
    if (sortBy === 'sequence') {
      list.sort((a, b) => a.stopSequence - b.stopSequence);
    } else {
      const rank: Record<string, number> = {
        'En Route': 1,
        'Picked Up': 2,
        'Driver Assigned': 3,
        'Submitted': 4,
        'Held — Compliance': 5,
        'Delivered': 6,
        'Failed': 7,
      };
      list.sort((a, b) => (rank[a.status] || 99) - (rank[b.status] || 99));
    }

    return list;
  }, [deliveries, searchQuery, statusFilter, sortBy]);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'En Route':
        return (
          <span className={`${styles.statusBadge} ${styles.badgeEnRoute}`}>
            <Clock size={12} />
            En Route
          </span>
        );
      case 'Picked Up':
        return (
          <span className={`${styles.statusBadge} ${styles.badgePickedUp}`}>
            <PackageCheck size={12} />
            Picked Up
          </span>
        );
      case 'Driver Assigned':
        return (
          <span className={`${styles.statusBadge} ${styles.badgeAssigned}`}>
            <CheckCircle2 size={12} />
            Assigned
          </span>
        );
      case 'Delivered':
        return (
          <span className={`${styles.statusBadge} ${styles.badgeDelivered}`}>
            <Check size={12} strokeWidth={3} />
            Delivered
          </span>
        );
      case 'Failed':
        return (
          <span className={`${styles.statusBadge} ${styles.badgeFailed}`}>
            <AlertTriangle size={12} />
            Failed
          </span>
        );
      case 'Held — Compliance':
        return (
          <span className={`${styles.statusBadge} ${styles.badgeHeld}`}>
            <Lock size={12} />
            Held
          </span>
        );
      default:
        return (
          <span className={`${styles.statusBadge} ${styles.badgeAssigned}`}>
            {status}
          </span>
        );
    }
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className={styles.topHeaderRow}>
        <div>
          <div className={styles.greetingTitle}>Courier Manifest Dashboard</div>
          <div className={styles.subSubtitle}>
            {todayFormatted} • Route Run #104 (Marcus Vance)
          </div>
        </div>

        <div className={styles.headerActionBtns}>
          <button
            className={styles.routeLaunchBtn}
            onClick={() => navigate('/driver/route')}
          >
            <Navigation size={16} />
            <span>Launch Route Map</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: 'rgba(14, 163, 131, 0.1)', color: '#0EA383' }}>
            <Package size={20} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Manifest Stops</span>
            <div className={styles.statNumber}>{totalStops}</div>
            <span className={styles.statNote}>100% vehicle capacity</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
            <CheckCircle2 size={20} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Completed Stops</span>
            <div className={styles.statNumber}>{completedStops}</div>
            <span className={styles.statNote} style={{ color: '#10B981' }}>
              {totalStops > 0 ? Math.round((completedStops / totalStops) * 100) : 0}% shift progress
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
            <Clock size={20} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Remaining Active</span>
            <div className={styles.statNumber}>{remainingStops}</div>
            <span className={styles.statNote}>
              {remainingStops === 0 ? 'All delivered!' : 'Pending deliveries'}
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#0284C7' }}>
            <Snowflake size={20} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Cold-Chain (2–8°C)</span>
            <div className={styles.statNumber}>{coldStops}</div>
            <span className={styles.statNote} style={{ color: '#0284C7' }}>Dual-temp monitored</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#DC2626' }}>
            <Lock size={20} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Controlled C-II</span>
            <div className={styles.statNumber}>{controlledStops}</div>
            <span className={styles.statNote} style={{ color: '#DC2626' }}>DEA 222 Mandated</span>
          </div>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className={styles.toolbarCard}>
        {/* Search Bar */}
        <div className={styles.searchBar}>
          <Search size={18} className={styles.searchIcon} />
          <input
            ref={searchInputRef}
            id="driver-search-order-id"
            type="text"
            className={styles.searchInput}
            placeholder="Search manifest by Order ID, Patient ID, Street address, Rx description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className={styles.clearSearchBtn}
              onClick={() => setSearchQuery('')}
              aria-label="Clear Search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <button
              className={`${styles.filterBtn} ${statusFilter === 'ALL' ? styles.filterBtnActive : ''}`}
              onClick={() => setStatusFilter('ALL')}
            >
              All ({deliveries.length})
            </button>
            <button
              className={`${styles.filterBtn} ${statusFilter === 'ACTIVE' ? styles.filterBtnActive : ''}`}
              onClick={() => setStatusFilter('ACTIVE')}
            >
              Active ({remainingStops})
            </button>
            <button
              className={`${styles.filterBtn} ${statusFilter === 'DELIVERED' ? styles.filterBtnActive : ''}`}
              onClick={() => setStatusFilter('DELIVERED')}
            >
              Delivered ({completedStops})
            </button>
            <button
              className={`${styles.filterBtn} ${statusFilter === 'CONTROLLED' ? styles.filterBtnActive : ''}`}
              onClick={() => setStatusFilter('CONTROLLED')}
            >
              <Lock size={12} />
              Controlled ({controlledStops})
            </button>
            <button
              className={`${styles.filterBtn} ${statusFilter === 'COLD' ? styles.filterBtnActive : ''}`}
              onClick={() => setStatusFilter('COLD')}
            >
              <Snowflake size={12} />
              Cold ({coldStops})
            </button>
          </div>

          {/* Sort tabs */}
          <div className={styles.sortGroup}>
            <span className={styles.sortLabel}>Sort:</span>
            <div className={styles.sortTabs}>
              <button
                className={`${styles.sortTabBtn} ${sortBy === 'sequence' ? styles.sortTabBtnActive : ''}`}
                onClick={() => setSortBy('sequence')}
              >
                Sequence #
              </button>
              <button
                className={`${styles.sortTabBtn} ${sortBy === 'status' ? styles.sortTabBtnActive : ''}`}
                onClick={() => setSortBy('status')}
              >
                Active First
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Shift Complete Banner */}
      {isShiftComplete && !searchQuery && (
        <div className={styles.endOfShiftCard}>
          <div className={styles.endCheckIcon}>
            <CheckCircle2 size={36} />
          </div>
          <div className={styles.endContent}>
            <h2 className={styles.endTitle}>All Manifest Deliveries Completed!</h2>
            <p className={styles.endSub}>
              Excellent work, Marcus. All {totalStops} stops delivered with recipient signatures and temperature compliance proof.
            </p>
          </div>
          <div className={styles.endStatsRow}>
            <div className={styles.endStatPill}>
              <strong>{totalStops}</strong> Delivered
            </div>
            <div className={styles.endStatPill} style={{ color: '#10B981', borderColor: 'rgba(16,185,129,0.3)' }}>
              <strong>100%</strong> On-Time SLA
            </div>
            <button
              className={styles.viewHistoryBtn}
              onClick={() => navigate('/driver/history')}
            >
              View Delivery Audit History
            </button>
          </div>
        </div>
      )}

      {/* Manifest Deliveries List */}
      <div className={styles.stopsList}>
        {filteredDeliveries.map((order) => {
          const isControlled = order.flags.controlled;
          const isCold = order.flags.refrigerated;
          const isRush = order.flags.rush;
          const hasConflict = !!order.rejectionNotice;
          const isDelivered = order.status === 'Delivered';

          return (
            <div
              key={order.id}
              id={`order-card-${order.id}`}
              className={`${styles.orderCard} ${isControlled ? styles.orderCardControlled : ''} ${
                isDelivered ? styles.orderCardDelivered : ''
              }`}
              onClick={() => navigate(`/driver/order/${order.id}`)}
              role="button"
              tabIndex={0}
            >
              {/* Conflict Alert Stripe */}
              {hasConflict && (
                <div className={styles.conflictAlertStripe}>
                  <AlertTriangle size={15} />
                  <span>Sync Rejection / Conflict: Modified during offline mode</span>
                </div>
              )}

              <div className={styles.cardHeaderRow}>
                <div className={styles.sequenceGroup}>
                  <span className={styles.stopSequenceBadge}>
                    {order.stopSequence}
                  </span>
                  <div className={styles.orderIdGroup}>
                    <span className={styles.orderIdText}>{order.id}</span>
                    <span className={styles.safeIdBadge}>Patient: {order.patientSafeId}</span>
                  </div>
                </div>

                <div className={styles.rightHeaderGroup}>
                  <div className={styles.flagsRow}>
                    {isControlled && (
                      <span className={`${styles.flagChip} ${styles.flagControlled}`}>
                        <Lock size={11} />
                        C-II DEA
                      </span>
                    )}
                    {isCold && (
                      <span className={`${styles.flagChip} ${styles.flagCold}`}>
                        <Snowflake size={11} />
                        Cold (2–8°C)
                      </span>
                    )}
                    {isRush && (
                      <span className={`${styles.flagChip} ${styles.flagRush}`}>
                        <Zap size={11} />
                        Rush
                      </span>
                    )}
                  </div>

                  {renderStatusBadge(order.status)}
                </div>
              </div>

              {/* Card Body: Address & Prescription */}
              <div className={styles.cardBodyGrid}>
                <div className={styles.addressBlock}>
                  <MapPin size={16} className={styles.addressIcon} />
                  <div>
                    <div className={styles.addressStreet}>
                      {order.deliveryAddress.street}
                      {order.deliveryAddress.apt ? `, ${order.deliveryAddress.apt}` : ''}
                    </div>
                    <div className={styles.addressCity}>
                      {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zip}
                    </div>
                  </div>
                </div>

                <div className={styles.rxBlock}>
                  <div className={styles.rxPharmacy}>
                    Dispensed by: <strong>{order.pharmacy.name}</strong>
                  </div>
                  <div className={styles.rxDescription}>
                    {order.prescriptionSummary.description} ({order.prescriptionSummary.itemCount} items)
                  </div>
                </div>
              </div>

              {/* Card Footer: SLA & Action Link */}
              <div className={styles.cardFooterRow}>
                <div className={styles.slaTimeBlock}>
                  <Clock size={13} />
                  <span className={order.slaWindow.isNearBreach ? styles.nearBreach : ''}>
                    {order.slaWindow.urgentTimeLeft || `SLA Target: ${order.slaWindow.end}`}
                  </span>
                </div>

                <div className={styles.viewStopLink}>
                  <span>Stop Details & Evidence</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          );
        })}

        {filteredDeliveries.length === 0 && (
          <div className={styles.emptyState}>
            <PackageCheck size={40} className={styles.emptyIcon} />
            <div className={styles.emptyTitle}>No Deliveries Found</div>
            <div className={styles.emptySub}>
              No manifest stops matched your filter criteria or search query "{searchQuery}".
            </div>
            <button
              className={styles.resetFilterBtn}
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;
