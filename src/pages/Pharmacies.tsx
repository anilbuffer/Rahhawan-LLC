import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  Plus,
  Search,
  ShieldCheck,
  AlertTriangle,
  MoreVertical,
  Edit2,
  ExternalLink,
  Users,
  X,
  Package,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { auditLogService } from '../services/auditLogService';
import styles from './Pharmacies.module.css';

export interface PharmacyEntity {
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [pharmacies, setPharmacies] = useState<PharmacyEntity[]>(MOCK_PHARMACIES);
  const [search, setSearch] = useState('');

  // Modals & Detail state
  const [onboardModalOpen, setOnboardModalOpen] = useState(false);
  const [detailPharmacy, setDetailPharmacy] = useState<PharmacyEntity | null>(null);
  const [editingPharmacy, setEditingPharmacy] = useState<PharmacyEntity | null>(null);

  // New Pharmacy Form
  const [newPharmacy, setNewPharmacy] = useState({
    name: '',
    code: '',
    address: '',
    deaLicense: '',
    deaStatus: 'Compliant' as PharmacyEntity['deaStatus'],
    subscriptionPlan: 'Enterprise' as PharmacyEntity['subscriptionPlan'],
    primaryContact: '',
    contactEmail: '',
    monthlyVolume: 1500,
  });

  // Check URL query param ?new=true
  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setOnboardModalOpen(true);
    }
  }, [searchParams]);

  const filtered = pharmacies.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.deaLicense.toLowerCase().includes(search.toLowerCase()) ||
      p.address.toLowerCase().includes(search.toLowerCase())
  );

  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created: PharmacyEntity = {
      id: `PHARM-0${pharmacies.length + 1}`,
      code: newPharmacy.code || newPharmacy.name.substring(0, 4).toUpperCase(),
      name: newPharmacy.name,
      address: newPharmacy.address,
      deaLicense: newPharmacy.deaLicense,
      deaStatus: newPharmacy.deaStatus,
      activeDeliveries: 0,
      monthlyVolume: Number(newPharmacy.monthlyVolume) || 1200,
      subscriptionPlan: newPharmacy.subscriptionPlan,
      primaryContact: newPharmacy.primaryContact,
      contactEmail: newPharmacy.contactEmail,
    };

    setPharmacies((prev) => [created, ...prev]);
    setOnboardModalOpen(false);
    setDetailPharmacy(created);

    auditLogService.logEvent({
      actionType: 'SECURITY_POLICY_CHANGE',
      category: 'Compliance',
      description: `Onboarded New Pharmacy Tenant: ${created.name} (DEA: ${created.deaLicense})`,
      actor: { id: 'USR-001', name: 'Sarah Jenkins', role: 'Super Admin' },
      severity: 'info',
      resource: { type: 'pharmacy', id: created.id, label: created.name, details: { plan: created.subscriptionPlan, contact: created.primaryContact } }
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPharmacy) return;

    setPharmacies((prev) =>
      prev.map((p) => (p.id === editingPharmacy.id ? editingPharmacy : p))
    );

    if (detailPharmacy?.id === editingPharmacy.id) {
      setDetailPharmacy(editingPharmacy);
    }

    auditLogService.logEvent({
      actionType: 'COMPLIANCE_OVERRIDE',
      category: 'Compliance',
      description: `Updated Licensing & Compliance for ${editingPharmacy.name}`,
      actor: { id: 'USR-001', name: 'Sarah Jenkins', role: 'Super Admin' },
      severity: editingPharmacy.deaStatus === 'Non-Compliant' ? 'warning' : 'info',
      resource: { type: 'pharmacy', id: editingPharmacy.id, label: editingPharmacy.name, details: { deaStatus: editingPharmacy.deaStatus, plan: editingPharmacy.subscriptionPlan } }
    });

    setEditingPharmacy(null);
  };

  return (
    <div className={styles.pharmaciesContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Pharmacy Organizations & Tenants</h1>
          <p className={styles.pageSubtitle}>
            Institutional licensing, DEA compliance certificates, and dispensing hub subscriptions.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setOnboardModalOpen(true)}>
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
              {pharmacies.reduce((acc, p) => acc + p.monthlyVolume, 0).toLocaleString()}
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
              {pharmacies.filter((p) => p.deaStatus === 'Non-Compliant').length} Non-Compliant
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
                <tr
                  key={pharmacy.id}
                  className={styles.tableRow}
                  onClick={() => setDetailPharmacy(pharmacy)}
                >
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
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        className={styles.actionBtn}
                        title="Edit Pharmacy"
                        onClick={() => setEditingPharmacy(pharmacy)}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className={styles.actionBtn}
                        title="View Hub Portal & Deliveries"
                        onClick={() => setDetailPharmacy(pharmacy)}
                      >
                        <ExternalLink size={14} />
                      </button>
                      <button
                        className={styles.actionBtn}
                        title="Export Orders"
                        onClick={() => navigate('/route4me')}
                      >
                        <FileSpreadsheet size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pharmacy Details Drawer / Modal */}
      {detailPharmacy && createPortal(
        <div className={styles.modalOverlay} onClick={() => setDetailPharmacy(null)}>
          <div className={styles.modalContent} style={{ maxWidth: 620 }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className={styles.pharmacyIcon} style={{ width: 44, height: 44 }}>
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{detailPharmacy.name}</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    ID: {detailPharmacy.id} • Tenant Code: {detailPharmacy.code}
                  </p>
                </div>
              </div>
              <button className={styles.drawerCloseBtn} onClick={() => setDetailPharmacy(null)}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: 8 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                    DEA REGISTRATION & LICENSING
                  </span>
                  <div style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'monospace', marginTop: '0.25rem' }}>
                    {detailPharmacy.deaLicense}
                  </div>
                  <div style={{ marginTop: '0.5rem' }}>
                    {detailPharmacy.deaStatus === 'Compliant' ? (
                      <span className="badge badge-teal"><ShieldCheck size={12} /> Compliant</span>
                    ) : detailPharmacy.deaStatus === 'Renewal Due' ? (
                      <span className="badge badge-amber"><AlertTriangle size={12} /> Renewal Due</span>
                    ) : (
                      <span className="badge badge-red"><AlertTriangle size={12} /> Non-Compliant</span>
                    )}
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: 8 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                    DISPATCH & CAPACITY
                  </span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-teal)', marginTop: '0.25rem' }}>
                    {detailPharmacy.activeDeliveries} Active Loads
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                    {detailPharmacy.monthlyVolume.toLocaleString()} monthly Rx shipments
                  </div>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  ORGANIZATION ADDRESS
                </span>
                <div style={{ fontSize: '0.875rem', fontWeight: 500, marginTop: '0.25rem' }}>
                  {detailPharmacy.address}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  PRIMARY CONTACT & CREDENTIALED PHARMACIST
                </span>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, marginTop: '0.25rem' }}>
                  {detailPharmacy.primaryContact}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                  {detailPharmacy.contactEmail}
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  const toEdit = detailPharmacy;
                  setDetailPharmacy(null);
                  setEditingPharmacy(toEdit);
                }}
              >
                <Edit2 size={14} />
                <span>Edit Details</span>
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setDetailPharmacy(null);
                  navigate('/deliveries');
                }}
              >
                <Package size={14} />
                <span>View All Deliveries</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Onboard New Pharmacy Modal */}
      {onboardModalOpen && createPortal(
        <div className={styles.modalOverlay} onClick={() => setOnboardModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleOnboardSubmit}>
              <div className={styles.modalHeader}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Onboard New Pharmacy Hub</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Register dispensing facility and configure automated DEA 222 compliance credentials.
                  </p>
                </div>
                <button type="button" className={styles.drawerCloseBtn} onClick={() => setOnboardModalOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              <div className={styles.modalBody}>
                <div>
                  <label className={styles.formLabel}>Pharmacy Organization Name</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="e.g. Apex Clinical Speciality Pharmacy"
                    value={newPharmacy.name}
                    onChange={(e) => setNewPharmacy({ ...newPharmacy, name: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
                  <div>
                    <label className={styles.formLabel}>Tenant Code</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="e.g. APEX-RX"
                      value={newPharmacy.code}
                      onChange={(e) => setNewPharmacy({ ...newPharmacy, code: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className={styles.formLabel}>DEA License Certificate #</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="e.g. DN-1982741-B"
                      value={newPharmacy.deaLicense}
                      onChange={(e) => setNewPharmacy({ ...newPharmacy, deaLicense: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={styles.formLabel}>Facility Street Address</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="Street, Suite, City, State ZIP"
                    value={newPharmacy.address}
                    onChange={(e) => setNewPharmacy({ ...newPharmacy, address: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className={styles.formLabel}>Primary Contact / Pharmacist</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="Dr. Jane Doe, PharmD"
                      value={newPharmacy.primaryContact}
                      onChange={(e) => setNewPharmacy({ ...newPharmacy, primaryContact: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className={styles.formLabel}>Contact Email</label>
                    <input
                      type="email"
                      className={styles.formInput}
                      placeholder="contact@pharmacy.com"
                      value={newPharmacy.contactEmail}
                      onChange={(e) => setNewPharmacy({ ...newPharmacy, contactEmail: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className={styles.formLabel}>Subscription Plan</label>
                    <select
                      className={styles.formInput}
                      value={newPharmacy.subscriptionPlan}
                      onChange={(e) => setNewPharmacy({ ...newPharmacy, subscriptionPlan: e.target.value as any })}
                    >
                      <option value="Enterprise">Enterprise Hub</option>
                      <option value="Professional">Professional Tier</option>
                      <option value="Standard">Standard Dispensary</option>
                    </select>
                  </div>
                  <div>
                    <label className={styles.formLabel}>Estimated Monthly Volume</label>
                    <input
                      type="number"
                      className={styles.formInput}
                      value={newPharmacy.monthlyVolume}
                      onChange={(e) => setNewPharmacy({ ...newPharmacy, monthlyVolume: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className="btn btn-secondary" onClick={() => setOnboardModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Complete Pharmacy Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Pharmacy Modal */}
      {editingPharmacy && createPortal(
        <div className={styles.modalOverlay} onClick={() => setEditingPharmacy(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleEditSubmit}>
              <div className={styles.modalHeader}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Edit Pharmacy Information</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Updating credentials for {editingPharmacy.name}
                  </p>
                </div>
                <button type="button" className={styles.drawerCloseBtn} onClick={() => setEditingPharmacy(null)}>
                  <X size={18} />
                </button>
              </div>

              <div className={styles.modalBody}>
                <div>
                  <label className={styles.formLabel}>Pharmacy Name</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={editingPharmacy.name}
                    onChange={(e) => setEditingPharmacy({ ...editingPharmacy, name: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className={styles.formLabel}>DEA License #</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={editingPharmacy.deaLicense}
                      onChange={(e) => setEditingPharmacy({ ...editingPharmacy, deaLicense: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className={styles.formLabel}>DEA Compliance Status</label>
                    <select
                      className={styles.formInput}
                      value={editingPharmacy.deaStatus}
                      onChange={(e) => setEditingPharmacy({ ...editingPharmacy, deaStatus: e.target.value as any })}
                    >
                      <option value="Compliant">Compliant</option>
                      <option value="Renewal Due">Renewal Due</option>
                      <option value="Non-Compliant">Non-Compliant</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={styles.formLabel}>Address</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={editingPharmacy.address}
                    onChange={(e) => setEditingPharmacy({ ...editingPharmacy, address: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className={styles.formLabel}>Primary Contact</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={editingPharmacy.primaryContact}
                      onChange={(e) => setEditingPharmacy({ ...editingPharmacy, primaryContact: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className={styles.formLabel}>Contact Email</label>
                    <input
                      type="email"
                      className={styles.formInput}
                      value={editingPharmacy.contactEmail}
                      onChange={(e) => setEditingPharmacy({ ...editingPharmacy, contactEmail: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingPharmacy(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Pharmacies;
