import type { AuditEvent, AuditActor, AuditResource, AuditActionType, AuditCategory, AuditSeverity, StateChangeDiff } from '../types/audit';

const STORAGE_KEY = 'rahhawan_audit_log_ledger_v1';

// Deterministic fast hash simulation for append-only tamper-evident audit ledger
function generateEventHash(event: Omit<AuditEvent, 'hash'>): string {
  const content = `${event.previousHash}|${event.id}|${event.timestampRaw}|${event.actor.id}|${event.actionType}|${event.resource.id}|${event.description}`;
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const salt = Math.abs(content.length * 31337).toString(16).padStart(6, '0');
  return `0x${hex}${salt}${event.id.replace(/[^0-9]/g, '').slice(0, 4)}`.padEnd(64, 'a').slice(0, 64);
}

const NOW = Date.now();
const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

// Helper to format ISO to display string
export function formatAuditDate(timestampRaw: number): string {
  const d = new Date(timestampRaw);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

export function formatAuditRelativeTime(timestampRaw: number): string {
  const diff = Date.now() - timestampRaw;
  if (diff < 60 * 1000) return 'Just now';
  if (diff < 60 * MIN) return `${Math.floor(diff / MIN)}m ago`;
  if (diff < 24 * HOUR) return `${Math.floor(diff / HOUR)}h ago`;
  const days = Math.floor(diff / DAY);
  return days === 1 ? 'Yesterday' : `${days}d ago`;
}

// Initial realistic seed audit events with complete tamper-evident chain
const SEED_AUDIT_LOGS_RAW: Array<Omit<AuditEvent, 'hash' | 'previousHash'>> = [
  {
    id: 'AUD-89240',
    timestampRaw: NOW - 4 * MIN,
    timestamp: formatAuditDate(NOW - 4 * MIN),
    actor: {
      id: 'USR-001',
      name: 'Sarah Jenkins',
      role: 'Super Admin',
      organization: 'Rahhawan Platform HQ',
      ipAddress: '198.51.100.42',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0',
    },
    actionType: 'ROUTE4ME_EXPORT',
    category: 'Route & Export',
    resource: {
      type: 'delivery_batch',
      id: 'BATCH-2026-0819-01',
      label: 'Route4Me Bulk Export (8 Orders)',
      details: {
        driverFilter: 'DRV-101 (Marcus Vance)',
        dateFilter: 'Today (2026-08-19)',
        orderIds: ['ORD-9842', 'ORD-9841', 'ORD-9839', 'ORD-9838', 'ORD-9836', 'ORD-9835', 'ORD-9833', 'ORD-9832'],
      },
    },
    severity: 'info',
    description: 'Exported 8 deliveries to Route4Me 3-Field schema for driver Marcus Vance (Vehicle: Toyota Prius).',
    metadata: {
      schema: 'Route4Me Bulk-Upload Schema (3 Fields: Address, Stop Alias, Operational Window/Notes)',
      exportRecordCount: 8,
      controlledSubstanceCount: 2,
      coldChainCount: 3,
      checksumSHA256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    },
  },
  {
    id: 'AUD-89239',
    timestampRaw: NOW - 12 * MIN,
    timestamp: formatAuditDate(NOW - 12 * MIN),
    actor: {
      id: 'USR-004',
      name: 'Alex Rivera',
      role: 'Dispatcher',
      organization: 'Rahhawan Platform HQ',
      ipAddress: '198.51.100.55',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0',
    },
    actionType: 'DRIVER_ASSIGNED',
    category: 'State Change',
    resource: {
      type: 'order',
      id: 'ORD-9841',
      label: 'ORD-9841 (PT-7719)',
    },
    severity: 'info',
    description: 'Assigned Driver Marcus Vance (DRV-101) to delivery order ORD-9841. ETA 11:20 AM.',
    diff: [
      { field: 'driver', previousValue: 'Unassigned', newValue: 'Marcus Vance (DRV-101)' },
      { field: 'status', previousValue: 'Submitted', newValue: 'Driver Assigned' },
    ],
    metadata: {
      etaTarget: '11:20 AM',
      vehicle: 'Toyota Prius (Eco)',
      pharmacyCode: 'NG-INF',
    },
  },
  {
    id: 'AUD-89238',
    timestampRaw: NOW - 25 * MIN,
    timestamp: formatAuditDate(NOW - 25 * MIN),
    actor: {
      id: 'USR-002',
      name: 'Dr. Rebecca Vance',
      role: 'Tenant Admin',
      organization: 'Northgate Infusion Rx',
      ipAddress: '203.0.113.19',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) Safari/605.1.15',
    },
    actionType: 'PHI_ACCESS',
    category: 'PHI Access',
    resource: {
      type: 'order',
      id: 'ORD-9842',
      label: 'Patient Record PT-8831',
    },
    severity: 'warning',
    description: 'Accessed Schedule II prescription details & recipient contact information for Patient Safe ID PT-8831.',
    metadata: {
      rxNumbers: ['RX-908122', 'RX-908123'],
      deIdentificationProtocol: 'Safe Harbor Method § 164.514(b)',
      reason: 'Clinical pharmacist compliance verification for DEA 222 digital token match.',
    },
  },
  {
    id: 'AUD-89237',
    timestampRaw: NOW - 45 * MIN,
    timestamp: formatAuditDate(NOW - 45 * MIN),
    actor: {
      id: 'USR-003',
      name: 'Marcus Sterling, RPh',
      role: 'Compliance Officer',
      organization: 'HealthLink Compounding',
      ipAddress: '198.51.100.89',
    },
    actionType: 'COMPLIANCE_OVERRIDE',
    category: 'Compliance',
    resource: {
      type: 'order',
      id: 'ORD-9839',
      label: 'ORD-9839 (PT-3490)',
    },
    severity: 'warning',
    description: 'Manual compliance hold released after electronic verification of State Board compounding certificate.',
    diff: [
      { field: 'status', previousValue: 'Held — Compliance', newValue: 'Submitted' },
      { field: 'isHeldCompliance', previousValue: true, newValue: false },
    ],
    metadata: {
      overrideReason: 'Digital compounding batch certificate validated via NABP e-Profile #90812.',
      signedOfficer: 'Marcus Sterling, RPh (License #IL-RPH-449102)',
    },
  },
  {
    id: 'AUD-89236',
    timestampRaw: NOW - 75 * MIN,
    timestamp: formatAuditDate(NOW - 75 * MIN),
    actor: {
      id: 'SYS-CORE-01',
      name: 'Cold-Chain IoT Telemetry Daemon',
      role: 'System',
      organization: 'Rahhawan Core Engine',
      ipAddress: '10.240.0.14',
    },
    actionType: 'TEMPERATURE_EXCURSION_ACK',
    category: 'State Change',
    resource: {
      type: 'order',
      id: 'ORD-9840',
      label: 'ORD-9840 (PT-6621)',
    },
    severity: 'critical',
    description: 'Cold-chain excursion alert triggered: Sensor probe #SENS-884 recorded 8.4°C (Upper threshold: 8.0°C). Driver re-isolated refrigerated container.',
    metadata: {
      sensorId: 'SENS-884-PROBE',
      tempRecordedCelsius: 8.4,
      safeThresholdMax: 8.0,
      safeThresholdMin: 2.0,
      excursionDurationSec: 180,
    },
  },
  {
    id: 'AUD-89235',
    timestampRaw: NOW - 2 * HOUR,
    timestamp: formatAuditDate(NOW - 2 * HOUR),
    actor: {
      id: 'USR-004',
      name: 'Alex Rivera',
      role: 'Dispatcher',
      organization: 'Rahhawan Platform HQ',
      ipAddress: '198.51.100.55',
    },
    actionType: 'ORDER_STATUS_UPDATE',
    category: 'State Change',
    resource: {
      type: 'order',
      id: 'ORD-9838',
      label: 'ORD-9838 (PT-1102)',
    },
    severity: 'info',
    description: 'Dispatched delivery ORD-9838 to Driver Elena Rostova. Status transitioned to En Route.',
    diff: [
      { field: 'status', previousValue: 'Driver Assigned', newValue: 'En Route' },
    ],
  },
  {
    id: 'AUD-89234',
    timestampRaw: NOW - 3 * HOUR,
    timestamp: formatAuditDate(NOW - 3 * HOUR),
    actor: {
      id: 'USR-005',
      name: 'Marcus Vance',
      role: 'Driver',
      organization: 'Courier Fleet Tier 1',
      ipAddress: '172.56.21.90',
      userAgent: 'Rahhawan Driver App v3.4.1 (iOS 17.5.1)',
    },
    actionType: 'ORDER_STATUS_UPDATE',
    category: 'State Change',
    resource: {
      type: 'order',
      id: 'ORD-9835',
      label: 'ORD-9835 (PT-4421)',
    },
    severity: 'success',
    description: 'Proof of Delivery (POD) signed and biometric chain-of-custody recorded. Order marked Delivered.',
    diff: [
      { field: 'status', previousValue: 'En Route', newValue: 'Delivered' },
    ],
    metadata: {
      recipientName: 'K. Miller (Self)',
      signatureHash: 'sha256:d8a9b2c3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9',
      photoAttached: true,
      gpsLocation: { lat: 41.8781, lng: -87.6298 },
    },
  },
  {
    id: 'AUD-89233',
    timestampRaw: NOW - 5 * HOUR,
    timestamp: formatAuditDate(NOW - 5 * HOUR),
    actor: {
      id: 'USR-001',
      name: 'Sarah Jenkins',
      role: 'Super Admin',
      organization: 'Rahhawan Platform HQ',
      ipAddress: '198.51.100.42',
    },
    actionType: 'USER_AUTHENTICATION',
    category: 'Security & Auth',
    resource: {
      type: 'user',
      id: 'USR-001',
      label: 'Sarah Jenkins (Super Admin)',
    },
    severity: 'info',
    description: 'User successfully authenticated via WebAuthn FIDO2 biometric hardware security key.',
    metadata: {
      mfaMethod: 'FIDO2_HARDWARE_TOKEN',
      sessionDurationHours: 12,
      authResult: 'SUCCESS_MFA_VERIFIED',
    },
  },
  {
    id: 'AUD-89232',
    timestampRaw: NOW - 1 * DAY,
    timestamp: formatAuditDate(NOW - 1 * DAY),
    actor: {
      id: 'USR-001',
      name: 'Sarah Jenkins',
      role: 'Super Admin',
      organization: 'Rahhawan Platform HQ',
      ipAddress: '198.51.100.42',
    },
    actionType: 'ROUTE4ME_EXPORT',
    category: 'Route & Export',
    resource: {
      type: 'delivery_batch',
      id: 'BATCH-2026-0818-02',
      label: 'Route4Me Bulk Export (14 Orders)',
      details: {
        driverFilter: 'All Drivers',
        dateFilter: 'Yesterday (2026-08-18)',
      },
    },
    severity: 'info',
    description: 'Exported 14 deliveries across all active courier routes to Route4Me CSV schema for evening dispatch.',
    metadata: {
      schema: 'Route4Me Bulk-Upload Schema (3 Fields)',
      exportRecordCount: 14,
      totalDrivers: 4,
      controlledSubstanceCount: 4,
    },
  },
  {
    id: 'AUD-89231',
    timestampRaw: NOW - 1 * DAY - 2 * HOUR,
    timestamp: formatAuditDate(NOW - 1 * DAY - 2 * HOUR),
    actor: {
      id: 'SYS-AUTH',
      name: 'Security Guardian Agent',
      role: 'System',
      organization: 'Rahhawan Security Hub',
      ipAddress: '10.240.0.2',
    },
    actionType: 'SECURITY_POLICY_CHANGE',
    category: 'Security & Auth',
    resource: {
      type: 'system',
      id: 'SYS-POLICY-HIPAA',
      label: 'HIPAA Access Control Policy',
    },
    severity: 'warning',
    description: 'Applied automated 90-day cryptographic certificate and API key rotation for Westside Delivery Rx tenant endpoint.',
    metadata: {
      policy: 'AUTOMATED_CREDENTIAL_ROTATION',
      certificateExp: '2027-08-18',
    },
  },
  {
    id: 'AUD-89230',
    timestampRaw: NOW - 2 * DAY,
    timestamp: formatAuditDate(NOW - 2 * DAY),
    actor: {
      id: 'USR-002',
      name: 'Dr. Rebecca Vance',
      role: 'Tenant Admin',
      organization: 'Northgate Infusion Rx',
      ipAddress: '203.0.113.19',
    },
    actionType: 'DELIVERY_CREATED',
    category: 'State Change',
    resource: {
      type: 'order',
      id: 'ORD-9842',
      label: 'ORD-9842 (PT-8831)',
    },
    severity: 'info',
    description: 'Submitted new prescription batch containing Schedule II pain management and anticoagulant infusion therapies.',
    metadata: {
      pharmacyCode: 'NG-INF',
      itemCount: 2,
    },
  },
  {
    id: 'AUD-89229',
    timestampRaw: NOW - 3 * DAY,
    timestamp: formatAuditDate(NOW - 3 * DAY),
    actor: {
      id: 'USR-003',
      name: 'Marcus Sterling, RPh',
      role: 'Compliance Officer',
      organization: 'HealthLink Compounding',
      ipAddress: '198.51.100.89',
    },
    actionType: 'PHI_ACCESS',
    category: 'PHI Access',
    resource: {
      type: 'order',
      id: 'ORD-9830',
      label: 'Patient Record PT-2194',
    },
    severity: 'warning',
    description: 'Audited sterile compounded ophthalmic formulation patient manifest for state pharmacy board compliance inspection.',
    metadata: {
      rxNumbers: ['RX-441029'],
      deIdentificationProtocol: 'Safe Harbor Method § 164.514(b)',
    },
  },
];

// Initialize seed with chain hashes
function buildInitialChain(rawEvents: Array<Omit<AuditEvent, 'hash' | 'previousHash'>>): AuditEvent[] {
  const result: AuditEvent[] = [];
  let prevHash = '0x0000000000000000000000000000000000000000000000000000000000000000';

  // Build from oldest to newest
  const sortedRaw = [...rawEvents].sort((a, b) => a.timestampRaw - b.timestampRaw);

  for (const item of sortedRaw) {
    const unhashed = {
      ...item,
      previousHash: prevHash,
    };
    const hash = generateEventHash(unhashed);
    const fullEvent: AuditEvent = {
      ...unhashed,
      hash,
    };
    result.push(fullEvent);
    prevHash = hash;
  }

  // Return newest first for display
  return result.reverse();
}

class AuditLogService {
  private logs: AuditEvent[] = [];
  private listeners: Array<(logs: AuditEvent[]) => void> = [];

  constructor() {
    this.loadLogs();
  }

  private loadLogs() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.logs = parsed;
            return;
          }
        }
      } catch (err) {
        console.warn('Could not load audit log from localStorage', err);
      }
    }
    // Fallback to seed
    this.logs = buildInitialChain(SEED_AUDIT_LOGS_RAW);
    this.saveLogs();
  }

  private saveLogs() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.logs));
      } catch (err) {
        console.warn('Could not save audit log to localStorage', err);
      }
    }
  }

  public getLogs(): AuditEvent[] {
    return [...this.logs];
  }

  public subscribe(listener: (logs: AuditEvent[]) => void): () => void {
    this.listeners.push(listener);
    listener(this.getLogs());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    const current = this.getLogs();
    this.listeners.forEach((l) => l(current));
  }

  public logEvent(params: {
    actor?: Partial<AuditActor>;
    actionType: AuditActionType;
    category: AuditCategory;
    resource: AuditResource;
    severity: AuditSeverity;
    description: string;
    metadata?: Record<string, any>;
    diff?: StateChangeDiff[];
  }): AuditEvent {
    const rawTimestamp = Date.now();
    const formattedTimestamp = formatAuditDate(rawTimestamp);
    const newId = `AUD-${Math.floor(10000 + Math.random() * 90000)}`;

    const defaultActor: AuditActor = {
      id: 'USR-001',
      name: 'Sarah Jenkins',
      role: 'Super Admin',
      organization: 'Rahhawan Platform HQ',
      ipAddress: '198.51.100.42',
      userAgent: navigator?.userAgent || 'Mozilla/5.0 Rahhawan Portal Client',
    };

    const actor: AuditActor = {
      ...defaultActor,
      ...(params.actor || {}),
    };

    // The previous top log's hash becomes this event's previousHash
    const topLog = this.logs[0];
    const previousHash = topLog ? topLog.hash : '0x0000000000000000000000000000000000000000000000000000000000000000';

    const unhashed: Omit<AuditEvent, 'hash'> = {
      id: newId,
      timestampRaw: rawTimestamp,
      timestamp: formattedTimestamp,
      actor,
      actionType: params.actionType,
      category: params.category,
      resource: params.resource,
      severity: params.severity,
      description: params.description,
      metadata: params.metadata,
      diff: params.diff,
      previousHash,
    };

    const hash = generateEventHash(unhashed);
    const newEvent: AuditEvent = {
      ...unhashed,
      hash,
    };

    // Prepend to list (newest first)
    this.logs = [newEvent, ...this.logs];
    this.saveLogs();
    this.notify();

    return newEvent;
  }

  // Convenience helper for Route4Me export actions
  public logRoute4MeExport(details: {
    selectedCount: number;
    orderIds: string[];
    driverFilter: string;
    dateFilter: string;
    pharmacyFilter?: string;
    hasColdChain: boolean;
    hasControlled: boolean;
  }): AuditEvent {
    return this.logEvent({
      actionType: 'ROUTE4ME_EXPORT',
      category: 'Route & Export',
      resource: {
        type: 'delivery_batch',
        id: `BATCH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
        label: `Route4Me Export (${details.selectedCount} Stops)`,
        details: {
          driverFilter: details.driverFilter,
          dateFilter: details.dateFilter,
          orderIds: details.orderIds,
        },
      },
      severity: 'info',
      description: `Exported ${details.selectedCount} deliveries in Route4Me 3-Field schema (Driver: ${details.driverFilter}, Date: ${details.dateFilter}).`,
      metadata: {
        schema: 'Route4Me Bulk Upload (Address, Stop Alias, Operational Window/Notes)',
        exportedOrdersCount: details.selectedCount,
        driverFilter: details.driverFilter,
        dateFilter: details.dateFilter,
        pharmacyFilter: details.pharmacyFilter || 'All',
        orderIds: details.orderIds,
        containsColdChain: details.hasColdChain,
        containsControlledSubstances: details.hasControlled,
        exportStandard: 'RFC-4180 CSV Compliant',
        complianceTag: 'HIPAA § 164.312(b) Audit Control Logged',
      },
    });
  }

  // Verify full append-only chain integrity
  public verifyIntegrity(): { isValid: boolean; verifiedCount: number; brokenAt?: string } {
    if (this.logs.length === 0) return { isValid: true, verifiedCount: 0 };
    // Reverse to check from genesis to head
    const chain = [...this.logs].reverse();
    let expectedPrev = '0x0000000000000000000000000000000000000000000000000000000000000000';

    for (let i = 0; i < chain.length; i++) {
      const event = chain[i];
      if (i > 0 && event.previousHash !== expectedPrev) {
        return { isValid: false, verifiedCount: i, brokenAt: event.id };
      }
      const recalculated = generateEventHash(event);
      if (recalculated !== event.hash) {
        return { isValid: false, verifiedCount: i, brokenAt: event.id };
      }
      expectedPrev = event.hash;
    }

    return { isValid: true, verifiedCount: chain.length };
  }
}

export const auditLogService = new AuditLogService();
