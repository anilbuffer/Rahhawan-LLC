import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  ShieldCheck,
  Bell,
  Lock,
  Database,
  Save,
  CheckCircle,
  Key,
  Globe,
  Sliders
} from 'lucide-react';

export const Settings: React.FC = () => {
  const [savedToast, setSavedToast] = useState(false);

  // Configuration state
  const [hipaaStrictAudit, setHipaaStrictAudit] = useState(true);
  const [autoMaskPHI, setAutoMaskPHI] = useState(true);
  const [slaWarningThreshold, setSlaWarningThreshold] = useState('30');
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState('15');
  const [enableWebhookAlerts, setEnableWebhookAlerts] = useState(true);
  const [temperatureAlertDelta, setTemperatureAlertDelta] = useState('0.5');

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2.5rem', maxWidth: 960 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>System Settings & Compliance Controls</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Configure HIPAA data safeguards, cold chain temperature triggers, and SLA dispatch parameters.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleSave}>
          <Save size={16} />
          <span>Save Changes</span>
        </button>
      </div>

      {savedToast && (
        <div style={{ padding: '0.75rem 1.25rem', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', color: '#065F46', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={18} />
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Settings successfully saved and propagated to all active nodes.</span>
        </div>
      )}

      {/* HIPAA & Security Controls */}
      <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <ShieldCheck size={20} color="var(--color-teal)" />
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>HIPAA & Security Compliance</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Automated PHI Masking on Courier Handhelds</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                Obfuscates patient last names and specific diagnostic Rx codes until courier reaches delivery geofence.
              </div>
            </div>
            <input
              type="checkbox"
              style={{ width: 18, height: 18, accentColor: 'var(--color-teal)', cursor: 'pointer' }}
              checked={autoMaskPHI}
              onChange={(e) => setAutoMaskPHI(e.target.checked)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Strict Chain of Custody (CoC) Immutable Ledger</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                Generates SHA-256 digital cryptographic hash for every handoff, temperature reading, and signature.
              </div>
            </div>
            <input
              type="checkbox"
              style={{ width: 18, height: 18, accentColor: 'var(--color-teal)', cursor: 'pointer' }}
              checked={hipaaStrictAudit}
              onChange={(e) => setHipaaStrictAudit(e.target.checked)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Inactivity Session Timeout (Minutes)</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                Enforces automatic workstation logout compliant with HIPAA technical safeguards (45 CFR § 164.312).
              </div>
            </div>
            <select
              value={sessionTimeoutMinutes}
              onChange={(e) => setSessionTimeoutMinutes(e.target.value)}
              style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
            >
              <option value="5">5 minutes</option>
              <option value="15">15 minutes (Recommended)</option>
              <option value="30">30 minutes</option>
              <option value="60">60 minutes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cold Chain & SLA Thresholds */}
      <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <Sliders size={20} color="var(--color-blue)" />
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Cold Chain & Dispatch Parameters</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>SLA Near-Breach Warning Lead Time</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                Triggers visual badges and dispatcher audio alarms before target delivery SLA window expires.
              </div>
            </div>
            <select
              value={slaWarningThreshold}
              onChange={(e) => setSlaWarningThreshold(e.target.value)}
              style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
            >
              <option value="15">15 minutes before window</option>
              <option value="30">30 minutes before window</option>
              <option value="45">45 minutes before window</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Refrigerated Sensor Excursion Threshold (Safe: 2.0°C - 8.0°C)</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                Immediate emergency notification if courier temperature sensor deviates beyond tolerance margin.
              </div>
            </div>
            <select
              value={temperatureAlertDelta}
              onChange={(e) => setTemperatureAlertDelta(e.target.value)}
              style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
            >
              <option value="0.2">±0.2°C (Ultra Strict)</option>
              <option value="0.5">±0.5°C (Standard)</option>
              <option value="1.0">±1.0°C (Relaxed)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications & Integrations */}
      <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <Bell size={20} color="var(--color-amber)" />
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Emergency Dispatch & Real-Time Alerts</h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Automated SMS & Webhook Escalations</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              Broadcasts immediate alerts to on-duty pharmacy manager when a controlled delivery fails or is rejected.
            </div>
          </div>
          <input
            type="checkbox"
            style={{ width: 18, height: 18, accentColor: 'var(--color-teal)', cursor: 'pointer' }}
            checked={enableWebhookAlerts}
            onChange={(e) => setEnableWebhookAlerts(e.target.checked)}
          />
        </div>
      </div>
    </div>
  );
};

export default Settings;
