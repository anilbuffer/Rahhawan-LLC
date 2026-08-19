import type { DeliveryOrder, DeliveryFlags, DeliveryStatus } from '../types/delivery';

export interface OutboxItem {
  id: string;
  idempotencyKey: string;
  orderId: string;
  actionType: 
    | 'STATUS_CHANGE'
    | 'SIGNATURE_CAPTURE'
    | 'PHOTO_CAPTURE'
    | 'TEMPERATURE_LOG'
    | 'CHAIN_OF_CUSTODY'
    | 'FAIL_ORDER';
  payload: any;
  timestamp: number;
  status: 'pending' | 'syncing' | 'synced' | 'rejected';
  errorNotice?: string;
}

export interface DriverEvidence {
  signature?: {
    recipientName: string;
    signedAt: string;
    signatureDataUrl: string;
  };
  photos: {
    id: string;
    photoUrl: string;
    capturedAt: string;
    caption?: string;
  }[];
  pickupTemp?: {
    celsius: number;
    fahrenheit: number;
    unit: 'F' | 'C';
    timestamp: string;
    isSafe: boolean;
  };
  deliveryTemp?: {
    celsius: number;
    fahrenheit: number;
    unit: 'F' | 'C';
    timestamp: string;
    isSafe: boolean;
  };
  chainOfCustodyPickup?: {
    confirmedBy: string;
    deaCertificateId: string;
    timestamp: string;
  };
  chainOfCustodyHandoff?: {
    confirmedBy: string;
    recipientName: string;
    timestamp: string;
  };
}

export interface DriverDeliveryOrder extends DeliveryOrder {
  stopSequence: number;
  driverEvidence?: DriverEvidence;
  failedReasonCode?: string;
  failedNotes?: string;
  rejectionNotice?: {
    title: string;
    message: string;
    timestamp: number;
  };
}

const OUTBOX_STORAGE_KEY = 'rahhawan_driver_outbox';
const DELIVERIES_STORAGE_KEY = 'rahhawan_driver_deliveries';
const NETWORK_OVERRIDE_KEY = 'rahhawan_driver_network_override';

// Initial dataset for driver Marcus Vance (DRV-101)
const SEED_DRIVER_ORDERS: DriverDeliveryOrder[] = [
  {
    id: 'DEL-10045',
    stopSequence: 1,
    patientSafeId: 'PT-33109',
    patientInitials: 'M.J.',
    pharmacy: {
      id: 'PHARM-MFP-01',
      name: 'Meridian Family Pharmacy',
      code: 'MFP',
      location: '2815 Oakwood Blvd, Chicago, IL',
    },
    flags: { controlled: false, refrigerated: true, rush: true },
    status: 'En Route',
    lastUpdated: '5m ago',
    lastUpdatedTimestamp: Date.now() - 5 * 60 * 1000,
    createdAt: 'Today, 09:10 AM',
    createdAtTimestamp: Date.now() - 5 * 60 * 60 * 1000,
    deliveryAddress: {
      street: '3200 N Lake Shore Dr',
      apt: 'Apt 22A',
      city: 'Chicago',
      state: 'IL',
      zip: '60657',
    },
    prescriptionSummary: {
      itemCount: 1,
      description: 'Lantus SoloStar Insulin 100 U/mL (Cold Chain 2°C - 8°C)',
      rxNumbers: ['RX-884012'],
    },
    slaWindow: { start: '10:30 AM', end: '12:00 PM', isNearBreach: true, urgentTimeLeft: '22m left' },
    timeline: [
      { id: 't1', status: 'Submitted', title: 'Order Submitted', timestamp: '09:10 AM', actor: 'Meridian Pharmacy', actorType: 'pharmacy' },
      { id: 't2', status: 'Driver Assigned', title: 'Assigned to Marcus Vance', timestamp: '09:20 AM', actor: 'Dispatch Engine', actorType: 'system' },
      { id: 't3', status: 'Picked Up', title: 'Picked Up & Thermal Verified (3.8°C)', timestamp: '09:45 AM', actor: 'Marcus Vance', actorType: 'driver' },
      { id: 't4', status: 'En Route', title: 'En Route to Recipient', timestamp: '09:50 AM', actor: 'Marcus Vance', actorType: 'driver' },
    ],
    driver: {
      id: 'DRV-101',
      name: 'Marcus Vance',
      phone: '+1 (555) 234-8901',
      vehicle: 'Toyota Prius (Eco Refrigerated Box)',
      status: 'delivering',
    },
    driverEvidence: {
      photos: [],
      pickupTemp: {
        celsius: 3.8,
        fahrenheit: 38.8,
        unit: 'F',
        timestamp: '09:45 AM',
        isSafe: true,
      },
    },
  },
  {
    id: 'DEL-10048',
    stopSequence: 2,
    patientSafeId: 'PT-88312',
    patientInitials: 'R.K.',
    pharmacy: {
      id: 'PHARM-MFP-01',
      name: 'Meridian Family Pharmacy',
      code: 'MFP',
      location: '2815 Oakwood Blvd, Chicago, IL',
    },
    flags: { controlled: true, refrigerated: true, rush: false },
    status: 'Picked Up',
    lastUpdated: '15m ago',
    lastUpdatedTimestamp: Date.now() - 15 * 60 * 1000,
    createdAt: 'Today, 09:15 AM',
    createdAtTimestamp: Date.now() - 4 * 60 * 60 * 1000,
    deliveryAddress: {
      street: '1420 N University Ave',
      apt: 'Suite 405',
      city: 'Chicago',
      state: 'IL',
      zip: '60614',
    },
    prescriptionSummary: {
      itemCount: 2,
      description: 'Morphine Sulfate Oral Solution 20mg/mL & Enoxaparin 40mg',
      rxNumbers: ['RX-908122', 'RX-908123'],
      schedule: 'Schedule II',
    },
    slaWindow: { start: '11:00 AM', end: '01:30 PM' },
    timeline: [
      { id: 't1', status: 'Submitted', title: 'Order Submitted', timestamp: '09:15 AM', actor: 'Meridian Pharmacy', actorType: 'pharmacy' },
      { id: 't2', status: 'Driver Assigned', title: 'Dispatched to Marcus Vance', timestamp: '09:30 AM', actor: 'System', actorType: 'system' },
      { id: 't3', status: 'Picked Up', title: 'Pickup Verified & Chain of Custody Signed', timestamp: '10:00 AM', actor: 'Marcus Vance', actorType: 'driver', note: 'DEA Form 222 PKI token transferred.' },
    ],
    driver: {
      id: 'DRV-101',
      name: 'Marcus Vance',
      phone: '+1 (555) 234-8901',
      vehicle: 'Toyota Prius (Eco Refrigerated Box)',
      status: 'on_shift',
    },
    driverEvidence: {
      photos: [],
      pickupTemp: {
        celsius: 4.1,
        fahrenheit: 39.4,
        unit: 'F',
        timestamp: '10:00 AM',
        isSafe: true,
      },
      chainOfCustodyPickup: {
        confirmedBy: 'Marcus Vance (DRV-101)',
        deaCertificateId: 'DEA-222-PKI-88410',
        timestamp: '10:00 AM',
      },
    },
  },
  {
    id: 'DEL-10051',
    stopSequence: 3,
    patientSafeId: 'PT-19402',
    patientInitials: 'E.D.',
    pharmacy: {
      id: 'PHARM-MFP-01',
      name: 'Meridian Family Pharmacy',
      code: 'MFP',
      location: '2815 Oakwood Blvd, Chicago, IL',
    },
    flags: { controlled: true, refrigerated: false, rush: true },
    status: 'Driver Assigned',
    lastUpdated: '25m ago',
    lastUpdatedTimestamp: Date.now() - 25 * 60 * 1000,
    createdAt: 'Today, 09:40 AM',
    createdAtTimestamp: Date.now() - 3 * 60 * 60 * 1000,
    deliveryAddress: {
      street: '740 W Addison St',
      apt: 'Apt 3B',
      city: 'Chicago',
      state: 'IL',
      zip: '60613',
    },
    prescriptionSummary: {
      itemCount: 1,
      description: 'Adderall XR 25mg Capsules (30-day supply)',
      rxNumbers: ['RX-789014'],
      schedule: 'Schedule II',
    },
    slaWindow: { start: '11:30 AM', end: '01:00 PM', isNearBreach: false },
    timeline: [
      { id: 't1', status: 'Submitted', title: 'Rush Controlled Rx Created', timestamp: '09:40 AM', actor: 'Meridian Pharmacy', actorType: 'pharmacy' },
      { id: 't2', status: 'Driver Assigned', title: 'Assigned to Marcus Vance', timestamp: '09:45 AM', actor: 'Auto-Dispatch', actorType: 'system' },
    ],
    driver: {
      id: 'DRV-101',
      name: 'Marcus Vance',
      phone: '+1 (555) 234-8901',
      vehicle: 'Toyota Prius (Eco Refrigerated Box)',
      status: 'on_shift',
    },
    driverEvidence: {
      photos: [],
    },
  },
  {
    id: 'DEL-10055',
    stopSequence: 4,
    patientSafeId: 'PT-77182',
    patientInitials: 'T.H.',
    pharmacy: {
      id: 'PHARM-MFP-01',
      name: 'Meridian Family Pharmacy',
      code: 'MFP',
      location: '2815 Oakwood Blvd, Chicago, IL',
    },
    flags: { controlled: false, refrigerated: false, rush: false },
    status: 'Driver Assigned',
    lastUpdated: '35m ago',
    lastUpdatedTimestamp: Date.now() - 35 * 60 * 1000,
    createdAt: 'Today, 10:00 AM',
    createdAtTimestamp: Date.now() - 2 * 60 * 60 * 1000,
    deliveryAddress: {
      street: '2240 N Clark St',
      apt: 'Unit 12',
      city: 'Chicago',
      state: 'IL',
      zip: '60614',
    },
    prescriptionSummary: {
      itemCount: 3,
      description: 'Atorvastatin 40mg, Lisinopril 10mg, Metformin 500mg',
      rxNumbers: ['RX-661021', 'RX-661022', 'RX-661023'],
    },
    slaWindow: { start: '12:00 PM', end: '03:00 PM' },
    timeline: [
      { id: 't1', status: 'Submitted', title: 'Maintenance Order Submitted', timestamp: '10:00 AM', actor: 'Meridian Pharmacy', actorType: 'pharmacy' },
      { id: 't2', status: 'Driver Assigned', title: 'Route Stop Assigned', timestamp: '10:05 AM', actor: 'Route4Me Dispatch', actorType: 'system' },
    ],
    driver: {
      id: 'DRV-101',
      name: 'Marcus Vance',
      phone: '+1 (555) 234-8901',
      vehicle: 'Toyota Prius (Eco)',
      status: 'on_shift',
    },
    driverEvidence: {
      photos: [],
    },
  },
  {
    id: 'DEL-10060',
    stopSequence: 5,
    patientSafeId: 'PT-99310',
    patientInitials: 'C.W.',
    pharmacy: {
      id: 'PHARM-MFP-01',
      name: 'Meridian Family Pharmacy',
      code: 'MFP',
      location: '2815 Oakwood Blvd, Chicago, IL',
    },
    flags: { controlled: false, refrigerated: true, rush: false },
    status: 'Driver Assigned',
    lastUpdated: '40m ago',
    lastUpdatedTimestamp: Date.now() - 40 * 60 * 1000,
    createdAt: 'Today, 10:15 AM',
    createdAtTimestamp: Date.now() - 2 * 60 * 60 * 1000,
    deliveryAddress: {
      street: '1850 W Division St',
      apt: '',
      city: 'Chicago',
      state: 'IL',
      zip: '60622',
    },
    prescriptionSummary: {
      itemCount: 1,
      description: 'Enbrel 50mg/mL Auto-injector (Refrigerated 2°C - 8°C)',
      rxNumbers: ['RX-448102'],
    },
    slaWindow: { start: '01:00 PM', end: '04:00 PM' },
    timeline: [
      { id: 't1', status: 'Submitted', title: 'Biologic Order Generated', timestamp: '10:15 AM', actor: 'Meridian Pharmacy', actorType: 'pharmacy' },
      { id: 't2', status: 'Driver Assigned', title: 'Dispatched to Route #4', timestamp: '10:20 AM', actor: 'System', actorType: 'system' },
    ],
    driver: {
      id: 'DRV-101',
      name: 'Marcus Vance',
      phone: '+1 (555) 234-8901',
      vehicle: 'Toyota Prius (Eco)',
      status: 'on_shift',
    },
    driverEvidence: {
      photos: [],
    },
  },
  {
    id: 'DEL-10042',
    stopSequence: 6,
    patientSafeId: 'PT-55210',
    patientInitials: 'A.R.',
    pharmacy: {
      id: 'PHARM-MFP-01',
      name: 'Meridian Family Pharmacy',
      code: 'MFP',
      location: '2815 Oakwood Blvd, Chicago, IL',
    },
    flags: { controlled: true, refrigerated: false, rush: false },
    status: 'Delivered',
    lastUpdated: '1h ago',
    lastUpdatedTimestamp: Date.now() - 60 * 60 * 1000,
    createdAt: 'Today, 08:30 AM',
    createdAtTimestamp: Date.now() - 6 * 60 * 60 * 1000,
    deliveryAddress: {
      street: '1420 S Michigan Ave',
      apt: 'Unit 8C',
      city: 'Chicago',
      state: 'IL',
      zip: '60605',
    },
    prescriptionSummary: {
      itemCount: 2,
      description: 'Hydrocodone-Acetaminophen 5/325mg & Amoxicillin 500mg',
      rxNumbers: ['RX-770421', 'RX-770422'],
      schedule: 'Schedule II',
    },
    slaWindow: { start: '09:00 AM', end: '12:00 PM' },
    timeline: [
      { id: 'e1', status: 'Delivered', title: 'Delivered — Signature captured', timestamp: '1h ago', actor: 'Marcus Vance', actorType: 'driver', note: 'Patient verified via photo ID. Signature captured on device.' },
      { id: 'e2', status: 'En Route', title: 'En route to patient', timestamp: '1h 30m ago', actor: 'Marcus Vance', actorType: 'driver' },
      { id: 'e3', status: 'Picked Up', title: 'Picked up from pharmacy', timestamp: '2h ago', actor: 'Marcus Vance', actorType: 'driver', note: 'Chain of custody acknowledged at pickup.' },
      { id: 'e4', status: 'Driver Assigned', title: 'Dispatched to Marcus Vance', timestamp: '2h 15m ago', actor: 'System', actorType: 'system' },
      { id: 'e5', status: 'Submitted', title: 'Order submitted by pharmacy', timestamp: '08:30 AM', actor: 'Dr. James Hartwell', actorType: 'pharmacy' },
    ],
    driver: {
      id: 'DRV-101',
      name: 'Marcus Vance',
      phone: '+1 (555) 234-8901',
      vehicle: 'Toyota Prius (Eco)',
      status: 'on_shift',
    },
    driverEvidence: {
      signature: {
        recipientName: 'A. Rodriguez',
        signedAt: 'Today, 10:48 AM',
        signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80"><path d="M10,60 Q50,10 90,60 T170,50" fill="none" stroke="%230EA383" stroke-width="3"/></svg>',
      },
      photos: [
        {
          id: 'p-10042-1',
          photoUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=60',
          capturedAt: '10:47 AM',
          caption: 'Delivered to resident at door',
        },
      ],
      chainOfCustodyPickup: {
        confirmedBy: 'Marcus Vance',
        deaCertificateId: 'DEA-222-PKI-88410',
        timestamp: '09:00 AM',
      },
      chainOfCustodyHandoff: {
        confirmedBy: 'Marcus Vance',
        recipientName: 'A. Rodriguez (ID #AR-9921)',
        timestamp: '10:48 AM',
      },
    },
  },
];

type SyncListener = () => void;

class DriverSyncService {
  private deliveries: DriverDeliveryOrder[] = [];
  private outbox: OutboxItem[] = [];
  private isOnlineOverride: boolean | null = null;
  private listeners: Set<SyncListener> = new Set();
  private isSyncing = false;
  private autoSyncTimer: number | null = null;

  constructor() {
    this.loadState();

    // Listen to real browser network events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange());
      window.addEventListener('offline', () => this.handleNetworkChange());
    }

    // Periodic auto-sync worker
    if (typeof window !== 'undefined') {
      setInterval(() => {
        if (this.isOnline && this.getPendingCount() > 0 && !this.isSyncing) {
          this.processOutbox();
        }
      }, 3000);
    }
  }

  private loadState() {
    try {
      const storedDeliveries = localStorage.getItem(DELIVERIES_STORAGE_KEY);
      if (storedDeliveries) {
        this.deliveries = JSON.parse(storedDeliveries);
      } else {
        this.deliveries = [...SEED_DRIVER_ORDERS];
        this.saveDeliveries();
      }

      const storedOutbox = localStorage.getItem(OUTBOX_STORAGE_KEY);
      if (storedOutbox) {
        this.outbox = JSON.parse(storedOutbox);
      }

      const storedOverride = localStorage.getItem(NETWORK_OVERRIDE_KEY);
      if (storedOverride !== null) {
        this.isOnlineOverride = storedOverride === 'true';
      }
    } catch (e) {
      console.warn('Could not load stored driver state:', e);
      this.deliveries = [...SEED_DRIVER_ORDERS];
    }
  }

  private saveDeliveries() {
    try {
      localStorage.setItem(DELIVERIES_STORAGE_KEY, JSON.stringify(this.deliveries));
    } catch (e) {
      console.error('Error saving deliveries to localStorage:', e);
    }
  }

  private saveOutbox() {
    try {
      localStorage.setItem(OUTBOX_STORAGE_KEY, JSON.stringify(this.outbox));
    } catch (e) {
      console.error('Error saving outbox to localStorage:', e);
    }
  }

  private handleNetworkChange() {
    this.notify();
    if (this.isOnline) {
      this.processOutbox();
    }
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public get isOnline(): boolean {
    if (this.isOnlineOverride !== null) {
      return this.isOnlineOverride;
    }
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  public setOnlineSimulation(online: boolean | null) {
    this.isOnlineOverride = online;
    if (online === null) {
      localStorage.removeItem(NETWORK_OVERRIDE_KEY);
    } else {
      localStorage.setItem(NETWORK_OVERRIDE_KEY, String(online));
    }
    this.notify();
    if (this.isOnline) {
      this.processOutbox();
    }
  }

  public getDeliveries(): DriverDeliveryOrder[] {
    return [...this.deliveries];
  }

  public getOrderById(orderId: string): DriverDeliveryOrder | undefined {
    return this.deliveries.find((d) => d.id === orderId);
  }

  public getOutbox(): OutboxItem[] {
    return [...this.outbox];
  }

  public getPendingCount(): number {
    return this.outbox.filter((item) => item.status === 'pending' || item.status === 'syncing').length;
  }

  public getSyncState(): { isOnline: boolean; isSyncing: boolean; pendingCount: number; rejectedCount: number } {
    const rejectedCount = this.outbox.filter((i) => i.status === 'rejected').length;
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      pendingCount: this.getPendingCount(),
      rejectedCount,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // ORIGIN WRITE ACTIONS (Optimistic + Outbox Queued)
  // ─────────────────────────────────────────────────────────────

  public queueAction(
    orderId: string,
    actionType: OutboxItem['actionType'],
    payload: any,
    simulateRejection = false
  ): string {
    const idempotencyKey = `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const outboxItem: OutboxItem = {
      id: `out_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      idempotencyKey,
      orderId,
      actionType,
      payload,
      timestamp: Date.now(),
      status: 'pending',
    };

    // 1. Optimistic Local State Update (Instant visual feedback for driver)
    this.applyOptimisticUpdate(orderId, actionType, payload);

    // 2. Add to outbox queue
    this.outbox.unshift(outboxItem);
    this.saveOutbox();
    this.notify();

    // 3. Trigger background sync attempt if online
    if (this.isOnline) {
      setTimeout(() => this.processOutbox(simulateRejection), 300);
    }

    return idempotencyKey;
  }

  private applyOptimisticUpdate(orderId: string, actionType: OutboxItem['actionType'], payload: any) {
    const orderIndex = this.deliveries.findIndex((d) => d.id === orderId);
    if (orderIndex === -1) return;

    const order = { ...this.deliveries[orderIndex] };
    const nowStr = 'Just now';
    const driverName = 'Marcus Vance';

    if (!order.driverEvidence) {
      order.driverEvidence = { photos: [] };
    }

    switch (actionType) {
      case 'STATUS_CHANGE': {
        const newStatus = payload.status as DeliveryStatus;
        order.status = newStatus;
        order.lastUpdated = nowStr;
        order.lastUpdatedTimestamp = Date.now();

        order.timeline = [
          {
            id: `tl_${Date.now()}`,
            status: newStatus,
            title: payload.title || `Status updated to ${newStatus}`,
            timestamp: nowStr,
            actor: driverName,
            actorType: 'driver',
            note: payload.note,
          },
          ...order.timeline,
        ];
        break;
      }

      case 'SIGNATURE_CAPTURE': {
        order.driverEvidence.signature = {
          recipientName: payload.recipientName,
          signedAt: nowStr,
          signatureDataUrl: payload.signatureDataUrl,
        };
        order.timeline = [
          {
            id: `tl_${Date.now()}`,
            status: order.status,
            title: 'Recipient Signature Captured',
            timestamp: nowStr,
            actor: driverName,
            actorType: 'driver',
            note: `Signed by ${payload.recipientName}`,
          },
          ...order.timeline,
        ];
        break;
      }

      case 'PHOTO_CAPTURE': {
        const newPhoto = {
          id: `photo_${Date.now()}`,
          photoUrl: payload.photoUrl,
          capturedAt: nowStr,
          caption: payload.caption || 'Proof of delivery photo',
        };
        order.driverEvidence.photos = [...(order.driverEvidence.photos || []), newPhoto];
        order.timeline = [
          {
            id: `tl_${Date.now()}`,
            status: order.status,
            title: 'Photo Proof Attached',
            timestamp: nowStr,
            actor: driverName,
            actorType: 'driver',
            note: 'Geotagged & compressed camera capture.',
          },
          ...order.timeline,
        ];
        break;
      }

      case 'TEMPERATURE_LOG': {
        const reading = {
          celsius: payload.celsius,
          fahrenheit: payload.fahrenheit,
          unit: payload.unit as 'F' | 'C',
          timestamp: nowStr,
          isSafe: payload.celsius >= 2 && payload.celsius <= 8,
        };

        if (payload.readingType === 'pickup') {
          order.driverEvidence.pickupTemp = reading;
        } else {
          order.driverEvidence.deliveryTemp = reading;
        }

        order.timeline = [
          {
            id: `tl_${Date.now()}`,
            status: order.status,
            title: `${payload.readingType === 'pickup' ? 'Pickup' : 'Delivery'} Temp Logged (${payload.unit === 'F' ? payload.fahrenheit + '°F' : payload.celsius + '°C'})`,
            timestamp: nowStr,
            actor: driverName,
            actorType: 'driver',
            note: reading.isSafe ? 'Thermal payload in nominal range (2°C - 8°C).' : 'Warning: Temperature out of nominal range!',
          },
          ...order.timeline,
        ];
        break;
      }

      case 'CHAIN_OF_CUSTODY': {
        if (payload.stage === 'pickup') {
          order.driverEvidence.chainOfCustodyPickup = {
            confirmedBy: driverName,
            deaCertificateId: 'DEA-222-PKI-' + Math.floor(10000 + Math.random() * 90000),
            timestamp: nowStr,
          };
        } else {
          order.driverEvidence.chainOfCustodyHandoff = {
            confirmedBy: driverName,
            recipientName: payload.recipientName,
            timestamp: nowStr,
          };
        }

        order.timeline = [
          {
            id: `tl_${Date.now()}`,
            status: order.status,
            title: `DEA Chain of Custody Acknowledged (${payload.stage === 'pickup' ? 'Pharmacy Transfer' : 'Patient Handoff'})`,
            timestamp: nowStr,
            actor: driverName,
            actorType: 'driver',
            note: 'Cryptographic custody token verified.',
          },
          ...order.timeline,
        ];
        break;
      }

      case 'FAIL_ORDER': {
        order.status = 'Failed';
        order.failedReasonCode = payload.reasonCode;
        order.failedNotes = payload.notes;
        order.lastUpdated = nowStr;
        order.lastUpdatedTimestamp = Date.now();

        order.timeline = [
          {
            id: `tl_${Date.now()}`,
            status: 'Failed',
            title: `Delivery Failed: ${payload.reasonTitle || payload.reasonCode}`,
            timestamp: nowStr,
            actor: driverName,
            actorType: 'driver',
            note: payload.notes || 'Driver reported delivery could not be completed.',
          },
          ...order.timeline,
        ];
        break;
      }
    }

    this.deliveries[orderIndex] = order;
    this.saveDeliveries();
  }

  // Process outbox with background network simulator
  public async processOutbox(simulateRejection = false) {
    if (this.isSyncing || !this.isOnline) return;

    const pendingItems = this.outbox.filter((item) => item.status === 'pending');
    if (pendingItems.length === 0) return;

    this.isSyncing = true;
    this.notify();

    // Simulate network latency batch
    await new Promise((resolve) => setTimeout(resolve, 800));

    let updatedOutbox = [...this.outbox];

    for (const item of pendingItems) {
      if (simulateRejection && item.orderId === 'DEL-10055') {
        // Demonstrate rejection scenario (e.g. order reassigned or cancelled by admin)
        item.status = 'rejected';
        item.errorNotice = `Order ${item.orderId} was reassigned or cancelled by Super Admin while offline. Action "${item.actionType}" could not be applied.`;
        
        // Add blocking notice to order
        const targetOrder = this.deliveries.find((d) => d.id === item.orderId);
        if (targetOrder) {
          targetOrder.rejectionNotice = {
            title: 'Sync Conflict / Reassigned Order',
            message: item.errorNotice,
            timestamp: Date.now(),
          };
          this.saveDeliveries();
        }
      } else {
        item.status = 'synced';
      }
    }

    this.outbox = updatedOutbox;
    this.isSyncing = false;
    this.saveOutbox();
    this.notify();
  }

  public dismissRejectionNotice(orderId: string) {
    const targetOrder = this.deliveries.find((d) => d.id === orderId);
    if (targetOrder) {
      delete targetOrder.rejectionNotice;
      this.saveDeliveries();
    }
    // Also remove from rejected outbox items
    this.outbox = this.outbox.filter((item) => !(item.orderId === orderId && item.status === 'rejected'));
    this.saveOutbox();
    this.notify();
  }

  public dismissOutboxItem(itemId: string) {
    this.outbox = this.outbox.filter((item) => item.id !== itemId);
    this.saveOutbox();
    this.notify();
  }

  public clearAllSyncedOutbox() {
    this.outbox = this.outbox.filter((item) => item.status !== 'synced');
    this.saveOutbox();
    this.notify();
  }

  // Hard Reset / Cache Purge for PHI on Logout
  public purgeLocalDriverData() {
    try {
      localStorage.removeItem(OUTBOX_STORAGE_KEY);
      localStorage.removeItem(DELIVERIES_STORAGE_KEY);
      localStorage.removeItem(NETWORK_OVERRIDE_KEY);
      this.outbox = [];
      this.deliveries = [...SEED_DRIVER_ORDERS];
      this.notify();
    } catch (e) {
      console.error('Failed to purge driver cache:', e);
    }
  }

  public resetToSeed() {
    this.deliveries = [...SEED_DRIVER_ORDERS];
    this.outbox = [];
    this.saveDeliveries();
    this.saveOutbox();
    this.notify();
  }
}

export const driverSyncService = new DriverSyncService();
