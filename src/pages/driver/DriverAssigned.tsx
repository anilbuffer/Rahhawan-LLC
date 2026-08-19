import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Lock,
  Snowflake,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Navigation,
  Check,
} from 'lucide-react';
import { driverSyncService, type DriverDeliveryOrder } from '../../services/driverSyncService';
import styles from './DriverAssigned.module.css';

export const DriverAssigned: React.FC = () => {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<DriverDeliveryOrder[]>(driverSyncService.getDeliveries());
  const [checklist, setChecklist] = useState({
    vehicleInspected: true,
    refrigerationCalibrated: true,
    deaSecured: true,
    manifestAccepted: true,
  });

  useEffect(() => {
    const unsub = driverSyncService.subscribe(() => {
      setDeliveries(driverSyncService.getDeliveries());
    });
    return unsub;
  }, []);

  const assignedOrders = deliveries.filter((d) => d.status !== 'Delivered' && d.status !== 'Failed');

  const handleStartAll = () => {
    // Advance assigned orders to En Route if picked up
    assignedOrders.forEach((o) => {
      if (o.status === 'Submitted' || o.status === 'Driver Assigned') {
        driverSyncService.queueAction(o.id, 'STATUS_CHANGE', {
          status: 'Picked Up',
          title: 'Picked Up from Pharmacy',
        });
      }
    });
    navigate('/driver/route');
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Assigned Deliveries Manifest</h1>
          <p className={styles.subtitle}>
            Active consignments dispatched for vehicle DRV-101 • Ready for execution
          </p>
        </div>

        <div className={styles.headerBtns}>
          <button
            className={styles.startRouteBtn}
            onClick={handleStartAll}
            disabled={assignedOrders.length === 0}
          >
            <Navigation size={16} />
            <span>Launch Active Route ({assignedOrders.length})</span>
          </button>
        </div>
      </div>

      {/* Vehicle & Shift Readiness Checklist */}
      <div className={styles.readinessCard}>
        <div className={styles.readinessHeader}>
          <div className={styles.readinessTitle}>
            <ShieldCheck size={20} color="#0EA383" />
            <span>Vehicle & Manifest Pre-Trip Checklist</span>
          </div>
          <span className={styles.readyBadge}>
            <Check size={13} strokeWidth={3} /> ALL VERIFIED
          </span>
        </div>

        <div className={styles.checklistGrid}>
          <label className={styles.checkItem}>
            <input
              type="checkbox"
              checked={checklist.vehicleInspected}
              onChange={(e) => setChecklist({ ...checklist, vehicleInspected: e.target.checked })}
            />
            <span className={styles.checkText}>
              <strong>Vehicle Safety:</strong> Toyota Prius tire pressure & security seals intact
            </span>
          </label>

          <label className={styles.checkItem}>
            <input
              type="checkbox"
              checked={checklist.refrigerationCalibrated}
              onChange={(e) => setChecklist({ ...checklist, refrigerationCalibrated: e.target.checked })}
            />
            <span className={styles.checkText}>
              <strong>Cold-Box Active:</strong> Internal temp calibrated to 38.2°F (3.4°C)
            </span>
          </label>

          <label className={styles.checkItem}>
            <input
              type="checkbox"
              checked={checklist.deaSecured}
              onChange={(e) => setChecklist({ ...checklist, deaSecured: e.target.checked })}
            />
            <span className={styles.checkText}>
              <strong>DEA Lockbox:</strong> Schedule II vault locked with biometric token
            </span>
          </label>

          <label className={styles.checkItem}>
            <input
              type="checkbox"
              checked={checklist.manifestAccepted}
              onChange={(e) => setChecklist({ ...checklist, manifestAccepted: e.target.checked })}
            />
            <span className={styles.checkText}>
              <strong>Manifest Confirmed:</strong> {assignedOrders.length} active stops accepted
            </span>
          </label>
        </div>
      </div>

      {/* Orders List */}
      <div className={styles.ordersSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Manifest Stops in Queue ({assignedOrders.length})</h2>
          <span className={styles.sectionHint}>Sorted in optimized multi-stop sequence</span>
        </div>

        <div className={styles.ordersGrid}>
          {assignedOrders.map((order) => {
            const isControlled = order.flags.controlled;
            const isCold = order.flags.refrigerated;

            return (
              <div
                key={order.id}
                className={`${styles.orderCard} ${isControlled ? styles.controlledCard : ''}`}
                onClick={() => navigate(`/driver/order/${order.id}`)}
              >
                <div className={styles.orderTop}>
                  <div className={styles.stopBadge}>Stop #{order.stopSequence}</div>
                  <span className={styles.orderId}>{order.id}</span>
                  <div className={styles.flags}>
                    {isControlled && (
                      <span className={styles.flagC2}>
                        <Lock size={11} /> C-II
                      </span>
                    )}
                    {isCold && (
                      <span className={styles.flagCold}>
                        <Snowflake size={11} /> Cold
                      </span>
                    )}
                  </div>
                  <span className={styles.statusPill}>{order.status}</span>
                </div>

                <div className={styles.orderBody}>
                  <div className={styles.addressLine}>
                    <MapPin size={15} color="#0EA383" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div className={styles.street}>{order.deliveryAddress.street}</div>
                      <div className={styles.city}>
                        {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zip}
                      </div>
                    </div>
                  </div>

                  <div className={styles.rxLine}>
                    <span className={styles.rxLabel}>Rx Summary:</span>
                    <span className={styles.rxVal}>{order.prescriptionSummary.description}</span>
                  </div>

                  <div className={styles.pharmacyLine}>
                    <span>Origin: <strong>{order.pharmacy.name}</strong></span>
                    <span className={styles.patientBadge}>Patient {order.patientSafeId}</span>
                  </div>
                </div>

                <div className={styles.orderFooter}>
                  <div className={styles.slaTime}>
                    <Clock size={13} />
                    <span>Due by {order.slaWindow.end}</span>
                  </div>
                  <div className={styles.actionBtn}>
                    <span>Manage Stop</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            );
          })}

          {assignedOrders.length === 0 && (
            <div className={styles.emptyCard}>
              <CheckCircle2 size={36} color="#10B981" />
              <h3>No Pending Assigned Deliveries</h3>
              <p>All manifest orders have been successfully delivered or completed.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverAssigned;
