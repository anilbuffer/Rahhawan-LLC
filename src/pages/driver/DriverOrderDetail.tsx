import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Lock,
  Snowflake,
  Zap,
  MapPin,
  Phone,
  CheckCircle2,
  AlertTriangle,
  FileSignature,
  Camera,
  Thermometer,
  ShieldCheck,
  Package,
  Clock,
  Check,
  ExternalLink,
  Navigation,
} from 'lucide-react';
import { driverSyncService, type DriverDeliveryOrder } from '../../services/driverSyncService';
import DriverSignatureModal from '../../components/driver/DriverSignatureModal';
import DriverPhotoModal from '../../components/driver/DriverPhotoModal';
import DriverTemperatureModal from '../../components/driver/DriverTemperatureModal';
import DriverChainOfCustodyModal from '../../components/driver/DriverChainOfCustodyModal';
import DriverFailModal from '../../components/driver/DriverFailModal';
import styles from './DriverOrderDetail.module.css';

export const DriverOrderDetail: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<DriverDeliveryOrder | undefined>(() =>
    orderId ? driverSyncService.getOrderById(orderId) : undefined
  );

  // Modal active states
  const [activeModal, setActiveModal] = useState<
    | 'signature'
    | 'photo'
    | 'pickup_temp'
    | 'delivery_temp'
    | 'coc_pickup'
    | 'coc_handoff'
    | 'fail'
    | null
  >(null);

  useEffect(() => {
    const unsub = driverSyncService.subscribe(() => {
      if (orderId) {
        setOrder(driverSyncService.getOrderById(orderId));
      }
    });
    return unsub;
  }, [orderId]);

  if (!order) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <p>Order not found</p>
          <button className={styles.backBtn} onClick={() => navigate('/driver/shift')}>
            Back to Shift
          </button>
        </div>
      </div>
    );
  }

  const isControlled = order.flags.controlled;
  const isCold = order.flags.refrigerated;
  const evidence = order.driverEvidence || { photos: [] };

  // Evidence check flags
  const hasSignature = !!evidence.signature;
  const hasPhoto = evidence.photos && evidence.photos.length > 0;
  const hasPickupTemp = !!evidence.pickupTemp;
  const hasDeliveryTemp = !!evidence.deliveryTemp;
  const hasCocPickup = !!evidence.chainOfCustodyPickup;
  const hasCocHandoff = !!evidence.chainOfCustodyHandoff;

  // Gate validation for "Delivered"
  const missingRequirements: string[] = [];
  if (!hasSignature) missingRequirements.push('Recipient signature');
  if (!hasPhoto) missingRequirements.push('Photo proof');
  if (isCold && !hasDeliveryTemp) missingRequirements.push('Delivery temperature');
  if (isControlled && !hasCocHandoff) missingRequirements.push('Chain of custody confirmation');

  const canMarkDelivered = missingRequirements.length === 0;

  // Next State Logic
  const handlePrimaryTransition = () => {
    switch (order.status) {
      case 'Submitted':
      case 'Driver Assigned': {
        if (isControlled && !hasCocPickup) {
          setActiveModal('coc_pickup');
          return;
        }
        if (isCold && !hasPickupTemp) {
          setActiveModal('pickup_temp');
          return;
        }
        driverSyncService.queueAction(order.id, 'STATUS_CHANGE', {
          status: 'Picked Up',
          title: 'Picked Up from Pharmacy',
          note: 'Package thermal seal intact and manifest verified.',
        });
        break;
      }

      case 'Picked Up': {
        driverSyncService.queueAction(order.id, 'STATUS_CHANGE', {
          status: 'En Route',
          title: 'En Route to Recipient',
          note: 'Courier in transit with payload.',
        });
        break;
      }

      case 'En Route': {
        if (!canMarkDelivered) return;
        driverSyncService.queueAction(order.id, 'STATUS_CHANGE', {
          status: 'Delivered',
          title: 'Delivered to Recipient',
          note: `All compliance evidence verified. Signed by ${evidence.signature?.recipientName}.`,
        });
        break;
      }
    }
  };

  const getPrimaryActionLabel = () => {
    switch (order.status) {
      case 'Submitted':
      case 'Driver Assigned':
        return 'Mark Picked Up from Pharmacy';
      case 'Picked Up':
        return 'Start En Route Navigation';
      case 'En Route':
        return 'Complete & Mark Delivered';
      case 'Delivered':
        return 'Delivery Complete & Archived';
      case 'Failed':
        return 'Delivery Marked as Failed';
      default:
        return 'Advance Status';
    }
  };

  const handleOpenMaps = () => {
    const addr = `${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state}`;
    window.open(`https://maps.google.com/?q=${encodeURIComponent(addr)}`, '_blank');
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.detailHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            className={styles.backBtn}
            onClick={() => navigate('/driver/shift')}
            aria-label="Back to Shift"
          >
            <ArrowLeft size={18} />
          </button>
          <div className={styles.headerTitleBlock}>
            <span className={styles.subSeq}>Manifest Stop #{order.stopSequence}</span>
            <span className={styles.orderIdText}>{order.id}</span>
          </div>
        </div>

        <div>
          <span
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 9999,
              fontSize: '0.75rem',
              fontWeight: 700,
              background:
                order.status === 'Delivered'
                  ? 'rgba(16,185,129,0.12)'
                  : order.status === 'En Route'
                  ? 'rgba(59,130,246,0.12)'
                  : order.status === 'Picked Up'
                  ? 'rgba(245,158,11,0.12)'
                  : '#F3F4F6',
              color:
                order.status === 'Delivered'
                  ? '#10B981'
                  : order.status === 'En Route'
                  ? '#3B82F6'
                  : order.status === 'Picked Up'
                  ? '#D97706'
                  : '#4B5563',
              border: '1px solid currentColor',
            }}
          >
            {order.status}
          </span>
        </div>
      </div>

      {/* Warning Banners */}
      <div className={styles.bannerGroup}>
        {/* Sync Rejection Conflict */}
        {order.rejectionNotice && (
          <div className={styles.warningBannerConflict}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div className={styles.bannerTitle}>{order.rejectionNotice.title}</div>
                <div className={styles.bannerDesc}>{order.rejectionNotice.message}</div>
              </div>
            </div>
            <button
              className={styles.conflictDismissBtn}
              onClick={() => driverSyncService.dismissRejectionNotice(order.id)}
            >
              Acknowledge & Dismiss
            </button>
          </div>
        )}

        {/* Controlled Substance */}
        {isControlled && (
          <div className={styles.warningBannerControlled}>
            <Lock size={20} style={{ flexShrink: 0 }} />
            <div>
              <div className={styles.bannerTitle}>
                Controlled Substance — DEA Form 222 Mandated
              </div>
              <div className={styles.bannerDesc}>
                Chain-of-custody transfer and recipient photo ID signature required before release.
              </div>
            </div>
          </div>
        )}

        {/* Cold Chain */}
        {isCold && (
          <div className={styles.warningBannerCold}>
            <Snowflake size={20} style={{ flexShrink: 0 }} />
            <div>
              <div className={styles.bannerTitle}>
                Cold-Chain Monitored (2.0°C – 8.0°C)
              </div>
              <div className={styles.bannerDesc}>
                Dual temperature logging required at pickup and delivery handoff.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Details + Status Pipeline */}
      <div className={styles.mainDetailGrid}>
        {/* Left Column: Patient & Order Details */}
        <div className={styles.infoCol}>
          <div className={styles.infoCard}>
            <div className={styles.infoCardHeader}>
              <div>
                <div className={styles.patientName}>Patient {order.patientInitials}</div>
                <div className={styles.safeIdBadge}>Safe Identifier: {order.patientSafeId}</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  Dispensing Pharmacy:
                </span>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-teal)' }}>
                  {order.pharmacy.name}
                </div>
              </div>
            </div>

            {/* Address */}
            <div className={styles.addressBlock}>
              <MapPin size={18} color="#0EA383" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div className={styles.streetText}>
                  {order.deliveryAddress.street}
                  {order.deliveryAddress.apt ? `, ${order.deliveryAddress.apt}` : ''}
                </div>
                <div className={styles.cityText}>
                  {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zip}
                </div>
              </div>
            </div>

            {/* Quick Navigation & Phone buttons */}
            <div className={styles.actionBtnsRow}>
              <button
                className={styles.navMapBtn}
                onClick={handleOpenMaps}
                type="button"
              >
                <Navigation size={16} />
                <span>Open Google Maps</span>
              </button>

              <a
                href="tel:+15552348901"
                className={styles.phoneCallBtn}
                id="driver-call-patient-btn"
              >
                <Phone size={16} />
                <span>Call Patient (+1 555-234-8901)</span>
              </a>
            </div>

            {/* Special Instructions */}
            <div className={styles.instructionsBox}>
              <strong>Special Delivery Instructions:</strong> Ring gate buzzer #402. Require physical ID check before handoff.
            </div>

            {/* Prescription Details */}
            <div className={styles.rxDetailsRow}>
              <span className={styles.rxLabel}>Prescription Details:</span>
              <span className={styles.rxValue}>
                {order.prescriptionSummary.itemCount} item(s) • {order.prescriptionSummary.description}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Status Pipeline & Primary Advance Action */}
        <div className={styles.pipelineCol}>
          <div className={styles.actionZoneCard}>
            <div className={styles.actionZoneTitle}>Stop Pipeline Status</div>

            {/* Past Steps Checklist */}
            <div className={styles.pastStepsList}>
              <div className={styles.pastStepItem}>
                <CheckCircle2 size={16} />
                <span>Order Dispatched & Manifest Route Verified</span>
              </div>

              {(order.status === 'Picked Up' || order.status === 'En Route' || order.status === 'Delivered') && (
                <div className={styles.pastStepItem}>
                  <CheckCircle2 size={16} />
                  <span>Picked Up from Pharmacy</span>
                </div>
              )}

              {(order.status === 'En Route' || order.status === 'Delivered') && (
                <div className={styles.pastStepItem}>
                  <CheckCircle2 size={16} />
                  <span>En Route Navigation Active</span>
                </div>
              )}

              {order.status === 'Delivered' && (
                <div className={styles.pastStepItem}>
                  <CheckCircle2 size={16} />
                  <span>Delivered & Custody Completed</span>
                </div>
              )}
            </div>

            {/* Primary Action Button */}
            {order.status !== 'Delivered' && order.status !== 'Failed' && (
              <div>
                <button
                  id="primary-status-advance-btn"
                  className={styles.primaryActionBtn}
                  onClick={handlePrimaryTransition}
                  disabled={order.status === 'En Route' && !canMarkDelivered}
                >
                  <Check size={18} strokeWidth={3} />
                  {getPrimaryActionLabel()}
                </button>

                {/* Hard gate inline explanation if disabled */}
                {order.status === 'En Route' && !canMarkDelivered && (
                  <div className={styles.gateWarningNote}>
                    <AlertTriangle size={15} style={{ flexShrink: 0 }} />
                    <span>
                      Required before delivery: <strong>{missingRequirements.join(', ')}</strong>
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stop Evidence & Compliance Section */}
      <div className={styles.evidenceSection}>
        <div className={styles.sectionHeader}>Stop Compliance Evidence</div>

        <div className={styles.evidenceGrid}>
          {/* 1. Recipient Signature */}
          <div
            id="evidence-signature-btn"
            className={`${styles.evidenceCard} ${hasSignature ? styles.evidenceCardDone : ''}`}
            onClick={() => setActiveModal('signature')}
            role="button"
            tabIndex={0}
          >
            <div className={styles.evidenceLeft}>
              <div className={styles.evidenceIconWrapper}>
                <FileSignature size={18} />
              </div>
              <div>
                <div className={styles.evidenceTitle}>Recipient Signature</div>
                <div className={styles.evidenceSubtitle}>
                  {hasSignature ? `Signed by ${evidence.signature?.recipientName}` : 'Required before delivery'}
                </div>
              </div>
            </div>

            {hasSignature ? (
              <span className={styles.statusIndicatorDone}>
                <Check size={13} strokeWidth={3} /> Captured
              </span>
            ) : (
              <span className={styles.statusIndicatorPending}>Pending</span>
            )}
          </div>

          {/* 2. Photo Proof */}
          <div
            id="evidence-photo-btn"
            className={`${styles.evidenceCard} ${hasPhoto ? styles.evidenceCardDone : ''}`}
            onClick={() => setActiveModal('photo')}
            role="button"
            tabIndex={0}
          >
            <div className={styles.evidenceLeft}>
              <div className={styles.evidenceIconWrapper}>
                <Camera size={18} />
              </div>
              <div>
                <div className={styles.evidenceTitle}>Photo Proof</div>
                <div className={styles.evidenceSubtitle}>
                  {hasPhoto ? `${evidence.photos.length} photo(s) attached` : 'Required before delivery'}
                </div>
              </div>
            </div>

            {hasPhoto ? (
              <span className={styles.statusIndicatorDone}>
                <Check size={13} strokeWidth={3} /> {evidence.photos.length} Attached
              </span>
            ) : (
              <span className={styles.statusIndicatorPending}>Pending</span>
            )}
          </div>

          {/* 3. Pickup Temperature (Refrigerated Only) */}
          {isCold && (
            <div
              id="evidence-pickup-temp-btn"
              className={`${styles.evidenceCard} ${hasPickupTemp ? styles.evidenceCardDone : ''}`}
              onClick={() => setActiveModal('pickup_temp')}
              role="button"
              tabIndex={0}
            >
              <div className={styles.evidenceLeft}>
                <div className={styles.evidenceIconWrapper}>
                  <Thermometer size={18} />
                </div>
                <div>
                  <div className={styles.evidenceTitle}>Pickup Temperature</div>
                  <div className={styles.evidenceSubtitle}>
                    {hasPickupTemp
                      ? `${evidence.pickupTemp?.fahrenheit}°F (${evidence.pickupTemp?.celsius}°C)`
                      : 'Required at pharmacy pickup'}
                  </div>
                </div>
              </div>

              {hasPickupTemp ? (
                <span className={styles.statusIndicatorDone}>
                  <Check size={13} strokeWidth={3} /> Logged
                </span>
              ) : (
                <span className={styles.statusIndicatorPending}>Pending</span>
              )}
            </div>
          )}

          {/* 4. Delivery Temperature (Refrigerated Only) */}
          {isCold && (
            <div
              id="evidence-delivery-temp-btn"
              className={`${styles.evidenceCard} ${hasDeliveryTemp ? styles.evidenceCardDone : ''}`}
              onClick={() => setActiveModal('delivery_temp')}
              role="button"
              tabIndex={0}
            >
              <div className={styles.evidenceLeft}>
                <div className={styles.evidenceIconWrapper}>
                  <Thermometer size={18} />
                </div>
                <div>
                  <div className={styles.evidenceTitle}>Delivery Temperature</div>
                  <div className={styles.evidenceSubtitle}>
                    {hasDeliveryTemp
                      ? `${evidence.deliveryTemp?.fahrenheit}°F (${evidence.deliveryTemp?.celsius}°C)`
                      : 'Required at recipient handoff'}
                  </div>
                </div>
              </div>

              {hasDeliveryTemp ? (
                <span className={styles.statusIndicatorDone}>
                  <Check size={13} strokeWidth={3} /> Logged
                </span>
              ) : (
                <span className={styles.statusIndicatorPending}>Pending</span>
              )}
            </div>
          )}

          {/* 5. Chain of Custody Confirmation (Controlled Only) */}
          {isControlled && (
            <div
              id="evidence-coc-handoff-btn"
              className={`${styles.evidenceCard} ${hasCocHandoff ? styles.evidenceCardDone : ''}`}
              onClick={() => setActiveModal('coc_handoff')}
              role="button"
              tabIndex={0}
            >
              <div className={styles.evidenceLeft}>
                <div className={styles.evidenceIconWrapper}>
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div className={styles.evidenceTitle}>DEA Chain of Custody</div>
                  <div className={styles.evidenceSubtitle}>
                    {hasCocHandoff ? 'Handoff Attested' : 'Schedule II Legal Confirmation'}
                  </div>
                </div>
              </div>

              {hasCocHandoff ? (
                <span className={styles.statusIndicatorDone}>
                  <Check size={13} strokeWidth={3} /> Confirmed
                </span>
              ) : (
                <span className={styles.statusIndicatorPending}>Pending</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Secondary Failed Action */}
      {order.status !== 'Delivered' && order.status !== 'Failed' && (
        <div className={styles.failActionSection}>
          <button
            id="mark-order-failed-btn"
            className={styles.failBtn}
            onClick={() => setActiveModal('fail')}
            type="button"
          >
            <AlertTriangle size={15} />
            Mark as Failed Delivery
          </button>
        </div>
      )}

      {/* Modals */}
      {activeModal === 'signature' && (
        <DriverSignatureModal
          order={order}
          onClose={() => setActiveModal(null)}
          onSaved={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'photo' && (
        <DriverPhotoModal
          order={order}
          onClose={() => setActiveModal(null)}
          onSaved={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'pickup_temp' && (
        <DriverTemperatureModal
          order={order}
          readingType="pickup"
          onClose={() => setActiveModal(null)}
          onSaved={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'delivery_temp' && (
        <DriverTemperatureModal
          order={order}
          readingType="delivery"
          onClose={() => setActiveModal(null)}
          onSaved={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'coc_pickup' && (
        <DriverChainOfCustodyModal
          order={order}
          stage="pickup"
          onClose={() => setActiveModal(null)}
          onSaved={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'coc_handoff' && (
        <DriverChainOfCustodyModal
          order={order}
          stage="handoff"
          onClose={() => setActiveModal(null)}
          onSaved={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'fail' && (
        <DriverFailModal
          order={order}
          onClose={() => setActiveModal(null)}
          onSaved={() => setActiveModal(null)}
        />
      )}
    </div>
  );
};

export default DriverOrderDetail;
