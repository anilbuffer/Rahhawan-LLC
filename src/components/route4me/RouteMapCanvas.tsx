import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  ZoomIn,
  ZoomOut,
  Navigation,
  Layers,
  Snowflake,
  Zap,
  Lock,
  ChevronRight,
  Trash2,
  X,
  Compass,
  AlertTriangle
} from 'lucide-react';
import type { RouteStop } from '../../mock/route4meData';
import { DEPOT_LOCATION } from '../../mock/route4meData';
import styles from './RouteMapCanvas.module.css';

interface RouteMapCanvasProps {
  stops: RouteStop[];
  selectedStopId: string | null;
  onSelectStop: (stopId: string | null) => void;
  onOpenStopDetail: (stop: RouteStop) => void;
  onRemoveStop: (stop: RouteStop) => void;
  filterFlag: 'all' | 'controlled' | 'refrigerated' | 'rush';
  isOptimizing: boolean;
  assignedDriverName: string;
}

export const RouteMapCanvas: React.FC<RouteMapCanvasProps> = ({
  stops,
  selectedStopId,
  onSelectStop,
  onOpenStopDetail,
  onRemoveStop,
  filterFlag,
  isOptimizing,
  assignedDriverName,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const driversLayerRef = useRef<L.LayerGroup | null>(null);

  // Layers visibility state
  const [showLayersMenu, setShowLayersMenu] = useState<boolean>(false);
  const [layerStops, setLayerStops] = useState<boolean>(true);
  const [layerRoute, setLayerRoute] = useState<boolean>(true);
  const [layerDrivers, setLayerDrivers] = useState<boolean>(true);
  const [mapTheme, setMapTheme] = useState<'voyager' | 'light'>('voyager');

  const selectedStop = stops.find((s) => s.id === selectedStopId);

  // 1. Initialize Real Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Initialize Leaflet Map centered on Manhattan
    const map = L.map(mapContainerRef.current, {
      center: [40.7580, -73.9855],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    // Real CartoDB Voyager Light Basemap (Real world roads, buildings, labels, water)
    const tileUrl =
      mapTheme === 'voyager'
        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    const tiles = L.tileLayer(tileUrl, {
      subdomains: 'abcd',
      maxZoom: 19,
    });
    tiles.addTo(map);

    const routeGroup = L.layerGroup().addTo(map);
    const markersGroup = L.layerGroup().addTo(map);
    const driversGroup = L.layerGroup().addTo(map);

    routeLayerRef.current = routeGroup;
    markersLayerRef.current = markersGroup;
    driversLayerRef.current = driversGroup;
    mapInstanceRef.current = map;

    // Fix map sizing on render
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Render Real Markers & Route Polylines
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !routeLayerRef.current || !markersLayerRef.current || !driversLayerRef.current) return;

    routeLayerRef.current.clearLayers();
    markersLayerRef.current.clearLayers();
    driversLayerRef.current.clearLayers();

    if (stops.length === 0) return;

    // Build Route Coordinates Array: Depot -> Stop 1 -> Stop 2 -> ... -> Stop 15
    const latLngs: [number, number][] = [
      [DEPOT_LOCATION.lat, DEPOT_LOCATION.lng],
      ...stops.map((s): [number, number] => [s.lat, s.lng]),
    ];

    // ROUTE POLYLINE (Layer 1: Outer Casing, Layer 2: Core Teal Path)
    if (layerRoute) {
      // White casing
      L.polyline(latLngs, {
        color: '#FFFFFF',
        weight: 7,
        opacity: 0.95,
        lineJoin: 'round',
        lineCap: 'round',
      }).addTo(routeLayerRef.current);

      // Core Vibrant Teal Line
      L.polyline(latLngs, {
        color: isOptimizing ? '#F59E0B' : '#0D9488',
        weight: 4.5,
        opacity: 0.95,
        dashArray: isOptimizing ? '6, 6' : undefined,
        lineJoin: 'round',
        lineCap: 'round',
      }).addTo(routeLayerRef.current);
    }

    // DEPOT HUB MARKER
    const depotHtml = `
      <div class="${styles.leafletDepotPin}">
        <div class="${styles.depotInner}">🏠</div>
        <div class="${styles.depotLabel}">DEPOT</div>
      </div>
    `;
    const depotIcon = L.divIcon({
      html: depotHtml,
      className: '',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    L.marker([DEPOT_LOCATION.lat, DEPOT_LOCATION.lng], { icon: depotIcon })
      .addTo(markersLayerRef.current)
      .on('click', () => onSelectStop(null));

    // NUMBERED DELIVERY STOP PINS (1 TO 15)
    if (layerStops) {
      stops.forEach((stop) => {
        const isSelected = selectedStopId === stop.id;
        const isMatchFilter =
          filterFlag === 'all' ||
          (filterFlag === 'controlled' && stop.flags.controlled) ||
          (filterFlag === 'refrigerated' && stop.flags.refrigerated) ||
          (filterFlag === 'rush' && stop.flags.rush);

        if (!isMatchFilter) return;

        let badgeHtml = '';
        if (stop.status === 'Problem') {
          badgeHtml = `<span class="${styles.pinBadgeAlert}">!</span>`;
        } else if (stop.flags.rush) {
          badgeHtml = `<span class="${styles.pinBadgeRush}">⚡</span>`;
        } else if (stop.flags.controlled) {
          badgeHtml = `<span class="${styles.pinBadgeControlled}">🔒</span>`;
        } else if (stop.flags.refrigerated) {
          badgeHtml = `<span class="${styles.pinBadgeCold}">❄</span>`;
        }

        const pinHtml = `
          <div class="${styles.leafletStopPin} ${isSelected ? styles.leafletStopPinSelected : ''} ${
            stop.status === 'Problem' ? styles.leafletStopPinProblem : ''
          }">
            <div class="${styles.pinCircle}">${stop.stopNumber}</div>
            ${badgeHtml}
            ${isSelected ? `<div class="${styles.pinPulseRing}"></div>` : ''}
          </div>
        `;

        const stopIcon = L.divIcon({
          html: pinHtml,
          className: '',
          iconSize: [32, 40],
          iconAnchor: [16, 38],
        });

        L.marker([stop.lat, stop.lng], { icon: stopIcon })
          .addTo(markersLayerRef.current!)
          .on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            onSelectStop(stop.id);
            map.panTo([stop.lat, stop.lng], { animate: true, duration: 0.4 });
          });
      });
    }

    // ACTIVE DRIVERS WITH RADAR PULSE WAVES (AS IN USER REFERENCE)
    if (layerDrivers) {
      const activeDrivers = [
        { name: assignedDriverName, lat: 40.7480, lng: -73.9920 },
        { name: 'Elena Rostova', lat: 40.7720, lng: -73.9800 },
        { name: 'David Wilson', lat: 40.7120, lng: -74.0080 },
      ];

      activeDrivers.forEach((driver) => {
        const driverHtml = `
          <div class="${styles.driverRadarPin}">
            <div class="${styles.driverPulseWave}"></div>
            <div class="${styles.driverPulseWave2}"></div>
            <div class="${styles.driverAvatar}">👤</div>
          </div>
        `;
        const driverIcon = L.divIcon({
          html: driverHtml,
          className: '',
          iconSize: [60, 60],
          iconAnchor: [30, 30],
        });

        L.marker([driver.lat, driver.lng], { icon: driverIcon }).addTo(driversLayerRef.current!);
      });
    }
  }, [stops, selectedStopId, filterFlag, isOptimizing, layerStops, layerRoute, layerDrivers, mapTheme]);

  // Fit all stops in view
  const handleFitRouteBounds = () => {
    const map = mapInstanceRef.current;
    if (!map || stops.length === 0) return;
    const allCoords: [number, number][] = [
      [DEPOT_LOCATION.lat, DEPOT_LOCATION.lng],
      ...stops.map((s): [number, number] => [s.lat, s.lng]),
    ];
    map.fitBounds(allCoords, { padding: [60, 60], maxZoom: 15 });
  };

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  // Close layers popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest(`.${styles.layersControlWrapper}`)) {
        setShowLayersMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.mapContainer}>
      {/* 1. TOP FLOATING LIVE STATUS PILL */}
      <div className={styles.topLivePill}>
        <span className={styles.liveGreenDot} />
        <span>
          <strong>Live • {stops.length} Stops Active</strong> ({assignedDriverName})
        </span>
      </div>

      {/* 2. REAL LEAFLET MAP ELEMENT */}
      <div ref={mapContainerRef} className={styles.leafletMapContainer} />

      {/* 3. INTERACTIVE STOP POPUP OVERLAY (FLOATING ON ACTIVE SELECTION) */}
      {selectedStop && (
        <div className={styles.popupFloatingWrapper}>
          <div className={styles.popupCard}>
            <button
              className={styles.popupCloseBtn}
              onClick={() => onSelectStop(null)}
              title="Close"
            >
              <X size={14} />
            </button>

            <div className={styles.popupHeader}>
              <div className={styles.popupStopBadge}>Stop {selectedStop.stopNumber}</div>
              <div className={styles.popupOrderId}>{selectedStop.orderId}</div>
            </div>

            <div className={styles.popupAddress}>
              <strong>{selectedStop.address.street}</strong>
              {selectedStop.address.apt && <span>, {selectedStop.address.apt}</span>}
              <div className={styles.popupCity}>
                {selectedStop.address.city}, {selectedStop.address.state} {selectedStop.address.zip} · {selectedStop.address.neighborhood}
              </div>
            </div>

            <div className={styles.popupPharmacy}>
              {selectedStop.pharmacy.name} · Window: <strong>{selectedStop.deliveryWindow.start} – {selectedStop.deliveryWindow.end}</strong>
            </div>

            {/* Flags */}
            <div className={styles.popupFlags}>
              {selectedStop.flags.controlled && (
                <span className={styles.pillControlled}>
                  <Lock size={10} /> CONTROLLED (C-II)
                </span>
              )}
              {selectedStop.flags.refrigerated && (
                <span className={styles.pillCold}>
                  <Snowflake size={10} /> REFRIGERATED
                </span>
              )}
              {selectedStop.flags.rush && (
                <span className={styles.pillRush}>
                  <Zap size={10} /> STAT RUSH
                </span>
              )}
            </div>

            <div className={styles.popupDriverRow}>
              <span>Driver: <strong>{assignedDriverName}</strong></span>
              <span className={styles.popupEst}>ETA: {selectedStop.estimatedArrival}</span>
            </div>

            <div className={styles.popupActions}>
              <button
                className="btn btn-primary"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.775rem' }}
                onClick={() => onOpenStopDetail(selectedStop)}
              >
                View Details <ChevronRight size={13} />
              </button>
              <button
                className="btn btn-secondary"
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.775rem', color: '#DC2626' }}
                onClick={() => onRemoveStop(selectedStop)}
              >
                <Trash2 size={13} /> Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. FLOATING MAP CONTROLS (TOP RIGHT) */}
      <div className={styles.mapControlsGroup}>
        <div className={styles.controlBox}>
          <button onClick={handleZoomIn} title="Zoom In" className={styles.controlBtn}>
            <ZoomIn size={16} />
          </button>
          <button onClick={handleZoomOut} title="Zoom Out" className={styles.controlBtn}>
            <ZoomOut size={16} />
          </button>
          <div className={styles.divider} />
          <button onClick={handleFitRouteBounds} title="Fit Entire Route" className={styles.controlBtn}>
            <Navigation size={16} />
          </button>
          <button
            onClick={() => mapInstanceRef.current?.setView([40.7580, -73.9855], 13)}
            title="Center Manhattan Hub"
            className={styles.controlBtn}
          >
            <Compass size={16} />
          </button>
        </div>

        {/* Layers Control */}
        <div className={styles.layersControlWrapper}>
          <button
            onClick={() => setShowLayersMenu((prev) => !prev)}
            title="Map Layers"
            className={`${styles.controlBtn} ${showLayersMenu ? styles.activeLayerBtn : ''}`}
          >
            <Layers size={16} />
          </button>

          {showLayersMenu && (
            <div className={styles.layersPopover}>
              <div className={styles.layersTitle}>Map Display Layers</div>
              <label className={styles.layerOption}>
                <input
                  type="checkbox"
                  checked={layerStops}
                  onChange={(e) => setLayerStops(e.target.checked)}
                />
                <span>Delivery Stops ({stops.length})</span>
              </label>
              <label className={styles.layerOption}>
                <input
                  type="checkbox"
                  checked={layerRoute}
                  onChange={(e) => setLayerRoute(e.target.checked)}
                />
                <span>Route Polyline</span>
              </label>
              <label className={styles.layerOption}>
                <input
                  type="checkbox"
                  checked={layerDrivers}
                  onChange={(e) => setLayerDrivers(e.target.checked)}
                />
                <span>Live Couriers (Radar)</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* 5. STATUS LEGEND CARD (BOTTOM LEFT - LIGHT THEME) */}
      <div className={styles.statusLegendCard}>
        <div className={styles.legendHeader}>Status Legend</div>
        <div className={styles.legendRow}>
          <span className={styles.dotActive} />
          <span>Active / On Route</span>
        </div>
        <div className={styles.legendRow}>
          <span className={styles.dotAlert}>!</span>
          <span>Alert / Delayed</span>
        </div>
        <div className={styles.legendRow}>
          <span className={styles.diamondPriority}>⚡</span>
          <span>Priority Visit (STAT)</span>
        </div>
        <div className={styles.legendRow}>
          <span className={styles.dotRoutine}>🔒</span>
          <span>Controlled / Cold</span>
        </div>
      </div>
    </div>
  );
};

export default RouteMapCanvas;
