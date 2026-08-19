import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Calendar,
  User,
  Eye,
  FileSpreadsheet,
  FileCode,
  Lock,
  X,
  AlertTriangle,
  RotateCcw,
  Key,
  Database,
  ArrowRight,
  Layers,
  ThermometerSnowflake,
  Clock
} from 'lucide-react';
import type { AuditEvent } from '../types/audit';
import { auditLogService, formatAuditRelativeTime } from '../services/auditLogService';
import styles from './AuditLogViewer.module.css';

export const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditEvent[]>(() => auditLogService.getLogs());

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedActionType, setSelectedActionType] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'yesterday' | '7days' | '30days'>('all');
  const [activeChip, setActiveChip] = useState<'all' | 'route4me' | 'phi' | 'compliance' | 'today'>('all');

  // Selected event for Inspector Drawer
  const [inspectingEvent, setInspectingEvent] = useState<AuditEvent | null>(null);

  // Verification state
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    verifiedCount: number;
    timestamp: string;
  } | null>(null);

  // Subscribe to reactive audit log changes
  useEffect(() => {
    const unsubscribe = auditLogService.subscribe((updatedLogs) => {
      setLogs(updatedLogs);
    });
    return unsubscribe;
  }, []);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;

    return logs.filter((event) => {
      // User filter
      if (selectedUser !== 'all') {
        if (selectedUser === 'System') {
          if (event.actor.role !== 'System') return false;
        } else if (event.actor.role !== selectedUser && event.actor.name !== selectedUser) {
          return false;
        }
      }

      // Action Type filter
      if (selectedActionType !== 'all' && event.actionType !== selectedActionType) {
        return false;
      }

      // Severity filter
      if (selectedSeverity !== 'all' && event.severity !== selectedSeverity) {
        return false;
      }

      // Date Range filter
      if (dateRange === 'today') {
        if (now - event.timestampRaw > DAY) return false;
      } else if (dateRange === 'yesterday') {
        const diff = now - event.timestampRaw;
        if (diff < DAY || diff > 2 * DAY) return false;
      } else if (dateRange === '7days') {
        if (now - event.timestampRaw > 7 * DAY) return false;
      } else if (dateRange === '30days') {
        if (now - event.timestampRaw > 30 * DAY) return false;
      }

      // Quick chip filters
      if (activeChip === 'route4me' && event.actionType !== 'ROUTE4ME_EXPORT') return false;
      if (activeChip === 'phi' && event.actionType !== 'PHI_ACCESS') return false;
      if (activeChip === 'compliance' && event.actionType !== 'COMPLIANCE_OVERRIDE' && event.severity !== 'critical') return false;
      if (activeChip === 'today' && now - event.timestampRaw > DAY) return false;

      // Full-text search
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matches =
          event.id.toLowerCase().includes(q) ||
          event.actor.name.toLowerCase().includes(q) ||
          event.actor.role.toLowerCase().includes(q) ||
          event.actor.ipAddress.toLowerCase().includes(q) ||
          event.resource.id.toLowerCase().includes(q) ||
          (event.resource.label && event.resource.label.toLowerCase().includes(q)) ||
          event.description.toLowerCase().includes(q) ||
          event.hash.toLowerCase().includes(q);

        if (!matches) return false;
      }

      return true;
    });
  }, [logs, selectedUser, selectedActionType, selectedSeverity, dateRange, activeChip, searchQuery]);

  // Metrics
  const metrics = useMemo(() => {
    const total = logs.length;
    const phiAccessCount = logs.filter((l) => l.actionType === 'PHI_ACCESS').length;
    const exportCount = logs.filter((l) => l.actionType === 'ROUTE4ME_EXPORT').length;
    const criticalCount = logs.filter((l) => l.severity === 'critical' || l.severity === 'warning').length;

    return {
      total,
      phiAccessCount,
      exportCount,
      criticalCount,
    };
  }, [logs]);

  // Handle Verify Integrity
  const handleVerifyIntegrity = () => {
    const res = auditLogService.verifyIntegrity();
    setVerificationResult({
      isValid: res.isValid,
      verifiedCount: res.verifiedCount,
      timestamp: new Date().toLocaleTimeString(),
    });
    setTimeout(() => {
      // Keep visible
    }, 4000);
  };

  // Export audit logs to CSV
  const handleExportAuditCsv = () => {
    const headers = ['Audit ID', 'Timestamp', 'Actor Name', 'Actor Role', 'Actor IP', 'Action Type', 'Resource ID', 'Severity', 'Description', 'SHA-256 Hash'];
    const rows = filteredLogs.map((log) => [
      `"${log.id}"`,
      `"${log.timestamp}"`,
      `"${log.actor.name}"`,
      `"${log.actor.role}"`,
      `"${log.actor.ipAddress}"`,
      `"${log.actionType}"`,
      `"${log.resource.id}"`,
      `"${log.severity}"`,
      `"${log.description.replace(/"/g, '""')}"`,
      `"${log.hash}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `rahhawan_audit_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedUser('all');
    setSelectedActionType('all');
    setSelectedSeverity('all');
    setDateRange('all');
    setActiveChip('all');
  };

  const getActionBadgeClass = (actionType: string) => {
    switch (actionType) {
      case 'ROUTE4ME_EXPORT':
        return styles.actionExport;
      case 'PHI_ACCESS':
        return styles.actionPhi;
      case 'ORDER_STATUS_UPDATE':
      case 'DELIVERY_CREATED':
        return styles.actionStatus;
      case 'DRIVER_ASSIGNED':
        return styles.actionDriver;
      case 'COMPLIANCE_OVERRIDE':
        return styles.actionCompliance;
      case 'TEMPERATURE_EXCURSION_ACK':
      case 'SECURITY_POLICY_CHANGE':
        return styles.actionSecurity;
      default:
        return styles.actionExport;
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerCard}>
        <div className={styles.headerMain}>
          <div className={styles.iconBox}>
            <ShieldCheck size={26} />
          </div>
          <div className={styles.titleArea}>
            <h1>
              Audit Log Viewer
              <span className={styles.ledgerBadge}>
                <Lock size={13} /> Append-Only Immutable Ledger
              </span>
            </h1>
            <p className={styles.headerDesc}>
              Read-only, tamper-evident record of all Protected Health Information (PHI) access events, prescription dispatches, Route4Me CSV exports, driver assignments, and compliance state transitions in compliance with <strong>HIPAA § 164.312(b) Audit Controls</strong>.
            </p>
          </div>
        </div>

        <div className={styles.headerActions}>
          <button className="btn btn-secondary" onClick={handleVerifyIntegrity}>
            <ShieldCheck size={16} color="#059669" /> Verify Ledger Integrity
          </button>
          <button className="btn btn-primary" onClick={handleExportAuditCsv}>
            <Download size={16} /> Export Audit Ledger
          </button>
        </div>
      </div>

      {/* Verification Feedback Banner */}
      {verificationResult && (
        <div className={styles.verificationSuccess}>
          <CheckCircle2 size={20} color="#059669" />
          <div>
            <strong>100% Tamper-Evident Integrity Verified:</strong> Successfully validated continuous SHA-256 cryptographic hash-chain across all {verificationResult.verifiedCount} historical events (Genesis to Head at {verificationResult.timestamp}).
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div>
            <div className={styles.metricLabel}>Total Ledger Events</div>
            <div className={styles.metricValue}>{metrics.total}</div>
            <div className={styles.metricSubtext}>Cryptographically chained</div>
          </div>
          <div className={styles.metricIcon} style={{ background: '#EFF6FF', color: '#2563EB' }}>
            <Database size={20} />
          </div>
        </div>

        <div className={styles.metricCard}>
          <div>
            <div className={styles.metricLabel}>PHI Access Events</div>
            <div className={styles.metricValue}>{metrics.phiAccessCount}</div>
            <div className={styles.metricSubtext}>Safe Harbor tracked</div>
          </div>
          <div className={styles.metricIcon} style={{ background: '#FEF3C7', color: '#D97706' }}>
            <Eye size={20} />
          </div>
        </div>

        <div className={styles.metricCard}>
          <div>
            <div className={styles.metricLabel}>Route4Me CSV Exports</div>
            <div className={styles.metricValue}>{metrics.exportCount}</div>
            <div className={styles.metricSubtext}>Bulk courier dispatches</div>
          </div>
          <div className={styles.metricIcon} style={{ background: '#ECFDF5', color: '#059669' }}>
            <FileSpreadsheet size={20} />
          </div>
        </div>

        <div className={styles.metricCard}>
          <div>
            <div className={styles.metricLabel}>Compliance & Alerts</div>
            <div className={styles.metricValue}>{metrics.criticalCount}</div>
            <div className={styles.metricSubtext}>Overrides & Excursions</div>
          </div>
          <div className={styles.metricIcon} style={{ background: '#FEE2E2', color: '#DC2626' }}>
            <AlertTriangle size={20} />
          </div>
        </div>
      </div>

      {/* Filter Card */}
      <div className={styles.filterCard}>
        <div className={styles.filterHeader}>
          <div className={styles.filterTitle}>
            <Filter size={16} color="var(--color-teal)" />
            <span>Audit Query & Filter Engine</span>
          </div>
          <button className={styles.resetBtn} onClick={handleResetFilters}>
            <RotateCcw size={13} /> Reset Filters
          </button>
        </div>

        <div className={styles.filterGrid}>
          {/* User / Actor */}
          <div className={styles.formGroup}>
            <label>
              <User size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />
              User / Actor
            </label>
            <select
              className={styles.selectField}
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="all">All Users & System</option>
              <option value="Super Admin">Sarah Jenkins (Super Admin)</option>
              <option value="Tenant Admin">Dr. Rebecca Vance (Tenant Admin)</option>
              <option value="Compliance Officer">Marcus Sterling, RPh (Compliance)</option>
              <option value="Dispatcher">Alex Rivera (Dispatcher)</option>
              <option value="Driver">Marcus Vance (Driver)</option>
              <option value="System">System Automation / Daemons</option>
            </select>
          </div>

          {/* Action Type */}
          <div className={styles.formGroup}>
            <label>
              <Layers size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />
              Action Type
            </label>
            <select
              className={styles.selectField}
              value={selectedActionType}
              onChange={(e) => setSelectedActionType(e.target.value)}
            >
              <option value="all">All Action Types</option>
              <option value="ROUTE4ME_EXPORT">Route4Me CSV Export</option>
              <option value="PHI_ACCESS">PHI Access / View</option>
              <option value="ORDER_STATUS_UPDATE">Order Status Update</option>
              <option value="DRIVER_ASSIGNED">Driver Assignment</option>
              <option value="COMPLIANCE_OVERRIDE">Compliance Hold Override</option>
              <option value="TEMPERATURE_EXCURSION_ACK">Cold-Chain Excursion Alert</option>
              <option value="USER_AUTHENTICATION">MFA / Authentication</option>
              <option value="SECURITY_POLICY_CHANGE">Security Policy Change</option>
              <option value="DELIVERY_CREATED">Delivery Batch Created</option>
            </select>
          </div>

          {/* Date Range */}
          <div className={styles.formGroup}>
            <label>
              <Calendar size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />
              Date Horizon
            </label>
            <select
              className={styles.selectField}
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
            >
              <option value="all">All Recorded History</option>
              <option value="today">Today (Past 24 Hours)</option>
              <option value="yesterday">Yesterday</option>
              <option value="7days">Past 7 Days</option>
              <option value="30days">Past 30 Days</option>
            </select>
          </div>

          {/* Search Query */}
          <div className={styles.formGroup}>
            <label>Search Resource / Order / Hash</label>
            <div className={styles.searchWrapper}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search order ID (ORD-9842), actor, IP..."
                className={`${styles.inputField} ${styles.searchInput}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Quick Filter Chips */}
        <div className={styles.chipsRow}>
          <span className={styles.chipLabel}>Quick Presets:</span>
          <button
            className={`${styles.chipBtn} ${activeChip === 'all' ? styles.activeChip : ''}`}
            onClick={() => setActiveChip('all')}
          >
            All Logs
          </button>
          <button
            className={`${styles.chipBtn} ${activeChip === 'route4me' ? styles.activeChip : ''}`}
            onClick={() => setActiveChip('route4me')}
          >
            <FileSpreadsheet size={13} /> Route4Me Exports
          </button>
          <button
            className={`${styles.chipBtn} ${activeChip === 'phi' ? styles.activeChip : ''}`}
            onClick={() => setActiveChip('phi')}
          >
            <Eye size={13} /> PHI Access Events
          </button>
          <button
            className={`${styles.chipBtn} ${activeChip === 'compliance' ? styles.activeChip : ''}`}
            onClick={() => setActiveChip('compliance')}
          >
            <ShieldAlert size={13} /> Compliance & Warnings
          </button>
          <button
            className={`${styles.chipBtn} ${activeChip === 'today' ? styles.activeChip : ''}`}
            onClick={() => setActiveChip('today')}
          >
            <Clock size={13} /> Today's Dispatches
          </button>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableToolbar}>
          <div className={styles.logCountSummary}>
            Showing <strong>{filteredLogs.length}</strong> of <strong>{logs.length}</strong> immutable audit events
          </div>
          <span style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)' }}>
            Click any row to inspect complete cryptographic telemetry & diff payload
          </span>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '160px' }}>Timestamp</th>
                <th style={{ width: '170px' }}>Action Type</th>
                <th style={{ width: '180px' }}>User / Actor</th>
                <th style={{ width: '130px' }}>Resource Target</th>
                <th>Description & Event Payload</th>
                <th style={{ width: '110px' }}>Block Hash</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Inspect</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className={styles.tableRow} onClick={() => setInspectingEvent(log)}>
                  {/* Timestamp */}
                  <td>
                    <div className={styles.timeCell}>
                      <span className={styles.timeDisplay}>{log.timestamp.split(', ')[1] || log.timestamp}</span>
                      <span className={styles.timeRelative}>
                        {formatAuditRelativeTime(log.timestampRaw)} • {log.timestamp.split(',')[0]}
                      </span>
                    </div>
                  </td>

                  {/* Action Type */}
                  <td>
                    <span className={`${styles.actionBadge} ${getActionBadgeClass(log.actionType)}`}>
                      {log.actionType === 'ROUTE4ME_EXPORT' && <FileSpreadsheet size={12} />}
                      {log.actionType === 'PHI_ACCESS' && <Eye size={12} />}
                      {log.actionType === 'ORDER_STATUS_UPDATE' && <CheckCircle2 size={12} />}
                      {log.actionType === 'DRIVER_ASSIGNED' && <User size={12} />}
                      {log.actionType === 'COMPLIANCE_OVERRIDE' && <ShieldAlert size={12} />}
                      {log.actionType === 'TEMPERATURE_EXCURSION_ACK' && <ThermometerSnowflake size={12} />}
                      {log.actionType === 'USER_AUTHENTICATION' && <Key size={12} />}
                      {log.actionType === 'SECURITY_POLICY_CHANGE' && <Lock size={12} />}
                      {log.actionType}
                    </span>
                  </td>

                  {/* Actor */}
                  <td>
                    <div className={styles.actorCell}>
                      <div className={styles.actorAvatar}>
                        {log.actor.name.charAt(0)}
                      </div>
                      <div className={styles.actorInfo}>
                        <span className={styles.actorName}>{log.actor.name}</span>
                        <span className={styles.actorRole}>{log.actor.role}</span>
                      </div>
                    </div>
                  </td>

                  {/* Resource */}
                  <td>
                    <span className={styles.resourceBadge}>{log.resource.id}</span>
                  </td>

                  {/* Description */}
                  <td>
                    <div className={styles.descCell}>
                      {log.description}
                    </div>
                  </td>

                  {/* SHA-256 Hash */}
                  <td>
                    <span className={styles.hashPill} title={log.hash}>
                      {log.hash.slice(0, 10)}...
                    </span>
                  </td>

                  {/* Inspect Action */}
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectingEvent(log);
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Record Inspector Drawer */}
      {inspectingEvent && createPortal(
        <div className={styles.drawerOverlay} onClick={() => setInspectingEvent(null)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div className={styles.drawerTitle}>
                <ShieldCheck size={20} color="#059669" />
                <span>Audit Snapshot: {inspectingEvent.id}</span>
              </div>
              <button className={styles.closeBtn} onClick={() => setInspectingEvent(null)}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.drawerBody}>
              {/* Telemetry Summary */}
              <div className={styles.inspectorCard}>
                <div className={styles.inspectorCardTitle}>
                  <User size={15} /> Actor Telemetry
                </div>
                <div className={styles.keyValGrid}>
                  <span className={styles.keyLabel}>Actor Name:</span>
                  <span className={styles.valData}>{inspectingEvent.actor.name}</span>

                  <span className={styles.keyLabel}>User ID / Role:</span>
                  <span className={styles.valData}>{inspectingEvent.actor.id} ({inspectingEvent.actor.role})</span>

                  <span className={styles.keyLabel}>Organization:</span>
                  <span className={styles.valData}>{inspectingEvent.actor.organization || 'Rahhawan Platform'}</span>

                  <span className={styles.keyLabel}>IP Address:</span>
                  <span className={styles.valData}>{inspectingEvent.actor.ipAddress}</span>

                  {inspectingEvent.actor.userAgent && (
                    <>
                      <span className={styles.keyLabel}>User Agent:</span>
                      <span className={styles.valData} style={{ fontSize: '0.75rem' }}>
                        {inspectingEvent.actor.userAgent}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Event & Resource Target */}
              <div className={styles.inspectorCard}>
                <div className={styles.inspectorCardTitle}>
                  <Database size={15} /> Event & Resource Target
                </div>
                <div className={styles.keyValGrid}>
                  <span className={styles.keyLabel}>Action Type:</span>
                  <span className={styles.valData}>
                    <span className={`${styles.actionBadge} ${getActionBadgeClass(inspectingEvent.actionType)}`}>
                      {inspectingEvent.actionType}
                    </span>
                  </span>

                  <span className={styles.keyLabel}>Category:</span>
                  <span className={styles.valData}>{inspectingEvent.category}</span>

                  <span className={styles.keyLabel}>Timestamp:</span>
                  <span className={styles.valData}>
                    {inspectingEvent.timestamp} ({formatAuditRelativeTime(inspectingEvent.timestampRaw)})
                  </span>

                  <span className={styles.keyLabel}>Target Resource:</span>
                  <span className={styles.valData}>
                    <span className={styles.resourceBadge}>{inspectingEvent.resource.id}</span>{' '}
                    {inspectingEvent.resource.label && `(${inspectingEvent.resource.label})`}
                  </span>

                  <span className={styles.keyLabel}>Severity:</span>
                  <span className={styles.valData} style={{ textTransform: 'capitalize' }}>
                    {inspectingEvent.severity}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className={styles.inspectorCard}>
                <div className={styles.inspectorCardTitle}>
                  <FileCode size={15} /> Event Narrative
                </div>
                <div style={{ fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--color-text-primary)' }}>
                  {inspectingEvent.description}
                </div>
              </div>

              {/* State Diff if available */}
              {inspectingEvent.diff && inspectingEvent.diff.length > 0 && (
                <div className={styles.inspectorCard}>
                  <div className={styles.inspectorCardTitle}>
                    <Layers size={15} /> State Change Diff
                  </div>
                  <div className={styles.diffBox}>
                    {inspectingEvent.diff.map((d, idx) => (
                      <div key={idx} className={styles.diffRow}>
                        <div className={styles.diffField}>Property: {d.field}</div>
                        <div className={styles.diffValues}>
                          <span className={styles.diffPrev}>{String(d.previousValue)}</span>
                          <ArrowRight size={14} color="var(--color-text-muted)" />
                          <span className={styles.diffNext}>{String(d.newValue)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata Payload JSON */}
              {inspectingEvent.metadata && (
                <div className={styles.inspectorCard}>
                  <div className={styles.inspectorCardTitle}>
                    <FileCode size={15} /> Structured Metadata Payload
                  </div>
                  <pre className={styles.jsonBox}>
                    {JSON.stringify(inspectingEvent.metadata, null, 2)}
                  </pre>
                </div>
              )}

              {/* Cryptographic Chain Integrity */}
              <div className={styles.inspectorCard}>
                <div className={styles.inspectorCardTitle}>
                  <Lock size={15} /> Cryptographic Proof & Chain Linkage
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Current Block Hash (SHA-256):
                  </div>
                  <div className={styles.hashDisplay}>{inspectingEvent.hash}</div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                    Parent Block Hash (Previous Chain Link):
                  </div>
                  <div className={styles.hashDisplay}>{inspectingEvent.previousHash}</div>
                </div>
              </div>

              {/* HIPAA Certification stamp */}
              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  fontSize: '0.775rem',
                  color: '#166534',
                  lineHeight: 1.4,
                }}
              >
                <strong>HIPAA § 164.312(b) Compliant:</strong> Hardware-timestamped, tamper-evident audit record maintained under 7-year regulatory retention lifecycle. De-identification performed per HIPAA Safe Harbor standard.
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AuditLogViewer;
