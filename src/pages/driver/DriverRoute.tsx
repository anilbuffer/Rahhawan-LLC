import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Navigation,
  Clock,
  CheckCircle2,
  Phone,
  ArrowRight,
  Lock,
  Snowflake,
  ChevronRight,
  Compass,
  Check,
} from 'lucide-react';
import { driverSyncService, type DriverDeliveryOrder } from '../../services/driverSyncService';
import styles from './DriverRoute.module.css';

export const DriverRoute: React.FC = () => {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<DriverDeliveryOrder[]>(driverSyncService.getDeliveries());

  useEffect(() => {
    const unsub = driverSyncService.subscribe(() => {
      setDeliveries(driverSyncService.getDeliveries());
    });
    return unsub;
  }, []);

  const sortedDeliveries = [...deliveries].sort((a, b) => a.stopSequence - b.stopSequence);
  const activeStop = sortedDeliveries.find((d) => d.status !== 'Delivered' && d.status !== 'Failed') || sortedDeliveries[0];
  const completedCount = sortedDeliveries.filter((d) => d.status === 'Delivered').length;
  const totalCount = sortedDeliveries.length;

  const handleOpenMaps = (address: string) => {
    const encoded = encodeURIComponent(address);
    window.open(`https://maps.google.com/?q=${encoded}`, '_blank');
  };

  return (
    <div className={styles.container}>
      {/* Route Header */}
      <div className={styles.routeHeader}>
        <div>
          <h1 className={styles.routeTitle}>Active Route Run #104</h1>
          <p className={styles.routeSubtitle}>
            Optimized courier loop • {completedCount} of {totalCount} stops completed
          </p>
        </div>

        <div className={styles.routeMetrics}>
          <div className={styles.metricBox}>
            <span className={styles.metricVal}>18.4 mi</span>
            <span className={styles.metricLbl}>Total Distance</span>
          </div>
          <div className={styles.metricBox}>
            <span className={styles.metricVal}>42 min</span>
            <span className={styles.metricLbl}>Est. Transit</span>
          </div>
          <div className={styles.metricBox}>
            <span className={styles.metricVal} style={{ color: '#0EA383' }}>
              {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
            </span>
            <span className={styles.metricLbl}>Progress</span>
          </div>
        </div>
      </div>

      {/* Primary Next Stop Highlight Card */}
      {activeStop && activeStop.status !== 'Delivered' ? (
        <div className={styles.activeStopCard}>
          <div className={styles.activeTopStripe}>
            <div className={styles.nextStopBadge}>
              <Compass size={14} className={styles.spinner} />
              <span>CURRENT TARGET STOP · #{activeStop.stopSequence}</span>
            </div>
            <span className={styles.activeOrderId}>{activeStop.id}</span>
          </div>

          <div className={styles.activeContentGrid}>
            <div className={styles.activeMainInfo}>
              <div className={styles.patientRow}>
                <span className={styles.patientName}>Patient {activeStop.patientInitials}</span>
                <span className={styles.safeId}>ID: {activeStop.patientSafeId}</span>
                <span className={styles.statusPill}>{activeStop.status}</span>
              </div>

              <div className={styles.addressBlock}>
                <MapPin size={20} className={styles.pinIcon} />
                <div>
                  <div className={styles.streetText}>
                    {activeStop.deliveryAddress.street}
                    {activeStop.deliveryAddress.apt ? `, ${activeStop.deliveryAddress.apt}` : ''}
                  </div>
                  <div className={styles.cityText}>
                    {activeStop.deliveryAddress.city}, {activeStop.deliveryAddress.state} {activeStop.deliveryAddress.zip}
                  </div>
                </div>
              </div>

              <div className={styles.rxSummaryBox}>
                <strong>Prescription:</strong> {activeStop.prescriptionSummary.description}
              </div>
            </div>

            {/* Quick Actions */}
            <div className={styles.activeActionsBlock}>
              <button
                className={styles.gpsNavBtn}
                onClick={() =>
                  handleOpenMaps(
                    `${activeStop.deliveryAddress.street}, ${activeStop.deliveryAddress.city}, ${activeStop.deliveryAddress.state}`
                  )
                }
              >
                <Navigation size={18} />
                <span>Start GPS Navigation</span>
              </button>

              <button
                className={styles.openDetailBtn}
                onClick={() => navigate(`/driver/order/${activeStop.id}`)}
              >
                <span>Arrived at Stop & Capture Proof</span>
                <ArrowRight size={16} />
              </button>

              <div className={styles.secondaryBtnRow}>
                <a href="tel:+15552348901" className={styles.callBtn}>
                  <Phone size={14} />
                  <span>Call Recipient</span>
                </a>
                <div className={styles.slaBadge}>
                  <Clock size={13} />
                  <span>Due: {activeStop.slaWindow.end}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.allDoneBanner}>
          <CheckCircle2 size={32} color="#10B981" />
          <div>
            <div className={styles.allDoneTitle}>All Route Stops Completed!</div>
            <div className={styles.allDoneSub}>Your manifest route is 100% fulfilled. Return to depot or sign out.</div>
          </div>
        </div>
      )}

      {/* Sequential Route Stops Timeline */}
      <div className={styles.timelineSection}>
        <div className={styles.timelineHeader}>
          <h2 className={styles.timelineTitle}>Multi-Stop Manifest Sequence</h2>
          <span className={styles.timelineSub}>{sortedDeliveries.length} Planned Waypoints</span>
        </div>

        <div className={styles.timelineList}>
          {sortedDeliveries.map((order, index) => {
            const isCompleted = order.status === 'Delivered';
            const isCurrent = order.id === activeStop?.id && !isCompleted;
            const isControlled = order.flags.controlled;
            const isCold = order.flags.refrigerated;

            return (
              <div
                key={order.id}
                className={`${styles.timelineItem} ${isCurrent ? styles.currentTimelineItem : ''} ${
                  isCompleted ? styles.completedTimelineItem : ''
                }`}
                onClick={() => navigate(`/driver/order/${order.id}`)}
              >
                {/* Timeline connector marker */}
                <div className={styles.markerColumn}>
                  <div
                    className={`${styles.timelineMarker} ${
                      isCompleted
                        ? styles.markerCompleted
                        : isCurrent
                        ? styles.markerCurrent
                        : styles.markerPending
                    }`}
                  >
                    {isCompleted ? (
                      <Check size={14} strokeWidth={3} />
                    ) : (
                      <span>{order.stopSequence}</span>
                    )}
                  </div>
                  {index < sortedDeliveries.length - 1 && <div className={styles.timelineConnectorLine} />}
                </div>

                {/* Stop Content Card */}
                <div className={styles.timelineCard}>
                  <div className={styles.cardTop}>
                    <div className={styles.idGroup}>
                      <span className={styles.orderIdText}>{order.id}</span>
                      <span className={styles.patientText}>Patient {order.patientSafeId}</span>
                    </div>

                    <div className={styles.badgesGroup}>
                      {isControlled && (
                        <span className={styles.c2Badge}>
                          <Lock size={10} /> C-II
                        </span>
                      )}
                      {isCold && (
                        <span className={styles.coldBadge}>
                          <Snowflake size={10} /> Cold
                        </span>
                      )}
                      <span
                        className={`${styles.statusPillSmall} ${
                          isCompleted ? styles.statusDelivered : styles.statusPending
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className={styles.cardAddress}>
                    <MapPin size={14} className={styles.addressIcon} />
                    <span>
                      {order.deliveryAddress.street}, {order.deliveryAddress.city}
                    </span>
                  </div>

                  <div className={styles.cardFooter}>
                    <span className={styles.rxBrief}>{order.prescriptionSummary.description}</span>
                    <div className={styles.viewLink}>
                      <span>Stop #{order.stopSequence}</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DriverRoute;
