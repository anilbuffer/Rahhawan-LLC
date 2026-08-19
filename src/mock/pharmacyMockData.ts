import type { DeliveryOrder } from '../types/delivery';

// ── Tenant Info ──────────────────────────────────────────────
export const PHARMACY_TENANT = {
  id: 'PHARM-MFP-01',
  name: 'Meridian Family Pharmacy',
  code: 'MFP',
  address: '2815 Oakwood Blvd, Suite 110, Chicago, IL 60653',
  phone: '+1 (312) 555-0142',
  deaLicense: 'DN-7741820-B',
  npi: '1234567890',
};

export const PHARMACY_STAFF = {
  id: 'USR-PH-001',
  name: 'Dr. James Hartwell',
  email: 'j.hartwell@meridianfamilyrx.com',
  role: 'Pharmacy Admin',
  initials: 'JH',
  mfaEnabled: true,
};

// ── Pharmacy Notifications ───────────────────────────────────
export const PHARMACY_NOTIFICATIONS = [
  {
    id: 'pn1',
    title: 'Delivery Proof Received',
    description: 'Signature and photo proof captured for DEL-10042. Chain of custody confirmed.',
    time: '12m ago',
    type: 'info' as const,
    link: '/pharmacy/deliveries',
    unread: true,
  },
  {
    id: 'pn2',
    title: 'Order Status: En Route',
    description: 'DEL-10045 picked up by Marcus Vance. ETA 22 minutes.',
    time: '28m ago',
    type: 'info' as const,
    link: '/pharmacy/deliveries',
    unread: true,
  },
  {
    id: 'pn3',
    title: 'Delivery Failed',
    description: 'DEL-10038 marked Failed — Patient not available. Action required.',
    time: '1h ago',
    type: 'warning' as const,
    link: '/pharmacy/deliveries',
    unread: true,
  },
  {
    id: 'pn4',
    title: 'Invoice Generated',
    description: 'Invoice INV-MFP-2026-08 generated for Aug 01–15 billing period.',
    time: '3h ago',
    type: 'info' as const,
    link: '/pharmacy/billing',
    unread: false,
  },
];

// ── Pharmacy Delivery Orders ─────────────────────────────────
export const PHARMACY_DELIVERIES: DeliveryOrder[] = [
  {
    id: 'DEL-10042',
    patientSafeId: 'PT-55210',
    patientInitials: 'A.R.',
    pharmacy: {
      id: PHARMACY_TENANT.id,
      name: PHARMACY_TENANT.name,
      code: PHARMACY_TENANT.code,
      location: PHARMACY_TENANT.address,
    },
    flags: { controlled: true, refrigerated: false, rush: false },
    status: 'Delivered',
    lastUpdated: '12m ago',
    lastUpdatedTimestamp: Date.now() - 12 * 60 * 1000,
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
      { id: 'e1', status: 'Delivered', title: 'Delivered — Signature captured', timestamp: '12m ago', actor: 'Marcus Vance', actorType: 'driver', note: 'Patient verified via photo ID. Signature captured on device.' },
      { id: 'e2', status: 'En Route', title: 'En route to patient', timestamp: '45m ago', actor: 'Marcus Vance', actorType: 'driver' },
      { id: 'e3', status: 'Picked Up', title: 'Picked up from pharmacy', timestamp: '1h ago', actor: 'Marcus Vance', actorType: 'driver', note: 'Chain of custody acknowledged at pickup.' },
      { id: 'e4', status: 'Driver Assigned', title: 'Dispatched to Marcus Vance', timestamp: '1h 15m ago', actor: 'System', actorType: 'system' },
      { id: 'e5', status: 'Submitted', title: 'Order submitted by pharmacy', timestamp: 'Today, 08:30 AM', actor: 'Dr. James Hartwell', actorType: 'pharmacy' },
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
      photoUrl: '',
      photoCaption: 'Front door delivery — patient verified',
      temperatureCelsius: 22,
      tempSafeMin: 15,
      tempSafeMax: 30,
      tempLog: [
        { time: '10:05 AM', temp: 21 },
        { time: '10:25 AM', temp: 22 },
        { time: '10:48 AM', temp: 22 },
      ],
      cocHash: 'sha256-ab9f2e…c74d1',
    },
  },
  {
    id: 'DEL-10045',
    patientSafeId: 'PT-33109',
    patientInitials: 'M.J.',
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
      description: 'Insulin Glargine 100 units/mL — Cold Chain Required',
      rxNumbers: ['RX-770430'],
      schedule: undefined,
    },
    slaWindow: { start: '10:00 AM', end: '01:00 PM', isNearBreach: false },
    timeline: [
      { id: 'e1', status: 'En Route', title: 'En route to patient — ETA 22 min', timestamp: '5m ago', actor: 'Elena Rostova', actorType: 'driver', note: 'Temperature at pickup: 3.2°C — within range.' },
      { id: 'e2', status: 'Picked Up', title: 'Picked up from pharmacy', timestamp: '28m ago', actor: 'Elena Rostova', actorType: 'driver', note: 'Cold chain verified at pickup.' },
      { id: 'e3', status: 'Driver Assigned', title: 'Dispatched to Elena Rostova', timestamp: '40m ago', actor: 'System', actorType: 'system', note: 'Refrigerated-capable vehicle confirmed.' },
      { id: 'e4', status: 'Submitted', title: 'Order submitted by pharmacy', timestamp: 'Today, 09:10 AM', actor: 'Dr. James Hartwell', actorType: 'pharmacy' },
    ],
    driver: {
      id: 'DRV-102',
      name: 'Elena Rostova',
      phone: '+1 (555) 345-9012',
      vehicle: 'Honda CR-V (Refrigerated Box)',
      eta: '22 mins',
      status: 'delivering',
    },
    temperatureLog: [
      { time: '09:42 AM', temp: 3.2, status: 'nominal' },
      { time: '09:55 AM', temp: 3.5, status: 'nominal' },
      { time: '10:08 AM', temp: 3.8, status: 'nominal' },
    ],
  },
  {
    id: 'DEL-10046',
    patientSafeId: 'PT-22018',
    patientInitials: 'S.K.',
    pharmacy: {
      id: PHARMACY_TENANT.id,
      name: PHARMACY_TENANT.name,
      code: PHARMACY_TENANT.code,
      location: PHARMACY_TENANT.address,
    },
    flags: { controlled: false, refrigerated: false, rush: false },
    status: 'Submitted',
    lastUpdated: '20m ago',
    lastUpdatedTimestamp: Date.now() - 20 * 60 * 1000,
    createdAt: 'Today, 09:40 AM',
    createdAtTimestamp: Date.now() - 4.5 * 60 * 60 * 1000,
    deliveryAddress: {
      street: '5540 S Woodlawn Ave',
      city: 'Chicago',
      state: 'IL',
      zip: '60637',
    },
    prescriptionSummary: {
      itemCount: 3,
      description: 'Metformin 500mg, Lisinopril 10mg, Atorvastatin 20mg',
      rxNumbers: ['RX-770435', 'RX-770436', 'RX-770437'],
    },
    slaWindow: { start: '11:00 AM', end: '02:00 PM' },
    timeline: [
      { id: 'e1', status: 'Submitted', title: 'Order submitted by pharmacy', timestamp: 'Today, 09:40 AM', actor: 'Dr. James Hartwell', actorType: 'pharmacy' },
    ],
  },
  {
    id: 'DEL-10047',
    patientSafeId: 'PT-44821',
    patientInitials: 'L.P.',
    pharmacy: {
      id: PHARMACY_TENANT.id,
      name: PHARMACY_TENANT.name,
      code: PHARMACY_TENANT.code,
      location: PHARMACY_TENANT.address,
    },
    flags: { controlled: true, refrigerated: false, rush: true },
    status: 'Driver Assigned',
    lastUpdated: '8m ago',
    lastUpdatedTimestamp: Date.now() - 8 * 60 * 1000,
    createdAt: 'Today, 09:05 AM',
    createdAtTimestamp: Date.now() - 5.2 * 60 * 60 * 1000,
    deliveryAddress: {
      street: '1855 W Division St',
      apt: 'Floor 2',
      city: 'Chicago',
      state: 'IL',
      zip: '60622',
    },
    prescriptionSummary: {
      itemCount: 1,
      description: 'Adderall XR 20mg Capsules (Schedule II)',
      rxNumbers: ['RX-770440'],
      schedule: 'Schedule II',
    },
    slaWindow: { start: '10:30 AM', end: '01:30 PM' },
    timeline: [
      { id: 'e1', status: 'Driver Assigned', title: 'Dispatched to David Chen', timestamp: '8m ago', actor: 'System', actorType: 'system', note: 'Schedule II authorized driver confirmed.' },
      { id: 'e2', status: 'Submitted', title: 'Order submitted by pharmacy', timestamp: 'Today, 09:05 AM', actor: 'Dr. James Hartwell', actorType: 'pharmacy' },
    ],
    driver: {
      id: 'DRV-103',
      name: 'David Chen',
      phone: '+1 (555) 456-0123',
      vehicle: 'Ford Transit Connect',
      eta: '35 mins',
      status: 'on_shift',
    },
  },
  {
    id: 'DEL-10038',
    patientSafeId: 'PT-11950',
    patientInitials: 'B.W.',
    pharmacy: {
      id: PHARMACY_TENANT.id,
      name: PHARMACY_TENANT.name,
      code: PHARMACY_TENANT.code,
      location: PHARMACY_TENANT.address,
    },
    flags: { controlled: false, refrigerated: false, rush: false },
    status: 'Failed',
    lastUpdated: '1h ago',
    lastUpdatedTimestamp: Date.now() - 60 * 60 * 1000,
    createdAt: 'Today, 07:45 AM',
    createdAtTimestamp: Date.now() - 8 * 60 * 60 * 1000,
    deliveryAddress: {
      street: '2940 W Fullerton Ave',
      city: 'Chicago',
      state: 'IL',
      zip: '60647',
    },
    prescriptionSummary: {
      itemCount: 1,
      description: 'Omeprazole 20mg Capsules',
      rxNumbers: ['RX-770410'],
    },
    slaWindow: { start: '08:30 AM', end: '11:30 AM' },
    timeline: [
      { id: 'e1', status: 'Failed', title: 'Delivery failed — Patient not available', timestamp: '1h ago', actor: 'Tariq Al-Mansoor', actorType: 'driver', note: 'Attempted delivery twice. No response at door. Left door tag notice.' },
      { id: 'e2', status: 'En Route', title: 'En route to patient', timestamp: '1h 30m ago', actor: 'Tariq Al-Mansoor', actorType: 'driver' },
      { id: 'e3', status: 'Picked Up', title: 'Picked up from pharmacy', timestamp: '2h ago', actor: 'Tariq Al-Mansoor', actorType: 'driver' },
      { id: 'e4', status: 'Driver Assigned', title: 'Dispatched to Tariq Al-Mansoor', timestamp: '2h 15m ago', actor: 'System', actorType: 'system' },
      { id: 'e5', status: 'Submitted', title: 'Order submitted by pharmacy', timestamp: 'Today, 07:45 AM', actor: 'Dr. James Hartwell', actorType: 'pharmacy' },
    ],
    driver: {
      id: 'DRV-105',
      name: 'Tariq Al-Mansoor',
      phone: '+1 (555) 678-2345',
      vehicle: 'Subaru Outback',
      status: 'on_shift',
    },
    attentionReason: 'Patient not available — delivery failed',
    attentionType: 'failed',
  },
  {
    id: 'DEL-10041',
    patientSafeId: 'PT-66742',
    patientInitials: 'C.N.',
    pharmacy: {
      id: PHARMACY_TENANT.id,
      name: PHARMACY_TENANT.name,
      code: PHARMACY_TENANT.code,
      location: PHARMACY_TENANT.address,
    },
    flags: { controlled: false, refrigerated: true, rush: false },
    status: 'Delivered',
    lastUpdated: '2h ago',
    lastUpdatedTimestamp: Date.now() - 2 * 60 * 60 * 1000,
    createdAt: 'Today, 07:00 AM',
    createdAtTimestamp: Date.now() - 9 * 60 * 60 * 1000,
    deliveryAddress: {
      street: '4100 N Marine Dr',
      apt: 'Apt 5F',
      city: 'Chicago',
      state: 'IL',
      zip: '60613',
    },
    prescriptionSummary: {
      itemCount: 1,
      description: 'Humira (Adalimumab) 40mg/0.8mL Pen — Cold Chain',
      rxNumbers: ['RX-770418'],
    },
    slaWindow: { start: '08:00 AM', end: '11:00 AM' },
    timeline: [
      { id: 'e1', status: 'Delivered', title: 'Delivered — Temperature verified', timestamp: '2h ago', actor: 'Elena Rostova', actorType: 'driver', note: 'Temp at delivery: 4.1°C — within 2-8°C range. Patient signed.' },
      { id: 'e2', status: 'En Route', title: 'En route to patient', timestamp: '2h 30m ago', actor: 'Elena Rostova', actorType: 'driver' },
      { id: 'e3', status: 'Picked Up', title: 'Picked up from pharmacy', timestamp: '3h ago', actor: 'Elena Rostova', actorType: 'driver', note: 'Temp at pickup: 3.8°C' },
      { id: 'e4', status: 'Driver Assigned', title: 'Dispatched to Elena Rostova', timestamp: '3h 15m ago', actor: 'System', actorType: 'system' },
      { id: 'e5', status: 'Submitted', title: 'Order submitted by pharmacy', timestamp: 'Today, 07:00 AM', actor: 'Dr. James Hartwell', actorType: 'pharmacy' },
    ],
    driver: {
      id: 'DRV-102',
      name: 'Elena Rostova',
      phone: '+1 (555) 345-9012',
      vehicle: 'Honda CR-V (Refrigerated Box)',
      status: 'on_shift',
    },
    proofOfDelivery: {
      recipientName: 'C. Nguyen',
      signedAt: 'Today, 09:02 AM',
      signatureSvgPath: 'M5,50 C30,10 70,90 95,50',
      photoUrl: '',
      photoCaption: 'Delivered to patient at door',
      temperatureCelsius: 4.1,
      tempSafeMin: 2,
      tempSafeMax: 8,
      tempLog: [
        { time: '08:05 AM', temp: 3.8 },
        { time: '08:30 AM', temp: 4.0 },
        { time: '09:02 AM', temp: 4.1 },
      ],
      cocHash: 'sha256-d4e1a2…f891b',
    },
    temperatureLog: [
      { time: '08:05 AM', temp: 3.8, status: 'nominal' },
      { time: '08:30 AM', temp: 4.0, status: 'nominal' },
      { time: '09:02 AM', temp: 4.1, status: 'nominal' },
    ],
  },
  {
    id: 'DEL-10048',
    patientSafeId: 'PT-88321',
    patientInitials: 'T.G.',
    pharmacy: {
      id: PHARMACY_TENANT.id,
      name: PHARMACY_TENANT.name,
      code: PHARMACY_TENANT.code,
      location: PHARMACY_TENANT.address,
    },
    flags: { controlled: false, refrigerated: false, rush: false },
    status: 'Submitted',
    lastUpdated: '10m ago',
    lastUpdatedTimestamp: Date.now() - 10 * 60 * 1000,
    createdAt: 'Today, 10:00 AM',
    createdAtTimestamp: Date.now() - 4 * 60 * 60 * 1000,
    deliveryAddress: {
      street: '6730 S Stony Island Ave',
      city: 'Chicago',
      state: 'IL',
      zip: '60649',
    },
    prescriptionSummary: {
      itemCount: 2,
      description: 'Amlodipine 5mg, Losartan 50mg',
      rxNumbers: ['RX-770450', 'RX-770451'],
    },
    slaWindow: { start: '11:30 AM', end: '03:00 PM' },
    timeline: [
      { id: 'e1', status: 'Submitted', title: 'Order submitted by pharmacy', timestamp: 'Today, 10:00 AM', actor: 'Dr. James Hartwell', actorType: 'pharmacy' },
    ],
  },
  {
    id: 'DEL-10039',
    patientSafeId: 'PT-99102',
    patientInitials: 'R.D.',
    pharmacy: {
      id: PHARMACY_TENANT.id,
      name: PHARMACY_TENANT.name,
      code: PHARMACY_TENANT.code,
      location: PHARMACY_TENANT.address,
    },
    flags: { controlled: true, refrigerated: true, rush: false },
    status: 'Delivered',
    lastUpdated: '3h ago',
    lastUpdatedTimestamp: Date.now() - 3 * 60 * 60 * 1000,
    createdAt: 'Yesterday, 02:15 PM',
    createdAtTimestamp: Date.now() - 24 * 60 * 60 * 1000,
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
    slaWindow: { start: '03:00 PM', end: '06:00 PM' },
    timeline: [
      { id: 'e1', status: 'Delivered', title: 'Delivered — CoC confirmed, temp verified', timestamp: '3h ago', actor: 'Marcus Vance', actorType: 'driver', note: 'Chain of custody fully confirmed. Temp 5.2°C at delivery.' },
      { id: 'e2', status: 'En Route', title: 'En route to patient', timestamp: '4h ago', actor: 'Marcus Vance', actorType: 'driver' },
      { id: 'e3', status: 'Picked Up', title: 'Picked up — CoC acknowledged', timestamp: '4h 30m ago', actor: 'Marcus Vance', actorType: 'driver', note: 'DEA 222 verified. Temp at pickup: 4.8°C' },
      { id: 'e4', status: 'Driver Assigned', title: 'Dispatched to Marcus Vance', timestamp: 'Yesterday, 02:30 PM', actor: 'System', actorType: 'system' },
      { id: 'e5', status: 'Submitted', title: 'Order submitted by pharmacy', timestamp: 'Yesterday, 02:15 PM', actor: 'Dr. James Hartwell', actorType: 'pharmacy' },
    ],
    driver: {
      id: 'DRV-101',
      name: 'Marcus Vance',
      phone: '+1 (555) 234-8901',
      vehicle: 'Toyota Prius (Eco)',
      status: 'on_shift',
    },
    proofOfDelivery: {
      recipientName: 'R. Diaz',
      signedAt: 'Yesterday, 05:12 PM',
      signatureSvgPath: 'M10,60 Q50,15 90,60',
      photoUrl: '',
      photoCaption: 'Controlled substance — ID verified, CoC signed',
      temperatureCelsius: 5.2,
      tempSafeMin: 2,
      tempSafeMax: 8,
      tempLog: [
        { time: '04:00 PM', temp: 4.8 },
        { time: '04:40 PM', temp: 5.0 },
        { time: '05:12 PM', temp: 5.2 },
      ],
      cocHash: 'sha256-f2c891…ea42d',
    },
    temperatureLog: [
      { time: '04:00 PM', temp: 4.8, status: 'nominal' },
      { time: '04:40 PM', temp: 5.0, status: 'nominal' },
      { time: '05:12 PM', temp: 5.2, status: 'nominal' },
    ],
  },
];

// ── Pharmacy Invoices ────────────────────────────────────────
export interface PharmacyInvoice {
  id: string;
  period: string;
  orderCount: number;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  dueDate: string;
  lineItems: {
    orderId: string;
    deliveryFee: number;
    surcharges: number;
    total: number;
  }[];
  paymentHistory: {
    date: string;
    event: string;
    amount?: number;
  }[];
}

export const PHARMACY_INVOICES: PharmacyInvoice[] = [
  {
    id: 'INV-MFP-2026-08',
    period: 'Aug 01 – Aug 15, 2026',
    orderCount: 42,
    amount: 3780.00,
    status: 'Pending',
    dueDate: 'Aug 28, 2026',
    lineItems: [
      { orderId: 'DEL-10030', deliveryFee: 90.00, surcharges: 0, total: 90.00 },
      { orderId: 'DEL-10031', deliveryFee: 90.00, surcharges: 15.00, total: 105.00 },
      { orderId: 'DEL-10032', deliveryFee: 90.00, surcharges: 25.00, total: 115.00 },
      { orderId: 'DEL-10033', deliveryFee: 90.00, surcharges: 0, total: 90.00 },
      { orderId: 'DEL-10034', deliveryFee: 90.00, surcharges: 15.00, total: 105.00 },
    ],
    paymentHistory: [
      { date: 'Aug 16, 2026', event: 'Invoice generated' },
      { date: 'Aug 17, 2026', event: 'Email notification sent to pharmacy' },
    ],
  },
  {
    id: 'INV-MFP-2026-07B',
    period: 'Jul 16 – Jul 31, 2026',
    orderCount: 38,
    amount: 3420.00,
    status: 'Paid',
    dueDate: 'Aug 14, 2026',
    lineItems: [
      { orderId: 'DEL-10010', deliveryFee: 90.00, surcharges: 0, total: 90.00 },
      { orderId: 'DEL-10011', deliveryFee: 90.00, surcharges: 25.00, total: 115.00 },
      { orderId: 'DEL-10012', deliveryFee: 90.00, surcharges: 15.00, total: 105.00 },
      { orderId: 'DEL-10013', deliveryFee: 90.00, surcharges: 0, total: 90.00 },
    ],
    paymentHistory: [
      { date: 'Aug 01, 2026', event: 'Invoice generated' },
      { date: 'Aug 08, 2026', event: 'ACH payment initiated' },
      { date: 'Aug 10, 2026', event: 'Payment received', amount: 3420.00 },
    ],
  },
  {
    id: 'INV-MFP-2026-07A',
    period: 'Jul 01 – Jul 15, 2026',
    orderCount: 35,
    amount: 3150.00,
    status: 'Paid',
    dueDate: 'Jul 28, 2026',
    lineItems: [
      { orderId: 'DEL-10001', deliveryFee: 90.00, surcharges: 0, total: 90.00 },
      { orderId: 'DEL-10002', deliveryFee: 90.00, surcharges: 15.00, total: 105.00 },
      { orderId: 'DEL-10003', deliveryFee: 90.00, surcharges: 25.00, total: 115.00 },
    ],
    paymentHistory: [
      { date: 'Jul 16, 2026', event: 'Invoice generated' },
      { date: 'Jul 22, 2026', event: 'ACH payment initiated' },
      { date: 'Jul 24, 2026', event: 'Payment received', amount: 3150.00 },
    ],
  },
  {
    id: 'INV-MFP-2026-06B',
    period: 'Jun 16 – Jun 30, 2026',
    orderCount: 31,
    amount: 2790.00,
    status: 'Paid',
    dueDate: 'Jul 14, 2026',
    lineItems: [
      { orderId: 'DEL-09980', deliveryFee: 90.00, surcharges: 0, total: 90.00 },
      { orderId: 'DEL-09981', deliveryFee: 90.00, surcharges: 15.00, total: 105.00 },
    ],
    paymentHistory: [
      { date: 'Jul 01, 2026', event: 'Invoice generated' },
      { date: 'Jul 08, 2026', event: 'ACH payment initiated' },
      { date: 'Jul 10, 2026', event: 'Payment received', amount: 2790.00 },
    ],
  },
];
