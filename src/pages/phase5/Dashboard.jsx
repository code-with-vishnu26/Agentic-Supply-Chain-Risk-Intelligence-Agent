import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Zap, Route, DollarSign, CheckCircle, Clock, Globe, Bell } from 'lucide-react';
import { getKPIs, getRiskByCategory, SUPPLY_ROUTES, generateEventBatch } from '../../data/dataEngine';
import { useApi } from '../../hooks/useApi';
import GlobalRiskMap from '../../components/GlobalRiskMap';
import SimulationControl from '../../components/SimulationControl';
import EmbeddedChatbot from '../../components/EmbeddedChatbot';

const CATEGORY_COLORS = {
  Weather: '#06b6d4',
  Geopolitical: '#8b5cf6',
  Logistics: '#f59e0b',
  Shipping: '#ec4899',
};

function AnimatedNumber({ value, suffix = '' }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const num = typeof value === 'string' ? parseInt(value.replace(/[^0-9]/g, '')) : value;
    if (isNaN(num)) { setDisplay(value); return; }
    let start = 0;
    const duration = 1500;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * num));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);
  return <>{typeof value === 'string' && value.startsWith('$') ? '$' : ''}{display}{suffix}</>;
}

export default function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [risks, setRisks] = useState([]);
  const [events, setEvents] = useState([]);
  
  const { data: initialEvents, isUsingFallback, mutate } = useApi('/ingestion/events?limit=12', {
    fallbackFn: () => generateEventBatch(12)
  });

  const refreshDashboard = useCallback(() => {
    setKpis(getKPIs());
    setRisks(getRiskByCategory());
    if (mutate) mutate();
  }, [mutate]);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  useEffect(() => {
    if (initialEvents) {
      if (isUsingFallback) {
        setEvents(initialEvents);
      } else {
        const list = Array.isArray(initialEvents) ? initialEvents : initialEvents.events || [];
        setEvents(list.map(e => ({
          ...e,
          title: e.description?.substring(0, 50) || e.type,
          location: { name: e.location, lat: e.latitude || 0, lng: e.longitude || 0 }
        })));
      }
    }
  }, [initialEvents, isUsingFallback]);

  const routeData = SUPPLY_ROUTES.map(r => ({
    name: r.name.length > 20 ? r.name.substring(0, 20) + '…' : r.name,
    risk: r.risk,
    fullName: r.name,
  })).sort((a, b) => b.risk - a.risk);

  if (!kpis) return null;

  const riskColor = kpis.overallRisk > 75 ? '#ef4444' : kpis.overallRisk > 50 ? '#f59e0b' : '#10b981';

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2>Supply Chain Command Center</h2>
          <p>Real-time monitoring across {kpis.monitoredNodes} supply chain nodes worldwide</p>
        </div>
        <div style={{ width: '350px' }}>
          <SimulationControl onSimulationComplete={() => refreshDashboard()} />
        </div>
      </div>


      {/* Embedded Agentic Chatbot Section */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr', marginBottom: '32px' }}>
        <EmbeddedChatbot />
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <motion.div className="kpi-card cyan" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="kpi-card-icon cyan"><AlertTriangle size={22} /></div>
          <div className="kpi-card-value" style={{ color: riskColor }}>
            <AnimatedNumber value={kpis.overallRisk} suffix="/100" />
          </div>
          <div className="kpi-card-label">Overall Risk Score</div>
        </motion.div>

        <motion.div className="kpi-card red" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="kpi-card-icon red"><Zap size={22} /></div>
          <div className="kpi-card-value"><AnimatedNumber value={kpis.activeDisruptions} /></div>
          <div className="kpi-card-label">Active Disruptions</div>
        </motion.div>

        <motion.div className="kpi-card amber" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="kpi-card-icon amber"><Route size={22} /></div>
          <div className="kpi-card-value"><AnimatedNumber value={kpis.affectedRoutes} /></div>
          <div className="kpi-card-label">Affected Routes</div>
        </motion.div>

        <motion.div className="kpi-card emerald" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="kpi-card-icon emerald"><DollarSign size={22} /></div>
          <div className="kpi-card-value">{kpis.financialExposure}</div>
          <div className="kpi-card-label">Financial Exposure</div>
        </motion.div>
      </div>

      {/* Second KPI Row */}
      <div className="kpi-grid" style={{ marginBottom: 'var(--space-lg)' }}>
        <motion.div className="kpi-card emerald" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="kpi-card-icon emerald"><CheckCircle size={22} /></div>
          <div className="kpi-card-value"><AnimatedNumber value={kpis.resolvedToday} /></div>
          <div className="kpi-card-label">Resolved Today</div>
        </motion.div>

        <motion.div className="kpi-card cyan" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="kpi-card-icon cyan"><Clock size={22} /></div>
          <div className="kpi-card-value">{kpis.avgResolutionTime}</div>
          <div className="kpi-card-label">Avg Resolution Time</div>
        </motion.div>

        <motion.div className="kpi-card amber" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <div className="kpi-card-icon amber"><Globe size={22} /></div>
          <div className="kpi-card-value"><AnimatedNumber value={kpis.monitoredNodes} /></div>
          <div className="kpi-card-label">Monitored Nodes</div>
        </motion.div>

        <motion.div className="kpi-card red" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="kpi-card-icon red"><Bell size={22} /></div>
          <div className="kpi-card-value"><AnimatedNumber value={kpis.alertsTriggered} /></div>
          <div className="kpi-card-label">Alerts Triggered</div>
        </motion.div>
      </div>

      {/* World Map + Risk Distribution */}
      <div className="dashboard-grid">
        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="glass-card-header">
            <div className="glass-card-title"><Globe size={16} /> Global Risk Hotspots (Live Agent Monitoring)</div>
          </div>
          <GlobalRiskMap events={events} />
        </motion.div>

        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="glass-card-header">
            <div className="glass-card-title"><AlertTriangle size={16} /> Risk Distribution</div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={risks} dataKey="risk" nameKey="category" cx="50%" cy="50%" outerRadius={90} innerRadius={55} strokeWidth={0} paddingAngle={3}>
                {risks.map((entry, index) => (
                  <Cell key={index} fill={CATEGORY_COLORS[entry.category] || '#64748b'} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a2332', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '8px', color: '#f1f5f9', fontSize: '0.8rem' }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {risks.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: CATEGORY_COLORS[r.category] }} />
                {r.category}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Routes Bar Chart + Recent Events */}
      <div className="dashboard-grid">
        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div className="glass-card-header">
            <div className="glass-card-title"><Route size={16} /> Top Affected Routes</div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={routeData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis dataKey="name" type="category" width={140} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#1a2332', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '8px', color: '#f1f5f9', fontSize: '0.8rem' }}
                formatter={(val, name, props) => [`Risk: ${val}`, props.payload.fullName]}
              />
              <Bar dataKey="risk" radius={[0, 6, 6, 0]}>
                {routeData.map((entry, index) => (
                  <Cell key={index} fill={entry.risk > 70 ? '#ef4444' : entry.risk > 50 ? '#f59e0b' : '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <div className="glass-card-header">
            <div className="glass-card-title"><Zap size={16} /> Recent Events</div>
          </div>
          <div style={{ maxHeight: 280, overflowY: 'auto' }}>
            {events.slice(0, 8).map((evt, i) => (
              <div className="timeline-item" key={evt.id || i}>
                <div className={`timeline-dot ${evt.severity}`}>
                  <span style={{ fontSize: '0.5rem' }}>●</span>
                </div>
                <div className="timeline-content">
                  <div className="timeline-title">{evt.title?.substring(0, 50) || evt.type}</div>
                  <div className="timeline-time">
                    {evt.location?.name || evt.location} • {new Date(evt.timestamp).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>


    </div>
  );
}

