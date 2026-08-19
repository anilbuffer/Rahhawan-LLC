import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  DollarSign,
  Calendar,
  CheckCircle2,
  Search,
  X,
  Download,
  Printer,
  CreditCard,
  FileText,
  Clock,
  Lock,
} from 'lucide-react';
import { PHARMACY_TENANT, PHARMACY_INVOICES } from '../../mock/pharmacyMockData';
import type { PharmacyInvoice } from '../../mock/pharmacyMockData';
import styles from './PharmacyBilling.module.css';

const PharmacyBilling: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<PharmacyInvoice | null>(null);

  const filteredInvoices = useMemo(() => {
    return PHARMACY_INVOICES.filter((inv) =>
      inv.id.toLowerCase().includes(search.toLowerCase()) ||
      inv.period.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  // KPIs
  const outstandingBalance = useMemo(() => {
    return PHARMACY_INVOICES
      .filter((inv) => inv.status === 'Pending' || inv.status === 'Overdue')
      .reduce((sum, inv) => sum + inv.amount, 0);
  }, []);

  const paidThisMonth = useMemo(() => {
    return PHARMACY_INVOICES
      .filter((inv) => inv.status === 'Paid')
      .reduce((sum, inv) => sum + inv.amount, 0);
  }, []);

  const nextInvoiceDate = 'Sep 01, 2026';

  const getStatusBadge = (status: PharmacyInvoice['status']) => {
    switch (status) {
      case 'Paid': return 'badge badge-teal';
      case 'Pending': return 'badge badge-blue';
      case 'Overdue': return 'badge badge-red';
    }
  };

  const handleExport = (invoice: PharmacyInvoice) => {
    const headers = ['Order ID', 'Delivery Fee', 'Surcharges', 'Total'];
    const rows = invoice.lineItems.map((item) => [
      item.orderId,
      `$${item.deliveryFee.toFixed(2)}`,
      `$${item.surcharges.toFixed(2)}`,
      `$${item.total.toFixed(2)}`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `${invoice.id}_${PHARMACY_TENANT.code}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.pageContainer}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Billing</h1>
          <p className={styles.pageSubtitle}>Invoices for {PHARMACY_TENANT.name}</p>
        </div>
      </div>

      {/* KPI Strip */}
      <div className={styles.kpiStrip}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiCardHeader}>
            <span className={styles.kpiLabel}>Outstanding Balance</span>
            <div className={`${styles.kpiIconWrapper} ${styles.iconAmber}`}>
              <DollarSign size={18} />
            </div>
          </div>
          <div className={styles.kpiValue}>
            ${outstandingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          {outstandingBalance > 0 && (
            <div style={{ fontSize: '0.75rem', color: 'var(--color-amber)' }}>
              Payment due by next invoice cycle
            </div>
          )}
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiCardHeader}>
            <span className={styles.kpiLabel}>Paid This Month</span>
            <div className={`${styles.kpiIconWrapper} ${styles.iconTeal}`}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className={styles.kpiValue}>
            ${paidThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-teal)' }}>
            All payments current
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiCardHeader}>
            <span className={styles.kpiLabel}>Next Invoice Date</span>
            <div className={`${styles.kpiIconWrapper} ${styles.iconBlue}`}>
              <Calendar size={18} />
            </div>
          </div>
          <div className={styles.kpiValue} style={{ fontSize: '1.25rem' }}>
            {nextInvoiceDate}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Semi-monthly billing cycle
          </div>
        </div>
      </div>

      {/* Invoice Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div className={`${styles.searchBox} input`}>
            <Search size={16} color="var(--color-text-muted)" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={14} color="var(--color-text-muted)" />
              </button>
            )}
          </div>
          <span className={styles.resultCount}>
            {filteredInvoices.length} of {PHARMACY_INVOICES.length} invoices
          </span>
        </div>

        {filteredInvoices.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <FileText size={28} />
            </div>
            <p style={{ fontWeight: 500 }}>No invoices found</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Invoices are generated automatically once deliveries are completed during a billing cycle.
            </p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Period</th>
                  <th>Orders</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className={styles.tableRow}
                    onClick={() => setSelectedInvoice(inv)}
                  >
                    <td>
                      <span className={styles.invoiceId}>{inv.id}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                        {inv.period}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                        {inv.orderCount}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                        ${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td>
                      <span className={getStatusBadge(inv.status)}>
                        {inv.status === 'Paid' && <CheckCircle2 size={12} />}
                        {inv.status === 'Pending' && <Clock size={12} />}
                        {inv.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '0.35rem 0.625rem' }}
                        onClick={() => setSelectedInvoice(inv)}
                      >
                        <FileText size={13} />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Reassurance Note */}
        <div className={styles.reassuranceNote}>
          <Lock size={14} />
          <span>Invoices reference Order IDs only — no patient-identifiable information is included in billing records.</span>
        </div>
      </div>

      {/* Invoice Detail Drawer */}
      {selectedInvoice && createPortal(
        <div className={styles.drawerOverlay} onClick={() => setSelectedInvoice(null)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <div className={styles.drawerTitleBlock}>
                <span className={styles.drawerTitle}>
                  <span style={{ fontFamily: 'monospace', color: 'var(--color-teal)' }}>{selectedInvoice.id}</span>
                </span>
                <span className={getStatusBadge(selectedInvoice.status)}>
                  {selectedInvoice.status}
                </span>
              </div>
              <button className={styles.drawerCloseBtn} onClick={() => setSelectedInvoice(null)}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.drawerBody}>
              {/* Invoice Summary */}
              <div className={styles.drawerSection}>
                <div className={styles.drawerSectionTitle}>
                  <CreditCard size={14} /> Invoice Summary
                </div>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Billing Period</span>
                    <span className={styles.infoValue}>{selectedInvoice.period}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Due Date</span>
                    <span className={styles.infoValue}>{selectedInvoice.dueDate}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Total Orders</span>
                    <span className={styles.infoValue}>{selectedInvoice.orderCount}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Total Amount</span>
                    <span className={styles.infoValue} style={{ fontWeight: 700, fontSize: '1.125rem' }}>
                      ${selectedInvoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Line Items (Order IDs only) */}
              <div className={styles.drawerSection}>
                <div className={styles.drawerSectionTitle}>
                  <FileText size={14} /> Line Items
                </div>
                <div className={styles.lineItemsTable}>
                  <div className={styles.lineItemHeader}>
                    <span>Order ID</span>
                    <span>Delivery</span>
                    <span>Surcharges</span>
                    <span>Total</span>
                  </div>
                  {selectedInvoice.lineItems.map((item, idx) => (
                    <div key={idx} className={styles.lineItemRow}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-teal)' }}>
                        {item.orderId}
                      </span>
                      <span style={{ fontVariantNumeric: 'tabular-nums' }}>${item.deliveryFee.toFixed(2)}</span>
                      <span style={{ fontVariantNumeric: 'tabular-nums' }}>${item.surcharges.toFixed(2)}</span>
                      <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>${item.total.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className={styles.lineItemRow} style={{ borderTop: '2px solid var(--border-color)', fontWeight: 700 }}>
                    <span>Total ({selectedInvoice.lineItems.length} shown)</span>
                    <span></span>
                    <span></span>
                    <span>${selectedInvoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontStyle: 'italic', marginTop: '0.25rem' }}>
                  Showing sample line items. Full invoice contains all {selectedInvoice.orderCount} orders.
                </div>
              </div>

              {/* Payment History */}
              <div className={styles.drawerSection}>
                <div className={styles.drawerSectionTitle}>
                  <Clock size={14} /> Payment Status History
                </div>
                <div className={styles.paymentTimeline}>
                  {selectedInvoice.paymentHistory.map((event, idx) => (
                    <div key={idx} className={styles.paymentEvent}>
                      <div className={styles.paymentDot} style={{
                        backgroundColor: event.amount ? 'var(--color-teal)' : '#D1D5DB',
                      }} />
                      <div className={styles.paymentContent}>
                        <div className={styles.paymentEventTitle}>{event.event}</div>
                        <div className={styles.paymentEventDate}>
                          {event.date}
                          {event.amount && (
                            <span style={{ fontWeight: 600, color: 'var(--color-teal)', marginLeft: '0.5rem' }}>
                              ${event.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance Note */}
              <div className={styles.reassuranceDrawer}>
                <Lock size={14} />
                <span>This invoice references Anonymous Order IDs only. No patient names or PHI are included in billing records.</span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleExport(selectedInvoice)}>
                  <Download size={16} /> Export CSV
                </button>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => window.print()}>
                  <Printer size={16} /> Print
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default PharmacyBilling;
