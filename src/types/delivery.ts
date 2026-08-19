export type DeliveryStatus =
  | 'Submitted'
  | 'Accepted'
  | 'Driver Assigned'
  | 'Picked Up'
  | 'En Route'
  | 'Delivered'
  | 'Chain of Custody Confirmed'
  | 'Completed'
  | 'Failed'
  | 'Cancelled'
  | 'Held — Compliance';

export interface DeliveryFlags {
  controlled: boolean; // Lock icon
  refrigerated: boolean; // Snowflake icon
  rush: boolean; // Arrow icon
}

export interface TimelineEvent {
  id: string;
  status: string;
  title: string;
  timestamp: string;
  actor: string;
  actorType: 'system' | 'driver' | 'admin' | 'pharmacy';
  note?: string;
}

export interface ProofOfDelivery {
  recipientName: string;
  signedAt: string;
  signatureSvgPath?: string;
  photoUrl?: string;
  photoCaption?: string;
  temperatureCelsius: number;
  tempSafeMin: number;
  tempSafeMax: number;
  tempLog: { time: string; temp: number }[];
  cocHash: string;
}

export type DriverStatus = 'on_shift' | 'busy' | 'delivering' | 'offline';

export interface DeliveryOrder {
  id: string;
  patientSafeId: string;
  patientInitials: string;
  patientName?: string;
  phone?: string;
  specialInstructions?: string;
  pharmacy: {
    id: string;
    name: string;
    code: string;
    location: string;
  };
  flags: DeliveryFlags;
  driver?: {
    id: string;
    name: string;
    avatar?: string;
    phone: string;
    vehicle: string;
    eta?: string;
    status?: DriverStatus;
    currentLocation?: string;
  };
  status: DeliveryStatus;
  lastUpdated: string;
  lastUpdatedTimestamp: number;
  createdAt: string;
  createdAtTimestamp?: number;
  deliveryAddress: {
    street: string;
    apt?: string;
    city: string;
    state: string;
    zip: string;
  };
  prescriptionSummary: {
    itemCount: number;
    description: string;
    rxNumbers: string[];
    schedule?: string;
  };
  slaWindow: {
    start: string;
    end: string;
    isNearBreach?: boolean;
    urgentTimeLeft?: string;
  };
  timeline: TimelineEvent[];
  proofOfDelivery?: ProofOfDelivery;
  temperatureLog?: {
    time: string;
    temp: number;
    status: 'nominal' | 'warning' | 'critical' | string;
  }[];
  attentionReason?: string;
  attentionType?: 'held' | 'failed' | 'unassigned_urgent' | 'temperature';
  isHeldCompliance?: boolean;
  heldReason?: string;
  cancellationReason?: string;
}

export interface DeliveryFilters {
  search: string;
  status: string;
  pharmacyId: string;
  driverId: string;
  dateRange: 'today' | 'yesterday' | '7days' | '30days' | 'all';
  flags: {
    controlled: boolean;
    refrigerated: boolean;
    rush: boolean;
  };
}

export interface DriverOption {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  status: DriverStatus;
  currentDeliveries: number;
  rating: number;
}
