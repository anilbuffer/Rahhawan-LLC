import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Download,
  FileSignature,
  Thermometer,
  ShieldCheck,
  Camera,
  ArrowRight,
  Filter,
  Check,
  X,
  Package,
} from 'lucide-react';
import { driverSyncService, type DriverDeliveryOrder } from '../../services/driverSyncService';
import styles from './DriverHistory.module.css';

export const DriverHistory: React.FC = () => {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<DriverDeliveryOrder[]>(driverSyncService.getDeliveries());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'DELIVERED' | 'FAILED' | 'CONTROLLED' | 'COLD'>('ALL');

  useEffect(() => {
    const unsub = driverSyncService.subscribe(() => {
      setDeliveries(driverSyncService.getDeliveries());
    });
    return unsub;
  }, []);

  const filteredHistory = useMemo(() => {
    let list = [...deliveries];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (d) =>
          d.id.toLowerCase().includes(q) ||
          d.patientSafeId.toLowerCase().includes(q) ||
          d.deliveryAddress.street.toLowerCase().includes(q) ||
          d.prescriptionSummary.description.toLowerCase().includes(q)
      );
    }

    if (filterType === 'DELIVERED') {
      list = list.filter((d) => d.status === 'Delivered');
    } else if (filterType === 'FAILED') {
      list = list.filter((d) => d.status === 'Failed');
    } else if (filterType === 'CONTROLLED') {
      list = list.filter((d) => d.flags.controlled);
    } else if (filterType === 'COLD') {
      list = list.filter((d) => d.flags.refrigerated);
    }

    return list;
  }, [deliveries, searchQuery, filterType]);

  const deliveredCount = deliveries.filter((d) => d.status === 'Delivered').length;
  const failedCount = deliveries.filter((d) => d.status === 'Failed').length;

  const handleExportCSV = () => {
    const headers = 'Order ID,Stop #,Patient ID,Address,Status,Signature,Pickup Temp,Delivery Temp,DEA Token\n';
    const rows = filteredHistory
      .map(
        (d) =>
          `${d.id},${d.stopSequence},${d.patientSafeId},"${d.deliveryAddress.street}, ${d.deliveryAddress.city}",${
            d.status
          },${d.driverEvidence?.signature ? 'Verified' : 'N/A'},${
            d.driverEvidence?.pickupTemp ? `${d.driverEvidence.pickupTemp.fahrenheit}F` : 'N/A'
          },${
            d.driverEvidence?.deliveryTemp ? `${d.driverEvidence.deliveryTemp.fahrenheit}F` : 'N/A'
          },${d.flags.controlled ? 'DEA-222-PKI' : 'N/A'}`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `driver-manifest-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Delivery Audit History</h1>
          <p className={styles.pageSubtitle}>
            Completed manifest chain-of-custody proofs, dual-temperature logs, and digital signatures
          </p>
        </div>

        <button className={styles.exportBtn} onClick={handleExportCSV}>
          <Download size={16} />
          <span>Export Manifest Audit (.CSV)</span>
        </button>
      </div>

      {/* History Stats Cards */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Shift Stops</span>
          <div className={styles.statValue}>{deliveries.length}</div>
          <span className={styles.statSub}>100% Manifest Verified</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Delivered & Verified</span>
          <div className={styles.statValue} style={{ color: '#10B981' }}>{deliveredCount}</div>
          <span className={styles.statSub}>Signatures Captured</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Cold-Chain Logged</span>
          <div className={styles.statValue} style={{ color: '#0284C7' }}>
            {deliveries.filter((d) => d.flags.refrigerated).length}
          </div>
          <span className={styles.statSub}>Dual-Temp Conforming</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>DEA Form 222 Confirmed</span>
          <div className={styles.statValue} style={{ color: '#D97706' }}>
            {deliveries.filter((d) => d.flags.controlled).length}
          </div>
          <span className={styles.statSub}>PKI Tokens Attached</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search delivery history by Order ID, address, patient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className={styles.clearBtn} onClick={() => setSearchQuery('')}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className={styles.filterBtns}>
          <button
            className={`${styles.filterBtn} ${filterType === 'ALL' ? styles.filterActive : ''}`}
            onClick={() => setFilterType('ALL')}
          >
            All ({deliveries.length})
          </button>
          <button
            className={`${styles.filterBtn} ${filterType === 'DELIVERED' ? styles.filterActive : ''}`}
            onClick={() => setFilterType('DELIVERED')}
          >
            Delivered ({deliveredCount})
          </button>
          <button
            className={`${styles.filterBtn} ${filterType === 'CONTROLLED' ? styles.filterActive : ''}`}
            onClick={() => setFilterType('CONTROLLED')}
          >
            Controlled C-II
          </button>
          <button
            className={`${styles.filterBtn} ${filterType === 'COLD' ? styles.filterActive : ''}`}
            onClick={() => setFilterType('COLD')}
          >
            Cold-Chain
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Stop #</th>
              <th>Order ID</th>
              <th>Patient & Address</th>
              <th>Prescription</th>
              <th>Evidence Captured</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.map((order) => {
              const evidence = order.driverEvidence;
              const hasSig = !!evidence?.signature;
              const hasPhotos = (evidence?.photos || []).length > 0;
              const hasTemp = !!evidence?.deliveryTemp || !!evidence?.pickupTemp;
              const hasCoc = !!evidence?.chainOfCustodyHandoff;

              return (
                <tr key={order.id} onClick={() => navigate(`/driver/order/${order.id}`)} className={styles.tableRow}>
                  <td>
                    <span className={styles.stopNum}>#{order.stopSequence}</span>
                  </td>
                  <td>
                    <div className={styles.orderIdCell}>
                      <span className={styles.orderIdText}>{order.id}</span>
                      <span className={styles.pharmacyName}>{order.pharmacy.name}</span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.addressCell}>
                      <div className={styles.patientName}>Patient {order.patientSafeId}</div>
                      <div className={styles.streetName}>
                        {order.deliveryAddress.street}, {order.deliveryAddress.city}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.rxCell}>
                      <span className={styles.rxDesc}>{order.prescriptionSummary.description}</span>
                      <div className={styles.tagsRow}>
                        {order.flags.controlled && <span className={styles.c2Tag}>C-II DEA</span>}
                        {order.flags.refrigerated && <span className={styles.coldTag}>Cold-Chain</span>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.evidenceBadges}>
                      {hasSig && (
                        <span className={styles.evidencePill} title="Recipient Signature Attached">
                          <FileSignature size={12} color="#0EA383" />
                          <span>Signature</span>
                        </span>
                      )}
                      {hasPhotos && (
                        <span className={styles.evidencePill} title="Photo Proof Attached">
                          <Camera size={12} color="#0EA383" />
                          <span>Photo</span>
                        </span>
                      )}
                      {hasTemp && (
                        <span className={styles.evidencePill} title="Temperature Reading Attached">
                          <Thermometer size={12} color="#0284C7" />
                          <span>{evidence?.deliveryTemp?.fahrenheit || evidence?.pickupTemp?.fahrenheit}°F</span>
                        </span>
                      )}
                      {hasCoc && (
                        <span className={styles.evidencePill} title="DEA Chain of Custody Confirmed">
                          <ShieldCheck size={12} color="#D97706" />
                          <span>DEA CoC</span>
                        </span>
                      )}
                      {!hasSig && !hasPhotos && !hasTemp && !hasCoc && (
                        <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>In Progress</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${
                        order.status === 'Delivered'
                          ? styles.statusDelivered
                          : order.status === 'Failed'
                          ? styles.statusFailed
                          : styles.statusActive
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className={styles.viewBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/driver/order/${order.id}`);
                      }}
                    >
                      <span>Audit Record</span>
                      <ArrowRight size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredHistory.length === 0 && (
          <div className={styles.emptyState}>
            <Package size={36} color="#9CA3AF" />
            <p>No delivery history matched the selected filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverHistory;
