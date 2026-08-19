export type DeliveryStatus =
  | 'Submitted'
  | 'Driver Assigned'
  | 'En Route'
  | 'Delivered'
  | 'Failed'
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

export interface DeliveryOrder {
  id: string;
  patientSafeId: string;
  patientInitials: string;
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
    status?: 'on_shift' | 'offline' | 'delivering';
  };
  status: DeliveryStatus;
  lastUpdated: string;
  lastUpdatedTimestamp: number;
  createdAt: string;
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
  status: 'on_shift' | 'busy' | 'offline';
  currentDeliveries: number;
  rating: number;
}
