export type AuditActionType =
  | 'ROUTE4ME_EXPORT'
  | 'PHI_ACCESS'
  | 'ORDER_STATUS_UPDATE'
  | 'DRIVER_ASSIGNED'
  | 'COMPLIANCE_OVERRIDE'
  | 'TEMPERATURE_EXCURSION_ACK'
  | 'USER_AUTHENTICATION'
  | 'SECURITY_POLICY_CHANGE'
  | 'DELIVERY_CREATED';

export type AuditCategory =
  | 'PHI Access'
  | 'Route & Export'
  | 'State Change'
  | 'Security & Auth'
  | 'Compliance';

export type AuditSeverity = 'info' | 'warning' | 'critical' | 'success';

export interface AuditActor {
  id: string;
  name: string;
  role: 'Super Admin' | 'Tenant Admin' | 'Compliance Officer' | 'Dispatcher' | 'Driver' | 'System';
  organization?: string;
  ipAddress: string;
  userAgent?: string;
}

export interface AuditResource {
  type: 'order' | 'delivery_batch' | 'user' | 'driver' | 'system' | 'pharmacy';
  id: string;
  label?: string;
  details?: Record<string, any>;
}

export interface StateChangeDiff {
  field: string;
  previousValue: any;
  newValue: any;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  timestampRaw: number;
  actor: AuditActor;
  actionType: AuditActionType;
  category: AuditCategory;
  resource: AuditResource;
  severity: AuditSeverity;
  description: string;
  metadata?: Record<string, any>;
  diff?: StateChangeDiff[];
  hash: string;
  previousHash: string;
}

export interface AuditFilterState {
  searchQuery: string;
  userId: string;
  actionType: string;
  category: string;
  orderId: string;
  dateRange: 'all' | 'today' | 'yesterday' | '7days' | '30days' | 'custom';
  startDate?: string;
  endDate?: string;
  severity: string;
}
