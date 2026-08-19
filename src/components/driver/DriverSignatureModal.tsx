import React, { useRef, useState, useEffect } from 'react';
import { X, Check, Edit3, Trash2 } from 'lucide-react';
import { driverSyncService, type DriverDeliveryOrder } from '../../services/driverSyncService';
import styles from './DriverSignatureModal.module.css';

interface DriverSignatureModalProps {
  order: DriverDeliveryOrder;
  onClose: () => void;
  onSaved: () => void;
}

export const DriverSignatureModal: React.FC<DriverSignatureModalProps> = ({ order, onClose, onSaved }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [recipientName, setRecipientName] = useState(
    order.proofOfDelivery?.recipientName || `Patient ${order.patientInitials}`
  );
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [isSuccessFeedback, setIsSuccessFeedback] = useState(false);

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#0EA383'; // Crisp brand teal ink
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;

    const signatureDataUrl = canvas.toDataURL('image/png');

    // Queue in outbox + optimistic update
    driverSyncService.queueAction(order.id, 'SIGNATURE_CAPTURE', {
      recipientName: recipientName.trim() || `Patient ${order.patientInitials}`,
      signatureDataUrl,
    });

    // Quiet ~150ms optimistic confirmation
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
            <span className={styles.headerEyebrow}>Signature Capture</span>
            <span className={styles.headerOrderId}>{order.id}</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Recipient Input */}
        <div className={styles.recipientField}>
          <label className={styles.label} htmlFor="sig-recipient-name">
            Recipient Name / Authorized Representative
          </label>
          <input
            id="sig-recipient-name"
            className={styles.input}
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="Enter recipient full legal name"
          />
        </div>

        {/* Canvas Area */}
        <div className={`${styles.canvasContainer} ${isDrawing ? styles.activeStroke : ''}`}>
          <canvas
            ref={canvasRef}
            className={styles.signatureCanvas}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />

          {!hasDrawn && (
            <div className={styles.canvasPlaceholder}>
              <Edit3 size={16} />
              <span>Sign with finger, mouse, or stylus above</span>
            </div>
          )}

          <div className={styles.signLine} />
          <div className={styles.signLineLabel}>Signature of Recipient (X)</div>

          {/* Optimistic Confirmation Check */}
          {isSuccessFeedback && (
            <div className={styles.successOverlay}>
              <div className={styles.successCircle}>
                <Check size={32} strokeWidth={3} />
              </div>
              <div style={{ color: '#111827', fontWeight: 700, fontSize: '1rem' }}>
                Signature Recorded!
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={styles.actionsZone}>
          <button
            id="save-signature-btn"
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={!hasDrawn || isSuccessFeedback}
          >
            <Check size={18} />
            Save Signature
          </button>

          <button className={styles.clearBtn} onClick={clearCanvas} type="button">
            <Trash2 size={16} />
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverSignatureModal;
