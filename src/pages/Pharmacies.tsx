import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  ShieldCheck,
  AlertTriangle,
  MoreVertical,
  Edit2,
  ExternalLink,
  Users
} from 'lucide-react';
import styles from './Pharmacies.module.css';

interface PharmacyEntity {
  id: string;
  code: string;
  name: string;
  address: string;
  deaLicense: string;
  deaStatus: 'Compliant' | 'Renewal Due' | 'Non-Compliant';
  activeDeliveries: number;
  monthlyVolume: number;
  subscriptionPlan: 'Enterprise' | 'Professional' | 'Standard';
  primaryContact: string;
  contactEmail: string;
}

const MOCK_PHARMACIES: PharmacyEntity[] = [
  {
    id: 'PHARM-01',
    code: 'NG-INF',
    name: 'Northgate Infusion Pharmacy',
    address: '1240 Grand Ave, Suite 300, Chicago, IL',
    deaLicense: 'DN-9948218-A',
    deaStatus: 'Non-Compliant',
    activeDeliveries: 14,
    monthlyVolume: 1240,
    subscriptionPlan: 'Enterprise',
    primaryContact: 'Dr. Rebecca Vance',
    contactEmail: 'rebecca@northgate-infusion.com',
  },
  {
    id: 'PHARM-02',
    code: 'HL-CMP',
    name: 'HealthLink Compounding Center',
    address: '840 N Michigan Ave, Fl 4, Chicago, IL',
    deaLicense: 'DN-8491024-C',
    deaStatus: 'Compliant',
    activeDeliveries: 28,
    monthlyVolume: 3420,
    subscriptionPlan: 'Enterprise',
    primaryContact: 'Marcus Sterling, RPh',
    contactEmail: 'msterling@healthlinkrx.com',
  },
  {
    id: 'PHARM-03',
    code: 'MP-SPEC',
    name: 'Metro Specialty Oncology Rx',
    address: '500 W Madison St, Suite 120, Chicago, IL',
    deaLicense: 'DN-3019284-B',
    deaStatus: 'Compliant',
    activeDeliveries: 8,
    monthlyVolume: 980,
    subscriptionPlan: 'Professional',
    primaryContact: 'Sophia Lin, PharmD',
    contactEmail: 'slin@metrospecialty.com',
  },
  {
    id: 'PHARM-04',
    code: 'WS-DEL',
    name: 'Westside Community Delivery Rx',
    address: '2201 S Western Ave, Chicago, IL',
    deaLicense: 'DN-4491022-D',
    deaStatus: 'Renewal Due',
    activeDeliveries: 19,
    monthlyVolume: 2150,
    subscriptionPlan: 'Professional',
    primaryContact: 'David Kim',
    contactEmail: 'dkim@westsidedelivery.com',
  },
  {
    id: 'PHARM-05',
    code: 'OS-APOTH',
    name: 'Oak Street Clinical Apothecary',
    address: '1120 N Clark St, Chicago, IL',
    deaLicense: 'DN-5820194-E',
    deaStatus: 'Compliant',
    activeDeliveries: 17,
    monthlyVolume: 1890,
    subscriptionPlan: 'Standard',
    primaryContact: 'Elena Rostova',
    contactEmail: 'elena@oakstreetapothecary.com',
  },
];

export const Pharmacies: React.FC = () => {
  const [pharmacies, setPharmacies] = useState<PharmacyEntity[]>(MOCK_PHARMACIES);
  const [search, setSearch] = useState('');

  const filtered = pharmacies.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.deaLicense.toLowerCase().includes(search.toLowerCase()) ||
      p.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.pharmaciesContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Pharmacy Organizations & Tenants</h1>
          <p className={styles.pageSubtitle}>
            Institutional licensing, DEA compliance certificates, and dispensing hub subscriptions.
          </p>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} />
          <span>Onboard New Pharmacy</span>
        </button>
      </div>

      {/* KPI Overview */}
      <div className={styles.kpiStrip}>
        <div className={styles.kpiCard}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Active Pharmacies
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem' }}>
              {pharmacies.length}
            </div>
          </div>
          <div style={{ padding: '0.625rem', borderRadius: 'var(--radius-2xl)', background: 'rgba(14, 163, 131, 0.1)', color: 'var(--color-teal)' }}>
            <Building2 size={22} />
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              Monthly Rx Volume
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem' }}>
              9,680
            </div>
          </div>
          <div style={{ padding: '0.625rem', borderRadius: 'var(--radius-2xl)', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--color-blue)' }}>
            <Users size={22} />
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              DEA Audits Pending
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--color-red)' }}>
              1 Non-Compliant
            </div>
          </div>
          <div style={{ padding: '0.625rem', borderRadius: 'var(--radius-2xl)', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-red)' }}>
            <AlertTriangle size={22} />
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div className="input" style={{ flex: 1, maxWidth: 400 }}>
            <Search size={16} color="var(--color-text-muted)" />
            <input
              type="text"
              placeholder="Search pharmacy name, code, DEA license..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            Showing {filtered.length} of {pharmacies.length} pharmacies
          </div>
        </div>
      </div>

      {/* Pharmacies Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Pharmacy Organization</th>
                <th>DEA License #</th>
                <th>DEA / State Status</th>
                <th>Active Deliveries</th>
                <th>Monthly Volume</th>
                <th>Plan Tier</th>
                <th>Primary Contact</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((pharmacy) => (
                <tr key={pharmacy.id} className={styles.tableRow}>
                  <td>
                    <div className={styles.pharmacyBlock}>
                      <div className={styles.pharmacyIcon}>
                        <Building2 size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{pharmacy.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          {pharmacy.address}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                      {pharmacy.deaLicense}
                    </span>
                  </td>

                  <td>
                    {pharmacy.deaStatus === 'Compliant' ? (
                      <span className="badge badge-teal">
                        <ShieldCheck size={12} /> Compliant
                      </span>
                    ) : pharmacy.deaStatus === 'Renewal Due' ? (
                      <span className="badge badge-amber">
                        <AlertTriangle size={12} /> Renewal Due
                      </span>
                    ) : (
                      <span className="badge badge-red">
                        <AlertTriangle size={12} /> Non-Compliant
                      </span>
                    )}
                  </td>

                  <td>
                    <strong>{pharmacy.activeDeliveries}</strong> active
                  </td>

                  <td>
                    {pharmacy.monthlyVolume.toLocaleString()} / mo
                  </td>

                  <td>
                    <span className={`badge badge-${pharmacy.subscriptionPlan === 'Enterprise' ? 'blue' : 'grey'}`}>
                      {pharmacy.subscriptionPlan}
                    </span>
                  </td>

                  <td>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '0.8125rem' }}>{pharmacy.primaryContact}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{pharmacy.contactEmail}</div>
                    </div>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className={styles.actionBtn} title="Edit Pharmacy">
                        <Edit2 size={14} />
                      </button>
                      <button className={styles.actionBtn} title="View Hub Portal">
                        <ExternalLink size={14} />
                      </button>
                      <button className={styles.actionBtn} title="More Options">
                        <MoreVertical size={14} />
                      </button>
                    </div>
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

export default Pharmacies;
