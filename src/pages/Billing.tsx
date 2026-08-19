import React, { useState } from 'react';
import {
  CreditCard,
  TrendingUp,
  Download,
  DollarSign,
  ArrowUpRight,
  Receipt,
  CheckCircle2,
  Search,
  X,
  Printer
} from 'lucide-react';
import { auditLogService } from '../services/auditLogService';

export interface Invoice {
  id: string;
  pharmacy: string;
  amount: number;
  deliveriesCount: number;
  period: string;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  breakdown: {
    baseDeliveryFee: number;
    controlledSubstanceFee: number;
    coldChainSurcharge: number;
    platformMargin: number;
    courierPayout: number;
  };
}

const MOCK_INVOICES: Invoice[] = [
  {
    id: 'INV-2026-081',
    pharmacy: 'Northgate Infusion Pharmacy',
    amount: 14820.50,
    deliveriesCount: 1240,
    period: 'Aug 01 - Aug 15, 2026',
    dueDate: 'Aug 25, 2026',
    status: 'Paid',
    breakdown: {
      baseDeliveryFee: 11160.00,
      controlledSubstanceFee: 1860.00,
      coldChainSurcharge: 1800.50,
      platformMargin: 1778.46,
      courierPayout: 13042.04,
    },
  },
  {
    id: 'INV-2026-082',
    pharmacy: 'HealthLink Compounding Center',
    amount: 28450.00,
    deliveriesCount: 3420,
    period: 'Aug 01 - Aug 15, 2026',
    dueDate: 'Aug 25, 2026',
    status: 'Paid',
    breakdown: {
      baseDeliveryFee: 21375.00,
      controlledSubstanceFee: 4100.00,
      coldChainSurcharge: 2975.00,
      platformMargin: 3414.00,
      courierPayout: 25036.00,
    },
  },
  {
    id: 'INV-2026-083',
    pharmacy: 'Metro Specialty Oncology Rx',
    amount: 9820.75,
    deliveriesCount: 980,
    period: 'Aug 01 - Aug 15, 2026',
    dueDate: 'Aug 28, 2026',
    status: 'Pending',
    breakdown: {
      baseDeliveryFee: 7350.00,
      controlledSubstanceFee: 1200.00,
      coldChainSurcharge: 1270.75,
      platformMargin: 1178.49,
      courierPayout: 8642.26,
    },
  },
  {
    id: 'INV-2026-084',
    pharmacy: 'Westside Community Delivery Rx',
    amount: 18910.00,
    deliveriesCount: 2150,
    period: 'Aug 01 - Aug 15, 2026',
    dueDate: 'Aug 22, 2026',
    status: 'Pending',
    breakdown: {
      baseDeliveryFee: 14175.00,
      controlledSubstanceFee: 2500.00,
      coldChainSurcharge: 2235.00,
      platformMargin: 2269.20,
      courierPayout: 16640.80,
    },
  },
  {
    id: 'INV-2026-085',
    pharmacy: 'Oak Street Clinical Apothecary',
    amount: 15400.25,
    deliveriesCount: 1890,
    period: 'Jul 15 - Jul 31, 2026',
    dueDate: 'Aug 10, 2026',
    status: 'Overdue',
    breakdown: {
      baseDeliveryFee: 11800.00,
      controlledSubstanceFee: 1950.00,
      coldChainSurcharge: 1650.25,
      platformMargin: 1848.03,
      courierPayout: 13552.22,
    },
  },
];

export const Billing: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [search, setSearch] = useState('');
  
  // Modals
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.pharmacy.toLowerCase().includes(search.toLowerCase()) ||
      inv.id.toLowerCase().includes(search.toLowerCase())
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExportStatement = () => {
    const headers = ['Invoice ID', 'Pharmacy Hub', 'Billing Period', 'Rx Deliveries', 'Amount Due', 'Status', 'Platform Margin', 'Courier Payout'];
    const rows = filteredInvoices.map((inv) => [
      inv.id,
      `"${inv.pharmacy}"`,
      `"${inv.period}"`,
      inv.deliveriesCount,
      `$${inv.amount.toFixed(2)}`,
      inv.status,
      `$${inv.breakdown.platformMargin.toFixed(2)}`,
      `$${inv.breakdown.courierPayout.toFixed(2)}`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rahhawan_Billing_Statement_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    auditLogService.logEvent({
      actionType: 'ROUTE4ME_EXPORT',
      category: 'Route & Export',
      description: `Exported Financial Billing Statement CSV (${filteredInvoices.length} invoices)`,
      actor: { id: 'USR-001', name: 'Sarah Jenkins', role: 'Super Admin' },
      severity: 'info',
      resource: { type: 'system', id: 'MTD-2026-08', label: 'August 2026 Ledger', details: { count: filteredInvoices.length } }
    });

    showToast('Billing statement CSV exported successfully.');
  };

  const handleGenerateInvoicesBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const newInv: Invoice = {
      id: `INV-2026-08${invoices.length + 1}`,
      pharmacy: 'Apex Clinical Specialty Pharmacy',
      amount: 11250.00,
      deliveriesCount: 1410,
      period: 'Aug 01 - Aug 15, 2026',
      dueDate: 'Aug 30, 2026',
      status: 'Pending',
      breakdown: {
        baseDeliveryFee: 8460.00,
        controlledSubstanceFee: 1410.00,
        coldChainSurcharge: 1380.00,
        platformMargin: 1350.00,
        courierPayout: 9900.00,
      }
    };

    setInvoices((prev) => [newInv, ...prev]);
    setGenerateModalOpen(false);
    setSelectedInvoice(newInv);

    auditLogService.logEvent({
      actionType: 'ORDER_STATUS_UPDATE',
      category: 'State Change',
      description: `Generated Semi-Monthly Invoicing Batch for Semi-Monthly Period (Aug 01 - Aug 15)`,
      actor: { id: 'USR-001', name: 'Sarah Jenkins', role: 'Super Admin' },
      severity: 'info',
      resource: { type: 'system', id: newInv.id, label: newInv.pharmacy, details: { amount: newInv.amount, deliveries: newInv.deliveriesCount } }
    });

    showToast('Invoicing batch generated and queued for automated ACH settlement.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Billing & Financial Settlements</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Automated courier payouts, pharmacy delivery invoicing, and platform revenue telemetry.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={handleExportStatement}>
            <Download size={16} />
            <span>Export Statement</span>
          </button>
          <button className="btn btn-primary" onClick={() => setGenerateModalOpen(true)}>
            <CreditCard size={16} />
            <span>Generate Invoices</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div style={{ padding: '0.75rem 1.25rem', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', color: '#065F46', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} />
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{toastMessage}</span>
        </div>
      )}

      {/* KPI Financial Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Gross Delivery Volume (MTD)
            </span>
            <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(14, 163, 131, 0.1)', color: 'var(--color-teal)' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.5rem' }}>
            $87,401.50
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-teal)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
            <ArrowUpRight size={14} /> +18.4% vs last month
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Rahhawan Platform Net (12%)
            </span>
            <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--color-blue)' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.5rem' }}>
            $10,488.18
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            Platform service & routing margin
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Courier Disbursals Due
            </span>
            <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-amber)' }}>
              <Receipt size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.5rem' }}>
            $76,913.32
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-amber)', marginTop: '0.25rem' }}>
            Scheduled payout: Friday, Aug 21
          </div>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div className="input" style={{ maxWidth: 360 }}>
            <Search size={16} color="var(--color-text-muted)" />
            <input
              type="text"
              placeholder="Search invoices by pharmacy or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            Showing {filteredInvoices.length} of {invoices.length} invoices
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Invoice ID</th>
                <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Pharmacy Hub</th>
                <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Billing Period</th>
                <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Rx Deliveries</th>
                <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Amount Due</th>
                <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '0.875rem 1.25rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((inv) => (
                <tr
                  key={inv.id}
                  style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                  onClick={() => setSelectedInvoice(inv)}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '1rem 1.25rem', fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-teal)' }}>
                    {inv.id}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 500 }}>
                    {inv.pharmacy}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>
                    {inv.period}
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>
                    {inv.deliveriesCount.toLocaleString()} deliveries
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700 }}>
                    ${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span
                      className={`badge badge-${
                        inv.status === 'Paid'
                          ? 'teal'
                          : inv.status === 'Pending'
                          ? 'blue'
                          : 'red'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                    <button
                      className="btn btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.625rem' }}
                      onClick={() => setSelectedInvoice(inv)}
                    >
                      <Download size={13} />
                      <span>Details & PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Details & Breakdown Modal */}
      {selectedInvoice && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(17, 24, 39, 0.5)',
            backdropFilter: 'blur(2px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setSelectedInvoice(null)}
        >
          <div
            style={{
              background: 'white',
              width: '100%',
              maxWidth: 580,
              borderRadius: '16px',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Invoice Statement #{selectedInvoice.id}</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  {selectedInvoice.pharmacy} • Period: {selectedInvoice.period}
                </p>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', padding: '1rem', borderRadius: 8 }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    TOTAL AMOUNT DUE
                  </span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    ${selectedInvoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <span
                    className={`badge badge-${
                      selectedInvoice.status === 'Paid' ? 'teal' : selectedInvoice.status === 'Pending' ? 'blue' : 'red'
                    }`}
                    style={{ fontSize: '0.875rem', padding: '0.4rem 0.75rem' }}
                  >
                    {selectedInvoice.status}
                  </span>
                </div>
              </div>

              {/* Itemized Breakdown Table */}
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                  Itemized Fee Breakdown
                </span>
                <div style={{ marginTop: '0.5rem', border: '1px solid var(--border-color)', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.625rem 0.875rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.8125rem' }}>
                    <span>Base Courier Dispatch Fee ({selectedInvoice.deliveriesCount} deliveries)</span>
                    <span style={{ fontWeight: 600 }}>${selectedInvoice.breakdown.baseDeliveryFee.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.625rem 0.875rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.8125rem' }}>
                    <span>DEA Schedule II Chain of Custody Verification</span>
                    <span style={{ fontWeight: 600 }}>${selectedInvoice.breakdown.controlledSubstanceFee.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.625rem 0.875rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.8125rem' }}>
                    <span>Cold-Chain Temperature Sensor Telemetry</span>
                    <span style={{ fontWeight: 600 }}>${selectedInvoice.breakdown.coldChainSurcharge.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.625rem 0.875rem', background: '#F8FAFC', fontSize: '0.8125rem' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Platform Service Margin (12%)</span>
                    <span style={{ color: 'var(--color-blue)', fontWeight: 600 }}>${selectedInvoice.breakdown.platformMargin.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Due Date: <strong>{selectedInvoice.dueDate}</strong> • Electronic settlement compliant with HIPAA merchant processing standards.
              </div>
            </div>

            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', background: '#F9FAFB', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedInvoice(null)}>
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  showToast(`Invoice #${selectedInvoice.id} receipt PDF generated.`);
                  setSelectedInvoice(null);
                }}
              >
                <Printer size={14} />
                <span>Print / Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Invoices Modal */}
      {generateModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(17, 24, 39, 0.5)',
            backdropFilter: 'blur(2px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setGenerateModalOpen(false)}
        >
          <div
            style={{
              background: 'white',
              width: '100%',
              maxWidth: 520,
              borderRadius: '16px',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleGenerateInvoicesBatch}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Generate Semi-Monthly Invoices</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Computes delivery logs, schedule II surcharges, and ACH disbursals.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setGenerateModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
                    Billing Cycle Period
                  </label>
                  <select style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                    <option>Aug 01 - Aug 15, 2026 (Current Cycle)</option>
                    <option>Jul 15 - Jul 31, 2026 (Previous Cycle)</option>
                  </select>
                </div>

                <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Batch Calculation Summary:</div>
                  <ul style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem', paddingLeft: '1.25rem', lineHeight: 1.6 }}>
                    <li>6 active pharmacy organizations queued</li>
                    <li>8,680 completed delivery orders scanned</li>
                    <li>Automated 12% platform routing fee applied</li>
                    <li>Cryptographic invoice hash appended to audit ledger</li>
                  </ul>
                </div>
              </div>

              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', background: '#F9FAFB', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setGenerateModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Run Invoicing Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
