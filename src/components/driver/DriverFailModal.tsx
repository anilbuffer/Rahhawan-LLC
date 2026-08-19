import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { driverSyncService, type DriverDeliveryOrder } from '../../services/driverSyncService';
import styles from './DriverFailModal.module.css';

interface DriverFailModalProps {
  order: DriverDeliveryOrder;
  onClose: () => void;
  onSaved: () => void;
}

const FAIL_REASONS = [
  { code: 'PATIENT_UNAVAILABLE', title: 'Recipient not available / No answer at door' },
  { code: 'ACCESS_BLOCKED', title: 'Access blocked / Gated entry code invalid' },
  { code: 'INCORRECT_ADDRESS', title: 'Incorrect or invalid physical address' },
  { code: 'REFUSED_DELIVERY', title: 'Recipient refused package / Seal compromised' },
  { code: 'TEMP_EXCURSION', title: 'Cold-chain thermal breach detected' },
  { code: 'SAFETY_HAZARD', title: 'Safety hazard or aggressive animal' },
];

export const DriverFailModal: React.FC<DriverFailModalProps> = ({ order, onClose, onSaved }) => {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [notes, setNotes] = useState('');

  const handleConfirmFail = () => {
    if (!selectedReason) return;
    const reasonObj = FAIL_REASONS.find((r) => r.code === selectedReason);

    driverSyncService.queueAction(order.id, 'FAIL_ORDER', {
      reasonCode: selectedReason,
      reasonTitle: reasonObj?.title,
      notes: notes.trim(),
    });

    onSaved();
  };

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={styles.modalCard}>
        <div className={styles.modalHeader}>
          <div className={styles.headerTitleGroup}>
            <span className={styles.headerEyebrow}>Report Delivery Issue</span>
            <span className={styles.headerOrderId}>{order.id}</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className={styles.contentBody}>
          <div className={styles.warningBox}>
            <AlertTriangle size={18} color="#DC2626" style={{ flexShrink: 0 }} />
            <div className={styles.warningText}>
              Marking an order as Failed immediately alerts the dispensing pharmacy and cancels remaining route handoffs.
            </div>
          </div>

          <div className={styles.sectionLabel}>Select Reason Code (Required)</div>

          <div className={styles.reasonsList}>
            {FAIL_REASONS.map((reason) => (
              <div
                key={reason.code}
                className={`${styles.reasonOption} ${
                  selectedReason === reason.code ? styles.reasonOptionActive : ''
                }`}
                onClick={() => setSelectedReason(reason.code)}
                role="button"
                tabIndex={0}
              >
                <span className={styles.reasonText}>{reason.title}</span>
                <div className={styles.radioIndicator}>
                  {selectedReason === reason.code && <div className={styles.radioDot} />}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.sectionLabel}>Optional Notes for Dispatch</div>
          <textarea
            className={styles.notesInput}
            placeholder="e.g., Called patient 2x, gate locked, buzzer #402 unanswered."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <button
          id="confirm-fail-order-btn"
          className={styles.confirmFailBtn}
          onClick={handleConfirmFail}
          disabled={!selectedReason}
          type="button"
        >
          <AlertTriangle size={18} />
          Confirm Failed Delivery
        </button>
      </div>
    </div>
  );
};

export default DriverFailModal;
