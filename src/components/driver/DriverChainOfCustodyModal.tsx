import React, { useState } from 'react';
import { X, Check, Lock, ShieldCheck } from 'lucide-react';
import { driverSyncService, type DriverDeliveryOrder } from '../../services/driverSyncService';
import styles from './DriverChainOfCustodyModal.module.css';

interface DriverChainOfCustodyModalProps {
  order: DriverDeliveryOrder;
  stage: 'pickup' | 'handoff';
  onClose: () => void;
  onSaved: () => void;
}

export const DriverChainOfCustodyModal: React.FC<DriverChainOfCustodyModalProps> = ({
  order,
  stage,
  onClose,
  onSaved,
}) => {
  const [isSuccessFeedback, setIsSuccessFeedback] = useState(false);
  const isPickup = stage === 'pickup';

  const handleConfirm = () => {
    driverSyncService.queueAction(order.id, 'CHAIN_OF_CUSTODY', {
      stage,
      recipientName: isPickup ? 'Dispensing Pharmacist' : `Patient ${order.patientInitials}`,
    });

    setIsSuccessFeedback(true);
    setTimeout(() => {
      onSaved();
    }, 180);
  };

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={styles.modalCard}>
        <div className={styles.modalHeader}>
          <div className={styles.headerTitleGroup}>
            <span className={styles.headerEyebrow}>
              {isPickup ? 'Pharmacy Custody Transfer' : 'Recipient Custody Handoff'}
            </span>
            <span className={styles.headerOrderId}>{order.id}</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className={styles.contentBody}>
          <div className={styles.warningBox}>
            <Lock size={20} className={styles.warningIcon} />
            <div>
              <div className={styles.warningTitle}>DEA Schedule II Compliance Mandate</div>
              <div className={styles.warningText}>
                Federal 21 CFR §1305 regulations require cryptographic chain-of-custody transfer confirmation
                for all controlled substance consignments.
              </div>
            </div>
          </div>

          <div className={styles.detailsCard}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Prescription Schedule:</span>
              <span className={styles.detailValue}>
                {order.prescriptionSummary?.schedule || 'Schedule II Controlled Substance'}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Medication:</span>
              <span className={styles.detailValue}>{order.prescriptionSummary?.description}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Originating Pharmacy:</span>
              <span className={styles.detailValue}>{order.pharmacy?.name}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Authorized Courier:</span>
              <span className={styles.detailValue}>Marcus Vance (DRV-101)</span>
            </div>
            <div className={styles.detailRow} style={{ borderBottom: 'none' }}>
              <span className={styles.detailLabel}>DEA Form 222 Token:</span>
              <span className={`${styles.detailValue} ${styles.mono}`}>DEA-222-PKI-88410</span>
            </div>
          </div>

          <div className={styles.attestationBox}>
            <ShieldCheck size={16} color="#10B981" style={{ display: 'inline', marginRight: 6, verticalAlign: -2 }} />
            <strong>Courier Legal Attestation:</strong> By clicking confirm, I attest that the tamper-evident security seal is intact, package serials match the manifest, and physical custody is legally transferred.
          </div>
        </div>

        {isSuccessFeedback && (
          <div className={styles.successOverlay}>
            <div className={styles.successCircle}>
              <Check size={32} strokeWidth={3} />
            </div>
            <div style={{ color: '#111827', fontWeight: 700, fontSize: '1rem' }}>
              Chain of Custody Recorded!
            </div>
          </div>
        )}

        <button
          id="confirm-chain-of-custody-btn"
          className={styles.confirmBtn}
          onClick={handleConfirm}
          disabled={isSuccessFeedback}
          type="button"
        >
          <Check size={18} />
          Confirm Chain of Custody
        </button>
      </div>
    </div>
  );
};

export default DriverChainOfCustodyModal;
