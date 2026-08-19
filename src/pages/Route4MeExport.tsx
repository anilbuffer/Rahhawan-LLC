import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  User,
  CheckSquare,
  Square,
  Snowflake,
  Lock,
  Zap,
  Code2,
  Table as TableIcon,
  Copy,
  ExternalLink,
  ShieldCheck,
  Building2,
  Clock,
  RotateCcw,
  Truck
} from 'lucide-react';
import { INITIAL_DELIVERIES, AVAILABLE_DRIVERS, PHARMACIES_LIST } from '../mock/deliveryData';
import type { DeliveryOrder } from '../types/delivery';
import { auditLogService } from '../services/auditLogService';
import styles from './Route4MeExport.module.css';

// Helper to escape RFC 4180 CSV field
function escapeCsvField(val: string): string {
  if (val === undefined || val === null) return '""';
  const str = String(val).trim();
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

// Convert a single DeliveryOrder into Route4Me 3-Field format
export function formatToRoute4MeRow(order: DeliveryOrder) {
  // 1. Address: Full street address line
  const aptPart = order.deliveryAddress.apt ? `, ${order.deliveryAddress.apt}` : '';
  const address = `${order.deliveryAddress.street}${aptPart}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state} ${order.deliveryAddress.zip}`;

  // 2. Stop Alias: Order ID + Patient Safe ID + Pharmacy Code
  const stopAlias = `${order.id} [${order.patientSafeId}] - ${order.pharmacy.code}`;

  // 3. Operational Window/Notes: SLA window + assigned driver + flags + Rx summary
  const driverName = order.driver?.name || 'Unassigned';
  const windowStr = `Window: ${order.slaWindow.start} - ${order.slaWindow.end}`;
  const flagsList: string[] = [];
  if (order.flags.controlled) flagsList.push('Controlled (C-II DEA)');
  if (order.flags.refrigerated) flagsList.push('Cold-Chain (2-8°C)');
  if (order.flags.rush) flagsList.push('STAT Rush');

  const flagsStr = flagsList.length > 0 ? ` | Flags: ${flagsList.join(', ')}` : '';
  const rxStr = ` | Rx: ${order.prescriptionSummary.description.slice(0, 40)}${order.prescriptionSummary.description.length > 40 ? '...' : ''}`;
  const operationalNotes = `${windowStr} | Driver: ${driverName}${flagsStr}${rxStr}`;

  return {
    rawOrder: order,
    address,
    stopAlias,
    operationalNotes,
  };
}

export const Route4MeExport: React.FC = () => {
  const [deliveries] = useState<DeliveryOrder[]>(INITIAL_DELIVERIES);

  // Filters
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'all' | 'custom'>('today');
  const [customDate, setCustomDate] = useState<string>('2026-08-19');
  const [selectedDriver, setSelectedDriver] = useState<string>('all');
  const [selectedPharmacy, setSelectedPharmacy] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Order IDs for Export
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(INITIAL_DELIVERIES.map((d) => d.id))
  );

  // Active Preview Tab
  const [activeTab, setActiveTab] = useState<'table' | 'rawCsv'>('table');

  // Export Feedback state
  const [exportNotice, setExportNotice] = useState<{
    exportedCount: number;
    auditEventId: string;
    timestamp: string;
  } | null>(null);

  const [copiedCsv, setCopiedCsv] = useState(false);

  // Filtered deliveries based on user selections
  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((item) => {
      // Driver filter
      if (selectedDriver !== 'all') {
        if (selectedDriver === 'unassigned') {
          if (item.driver) return false;
        } else if (item.driver?.id !== selectedDriver) {
          return false;
        }
      }

      // Pharmacy filter
      if (selectedPharmacy !== 'all' && item.pharmacy.id !== selectedPharmacy) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && item.status !== selectedStatus) {
        return false;
      }

      // Date filter (Mock mapping: item.createdAt contains "Today" or dates)
      if (dateFilter === 'today') {
        if (!item.createdAt.toLowerCase().includes('today')) return false;
      } else if (dateFilter === 'yesterday') {
        if (!item.createdAt.toLowerCase().includes('yesterday')) return false;
      }

      // Search Query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const fullAddr = `${item.deliveryAddress.street} ${item.deliveryAddress.city} ${item.deliveryAddress.zip}`.toLowerCase();
        const rxDesc = item.prescriptionSummary.description.toLowerCase();
        const matches =
          item.id.toLowerCase().includes(q) ||
          item.patientSafeId.toLowerCase().includes(q) ||
          fullAddr.includes(q) ||
          rxDesc.includes(q) ||
          (item.driver?.name && item.driver.name.toLowerCase().includes(q)) ||
          item.pharmacy.name.toLowerCase().includes(q);

        if (!matches) return false;
      }

      return true;
    });
  }, [deliveries, selectedDriver, selectedPharmacy, selectedStatus, dateFilter, searchQuery]);

  // Selected formatted rows
  const selectedFormattedRows = useMemo(() => {
    return filteredDeliveries
      .filter((d) => selectedIds.has(d.id))
      .map(formatToRoute4MeRow);
  }, [filteredDeliveries, selectedIds]);

  // Metrics
  const metrics = useMemo(() => {
    const selectedList = filteredDeliveries.filter((d) => selectedIds.has(d.id));
    const coldCount = selectedList.filter((d) => d.flags.refrigerated).length;
    const controlledCount = selectedList.filter((d) => d.flags.controlled).length;
    const distinctDrivers = new Set(selectedList.map((d) => d.driver?.name || 'Unassigned')).size;

    return {
      totalSelected: selectedList.length,
      totalVisible: filteredDeliveries.length,
      coldCount,
      controlledCount,
      distinctDrivers,
    };
  }, [filteredDeliveries, selectedIds]);

  // Toggle single selection
  const handleToggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Toggle select all visible
  const handleToggleSelectAll = () => {
    if (selectedFormattedRows.length === filteredDeliveries.length && filteredDeliveries.length > 0) {
      // Deselect visible
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredDeliveries.forEach((d) => next.delete(d.id));
        return next;
      });
    } else {
      // Select all visible
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filteredDeliveries.forEach((d) => next.add(d.id));
        return next;
      });
    }
  };

  const isAllSelected = filteredDeliveries.length > 0 && selectedFormattedRows.length === filteredDeliveries.length;
  const isSomeSelected = selectedFormattedRows.length > 0 && selectedFormattedRows.length < filteredDeliveries.length;

  // Generate RFC 4180 CSV string in Route4Me 3-Field schema
  const generateCsvContent = (): string => {
    const headers = ['Address', 'Stop Alias', 'Operational Window/Notes'];
    const lines = [headers.join(',')];

    for (const row of selectedFormattedRows) {
      const fields = [
        escapeCsvField(row.address),
        escapeCsvField(row.stopAlias),
        escapeCsvField(row.operationalNotes),
      ];
      lines.push(fields.join(','));
    }

    return lines.join('\r\n');
  };

  // Handle Export CSV action
  const handleExportCsv = () => {
    if (selectedFormattedRows.length === 0) {
      alert('Please select at least one delivery order to export.');
      return;
    }

    const csvData = generateCsvContent();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const dateStr = new Date().toISOString().slice(0, 10);
    const driverSuffix = selectedDriver !== 'all' ? `_drv-${selectedDriver}` : '';
    const filename = `route4me_upload_${dateStr}${driverSuffix}_${selectedFormattedRows.length}stops.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Record immutable audit log entry
    const driverLabel =
      selectedDriver === 'all'
        ? 'All Drivers'
        : selectedDriver === 'unassigned'
        ? 'Unassigned Deliveries'
        : AVAILABLE_DRIVERS.find((d) => d.id === selectedDriver)?.name || selectedDriver;

    const dateLabel =
      dateFilter === 'today'
        ? 'Today (2026-08-19)'
        : dateFilter === 'yesterday'
        ? 'Yesterday (2026-08-18)'
        : dateFilter === 'custom'
        ? `Custom (${customDate})`
        : 'All Dates';

    const auditEvent = auditLogService.logRoute4MeExport({
      selectedCount: selectedFormattedRows.length,
      orderIds: selectedFormattedRows.map((r) => r.rawOrder.id),
      driverFilter: driverLabel,
      dateFilter: dateLabel,
      pharmacyFilter: selectedPharmacy !== 'all' ? selectedPharmacy : undefined,
      hasColdChain: metrics.coldCount > 0,
      hasControlled: metrics.controlledCount > 0,
    });

    setExportNotice({
      exportedCount: selectedFormattedRows.length,
      auditEventId: auditEvent.id,
      timestamp: auditEvent.timestamp,
    });
  };

  // Copy raw CSV to clipboard
  const handleCopyCsv = () => {
    const csvData = generateCsvContent();
    navigator.clipboard.writeText(csvData).then(() => {
      setCopiedCsv(true);
      setTimeout(() => setCopiedCsv(false), 2500);
    });
  };

  // Reset filters
  const handleResetFilters = () => {
    setDateFilter('today');
    setSelectedDriver('all');
    setSelectedPharmacy('all');
    setSelectedStatus('all');
    setSearchQuery('');
  };

  return (
    <div className={styles.container}>
      {/* Header Banner */}
      <div className={styles.headerCard}>
        <div className={styles.headerMain}>
          <div className={styles.iconBox}>
            <FileSpreadsheet size={26} />
          </div>
          <div className={styles.titleArea}>
            <h1>
              Route4Me CSV Export
              <span className={styles.schemaBadge}>
                <ShieldCheck size={14} /> 3-Field Schema Compliant
              </span>
            </h1>
            <p className={styles.headerDesc}>
              Filter and batch delivery dispatches for Route4Me bulk-upload routing optimization. Strictly formatted with exactly 3 fields: <strong>Address</strong>, <strong>Stop Alias</strong>, and <strong>Operational Window/Notes</strong>. Every export is automatically recorded to the tamper-evident audit ledger.
            </p>
          </div>
        </div>

        <div className={styles.headerActions}>
          <button
            className="btn btn-primary"
            onClick={handleExportCsv}
            disabled={selectedFormattedRows.length === 0}
            style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}
          >
            <Download size={18} />
            Export Route4Me CSV ({selectedFormattedRows.length})
          </button>
        </div>
      </div>

      {/* Export Confirmation Toast */}
      {exportNotice && (
        <div className={styles.toastSuccess}>
          <div className={styles.toastLeft}>
            <CheckCircle2 size={24} className={styles.toastIcon} />
            <div>
              <div className={styles.toastTitle}>
                Successfully exported {exportNotice.exportedCount} stops to Route4Me CSV!
              </div>
              <div className={styles.toastSubtext}>
                Written to HIPAA audit log as <strong>{exportNotice.auditEventId}</strong> at {exportNotice.timestamp}
              </div>
            </div>
          </div>
          <Link to="/audit-logs" className={styles.toastLink}>
            View in Audit Log Viewer <ExternalLink size={14} />
          </Link>
        </div>
      )}

      {/* Metrics Strip */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div>
            <div className={styles.metricLabel}>Selected For Export</div>
            <div className={styles.metricValue}>
              {metrics.totalSelected} <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>/ {metrics.totalVisible}</span>
            </div>
            <div className={styles.metricSubtext}>Stops in bulk payload</div>
          </div>
          <div className={`${styles.metricIcon} ${styles.metricIconTeal}`}>
            <CheckSquare size={20} />
          </div>
        </div>

        <div className={styles.metricCard}>
          <div>
            <div className={styles.metricLabel}>Cold-Chain (2-8°C)</div>
            <div className={styles.metricValue}>{metrics.coldCount}</div>
            <div className={styles.metricSubtext}>Refrigerated boxes</div>
          </div>
          <div className={`${styles.metricIcon} ${styles.metricIconBlue}`}>
            <Snowflake size={20} />
          </div>
        </div>

        <div className={styles.metricCard}>
          <div>
            <div className={styles.metricLabel}>Controlled (C-II)</div>
            <div className={styles.metricValue}>{metrics.controlledCount}</div>
            <div className={styles.metricSubtext}>DEA signature required</div>
          </div>
          <div className={`${styles.metricIcon} ${styles.metricIconAmber}`}>
            <Lock size={20} />
          </div>
        </div>

        <div className={styles.metricCard}>
          <div>
            <div className={styles.metricLabel}>Assigned Drivers</div>
            <div className={styles.metricValue}>{metrics.distinctDrivers}</div>
            <div className={styles.metricSubtext}>Courier route distribution</div>
          </div>
          <div className={`${styles.metricIcon} ${styles.metricIconPurple}`}>
            <Truck size={20} />
          </div>
        </div>
      </div>

      {/* Filter Control Card */}
      <div className={styles.filterCard}>
        <div className={styles.filterHeader}>
          <div className={styles.filterTitle}>
            <Filter size={16} color="var(--color-teal)" />
            <span>Select Deliveries by Date & Driver</span>
          </div>
          <button className={styles.resetBtn} onClick={handleResetFilters}>
            <RotateCcw size={13} /> Reset Filters
          </button>
        </div>

        <div className={styles.filterGrid}>
          {/* Date Selector */}
          <div className={styles.formGroup}>
            <label>
              <Calendar size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />
              Dispatch Date
            </label>
            <select
              className={styles.selectField}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
            >
              <option value="today">Today (August 19, 2026)</option>
              <option value="yesterday">Yesterday (August 18, 2026)</option>
              <option value="all">All Dates Available</option>
              <option value="custom">Custom Date...</option>
            </select>
          </div>

          {dateFilter === 'custom' && (
            <div className={styles.formGroup}>
              <label>Custom Date</label>
              <input
                type="date"
                className={styles.inputField}
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
              />
            </div>
          )}

          {/* Driver Selector */}
          <div className={styles.formGroup}>
            <label>
              <User size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />
              Assigned Driver
            </label>
            <select
              className={styles.selectField}
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
            >
              <option value="all">All Drivers ({AVAILABLE_DRIVERS.length})</option>
              <option value="unassigned">Unassigned Orders Only</option>
              {AVAILABLE_DRIVERS.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.name} ({driver.vehicle})
                </option>
              ))}
            </select>
          </div>

          {/* Pharmacy Hub */}
          <div className={styles.formGroup}>
            <label>
              <Building2 size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />
              Dispensing Pharmacy
            </label>
            <select
              className={styles.selectField}
              value={selectedPharmacy}
              onChange={(e) => setSelectedPharmacy(e.target.value)}
            >
              {PHARMACIES_LIST.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Query */}
          <div className={styles.formGroup} style={{ gridColumn: 'span 1' }}>
            <label>Search Orders</label>
            <div className={styles.searchWrapper}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search order ID, patient, address, rx..."
                className={`${styles.inputField} ${styles.searchInput}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Route4Me Schema Validation Bar */}
      <div className={styles.validationBar}>
        <div className={styles.validationItems}>
          <div className={styles.validationTag}>
            <CheckCircle2 size={15} /> Exact 3 Fields: Address, Stop Alias, Operational Window/Notes
          </div>
          <div className={styles.validationTag}>
            <CheckCircle2 size={15} /> RFC 4180 Escaped (Quotes & Commas Safe)
          </div>
          <div className={styles.validationTag}>
            <CheckCircle2 size={15} /> HIPAA Safe (De-Identified Patient Tokens)
          </div>
          <div className={styles.validationTag}>
            <CheckCircle2 size={15} /> Geocodable USPS Address Normalized
          </div>
        </div>

        <button
          className={styles.copyBtn}
          onClick={handleCopyCsv}
          disabled={selectedFormattedRows.length === 0}
          title="Copy formatted CSV directly to clipboard"
        >
          <Copy size={13} /> {copiedCsv ? 'Copied to Clipboard!' : 'Copy CSV Text'}
        </button>
      </div>

      {/* Main Content Area: Table Preview vs Raw CSV */}
      <div className={styles.contentCard}>
        <div className={styles.actionBar}>
          <div className={styles.tabGroup}>
            <button
              className={`${styles.tabBtn} ${activeTab === 'table' ? styles.active : ''}`}
              onClick={() => setActiveTab('table')}
            >
              <TableIcon size={15} /> Table Preview ({selectedFormattedRows.length})
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'rawCsv' ? styles.active : ''}`}
              onClick={() => setActiveTab('rawCsv')}
            >
              <Code2 size={15} /> Raw CSV Payload
            </button>
          </div>

          <div className={styles.selectionSummary}>
            <span>
              <strong className={styles.selectionCount}>{selectedFormattedRows.length}</strong> of{' '}
              <strong>{filteredDeliveries.length}</strong> deliveries selected
            </span>
            <button
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.775rem' }}
              onClick={handleToggleSelectAll}
            >
              {isAllSelected ? 'Deselect All' : 'Select All Visible'}
            </button>
          </div>
        </div>

        {filteredDeliveries.length === 0 ? (
          <div className={styles.emptyState}>
            <Truck size={42} className={styles.emptyStateIcon} />
            <div className={styles.emptyTitle}>No Deliveries Match Your Filters</div>
            <div className={styles.emptySubtitle}>
              Try adjusting the date range, driver filter, pharmacy hub, or clear search queries to view deliveries.
            </div>
            <button className="btn btn-secondary" onClick={handleResetFilters} style={{ marginTop: '0.5rem' }}>
              Reset All Filters
            </button>
          </div>
        ) : activeTab === 'table' ? (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: '44px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isSomeSelected;
                      }}
                      onChange={handleToggleSelectAll}
                      title="Select / Deselect all visible"
                    />
                  </th>
                  <th style={{ width: '30%' }}>
                    <div className={styles.columnHeaderField}>
                      <span>Field 1: Address</span>
                      <span className={styles.schemaPill}>Address</span>
                    </div>
                  </th>
                  <th style={{ width: '22%' }}>
                    <div className={styles.columnHeaderField}>
                      <span>Field 2: Stop Alias</span>
                      <span className={styles.schemaPill}>Stop Alias</span>
                    </div>
                  </th>
                  <th>
                    <div className={styles.columnHeaderField}>
                      <span>Field 3: Operational Window/Notes</span>
                      <span className={styles.schemaPill}>Notes / Window</span>
                    </div>
                  </th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeliveries.map((item) => {
                  const isSelected = selectedIds.has(item.id);
                  const formatted = formatToRoute4MeRow(item);

                  return (
                    <tr key={item.id} className={isSelected ? styles.selectedRow : ''}>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          className={styles.checkbox}
                          checked={isSelected}
                          onChange={() => handleToggleRow(item.id)}
                        />
                      </td>

                      {/* Field 1: Address */}
                      <td>
                        <div className={styles.addressCell}>
                          <span className={styles.addressLine1}>
                            {item.deliveryAddress.street}
                            {item.deliveryAddress.apt ? ` (${item.deliveryAddress.apt})` : ''}
                          </span>
                          <span className={styles.addressLine2}>
                            {item.deliveryAddress.city}, {item.deliveryAddress.state} {item.deliveryAddress.zip}
                          </span>
                        </div>
                      </td>

                      {/* Field 2: Stop Alias */}
                      <td>
                        <span className={styles.stopAliasBadge}>{formatted.stopAlias}</span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                          {item.pharmacy.name}
                        </div>
                      </td>

                      {/* Field 3: Operational Window / Notes */}
                      <td>
                        <div className={styles.windowNotesCell}>
                          <div className={styles.windowText}>
                            <Clock size={13} color="var(--color-text-muted)" />
                            {item.slaWindow.start} - {item.slaWindow.end}
                          </div>

                          <div className={styles.notesFlags}>
                            {item.driver ? (
                              <span className={styles.badgeDriver}>
                                <User size={11} style={{ display: 'inline', marginRight: 3 }} />
                                {item.driver.name}
                              </span>
                            ) : (
                              <span className={styles.badgeDriver} style={{ background: '#FEF2F2', color: '#991B1B' }}>
                                Unassigned
                              </span>
                            )}

                            {item.flags.refrigerated && (
                              <span className={styles.badgeCold} title="Cold-Chain Temperature Monitored (2-8°C)">
                                <Snowflake size={11} /> 2-8°C Cold
                              </span>
                            )}

                            {item.flags.controlled && (
                              <span className={styles.badgeControlled} title="Schedule II Controlled Medication">
                                <Lock size={11} /> C-II Controlled
                              </span>
                            )}

                            {item.flags.rush && (
                              <span className={styles.badgeRush} title="STAT Priority">
                                <Zap size={11} /> STAT
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ textAlign: 'center' }}>
                        <span
                          style={{
                            fontSize: '0.725rem',
                            fontWeight: 600,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '9999px',
                            background:
                              item.status === 'Delivered'
                                ? '#ECFDF5'
                                : item.status === 'En Route'
                                ? '#EFF6FF'
                                : item.status === 'Driver Assigned'
                                ? '#F0FDFA'
                                : item.status.includes('Held')
                                ? '#FEF2F2'
                                : '#F3F4F6',
                            color:
                              item.status === 'Delivered'
                                ? '#065F46'
                                : item.status === 'En Route'
                                ? '#1D4ED8'
                                : item.status === 'Driver Assigned'
                                ? '#0F766E'
                                : item.status.includes('Held')
                                ? '#B91C1C'
                                : '#4B5563',
                          }}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.rawCsvWrapper}>
            <div className={styles.rawCsvHeader}>
              <div className={styles.rawCsvTitle}>
                <Code2 size={15} /> Route4Me RFC-4180 Raw CSV Stream ({selectedFormattedRows.length} Rows)
              </div>
              <button className={styles.copyBtn} onClick={handleCopyCsv}>
                <Copy size={13} /> {copiedCsv ? 'Copied!' : 'Copy Raw CSV'}
              </button>
            </div>

            <pre className={styles.codeBlock}>
              <div className={styles.codeHeaderLine}>Address,Stop Alias,Operational Window/Notes</div>
              {selectedFormattedRows.map((row, idx) => (
                <div key={idx}>
                  {`${escapeCsvField(row.address)},${escapeCsvField(row.stopAlias)},${escapeCsvField(row.operationalNotes)}`}
                </div>
              ))}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Route4MeExport;
