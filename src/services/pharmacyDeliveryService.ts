import type { DeliveryOrder } from '../types/delivery';
import { PHARMACY_TENANT } from '../mock/pharmacyMockData';

const PHARMACY_STORAGE_KEY = 'rahhawan_pharmacy_deliveries';

// Initial realistic dataset covering all statuses and flags
export const SEED_PHARMACY_DELIVERIES: DeliveryOrder[] = [
  {
    id: 'DEL-10062',
    patientSafeId: 'PT-99412',
    patientInitials: 'R.M.',
    patientName: 'Robert Martinez',
    phone: '+1 (312) 555-8910',
    specialInstructions: 'Ring doorbell twice. Building access code: #4820.',
    pharmacy: {
      id: PHARMACY_TENANT.id,
      name: PHARMACY_TENANT.name,
      code: PHARMACY_TENANT.code,
      location: PHARMACY_TENANT.address,
    },
    flags: { controlled: true, refrigerated: false, rush: true },
    status: 'Submitted',
    lastUpdated: '5m ago',
    lastUpdatedTimestamp: Date.now() - 5 * 60 * 1000,
    createdAt: 'Today, 11:15 AM',
    createdAtTimestamp: Date.now() - 30 * 60 * 1000,
    deliveryAddress: {
      street: '1420 S Michigan Ave',
      apt: 'Unit 12B',
      city: 'Chicago',
      state: 'IL',
      zip: '60605',
    },
    prescriptionSummary: {
      itemCount: 2,
      description: 'Oxycodone-Acetaminophen 10/325mg (Schedule II)',
      rxNumbers: ['RX-884091', 'RX-884092'],
      schedule: 'Schedule II',
    },
    slaWindow: { start: '11:45 AM', end: '01:15 PM', isNearBreach: false },
    timeline: [
      { id: 'e1', status: 'Submitted', title: 'Order Submitted by Pharmacy', timestamp: 'Today, 11:15 AM', actor: 'Dr. James Hartwell', actorType: 'pharmacy', note: 'Chain-of-custody protocol acknowledged at creation.' },
    ],
  },
  {
    id: 'DEL-10061',
    patientSafeId: 'PT-88310',
    patientInitials: 'S.K.',
    patientName: 'Sarah Kowalski',
    phone: '+1 (312) 555-3344',
    specialInstructions: 'Leave in refrigerated bag with doorman if not home.',
    pharmacy: {
      id: PHARMACY_TENANT.id,
      name: PHARMACY_TENANT.name,
      code: PHARMACY_TENANT.code,
      location: PHARMACY_TENANT.address,
    },
    flags: { controlled: false, refrigerated: true, rush: false },
    status: 'Accepted',
    lastUpdated: '12m ago',
    lastUpdatedTimestamp: Date.now() - 12 * 60 * 1000,
    createdAt: 'Today, 10:45 AM',
    createdAtTimestamp: Date.now() - 60 * 60 * 1000,
    deliveryAddress: {
      street: '3200 N Lake Shore Dr',
      apt: 'Apt 14F',
      city: 'Chicago',
      state: 'IL',
      zip: '60657',
    },
    prescriptionSummary: {
      itemCount: 1,
      description: 'Lantus SoloStar Insulin 100 U/mL (Cold Chain 2°C - 8°C)',
      rxNumbers: ['RX-884080'],
    },
    slaWindow: { start: '11:30 AM', end: '02:30 PM' },
    timeline: [
      { id: 'e1', status: 'Accepted', title: 'Order Accepted by Rahhawan Operations', timestamp: 'Today, 10:55 AM', actor: 'Dispatch Engine', actorType: 'system', note: 'Cold-chain delivery queue allocated.' },
      { id: 'e2', status: 'Submitted', title: 'Order Submitted by Pharmacy', timestamp: 'Today, 10:45 AM', actor: 'Dr. James Hartwell', actorType: 'pharmacy' },
    ],
  },
  {
    id: 'DEL-10058',
    patientSafeId: 'PT-77190',
    patientInitials: 'E.D.',
    patientName: 'Elena Davies',
    phone: '+1 (312) 555-7721',
    specialInstructions: 'Gate code #9011. Direct handoff required.',
    pharmacy: {
      id: PHARMACY_TENANT.id,
      name: PHARMACY_TENANT.name,
      code: PHARMACY_TENANT.code,
      location: PHARMACY_TENANT.address,
    },
    flags: { controlled: true, refrigerated: false, rush: true },
    status: 'Driver Assigned',
    lastUpdated: '18m ago',
    lastUpdatedTimestamp: Date.now() - 18 * 60 * 1000,
    createdAt: 'Today, 10:15 AM',
    createdAtTimestamp: Date.now() - 90 * 60 * 1000,
    deliveryAddress: {
      street: '740 W Addison St',
      apt: 'Apt 3B',
      city: 'Chicago',
      state: 'IL',
      zip: '60613',
    },
    prescriptionSummary: {
      itemCount: 1,
      description: 'Adderall XR 25mg Capsules (Schedule II)',
      rxNumbers: ['RX-789014'],
      schedule: 'Schedule II',
    },
    slaWindow: { start: '11:00 AM', end: '01:00 PM' },
    timeline: [
      { id: 'e1', status: 'Driver Assigned', title: 'Dispatched to David Chen', timestamp: 'Today, 10:30 AM', actor: 'Auto-Dispatch', actorType: 'system', note: 'Schedule II certified driver confirmed.' },
      { id: 'e2', status: 'Accepted', title: 'Accepted by Operations', timestamp: 'Today, 10:20 AM', actor: 'System', actorType: 'system' },
      { id: 'e3', status: 'Submitted', title: 'Order Submitted by Pharmacy', timestamp: 'Today, 10:15 AM', actor: 'Dr. James Hartwell', actorType: 'pharmacy' },
    ],
    driver: {
      id: 'DRV-103',
      name: 'David Chen',
      phone: '+1 (555) 456-0123',
      vehicle: 'Ford Transit Connect',
      eta: '25 mins to pickup',
      status: 'on_shift',
    },
  },
  {
    id: 'DEL-10052',
    patientSafeId: 'PT-44810',
    patientInitials: 'R.K.',
    patientName: 'Richard King',
    phone: '+1 (312) 555-9922',
    specialInstructions: 'Patient is wheelchair accessible unit.',
    pharmacy: {
      id: PHARMACY_TENANT.id,
      name: PHARMACY_TENANT.name,
      code: PHARMACY_TENANT.code,
      location: PHARMACY_TENANT.address,
    },
    flags: { controlled: true, refrigerated: true, rush: false },
    status: 'Picked Up',
    lastUpdated: '25m ago',
    lastUpdatedTimestamp: Date.now() - 25 * 60 * 1000,
    createdAt: 'Today, 09:30 AM',
    createdAtTimestamp: Date.now() - 2 * 60 * 60 * 1000,
    deliveryAddress: {
      street: '1420 N University Ave',
      apt: 'Suite 405',
      city: 'Chicago',
      state: 'IL',
      zip: '60614',
    },
    prescriptionSummary: {
      itemCount: 2,
      description: 'Morphine Sulfate Oral Solution & Enoxaparin 40mg (Cold Chain)',
      rxNumbers: ['RX-908122', 'RX-908123'],
      schedule: 'Schedule II',
    },
    slaWindow: { start: '10:30 AM', end: '01:30 PM' },
    timeline: [
      { id: 'e1', status: 'Picked Up', title: 'Picked Up & Thermal Verified (4.1°C)', timestamp: 'Today, 10:20 AM', actor: 'Marcus Vance', actorType: 'driver', note: 'DEA Form 222 PKI token transferred.' },
      { id: 'e2', status: 'Driver Assigned', title: 'Dispatched to Marcus Vance', timestamp: 'Today, 09:45 AM', actor: 'Dispatch Engine', actorType: 'system' },
      { id: 'e3', status: 'Submitted', title: 'Order Submitted by Pharmacy', timestamp: 'Today, 09:30 AM', actor: 'Dr. James Hartwell', actorType: 'pharmacy' },
    ],
    driver: {
      id: 'DRV-101',
      name: 'Marcus Vance',
      phone: '+1 (555) 234-8901',
      vehicle: 'Toyota Prius (Eco Refrigerated Box)',
      eta: '30 mins',
      status: 'delivering',
    },
    temperatureLog: [
      { time: '10:20 AM', temp: 4.1, status: 'nominal' },
    ],
  },
  {
    id: 'DEL-10045',
    patientSafeId: 'PT-33109',
    patientInitials: 'M.J.',
    patientName: 'Michael Jordan',
    phone: '+1 (312) 555-1100',
    specialInstructions: 'Call upon arrival.',
    pharmacy: {
      id: PHARMACY_TENANT.id,
      name: PHARMACY_TENANT.name,
      code: PHARMACY_TENANT.code,
      location: PHARMACY_TENANT.address,
    },
    flags: { controlled: false, refrigerated: true, rush: true },
    status: 'En Route',
    lastUpdated: '5m ago',
    lastUpdatedTimestamp: Date.now() - 5 * 60 * 1000,
    createdAt: 'Today, 09:10 AM',
    createdAtTimestamp: Date.now() - 3 * 60 * 60 * 1000,
    deliveryAddress: {
      street: '2240 N Clark St',
      apt: 'Unit 12',
      city: 'Chicago',
      state: 'IL',
      zip: '60614',
    },
    prescriptionSummary: {
      itemCount: 1,
      description: 'Humira 40mg/0.8mL Pen — Cold Chain Active',
      rxNumbers: ['RX-770430'],
    },
    slaWindow: { start: '10:00 AM', end: '12:30 PM', isNearBreach: true, urgentTimeLeft: '22m left' },
    timeline: [
      { id: 'e1', status: 'En Route', title: 'En Route to Patient — ETA 15 min', timestamp: 'Today, 10:40 AM', actor: 'Elena Rostova', actorType: 'driver', note: 'Live cold sensor: 3.8°C.' },
      { id: 'e2', status: 'Picked Up', title: 'Picked Up from Pharmacy', timestamp: 'Today, 10:15 AM', actor: 'Elena Rostova', actorType: 'driver', note: 'Thermal check passed: 3.5°C.' },
      { id: 'e3', status: 'Driver Assigned', title: 'Dispatched to Elena Rostova', timestamp: 'Today, 09:30 AM', actor: 'System', actorType: 'system' },
      { id: 'e4', status: 'Submitted', title: 'Order Submitted by Pharmacy', timestamp: 'Today, 09:10 AM', actor: 'Dr. James Hartwell', actorType: 'pharmacy' },
    ],
    driver: {
      id: 'DRV-102',
      name: 'Elena Rostova',
      phone: '+1 (555) 345-9012',
      vehicle: 'Honda CR-V (Refrigerated Box)',
      eta: '15 mins',
      status: 'delivering',
    },
    temperatureLog: [
      { time: '10:15 AM', temp: 3.5, status: 'nominal' },
      { time: '10:30 AM', temp: 3.6, status: 'nominal' },
      { time: '10:45 AM', temp: 3.8, status: 'nominal' },
    ],
  },
  {
    id: 'DEL-10042',
    patientSafeId: 'PT-55210',
    patientInitials: 'A.R.',
    patientName: 'Antonio Rodriguez',
    phone: '+1 (312) 555-4819',
    specialInstructions: 'Check government ID before handoff.',
    pharmacy: {
      id: PHARMACY_TENANT.id,
      name: PHARMACY_TENANT.name,
      code: PHARMACY_TENANT.code,
      location: PHARMACY_TENANT.address,
    },
    flags: { controlled: true, refrigerated: false, rush: false },
    status: 'Delivered',
    lastUpdated: '45m ago',
    lastUpdatedTimestamp: Date.now() - 45 * 60 * 1000,
    createdAt: 'Today, 08:30 AM',
    createdAtTimestamp: Date.now() - 4 * 60 * 60 * 1000,
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
      { id: 'e1', status: 'Delivered', title: 'Delivered — Signature & ID Verified', timestamp: 'Today, 10:48 AM', actor: 'Marcus Vance', actorType: 'driver', note: 'Recipient signed on screen. ID verification #AR-9921.' },
      { id: 'e2', status: 'En Route', title: 'En Route to Patient', timestamp: 'Today, 10:10 AM', actor: 'Marcus Vance', actorType: 'driver' },
      { id: 'e3', status: 'Picked Up', title: 'Picked Up from Pharmacy', timestamp: 'Today, 09:40 AM', actor: 'Marcus Vance', actorType: 'driver' },
      { id: 'e4', status: 'Driver Assigned', title: 'Dispatched to Marcus Vance', timestamp: 'Today, 09:00 AM', actor: 'System', actorType: 'system' },
      { id: 'e5', status: 'Submitted', title: 'Order Submitted by Pharmacy', timestamp: 'Today, 08:30 AM', actor: 'Dr. James Hartwell', actorType: 'pharmacy' },
    ],
    driver: {
      id: 'DRV-101',
      name: 'Marcus Vance',
      phone: '+1 (555) 234-8901',
      vehicle: 'Toyota Prius (Eco)',
      status: 'on_shift',
    },
    proofOfDelivery: {
      recipientName: 'A. Rodriguez',
      signedAt: 'Today, 10:48 AM',
      signatureSvgPath: 'M10,80 Q52,10 95,80 T180,80',
      photoUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=60',
      photoCaption: 'Front door direct handoff — government photo ID verified',
      temperatureCelsius: 21.8,
      tempSafeMin: 15,
      tempSafeMax: 30,
      tempLog: [
        { time: '09:40 AM', temp: 21.2 },
        { time: '10:10 AM', temp: 21.5 },
        { time: '10:48 AM', temp: 21.8 },
      ],
      cocHash: 'sha256-ab9f2e379c44d18080f331bb890c48e89f182',
    },
  },
  {
    id: 'DEL-10039',
    patientSafeId: 'PT-99102',
    patientInitials: 'R.D.',
    patientName: 'Rosa Diaz',
    phone: '+1 (312) 555-6677',
    specialInstructions: 'Controlled substance dual sign-off required.',
    pharmacy: {
      id: PHARMACY_TENANT.id,
      name: PHARMACY_TENANT.name,
      code: PHARMACY_TENANT.code,
      location: PHARMACY_TENANT.address,
    },
    flags: { controlled: true, refrigerated: true, rush: false },
    status: 'Chain of Custody Confirmed',
    lastUpdated: '1h ago',
    lastUpdatedTimestamp: Date.now() - 60 * 60 * 1000,
    createdAt: 'Today, 07:30 AM',
    createdAtTimestamp: Date.now() - 5 * 60 * 60 * 1000,
    deliveryAddress: {
      street: '2200 N Clybourn Ave',
      apt: 'Suite 4',
      city: 'Chicago',
      state: 'IL',
      zip: '60614',
    },
    prescriptionSummary: {
      itemCount: 1,
      description: 'Fentanyl Transdermal Patch 25mcg/h — Controlled & Cold Chain',
      rxNumbers: ['RX-770412'],
      schedule: 'Schedule II',
    },
    slaWindow: { start: '08:30 AM', end: '11:30 AM' },
    timeline: [
      { id: 'e1', status: 'Chain of Custody Confirmed', title: 'Cryptographic CoC Hash Confirmed', timestamp: 'Today, 10:15 AM', actor: 'Compliance Audit Engine', actorType: 'system', note: 'Dual PKI signatures reconciled against DEA registry.' },
      { id: 'e2', status: 'Delivered', title: 'Delivered to Recipient', timestamp: 'Today, 10:12 AM', actor: 'Marcus Vance', actorType: 'driver', note: 'Signed by R. Diaz. Temp at delivery 4.9°C.' },
      { id: 'e3', status: 'En Route', title: 'En Route to Patient', timestamp: 'Today, 09:30 AM', actor: 'Marcus Vance', actorType: 'driver' },
      { id: 'e4', status: 'Picked Up', title: 'Picked Up from Pharmacy', timestamp: 'Today, 09:00 AM', actor: 'Marcus Vance', actorType: 'driver' },
      { id: 'e5', status: 'Driver Assigned', title: 'Dispatched to Marcus Vance', timestamp: 'Today, 08:00 AM', actor: 'System', actorType: 'system' },
      { id: 'e6', status: 'Submitted', title: 'Order Submitted by Pharmacy', timestamp: 'Today, 07:30 AM', actor: 'Dr. James Hartwell', actorType: 'pharmacy' },
    ],
    driver: {
      id: 'DRV-101',
      name: 'Marcus Vance',
      phone: '+1 (555) 234-8901',
      vehicle: 'Toyota Prius (Eco Refrigerated Box)',
      status: 'on_shift',
    },
    proofOfDelivery: {
      recipientName: 'R. Diaz',
      signedAt: 'Today, 10:12 AM',
      signatureSvgPath: 'M10,60 Q50,15 90,60 T160,55',
      photoUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&auto=format&fit=crop&q=60',
      photoCaption: 'Direct handoff to patient — signature and biometric ID match',
      temperatureCelsius: 4.9,
      tempSafeMin: 2,
      tempSafeMax: 8,
      tempLog: [
        { time: '09:00 AM', temp: 4.2 },
        { time: '09:35 AM', temp: 4.6 },
        { time: '10:12 AM', temp: 4.9 },
      ],
      cocHash: 'sha256-f2c8919029ea42d881903bcde110488f82190',
    },
  },
  {
    id: 'DEL-10035',
    patientSafeId: 'PT-11029',
    patientInitials: 'K.L.',
    patientName: 'Kevin Lawson',
    phone: '+1 (312) 555-4433',
    specialInstructions: 'Maintenance shipment monthly.',
    pharmacy: {
      id: PHARMACY_TENANT.id,
      name: PHARMACY_TENANT.name,
      code: PHARMACY_TENANT.code,
      location: PHARMACY_TENANT.address,
    },
    flags: { controlled: false, refrigerated: false, rush: false },
    status: 'Completed',
    lastUpdated: '3h ago',
    lastUpdatedTimestamp: Date.now() - 3 * 60 * 60 * 1000,
    createdAt: 'Yesterday, 02:00 PM',
    createdAtTimestamp: Date.now() - 22 * 60 * 60 * 1000,
    deliveryAddress: {
      street: '5540 S Woodlawn Ave',
      apt: 'Unit 3',
      city: 'Chicago',
      state: 'IL',
      zip: '60637',
    },
    prescriptionSummary: {
      itemCount: 3,
      description: 'Metformin 500mg, Lisinopril 10mg, Atorvastatin 20mg',
      rxNumbers: ['RX-770401', 'RX-770402', 'RX-770403'],
    },
    slaWindow: { start: 'Yesterday, 03:00 PM', end: 'Yesterday, 06:00 PM' },
    timeline: [
      { id: 'e1', status: 'Completed', title: 'Delivery Archived & Reconciled', timestamp: 'Today, 08:00 AM', actor: 'Billing Engine', actorType: 'system', note: 'Invoice line item logged.' },
      { id: 'e2', status: 'Delivered', title: 'Delivered to Recipient', timestamp: 'Yesterday, 04:30 PM', actor: 'David Chen', actorType: 'driver' },
      { id: 'e3', status: 'En Route', title: 'En Route', timestamp: 'Yesterday, 03:45 PM', actor: 'David Chen', actorType: 'driver' },
      { id: 'e4', status: 'Picked Up', title: 'Picked Up from Pharmacy', timestamp: 'Yesterday, 03:15 PM', actor: 'David Chen', actorType: 'driver' },
      { id: 'e5', status: 'Submitted', title: 'Order Submitted', timestamp: 'Yesterday, 02:00 PM', actor: 'Dr. James Hartwell', actorType: 'pharmacy' },
    ],
    driver: {
      id: 'DRV-103',
      name: 'David Chen',
      phone: '+1 (555) 456-0123',
      vehicle: 'Ford Transit Connect',
      status: 'on_shift',
    },
    proofOfDelivery: {
      recipientName: 'K. Lawson',
      signedAt: 'Yesterday, 04:30 PM',
      signatureSvgPath: 'M5,50 C30,10 70,90 95,50',
      photoUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=60',
      photoCaption: 'Delivered to front desk reception',
      temperatureCelsius: 20.5,
      tempSafeMin: 15,
      tempSafeMax: 30,
      tempLog: [],
      cocHash: 'sha256-ee0192837bc9029a8f21900119',
    },
  },
  {
    id: 'DEL-10038',
    patientSafeId: 'PT-11950',
    patientInitials: 'B.W.',
    patientName: 'Brian Wallace',
    phone: '+1 (312) 555-8811',
    specialInstructions: 'Call patient before approaching house.',
    pharmacy: {
      id: PHARMACY_TENANT.id,
      name: PHARMACY_TENANT.name,
      code: PHARMACY_TENANT.code,
      location: PHARMACY_TENANT.address,
    },
    flags: { controlled: false, refrigerated: false, rush: false },
    status: 'Failed',
    lastUpdated: '2h ago',
    lastUpdatedTimestamp: Date.now() - 2 * 60 * 60 * 1000,
    createdAt: 'Today, 07:45 AM',
    createdAtTimestamp: Date.now() - 6 * 60 * 60 * 1000,
    deliveryAddress: {
      street: '2940 W Fullerton Ave',
      city: 'Chicago',
      state: 'IL',
      zip: '60647',
    },
    prescriptionSummary: {
      itemCount: 1,
      description: 'Omeprazole 20mg Delayed-Release Capsules',
      rxNumbers: ['RX-770410'],
    },
    slaWindow: { start: '08:30 AM', end: '11:30 AM' },
    timeline: [
      { id: 'e1', status: 'Failed', title: 'Delivery Failed — Patient Not Available', timestamp: 'Today, 09:50 AM', actor: 'Tariq Al-Mansoor', actorType: 'driver', note: 'Attempted delivery twice. No response at door. Door hanger notice left.' },
      { id: 'e2', status: 'En Route', title: 'En Route to Patient', timestamp: 'Today, 09:15 AM', actor: 'Tariq Al-Mansoor', actorType: 'driver' },
      { id: 'e3', status: 'Picked Up', title: 'Picked Up from Pharmacy', timestamp: 'Today, 08:45 AM', actor: 'Tariq Al-Mansoor', actorType: 'driver' },
      { id: 'e4', status: 'Submitted', title: 'Order Submitted', timestamp: 'Today, 07:45 AM', actor: 'Dr. James Hartwell', actorType: 'pharmacy' },
    ],
    driver: {
      id: 'DRV-105',
      name: 'Tariq Al-Mansoor',
      phone: '+1 (555) 678-2345',
      vehicle: 'Subaru Outback',
      status: 'on_shift',
    },
    attentionReason: 'Patient not available — returned to secure depot',
    attentionType: 'failed',
  },
  {
    id: 'DEL-10031',
    patientSafeId: 'PT-33019',
    patientInitials: 'M.P.',
    patientName: 'Marcus Patterson',
    phone: '+1 (312) 555-2231',
    specialInstructions: 'Patient requested cancellation prior to dispatch.',
    pharmacy: {
      id: PHARMACY_TENANT.id,
      name: PHARMACY_TENANT.name,
      code: PHARMACY_TENANT.code,
      location: PHARMACY_TENANT.address,
    },
    flags: { controlled: false, refrigerated: false, rush: false },
    status: 'Cancelled',
    lastUpdated: '4h ago',
    lastUpdatedTimestamp: Date.now() - 4 * 60 * 60 * 1000,
    createdAt: 'Today, 07:00 AM',
    createdAtTimestamp: Date.now() - 6.5 * 60 * 60 * 1000,
    deliveryAddress: {
      street: '1855 W Division St',
      apt: 'Floor 2',
      city: 'Chicago',
      state: 'IL',
      zip: '60622',
    },
    prescriptionSummary: {
      itemCount: 1,
      description: 'Amoxicillin 250mg Suspension',
      rxNumbers: ['RX-770388'],
    },
    slaWindow: { start: '08:00 AM', end: '11:00 AM' },
    timeline: [
      { id: 'e1', status: 'Cancelled', title: 'Order Cancelled by Pharmacy Staff', timestamp: 'Today, 07:25 AM', actor: 'Dr. James Hartwell', actorType: 'pharmacy', note: 'Patient called in to pick up prescription in store.' },
      { id: 'e2', status: 'Submitted', title: 'Order Submitted', timestamp: 'Today, 07:00 AM', actor: 'Dr. James Hartwell', actorType: 'pharmacy' },
    ],
    cancellationReason: 'Cancelled by pharmacy — patient opted for in-store pickup',
  },
];

type PharmacyListener = () => void;

class PharmacyDeliveryService {
  private deliveries: DeliveryOrder[] = [];
  private listeners: Set<PharmacyListener> = new Set();

  constructor() {
    this.loadDeliveries();
  }

  private loadDeliveries() {
    try {
      const stored = localStorage.getItem(PHARMACY_STORAGE_KEY);
      if (stored) {
        this.deliveries = JSON.parse(stored);
      } else {
        this.deliveries = [...SEED_PHARMACY_DELIVERIES];
        this.saveDeliveries();
      }
    } catch (e) {
      console.warn('Could not load pharmacy deliveries from storage:', e);
      this.deliveries = [...SEED_PHARMACY_DELIVERIES];
    }
  }

  private saveDeliveries() {
    try {
      localStorage.setItem(PHARMACY_STORAGE_KEY, JSON.stringify(this.deliveries));
    } catch (e) {
      console.error('Error saving pharmacy deliveries:', e);
    }
  }

  public subscribe(listener: PharmacyListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public getDeliveries(): DeliveryOrder[] {
    return [...this.deliveries];
  }

  public getOrderById(orderId: string): DeliveryOrder | undefined {
    return this.deliveries.find((d) => d.id === orderId);
  }

  public createOrder(params: {
    patientName: string;
    street: string;
    apt?: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    rxCount: number;
    specialInstructions?: string;
    isRush: boolean;
    isControlled: boolean;
    isRefrigerated: boolean;
    rxDescription?: string;
  }): DeliveryOrder {
    const rawInitials = params.patientName
      .trim()
      .split(/\s+/)
      .map((p) => p[0]?.toUpperCase() + '.')
      .join('');
    const patientInitials = rawInitials || 'P.N.';

    // Generate anonymous IDs
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderId = `DEL-${(10065 + Math.floor(Math.random() * 800)).toString()}`;
    const patientSafeId = `PT-${randomSuffix}`;

    const newOrder: DeliveryOrder = {
      id: orderId,
      patientSafeId,
      patientInitials,
      patientName: params.patientName,
      phone: params.phone,
      specialInstructions: params.specialInstructions,
      pharmacy: {
        id: PHARMACY_TENANT.id,
        name: PHARMACY_TENANT.name,
        code: PHARMACY_TENANT.code,
        location: PHARMACY_TENANT.address,
      },
      flags: {
        controlled: params.isControlled,
        refrigerated: params.isRefrigerated,
        rush: params.isRush,
      },
      status: 'Submitted',
      lastUpdated: 'Just now',
      lastUpdatedTimestamp: Date.now(),
      createdAt: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAtTimestamp: Date.now(),
      deliveryAddress: {
        street: params.street,
        apt: params.apt,
        city: params.city,
        state: params.state,
        zip: params.zip,
      },
      prescriptionSummary: {
        itemCount: params.rxCount,
        description: params.rxDescription || (params.isControlled
          ? 'Controlled Schedule II Medication'
          : params.isRefrigerated
          ? 'Refrigerated Biologic / Cold Chain Prescription'
          : 'Prescription Medication Handoff'),
        rxNumbers: Array.from({ length: params.rxCount }, (_, i) => `RX-${Math.floor(770500 + Math.random() * 500 + i)}`),
        schedule: params.isControlled ? 'Schedule II' : undefined,
      },
      slaWindow: {
        start: new Date(Date.now() + 30 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        end: new Date(Date.now() + (params.isRush ? 2 : 4) * 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      timeline: [
        {
          id: `tl_${Date.now()}`,
          status: 'Submitted',
          title: 'Order Submitted by Pharmacy Staff',
          timestamp: 'Just now',
          actor: 'Dr. James Hartwell',
          actorType: 'pharmacy',
          note: params.isControlled
            ? 'DEA chain-of-custody acknowledgment confirmed before submission.'
            : 'Standard dispatch queue initialized.',
        },
      ],
    };

    this.deliveries.unshift(newOrder);
    this.saveDeliveries();
    this.notify();
    return newOrder;
  }

  public cancelOrder(orderId: string, reason = 'Cancelled by pharmacy staff before pickup'): boolean {
    const orderIndex = this.deliveries.findIndex((d) => d.id === orderId);
    if (orderIndex === -1) return false;

    const order = this.deliveries[orderIndex];
    // Can only cancel before pickup
    if (order.status !== 'Submitted' && order.status !== 'Accepted' && order.status !== 'Driver Assigned') {
      return false;
    }

    const updatedOrder: DeliveryOrder = {
      ...order,
      status: 'Cancelled',
      lastUpdated: 'Just now',
      lastUpdatedTimestamp: Date.now(),
      cancellationReason: reason,
      timeline: [
        {
          id: `tl_${Date.now()}`,
          status: 'Cancelled',
          title: 'Order Cancelled by Pharmacy',
          timestamp: 'Just now',
          actor: 'Dr. James Hartwell',
          actorType: 'pharmacy',
          note: reason,
        },
        ...order.timeline,
      ],
    };

    this.deliveries[orderIndex] = updatedOrder;
    this.saveDeliveries();
    this.notify();
    return true;
  }

  public resetToMockData() {
    this.deliveries = [...SEED_PHARMACY_DELIVERIES];
    this.saveDeliveries();
    this.notify();
  }
}

export const pharmacyDeliveryService = new PharmacyDeliveryService();
