import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowDownToLine, Check, Loader2, Users, Navigation, Package, Globe, DollarSign, Clock, Ship } from 'lucide-react';
import { getMitigationStrategies } from '../../data/dataEngine';
import { useApi } from '../../hooks/useApi';

// Phase 4 — Alt. Suppliers Data
const ALT_SUPPLIERS = [
  { id: 'ALT-001', name: 'ShenTech Corp', location: 'Shenzhen, China', region: 'Asia Pacific', category: 'Electronics', cost: '$2.1/unit', leadTime: '18 days', reliabilityScore: 84, riskLevel: 'medium', recommended: true },
  { id: 'ALT-002', name: 'VietElec JSC', location: 'Ho Chi Minh City, Vietnam', region: 'Asia Pacific', category: 'Electronics', cost: '$1.8/unit', leadTime: '22 days', reliabilityScore: 78, riskLevel: 'low', recommended: true },
  { id: 'ALT-003', name: 'AutoTech France', location: 'Lyon, France', region: 'Europe', category: 'Automotive', cost: '€4.5/unit', leadTime: '10 days', reliabilityScore: 91, riskLevel: 'low', recommended: true },
  { id: 'ALT-004', name: 'BalticParts OÜ', location: 'Tallinn, Estonia', region: 'Europe', category: 'Automotive', cost: '€3.8/unit', leadTime: '12 days', reliabilityScore: 86, riskLevel: 'low', recommended: false },
  { id: 'ALT-005', name: 'BanglaFabrics Ltd', location: 'Dhaka, Bangladesh', region: 'South Asia', category: 'Textiles', cost: '$0.9/meter', leadTime: '28 days', reliabilityScore: 72, riskLevel: 'medium', recommended: false },
  { id: 'ALT-006', name: 'MexicoAuto SA', location: 'Monterrey, Mexico', region: 'North America', category: 'Automotive', cost: '$5.2/unit', leadTime: '6 days', reliabilityScore: 88, riskLevel: 'low', recommended: true },
];

// Phase 4 — Route Diversions Data
const ROUTE_DIVERSIONS = [
  { id: 'RD-001', original: 'Shanghai → Suez → Rotterdam', alternative: 'Shanghai → Cape of Good Hope → Rotterdam', addedDays: 12, costIncrease: '+18%', riskReduction: 45, reason: 'Red Sea security threat', status: 'recommended', safetyRating: 'high' },
  { id: 'RD-002', original: 'Mumbai → Suez → Hamburg', alternative: 'Mumbai → Cape of Good Hope → Hamburg', addedDays: 10, costIncrease: '+15%', riskReduction: 40, reason: 'Suez Canal congestion', status: 'active', safetyRating: 'high' },
  { id: 'RD-003', original: 'Busan → Pacific → LA', alternative: 'Busan → Pacific → Seattle (rail to LA)', addedDays: 3, costIncrease: '+8%', riskReduction: 25, reason: 'LA port congestion', status: 'recommended', safetyRating: 'medium' },
  { id: 'RD-004', original: 'Singapore → Malacca → Suez', alternative: 'Singapore → Lombok Strait → Suez', addedDays: 2, costIncrease: '+5%', riskReduction: 20, reason: 'Malacca piracy risk', status: 'standby', safetyRating: 'medium' },
  { id: 'RD-005', original: 'Santos → Panama → LA', alternative: 'Santos → Magellan Strait → LA', addedDays: 8, costIncrease: '+12%', riskReduction: 30, reason: 'Panama Canal draft restrictions', status: 'recommended', safetyRating: 'high' },
];

// Phase 4 — Inventory Buffers Data
const INVENTORY_BUFFERS = [
  { id: 'IB-001', component: 'Semiconductor Chips (7nm)', currentStock: '15 days', recommendedBuffer: '45 days', urgency: 'critical', supplier: 'KoreaSemicon', warehouseLocation: 'LA Distribution Center', estimatedCost: '$12.5M', riskReason: 'Single-source dependency + typhoon season' },
  { id: 'IB-002', component: 'LCD Display Panels', currentStock: '22 days', recommendedBuffer: '40 days', urgency: 'high', supplier: 'TechComp Asia', warehouseLocation: 'Rotterdam Warehouse', estimatedCost: '$8.2M', riskReason: 'Shanghai port congestion risk' },
  { id: 'IB-003', component: 'Automotive Bearings', currentStock: '30 days', recommendedBuffer: '35 days', urgency: 'medium', supplier: 'EuroParts GmbH', warehouseLocation: 'Hamburg Facility', estimatedCost: '$3.1M', riskReason: 'Energy cost volatility in EU' },
  { id: 'IB-004', component: 'Raw Cotton Bales', currentStock: '18 days', recommendedBuffer: '50 days', urgency: 'high', supplier: 'IndiaTextiles', warehouseLocation: 'Mumbai Depot', estimatedCost: '$5.7M', riskReason: 'Monsoon season disruption' },
  { id: 'IB-005', component: 'Petrochemical Resins', currentStock: '25 days', recommendedBuffer: '38 days', urgency: 'medium', supplier: 'GulfPetro LLC', warehouseLocation: 'Dubai Free Zone', estimatedCost: '$6.4M', riskReason: 'Red Sea shipping risk' },
  { id: 'IB-006', component: 'Lithium Battery Cells', currentStock: '12 days', recommendedBuffer: '42 days', urgency: 'critical', supplier: 'Multiple', warehouseLocation: 'Singapore Hub', estimatedCost: '$18.9M', riskReason: 'Global supply tightening + demand surge' },
];

export default function Mitigation() {
  const [strategies, setStrategies] = useState([]);
  const [applying, setApplying] = useState(null);
  const [activeSection, setActiveSection] = useState('strategies');

  // State for sub-sections
  const [suppliers, setSuppliers] = useState(ALT_SUPPLIERS.map(s => ({ ...s, contacted: false })));
  const [routes, setRoutes] = useState(ROUTE_DIVERSIONS);
  const [buffers, setBuffers] = useState(INVENTORY_BUFFERS.map(b => ({ ...b, ordered: false })));

  const [contactingSupplier, setContactingSupplier] = useState(null);
  const [activatingRoute, setActivatingRoute] = useState(null);
  const [orderingBuffer, setOrderingBuffer] = useState(null);

  const { data: bStrats, isUsingFallback } = useApi('/decisions/strategies?limit=10', { fallbackFn: getMitigationStrategies });

  useEffect(() => {
    if (bStrats) {
      if (isUsingFallback) setStrategies(bStrats);
      else setStrategies(bStrats.map(s => ({
        id: s.id,
        title: s.title,
        priority: s.priority,
        description: s.description,
        riskReduction: Math.round(Math.random() * 30 + 10), // mock derived
        estimatedCost: `$${(Math.random() * 10 + 1).toFixed(1)}M`, // mock derived
        timeline: s.estimated_timeline,
        affectedRisks: ['geopolitical', 'logistics'], // filler
        steps: [s.action_plan],
        status: s.status
      })));
    }
  }, [bStrats, isUsingFallback]);

  const handleApply = (id) => {
    setApplying(id);
    setTimeout(() => {
      setStrategies(prev => prev.map(s => s.id === id ? { ...s, status: 'applied' } : s));
      setApplying(null);
    }, 2000);
  };

  const handleContactSupplier = (id) => {
    setContactingSupplier(id);
    setTimeout(() => {
      setSuppliers(prev => prev.map(s => s.id === id ? { ...s, contacted: true } : s));
      setContactingSupplier(null);
    }, 1500);
  };

  const handleActivateRoute = (id) => {
    setActivatingRoute(id);
    setTimeout(() => {
      setRoutes(prev => prev.map(r => r.id === id ? { ...r, status: 'active' } : r));
      setActivatingRoute(null);
    }, 1500);
  };

  const handleOrderBuffer = (id) => {
    setOrderingBuffer(id);
    setTimeout(() => {
      setBuffers(prev => prev.map(b => b.id === id ? { ...b, ordered: true } : b));
      setOrderingBuffer(null);
    }, 1500);
  };

  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const sorted = [...strategies].sort((a, b) => (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4));
  const urgencyColor = (u) => u === 'critical' ? '#ef4444' : u === 'high' ? '#f97316' : u === 'medium' ? '#f59e0b' : '#10b981';

  return (
    <div>
      <div className="page-header">
        <h2>Phase 4 — Decision Support</h2>
        <p>Agent suggests actionable responses, ranked by urgency</p>
      </div>

      {/* Summary */}
      <div className="kpi-grid" style={{ marginBottom: 'var(--space-lg)' }}>
        <motion.div className="kpi-card cyan" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="kpi-card-icon cyan"><Users size={22} /></div>
          <div className="kpi-card-value">{ALT_SUPPLIERS.filter(s => s.recommended).length}</div>
          <div className="kpi-card-label">Alt. Suppliers Ready</div>
        </motion.div>
        <motion.div className="kpi-card emerald" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="kpi-card-icon emerald"><Navigation size={22} /></div>
          <div className="kpi-card-value">{ROUTE_DIVERSIONS.length}</div>
          <div className="kpi-card-label">Route Diversions</div>
        </motion.div>
        <motion.div className="kpi-card amber" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="kpi-card-icon amber"><Package size={22} /></div>
          <div className="kpi-card-value">{INVENTORY_BUFFERS.filter(b => b.urgency === 'critical').length}</div>
          <div className="kpi-card-label">Critical Buffers Needed</div>
        </motion.div>
        <motion.div className="kpi-card red" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="kpi-card-icon red"><DollarSign size={22} /></div>
          <div className="kpi-card-value">${strategies.reduce((sum, s) => sum + parseFloat(s.estimatedCost.replace(/[^0-9.]/g, '')), 0).toFixed(1)}M</div>
          <div className="kpi-card-label">Total Strategy Cost</div>
        </motion.div>
      </div>

      {/* Section Tabs */}
      <div className="filter-bar" style={{ marginBottom: 'var(--space-lg)' }}>
        <button className={`filter-chip ${activeSection === 'strategies' ? 'active' : ''}`} onClick={() => setActiveSection('strategies')}>
          <ShieldCheck size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> All Strategies
        </button>
        <button className={`filter-chip ${activeSection === 'suppliers' ? 'active' : ''}`} onClick={() => setActiveSection('suppliers')}>
          <Users size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Alt. Suppliers
        </button>
        <button className={`filter-chip ${activeSection === 'routes' ? 'active' : ''}`} onClick={() => setActiveSection('routes')}>
          <Navigation size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Route Diversions
        </button>
        <button className={`filter-chip ${activeSection === 'inventory' ? 'active' : ''}`} onClick={() => setActiveSection('inventory')}>
          <Package size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Inventory Buffers
        </button>
      </div>

      {/* Strategies Section (existing enhanced) */}
      {activeSection === 'strategies' && (
        <div className="strategies-grid">
          {sorted.map((strategy, i) => (
            <motion.div key={strategy.id} className="strategy-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}>
              <div className="strategy-card-header">
                <div>
                  <span className={`badge ${strategy.priority}`} style={{ marginBottom: '8px', display: 'inline-block' }}>{strategy.priority} priority</span>
                  <h3 className="strategy-title">{strategy.title}</h3>
                </div>
                <span className={`status-badge ${strategy.status}`}>{strategy.status.replace('-', ' ')}</span>
              </div>
              <p className="strategy-description">{strategy.description}</p>
              <div className="strategy-meta">
                <div className="strategy-meta-item">
                  <div className="strategy-meta-value" style={{ color: 'var(--accent-emerald)' }}>-{strategy.riskReduction}%</div>
                  <div className="strategy-meta-label">Risk Reduction</div>
                </div>
                <div className="strategy-meta-item">
                  <div className="strategy-meta-value">{strategy.estimatedCost}</div>
                  <div className="strategy-meta-label">Est. Cost</div>
                </div>
                <div className="strategy-meta-item">
                  <div className="strategy-meta-value">{strategy.timeline}</div>
                  <div className="strategy-meta-label">Timeline</div>
                </div>
              </div>
              <div className="strategy-tags">
                {strategy.affectedRisks.map((risk, j) => (
                  <span key={j} className="strategy-tag">{risk}</span>
                ))}
              </div>
              <ul className="strategy-steps">
                {strategy.steps.map((step, j) => (
                  <li key={j}>{step}</li>
                ))}
              </ul>
              <div style={{ display: 'flex', gap: '8px' }}>
                {strategy.status !== 'applied' ? (
                  <button className="strategy-btn primary" onClick={() => handleApply(strategy.id)} disabled={applying === strategy.id}>
                    {applying === strategy.id ? (
                      <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite', display: 'inline-block', marginRight: '6px' }} /> Applying...</>
                    ) : (
                      <><ArrowDownToLine size={14} style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }} /> Apply Strategy</>
                    )}
                  </button>
                ) : (
                  <button className="strategy-btn secondary" disabled>
                    <Check size={14} style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'middle', color: 'var(--accent-emerald)' }} /> Applied
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Alt. Suppliers Section */}
      {activeSection === 'suppliers' && (
        <div className="strategies-grid">
          {suppliers.map((supplier, i) => (
            <motion.div key={supplier.id} className="strategy-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + i * 0.06 }}>
              <div className="strategy-card-header">
                <div>
                  {supplier.recommended && <span className="badge low" style={{ marginBottom: '8px', display: 'inline-block' }}>recommended</span>}
                  <h3 className="strategy-title">{supplier.name}</h3>
                </div>
                <span className={`badge ${supplier.riskLevel}`}>{supplier.riskLevel} risk</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <Globe size={14} /> {supplier.location} • {supplier.region}
              </div>
              <div className="strategy-meta">
                <div className="strategy-meta-item">
                  <div className="strategy-meta-value">{supplier.cost}</div>
                  <div className="strategy-meta-label">Unit Cost</div>
                </div>
                <div className="strategy-meta-item">
                  <div className="strategy-meta-value">{supplier.leadTime}</div>
                  <div className="strategy-meta-label">Lead Time</div>
                </div>
                <div className="strategy-meta-item">
                  <div className="strategy-meta-value" style={{ color: supplier.reliabilityScore > 85 ? '#10b981' : '#f59e0b' }}>{supplier.reliabilityScore}%</div>
                  <div className="strategy-meta-label">Reliability</div>
                </div>
              </div>
              <div className="strategy-tags">
                <span className="strategy-tag">{supplier.category}</span>
              </div>
              {!supplier.contacted ? (
                <button className="strategy-btn primary" style={{ marginTop: '8px' }} onClick={() => handleContactSupplier(supplier.id)} disabled={contactingSupplier === supplier.id}>
                  {contactingSupplier === supplier.id ? (
                    <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite', display: 'inline-block', marginRight: '6px' }} /> Contacting...</>
                  ) : (
                    'Contact Supplier'
                  )}
                </button>
              ) : (
                <button className="strategy-btn secondary" style={{ marginTop: '8px' }} disabled>
                  <Check size={14} style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'middle', color: 'var(--accent-emerald)' }} /> Contacted
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Route Diversions Section */}
      {activeSection === 'routes' && (
        <div className="mitigation-routes-grid">
          {routes.map((route, i) => (
            <motion.div key={route.id} className="strategy-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + i * 0.06 }}>
              <div className="strategy-card-header">
                <div>
                  <span className={`status-badge ${route.status}`} style={{ marginBottom: '8px', display: 'inline-block' }}>{route.status}</span>
                  <h3 className="strategy-title" style={{ fontSize: '0.9rem' }}>{route.reason}</h3>
                </div>
                <span className="badge" style={{ background: route.safetyRating === 'high' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: route.safetyRating === 'high' ? '#10b981' : '#f59e0b', border: `1px solid ${route.safetyRating === 'high' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
                  {route.safetyRating} safety
                </span>
              </div>
              <div className="route-diversion-paths">
                <div className="route-path original">
                  <Ship size={14} /> <span>Original:</span> {route.original}
                </div>
                <div className="route-path alternative">
                  <Navigation size={14} /> <span>Alternative:</span> {route.alternative}
                </div>
              </div>
              <div className="strategy-meta">
                <div className="strategy-meta-item">
                  <div className="strategy-meta-value" style={{ color: 'var(--accent-amber)' }}>+{route.addedDays}d</div>
                  <div className="strategy-meta-label">Added Transit</div>
                </div>
                <div className="strategy-meta-item">
                  <div className="strategy-meta-value" style={{ color: 'var(--accent-red)' }}>{route.costIncrease}</div>
                  <div className="strategy-meta-label">Cost Impact</div>
                </div>
                <div className="strategy-meta-item">
                  <div className="strategy-meta-value" style={{ color: 'var(--accent-emerald)' }}>-{route.riskReduction}%</div>
                  <div className="strategy-meta-label">Risk Reduction</div>
                </div>
              </div>
              {route.status !== 'active' ? (
                <button className="strategy-btn primary" style={{ marginTop: '8px' }} onClick={() => handleActivateRoute(route.id)} disabled={activatingRoute === route.id}>
                  {activatingRoute === route.id ? (
                    <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite', display: 'inline-block', marginRight: '6px' }} /> Activating...</>
                  ) : (
                    'Activate Route'
                  )}
                </button>
              ) : (
                <button className="strategy-btn secondary" style={{ marginTop: '8px' }} disabled>
                  <Check size={14} style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'middle', color: 'var(--accent-emerald)' }} /> Route Active
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Inventory Buffers Section */}
      {activeSection === 'inventory' && (
        <div className="mitigation-inventory-grid">
          {buffers.map((buffer, i) => (
            <motion.div key={buffer.id} className="strategy-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + i * 0.06 }}>
              <div className="strategy-card-header">
                <div>
                  <span className={`badge ${buffer.urgency}`} style={{ marginBottom: '8px', display: 'inline-block' }}>{buffer.urgency} urgency</span>
                  <h3 className="strategy-title">{buffer.component}</h3>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: urgencyColor(buffer.urgency), fontSize: '1.1rem' }}>{buffer.estimatedCost}</div>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                ⚠️ {buffer.riskReason}
              </p>
              <div className="strategy-meta" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <div className="strategy-meta-item">
                  <div className="strategy-meta-value" style={{ color: 'var(--accent-red)' }}>{buffer.currentStock}</div>
                  <div className="strategy-meta-label">Current Stock</div>
                </div>
                <div className="strategy-meta-item">
                  <div className="strategy-meta-value" style={{ color: 'var(--accent-emerald)' }}>{buffer.recommendedBuffer}</div>
                  <div className="strategy-meta-label">Recommended Buffer</div>
                </div>
              </div>
              <div className="strategy-tags" style={{ marginTop: '8px' }}>
                <span className="strategy-tag">{buffer.supplier}</span>
                <span className="strategy-tag" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', borderColor: 'rgba(16,185,129,0.2)' }}>{buffer.warehouseLocation}</span>
              </div>
              {!buffer.ordered ? (
                <button className="strategy-btn primary" style={{ marginTop: '12px' }} onClick={() => handleOrderBuffer(buffer.id)} disabled={orderingBuffer === buffer.id}>
                  {orderingBuffer === buffer.id ? (
                    <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite', display: 'inline-block', marginRight: '6px' }} /> Ordering...</>
                  ) : (
                    <><Package size={14} style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }} /> Order Buffer Stock</>
                  )}
                </button>
              ) : (
                <button className="strategy-btn secondary" style={{ marginTop: '12px' }} disabled>
                  <Check size={14} style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'middle', color: 'var(--accent-emerald)' }} /> Order Placed
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
