import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, MapPin, Clock, AlertTriangle, X, Package, Ship, Cloud, Shield } from 'lucide-react';
import { EVENT_TYPES, generateEventBatch } from '../../data/dataEngine'; 
import { useApi } from '../../hooks/useApi';
import { useWebSocket } from '../../hooks/useWebSocket';

const TYPE_ICONS = { weather: Cloud, geopolitical: Shield, logistics: Package, shipping: Ship };

export default function EventsMonitor() {
  const [events, setEvents] = useState([]);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Fetch initial events from backend
  const { data: initialEvents, loading, error, isUsingFallback } = useApi('/ingestion/events?limit=50', {
    fallbackFn: () => generateEventBatch(30)
  });
  const { data: liveEvent } = useWebSocket('events'); // Listen for new events

  useEffect(() => {
    if (initialEvents) {
      if (isUsingFallback) {
        setEvents(initialEvents);
      } else {
        const list = Array.isArray(initialEvents) ? initialEvents : initialEvents.events || [];
        setEvents(list.map(e => {
          let evtCategory = e.type ? e.type.toLowerCase() : 'unknown';
          if (e.source) {
            const src = e.source.toLowerCase();
            if (src === 'news') evtCategory = 'geopolitical';
            else if (src === 'market') evtCategory = 'logistics';
            else if (src === 'weather') evtCategory = 'weather';
            else if (src === 'shipping') evtCategory = 'shipping';
            else evtCategory = 'logistics';
          }
          return {
            ...e,
            type: evtCategory,
            title: e.title || e.description?.substring(0, 50) || evtCategory.charAt(0).toUpperCase() + evtCategory.slice(1),
          location: { name: e.location, lat: e.latitude || 0, lng: e.longitude || 0, region: 'Mapped Region' },
          riskScore: e.severity === 'critical' ? 95 : e.severity === 'high' ? 75 : e.severity === 'medium' ? 50 : 25,
          estimatedImpact: { affectedShipments: Math.floor(Math.random() * 50) + 5, delayDays: Math.floor(Math.random() * 10) + 1, financialLoss: '$' + (Math.random() * 5).toFixed(1) + 'M' },
          affectedRoutes: [],
          affectedSuppliers: []
        };
        }));
      }
    }
  }, [initialEvents, isUsingFallback]);

  // Handle live events arriving via WebSocket
  useEffect(() => {
    if (liveEvent) {
      const mappedLive = {
        ...liveEvent,
        type: liveEvent.type ? liveEvent.type.toLowerCase() : 'unknown',
        title: liveEvent.description?.substring(0, 50) || liveEvent.type,
        location: { name: liveEvent.location, lat: 0, lng: 0, region: 'Mapped Region' },
        riskScore: liveEvent.severity === 'critical' ? 95 : liveEvent.severity === 'high' ? 75 : liveEvent.severity === 'medium' ? 50 : 25,
        estimatedImpact: { affectedShipments: 12, delayDays: 3, financialLoss: '$1.2M' },
        affectedRoutes: [],
        affectedSuppliers: []
      };
      setEvents(prev => [mappedLive, ...prev].slice(0, 50));
    }
  }, [liveEvent]);

  const filtered = events.filter(evt => {
    if (severityFilter !== 'all' && evt.severity !== severityFilter) return false;
    if (categoryFilter !== 'all' && evt.type !== categoryFilter) return false;
    return true;
  });

  const formatTime = (ts) => {
    const diff = Date.now() - new Date(ts).getTime();
    if (diff < 0) return 'Just now';
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div>
      <div className="page-header">
        <h2>Events Monitor</h2>
        <p>Real-time tracking of global supply chain disruption events</p>
      </div>

      {/* Summary Stats */}
      <div className="kpi-grid" style={{ marginBottom: 'var(--space-lg)' }}>
        {['critical', 'high', 'medium', 'low'].map((sev, i) => {
          const count = events.filter(e => e.severity === sev).length;
          const colors = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#10b981' };
          return (
            <motion.div key={sev} className={`kpi-card ${sev === 'critical' ? 'red' : sev === 'high' ? 'amber' : sev === 'low' ? 'emerald' : 'cyan'}`}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="kpi-card-value" style={{ color: colors[sev] }}>{count}</div>
              <div className="kpi-card-label">{sev.charAt(0).toUpperCase() + sev.slice(1)} Events</div>
            </motion.div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginRight: '8px' }}>Severity:</span>
        {['all', 'critical', 'high', 'medium', 'low'].map(s => (
          <button key={s} className={`filter-chip ${severityFilter === s ? 'active' : ''}`} onClick={() => setSeverityFilter(s)}>
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
        <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginLeft: '16px', marginRight: '8px' }}>Category:</span>
        {['all', ...EVENT_TYPES].map(c => (
          <button key={c} className={`filter-chip ${categoryFilter === c ? 'active' : ''}`} onClick={() => setCategoryFilter(c)}>
            {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      {/* Event List */}
      <div className="events-grid">
        <AnimatePresence>
          {filtered.map((evt, i) => {
            const Icon = TYPE_ICONS[evt.type] || AlertTriangle;
            return (
              <motion.div key={evt.id} className="event-card" onClick={() => setSelectedEvent(evt)}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}>
                <div className="event-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: `rgba(${evt.severity === 'critical' ? '239,68,68' : evt.severity === 'high' ? '249,115,22' : evt.severity === 'medium' ? '245,158,11' : '16,185,129'}, 0.12)` }}>
                      <Icon size={16} style={{ color: evt.severity === 'critical' ? '#ef4444' : evt.severity === 'high' ? '#f97316' : evt.severity === 'medium' ? '#f59e0b' : '#10b981' }} />
                    </div>
                    <div className="event-card-title">{evt.title}</div>
                  </div>
                  <span className={`badge ${evt.severity}`}>{evt.severity}</span>
                </div>
                <div className="event-card-meta">
                  <div className="event-card-meta-item"><MapPin size={12} /> {evt.location.name}</div>
                  <div className="event-card-meta-item"><Clock size={12} /> {formatTime(evt.timestamp)}</div>
                  <div className="event-card-meta-item">Risk: <strong style={{ color: evt.riskScore > 75 ? '#ef4444' : evt.riskScore > 50 ? '#f59e0b' : '#10b981' }}>{evt.riskScore}</strong></div>
                  <div className="event-card-meta-item"><Package size={12} /> {evt.estimatedImpact.affectedShipments} shipments</div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedEvent(null)}>
            <motion.div className="modal-content" onClick={e => e.stopPropagation()} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <div className="modal-header">
                <div>
                  <h3 style={{ marginBottom: '8px' }}>{selectedEvent.title}</h3>
                  <span className={`badge ${selectedEvent.severity}`}>{selectedEvent.severity}</span>
                  <span className={`status-badge ${selectedEvent.status}`} style={{ marginLeft: '8px' }}>{selectedEvent.status}</span>
                </div>
                <button className="modal-close" onClick={() => setSelectedEvent(null)}><X size={18} /></button>
              </div>

              <div className="modal-section">
                <div className="modal-section-title">Description</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{selectedEvent.description}</p>
              </div>

              <div className="modal-section">
                <div className="modal-section-title">Location</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{selectedEvent.location.name} — {selectedEvent.location.region}</p>
              </div>

              <div className="modal-section">
                <div className="modal-section-title">Impact Assessment</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <div style={{ textAlign: 'center', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '10px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent-red)' }}>{selectedEvent.estimatedImpact.financialLoss}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Est. Financial Loss</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '10px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent-amber)' }}>{selectedEvent.estimatedImpact.delayDays}d</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Delay Days</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '10px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>{selectedEvent.estimatedImpact.affectedShipments}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Shipments Affected</div>
                  </div>
                </div>
              </div>

              {selectedEvent.affectedRoutes.length > 0 && (
                <div className="modal-section">
                  <div className="modal-section-title">Affected Routes</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedEvent.affectedRoutes.map((r, i) => (
                      <span key={i} className="strategy-tag">{r}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedEvent.affectedSuppliers.length > 0 && (
                <div className="modal-section">
                  <div className="modal-section-title">Affected Suppliers</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedEvent.affectedSuppliers.map((s, i) => (
                      <span key={i} className="strategy-tag" style={{ background: 'rgba(236,72,153,0.12)', color: '#ec4899', borderColor: 'rgba(236,72,153,0.2)' }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
