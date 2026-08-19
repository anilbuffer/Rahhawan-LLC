import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  Snowflake,
  Zap,
  AlertTriangle,
  Info,
  CheckCircle2,
  Copy,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { PHARMACY_TENANT } from '../../mock/pharmacyMockData';
import styles from './NewDeliveryOrder.module.css';

const NewDeliveryOrder = () => {
  const navigate = useNavigate();

  // Form state
  const [patientName, setPatientName] = useState('');
  const [street, setStreet] = useState('');
  const [apt, setApt] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('IL');
  const [zip, setZip] = useState('');
  const [phone, setPhone] = useState('');
  const [rxCount, setRxCount] = useState('1');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Toggles
  const [isRush, setIsRush] = useState(false);
  const [isControlled, setIsControlled] = useState(false);
  const [isRefrigerated, setIsRefrigerated] = useState(false);
  const [cocAcknowledged, setCocAcknowledged] = useState(false);

  // Submission state
  const [submitted, setSubmitted] = useState(false);
  const [generatedOrderId, setGeneratedOrderId] = useState('');
  const [copied, setCopied] = useState(false);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!patientName.trim()) newErrors.patientName = 'Patient name is required';
    if (!street.trim()) newErrors.street = 'Street address is required';
    if (!city.trim()) newErrors.city = 'City is required';
    if (!state.trim()) newErrors.state = 'State is required';
    if (!zip.trim()) newErrors.zip = 'ZIP code is required';
    else if (!/^\d{5}(-\d{4})?$/.test(zip)) newErrors.zip = 'Invalid ZIP code format';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    if (isControlled && !cocAcknowledged) newErrors.coc = 'Chain-of-custody acknowledgment required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    if (!patientName.trim() || !street.trim() || !city.trim() || !state.trim() || !zip.trim() || !phone.trim()) return false;
    if (isControlled && !cocAcknowledged) return false;
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Generate DEL-##### ID
    const orderId = `DEL-${(10050 + Math.floor(Math.random() * 900)).toString()}`;
    setGeneratedOrderId(orderId);
    setSubmitted(true);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(generatedOrderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateAnother = () => {
    setPatientName('');
    setStreet('');
    setApt('');
    setCity('');
    setState('IL');
    setZip('');
    setPhone('');
    setRxCount('1');
    setSpecialInstructions('');
    setIsRush(false);
    setIsControlled(false);
    setIsRefrigerated(false);
    setCocAcknowledged(false);
    setSubmitted(false);
    setGeneratedOrderId('');
    setErrors({});
  };

  // ── CONFIRMATION STATE ──
  if (submitted) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.formCard}>
          <div className={styles.confirmationState}>
            <div className={styles.confirmIcon}>
              <CheckCircle2 size={48} color="var(--color-teal)" />
            </div>
            <h2 className={styles.confirmTitle}>Order Submitted Successfully</h2>
            <p className={styles.confirmSubtext}>
              This order is now visible to Rahhawan operations and will be assigned to a driver shortly.
            </p>

            <div className={styles.orderIdDisplay}>
              <span className={styles.orderIdLabel}>Your Order ID</span>
              <div className={styles.orderIdValue}>
                <span>{generatedOrderId}</span>
                <button className={styles.copyBtn} onClick={handleCopyId} title="Copy Order ID">
                  <Copy size={16} />
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className={styles.confirmFlags}>
              {isControlled && (
                <span className={styles.confirmFlagAmber}>
                  <Lock size={14} /> Controlled Substance — Chain of Custody Active
                </span>
              )}
              {isRefrigerated && (
                <span className={styles.confirmFlagBlue}>
                  <Snowflake size={14} /> Refrigerated — Temperature Logging Active
                </span>
              )}
              {isRush && (
                <span className={styles.confirmFlagRush}>
                  <Zap size={14} /> Rush Priority
                </span>
              )}
            </div>

            <div className={styles.confirmActions}>
              <button className="btn btn-primary" onClick={handleCreateAnother}>
                <Plus size={16} />
                Create Another Order
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/pharmacy/deliveries')}>
                View in Deliveries
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── FORM STATE ──
  return (
    <div className={styles.pageContainer}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>New Delivery Order</h1>
        <p className={styles.pageSubtext}>
          This order will be visible to Rahhawan operations and the assigned driver immediately upon submission.
        </p>
      </div>

      {/* Form Card */}
      <form className={styles.formCard} onSubmit={handleSubmit}>
        {/* Patient Name */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Patient Name <span className={styles.required}>*</span></label>
          <input
            type="text"
            className={`${styles.fieldInput} ${errors.patientName ? styles.fieldError : ''}`}
            placeholder="Full patient name"
            value={patientName}
            onChange={(e) => { setPatientName(e.target.value); setErrors((prev) => ({ ...prev, patientName: '' })); }}
          />
          {errors.patientName && <span className={styles.errorText}>{errors.patientName}</span>}
        </div>

        {/* Delivery Address */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Delivery Address <span className={styles.required}>*</span></label>
          <input
            type="text"
            className={`${styles.fieldInput} ${errors.street ? styles.fieldError : ''}`}
            placeholder="Street address"
            value={street}
            onChange={(e) => { setStreet(e.target.value); setErrors((prev) => ({ ...prev, street: '' })); }}
          />
          {errors.street && <span className={styles.errorText}>{errors.street}</span>}
          <input
            type="text"
            className={styles.fieldInput}
            placeholder="Apt, Suite, Unit (optional)"
            value={apt}
            onChange={(e) => setApt(e.target.value)}
            style={{ marginTop: '0.5rem' }}
          />
          <div className={styles.fieldRow} style={{ marginTop: '0.5rem' }}>
            <div style={{ flex: 2 }}>
              <input
                type="text"
                className={`${styles.fieldInput} ${errors.city ? styles.fieldError : ''}`}
                placeholder="City"
                value={city}
                onChange={(e) => { setCity(e.target.value); setErrors((prev) => ({ ...prev, city: '' })); }}
              />
              {errors.city && <span className={styles.errorText}>{errors.city}</span>}
            </div>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                className={`${styles.fieldInput} ${errors.state ? styles.fieldError : ''}`}
                placeholder="State"
                value={state}
                onChange={(e) => { setState(e.target.value); setErrors((prev) => ({ ...prev, state: '' })); }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                className={`${styles.fieldInput} ${errors.zip ? styles.fieldError : ''}`}
                placeholder="ZIP"
                value={zip}
                onChange={(e) => { setZip(e.target.value); setErrors((prev) => ({ ...prev, zip: '' })); }}
              />
              {errors.zip && <span className={styles.errorText}>{errors.zip}</span>}
            </div>
          </div>
        </div>

        {/* Phone Number */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Phone Number <span className={styles.required}>*</span></label>
          <input
            type="tel"
            className={`${styles.fieldInput} ${errors.phone ? styles.fieldError : ''}`}
            placeholder="(555) 123-4567"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setErrors((prev) => ({ ...prev, phone: '' })); }}
          />
          {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
        </div>

        {/* Prescription Count */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Prescription Count</label>
          <input
            type="number"
            className={styles.fieldInput}
            min="1"
            max="20"
            value={rxCount}
            onChange={(e) => setRxCount(e.target.value)}
          />
        </div>

        {/* Special Instructions */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Special Instructions</label>
          <textarea
            className={styles.fieldTextarea}
            placeholder="Gate code, delivery window preference, patient notes..."
            rows={3}
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
          />
        </div>

        {/* Divider */}
        <div className={styles.divider} />

        {/* Toggle Section */}
        <div className={styles.toggleSection}>
          {/* Rush Toggle */}
          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <Zap size={18} color={isRush ? 'var(--color-blue)' : 'var(--color-text-muted)'} />
              <div>
                <div className={styles.toggleLabel}>Rush Delivery</div>
                <div className={styles.toggleDesc}>Priority routing for time-sensitive prescriptions</div>
              </div>
            </div>
            <button
              type="button"
              className={`${styles.toggle} ${isRush ? styles.toggleActiveBlue : ''}`}
              onClick={() => setIsRush(!isRush)}
              role="switch"
              aria-checked={isRush}
            >
              <span className={styles.toggleKnob} />
            </button>
          </div>

          {/* Controlled Substance Toggle */}
          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <Lock size={18} color={isControlled ? 'var(--color-amber)' : 'var(--color-text-muted)'} />
              <div>
                <div className={styles.toggleLabel}>Controlled Substance</div>
                <div className={styles.toggleDesc}>DEA Schedule II–V requiring chain-of-custody protocol</div>
              </div>
            </div>
            <button
              type="button"
              className={`${styles.toggle} ${isControlled ? styles.toggleActiveAmber : ''}`}
              onClick={() => { setIsControlled(!isControlled); if (isControlled) setCocAcknowledged(false); }}
              role="switch"
              aria-checked={isControlled}
            >
              <span className={styles.toggleKnob} />
            </button>
          </div>

          {/* Controlled Substance Warning Panel */}
          <div className={`${styles.revealPanel} ${isControlled ? styles.revealPanelVisible : ''}`}>
            <div className={styles.warningPanel}>
              <div className={styles.warningHeader}>
                <AlertTriangle size={18} />
                <span>Chain-of-Custody Protocol Required</span>
              </div>
              <p className={styles.warningText}>
                This order will require chain-of-custody acknowledgment at both pickup and handoff.
                It will only be routed to a controlled-substance-authorized driver.
                The driver must verify patient identity and capture a signature at delivery.
              </p>
              <label className={styles.acknowledgmentCheck}>
                <input
                  type="checkbox"
                  checked={cocAcknowledged}
                  onChange={(e) => setCocAcknowledged(e.target.checked)}
                />
                <span>I confirm chain-of-custody protocol applies to this order</span>
              </label>
              {errors.coc && <span className={styles.errorText}>{errors.coc}</span>}
            </div>
          </div>

          {/* Refrigerated Toggle */}
          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <Snowflake size={18} color={isRefrigerated ? 'var(--color-blue)' : 'var(--color-text-muted)'} />
              <div>
                <div className={styles.toggleLabel}>Refrigerated</div>
                <div className={styles.toggleDesc}>Cold-chain medication requiring temperature monitoring</div>
              </div>
            </div>
            <button
              type="button"
              className={`${styles.toggle} ${isRefrigerated ? styles.toggleActiveBlue : ''}`}
              onClick={() => setIsRefrigerated(!isRefrigerated)}
              role="switch"
              aria-checked={isRefrigerated}
            >
              <span className={styles.toggleKnob} />
            </button>
          </div>

          {/* Refrigerated Info Panel */}
          <div className={`${styles.revealPanel} ${isRefrigerated ? styles.revealPanelVisible : ''}`}>
            <div className={styles.infoPanel}>
              <div className={styles.infoHeader}>
                <Info size={18} />
                <span>Temperature Logging Required</span>
              </div>
              <p className={styles.infoText}>
                Temperature logging will be mandatory at pickup and delivery.
                This order cannot be marked as Delivered without both temperature readings within the safe range.
              </p>
            </div>
          </div>
        </div>

        {/* Immutability Note */}
        <div className={styles.immutabilityNote}>
          <Lock size={14} />
          <span>These settings cannot be changed after submission. Only a Rahhawan Super Admin can override them.</span>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className={`btn btn-primary ${styles.submitButton}`}
          disabled={!isFormValid()}
        >
          Submit Delivery Order
        </button>
      </form>
    </div>
  );
};

export default NewDeliveryOrder;
