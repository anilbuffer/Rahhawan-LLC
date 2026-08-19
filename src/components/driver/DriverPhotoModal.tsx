import React, { useState, useRef } from 'react';
import { Camera, X, Check, RotateCcw, Plus } from 'lucide-react';
import { driverSyncService, type DriverDeliveryOrder } from '../../services/driverSyncService';
import styles from './DriverPhotoModal.module.css';

interface DriverPhotoModalProps {
  order: DriverDeliveryOrder;
  onClose: () => void;
  onSaved: () => void;
}

const SAMPLE_FALLBACK_PHOTOS = [
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&auto=format&fit=crop&q=80',
];

export const DriverPhotoModal: React.FC<DriverPhotoModalProps> = ({ order, onClose, onSaved }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [currentCapturedPhoto, setCurrentCapturedPhoto] = useState<string | null>(null);
  const photoCaption = 'Front door / Recipient handoff';
  const [isSuccessFeedback, setIsSuccessFeedback] = useState(false);

  const existingPhotos = order.driverEvidence?.photos || [];

  // Client-side automatic compression
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file);
      setCurrentCapturedPhoto(compressed);
    }
  };

  const triggerCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const useSamplePhoto = () => {
    const sample = SAMPLE_FALLBACK_PHOTOS[Math.floor(Math.random() * SAMPLE_FALLBACK_PHOTOS.length)];
    setCurrentCapturedPhoto(sample);
  };

  const handleUsePhoto = () => {
    if (!currentCapturedPhoto) return;

    // Queue in outbox + optimistic update
    driverSyncService.queueAction(order.id, 'PHOTO_CAPTURE', {
      photoUrl: currentCapturedPhoto,
      caption: photoCaption,
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
        {/* Hidden file camera input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerTitleGroup}>
            <span className={styles.headerEyebrow}>Proof of Delivery Photo</span>
            <span className={styles.headerOrderId}>{order.id}</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Main Viewport */}
        <div className={styles.mainStage}>
          {currentCapturedPhoto ? (
            <div className={styles.previewContainer}>
              <img
                src={currentCapturedPhoto}
                alt="Captured Delivery Proof"
                className={styles.previewImg}
              />
              <div className={styles.previewMetaTag}>
                📸 High-Res Compressed (Auto)
              </div>

              {/* Optimistic Confirmation */}
              {isSuccessFeedback && (
                <div className={styles.successOverlay}>
                  <div className={styles.successCircle}>
                    <Check size={32} strokeWidth={3} />
                  </div>
                  <div style={{ color: '#111827', fontWeight: 700, fontSize: '1rem' }}>
                    Photo Attached!
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.noPhotoBox}>
              <div className={styles.cameraIconBubble}>
                <Camera size={32} />
              </div>
              <div>
                <div className={styles.noPhotoTitle}>Capture Delivery Photo</div>
                <p className={styles.noPhotoDesc}>
                  Take a clear photo of the package at the recipient door or with verified recipient.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', alignItems: 'center' }}>
                <button
                  id="take-photo-primary-btn"
                  className={styles.takePhotoBtn}
                  onClick={triggerCamera}
                  type="button"
                >
                  <Camera size={18} />
                  Take Photo / Upload
                </button>

                <button
                  type="button"
                  onClick={useSamplePhoto}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-teal)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: '0.25rem',
                  }}
                >
                  Or use sample photo snapshot
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Multiple Photos strip if order already has photos */}
        {existingPhotos.length > 0 && !currentCapturedPhoto && (
          <div className={styles.photoStripSection}>
            <div className={styles.stripHeader}>
              <span>Previously Attached ({existingPhotos.length})</span>
            </div>
            <div className={styles.thumbnailRow}>
              {existingPhotos.map((p, idx) => (
                <div key={p.id || idx} className={styles.thumbCard}>
                  <img src={p.photoUrl} alt="Previous proof" className={styles.thumbImg} />
                </div>
              ))}
              <button className={styles.addAnotherBtn} onClick={triggerCamera} type="button">
                <Plus size={16} />
                <span>Add</span>
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        {currentCapturedPhoto && (
          <div className={styles.actionButtons}>
            <div className={styles.btnRow}>
              <button className={styles.retakeBtn} onClick={triggerCamera} type="button">
                <RotateCcw size={16} />
                Retake
              </button>
              <button
                id="confirm-use-photo-btn"
                className={styles.usePhotoBtn}
                onClick={handleUsePhoto}
                disabled={isSuccessFeedback}
                type="button"
              >
                <Check size={18} />
                Use Photo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverPhotoModal;
