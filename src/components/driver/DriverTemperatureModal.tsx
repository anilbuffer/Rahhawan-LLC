import React, { useState } from 'react';
import { X, Check, Thermometer, Delete } from 'lucide-react';
import { driverSyncService, type DriverDeliveryOrder } from '../../services/driverSyncService';
import styles from './DriverTemperatureModal.module.css';

interface DriverTemperatureModalProps {
  order: DriverDeliveryOrder;
  readingType: 'pickup' | 'delivery';
  onClose: () => void;
  onSaved: () => void;
}

export const DriverTemperatureModal: React.FC<DriverTemperatureModalProps> = ({
  order,
  readingType,
  onClose,
  onSaved,
}) => {
  const [unit, setUnit] = useState<'F' | 'C'>('F');
  const [valString, setValString] = useState('');
  const [isSuccessFeedback, setIsSuccessFeedback] = useState(false);

  const title = readingType === 'pickup' ? 'Pickup Temperature' : 'Delivery Temperature';

  const handleKeyPress = (char: string) => {
    if (char === '.') {
      if (!valString.includes('.')) {
        setValString(valString ? valString + '.' : '0.');
      }
    } else {
      if (valString.length < 5) {
        setValString(valString + char);
      }
    }
  };

  const handleBackspace = () => {
    setValString(valString.slice(0, -1));
  };

  const handleSave = () => {
    if (!valString) return;
    const num = parseFloat(valString);
    if (isNaN(num)) return;

    let celsius: number;
    let fahrenheit: number;

    if (unit === 'F') {
      fahrenheit = num;
      celsius = parseFloat((((num - 32) * 5) / 9).toFixed(1));
    } else {
      celsius = num;
      fahrenheit = parseFloat(((num * 9) / 5 + 32).toFixed(1));
    }

    // Queue in outbox + optimistic update
    driverSyncService.queueAction(order.id, 'TEMPERATURE_LOG', {
      readingType,
      celsius,
      fahrenheit,
      unit,
    });

    // Instant optimistic confirmation
    setIsSuccessFeedback(true);
    setTimeout(() => {
      onSaved();
    }, 180);
  };

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={styles.modalCard}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerTitleGroup}>
            <span className={styles.headerEyebrow}>{title}</span>
            <span className={styles.headerOrderId}>{order.id}</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Main Stage */}
        <div className={styles.stageArea}>
          {/* Unit Selector */}
          <div className={styles.unitSegmentedControl}>
            <button
              className={`${styles.unitBtn} ${unit === 'F' ? styles.unitBtnActive : ''}`}
              onClick={() => setUnit('F')}
              type="button"
            >
              Fahrenheit (°F)
            </button>
            <button
              className={`${styles.unitBtn} ${unit === 'C' ? styles.unitBtnActive : ''}`}
              onClick={() => setUnit('C')}
              type="button"
            >
              Celsius (°C)
            </button>
          </div>

          {/* Big Display */}
          <div className={styles.displayWrapper}>
            <span className={`${styles.tempValueText} ${!valString ? styles.emptyValue : ''}`}>
              {valString || '--.-'}
            </span>
            <span className={styles.tempUnitLabel}>°{unit}</span>
          </div>

          {/* Safe range guidance */}
          <div className={styles.rangeGuide}>
            <Thermometer size={15} />
            <span>Nominal Cold-Chain: {unit === 'F' ? '35.6°F – 46.4°F' : '2.0°C – 8.0°C'}</span>
          </div>

          {/* Numeric Keypad */}
          <div className={styles.keypadGrid}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                className={styles.numKey}
                onClick={() => handleKeyPress(digit)}
                type="button"
              >
                {digit}
              </button>
            ))}
            <button
              className={`${styles.numKey} ${styles.actionKey}`}
              onClick={() => handleKeyPress('.')}
              type="button"
            >
              .
            </button>
            <button
              className={styles.numKey}
              onClick={() => handleKeyPress('0')}
              type="button"
            >
              0
            </button>
            <button
              className={`${styles.numKey} ${styles.actionKey}`}
              onClick={handleBackspace}
              type="button"
              aria-label="Delete"
            >
              <Delete size={20} />
            </button>
          </div>
        </div>

        {/* Optimistic Confirmation */}
        {isSuccessFeedback && (
          <div className={styles.successOverlay}>
            <div className={styles.successCircle}>
              <Check size={32} strokeWidth={3} />
            </div>
            <div style={{ color: '#111827', fontWeight: 700, fontSize: '1rem' }}>
              {title} Recorded!
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          id="save-temp-btn"
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={!valString || isSuccessFeedback}
          type="button"
        >
          <Check size={18} />
          Save Reading
        </button>
      </div>
    </div>
  );
};

export default DriverTemperatureModal;
