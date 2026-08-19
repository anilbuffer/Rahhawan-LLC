import React, { useState } from 'react';
import {
  CreditCard,
  TrendingUp,
  Download,
  DollarSign,
  ArrowUpRight,
  Receipt,
  Building2,
  CheckCircle2,
  Clock,
  Search,
  Filter
} from 'lucide-react';

interface Invoice {
  id: string;
  pharmacy: string;
  amount: number;
  deliveriesCount: number;
  period: string;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue';
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
  },
  {
    id: 'INV-2026-082',
    pharmacy: 'HealthLink Compounding Center',
    amount: 28450.00,
    deliveriesCount: 3420,
    period: 'Aug 01 - Aug 15, 2026',
    dueDate: 'Aug 25, 2026',
    status: 'Paid',
  },
  {
    id: 'INV-2026-083',
    pharmacy: 'Metro Specialty Oncology Rx',
    amount: 9820.75,
    deliveriesCount: 980,
    period: 'Aug 01 - Aug 15, 2026',
    dueDate: 'Aug 28, 2026',
    status: 'Pending',
  },
  {
    id: 'INV-2026-084',
    pharmacy: 'Westside Community Delivery Rx',
    amount: 18910.00,
    deliveriesCount: 2150,
    period: 'Aug 01 - Aug 15, 2026',
    dueDate: 'Aug 22, 2026',
    status: 'Pending',
  },
  {
    id: 'INV-2026-085',
    pharmacy: 'Oak Street Clinical Apothecary',
    amount: 15400.25,
    deliveriesCount: 1890,
    period: 'Jul 15 - Jul 31, 2026',
    dueDate: 'Aug 10, 2026',
    status: 'Overdue',
  },
];

export const Billing: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [search, setSearch] = useState('');

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.pharmacy.toLowerCase().includes(search.toLowerCase()) ||
      inv.id.toLowerCase().includes(search.toLowerCase())
  );

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
          <button className="btn btn-secondary">
            <Download size={16} />
            <span>Export Statement</span>
          </button>
          <button className="btn btn-primary">
            <CreditCard size={16} />
            <span>Generate Invoices</span>
          </button>
        </div>
      </div>

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
            Billing Cycle: Semi-Monthly (1st & 15th)
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
                <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
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
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.625rem' }}>
                      <Download size={13} />
                      <span>PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Billing;
