import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Bell, BellOff, Check, Clock, Settings, History, Loader2 } from 'lucide-react';
import { getAlerts, getAlertHistory } from '../../data/dataEngine';
import { useApi } from '../../hooks/useApi';

const SEVERITY_COLORS = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#10b981' };

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('active');
  const [acknowledging, setAcknowledging] = useState(null);

  const { data: bAlerts, isUsingFallback } = useApi('/output/alerts?limit=15', { fallbackFn: getAlerts });

  useEffect(() => {
    if (bAlerts) {
      if (isUsingFallback) {
        setAlerts(bAlerts);
        setHistory(getAlertHistory());
      } else {
        setAlerts(bAlerts.map(a => ({
          id: a.id,
          title: a.title,
          severity: a.severity,
          channel: 'Email',
          threshold: 'Auto-detected',
          triggered: 1,
          lastTriggered: a.timestamp,
          status: 'active',
          enabled: true
        })));
        setHistory(getAlertHistory());
      }
    }
  }, [bAlerts, isUsingFallback]);

  const toggleAlert = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  const acknowledgeAlert = (id) => {
    setAcknowledging(id);
    setTimeout(() => {
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'acknowledged' } : a));
      
      const alertToAck = alerts.find(a => a.id === id);
      if (alertToAck) {
        const historyEntry = {
          id: `hist-${Date.now()}`,
          title: alertToAck.title,
          severity: alertToAck.severity,
          timestamp: alertToAck.lastTriggered || new Date().toISOString(),
          resolvedAt: new Date().toISOString(),
          acknowledged: true
        };
        setHistory(prev => [historyEntry, ...prev]);
      }
      setAcknowledging(null);
    }, 1000);
  };

  const severityDist = Object.entries(
    alerts.reduce((acc, a) => { acc[a.severity] = (acc[a.severity] || 0) + 1; return acc; }, {})
  ).map(([severity, count]) => ({ severity, count }));

  const formatTime = (ts) => {
    if (!ts) return '—';
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div>
      <div className="page-header">
        <h2>Alerts & Notifications</h2>
        <p>Configure and manage supply chain risk alerts</p>
      </div>

      {/* Stats Row */}
      <div className="kpi-grid" style={{ marginBottom: 'var(--space-lg)' }}>
        <motion.div className="kpi-card cyan" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="kpi-card-icon cyan"><Bell size={22} /></div>
          <div className="kpi-card-value">{alerts.filter(a => a.enabled).length}</div>
          <div className="kpi-card-label">Active Alerts</div>
        </motion.div>
        <motion.div className="kpi-card red" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="kpi-card-icon red"><Bell size={22} /></div>
          <div className="kpi-card-value">{alerts.reduce((s, a) => s + a.triggered, 0)}</div>
          <div className="kpi-card-label">Total Triggered</div>
        </motion.div>
        <motion.div className="kpi-card emerald" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="kpi-card-icon emerald"><Check size={22} /></div>
          <div className="kpi-card-value">{history.filter(h => h.acknowledged).length}</div>
          <div className="kpi-card-label">Acknowledged</div>
        </motion.div>
        <motion.div className="kpi-card amber" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="kpi-card-icon amber"><Clock size={22} /></div>
          <div className="kpi-card-value">{history.filter(h => !h.acknowledged).length}</div>
          <div className="kpi-card-label">Pending</div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="filter-bar" style={{ marginBottom: 'var(--space-lg)' }}>
        <button className={`filter-chip ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>
          <Settings size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Alert Configuration
        </button>
        <button className={`filter-chip ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
          <History size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Alert History
        </button>
        <button className={`filter-chip ${activeTab === 'distribution' ? 'active' : ''}`} onClick={() => setActiveTab('distribution')}>
          Severity Distribution
        </button>
      </div>

      {/* Active Alerts */}
      {activeTab === 'active' && (
        <div className="alerts-grid">
          {alerts.map((alert, i) => (
            <motion.div key={alert.id} className="alert-item" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="alert-item-left">
                <div style={{
                  width: 36, height: 36, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${SEVERITY_COLORS[alert.severity]}18`
                }}>
                  <Bell size={16} style={{ color: SEVERITY_COLORS[alert.severity] }} />
                </div>
                <div className="alert-item-info">
                  <div className="alert-item-title">{alert.title}</div>
                  <div className="alert-item-details">
                    <span className={`badge ${alert.severity}`} style={{ marginRight: '8px' }}>{alert.severity}</span>
                    {alert.channel} • Threshold: {alert.threshold}
                    {alert.lastTriggered && ` • Last: ${formatTime(alert.lastTriggered)}`}
                    {alert.triggered > 0 && ` • ${alert.triggered}× triggered`}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {alert.status === 'active' && alert.enabled && (
                  <button className="strategy-btn secondary" style={{ padding: '4px 12px', fontSize: '0.75rem' }} onClick={() => acknowledgeAlert(alert.id)} disabled={acknowledging === alert.id}>
                    {acknowledging === alert.id ? (
                      <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite', display: 'inline-block', marginRight: '4px' }} /> Acknowledging...</>
                    ) : (
                      'Acknowledge'
                    )}
                  </button>
                )}
                <div className={`alert-toggle ${alert.enabled ? 'active' : ''}`} onClick={() => toggleAlert(alert.id)} />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* History */}
      {activeTab === 'history' && (
        <div className="glass-card">
          <div style={{ maxHeight: 500, overflowY: 'auto' }}>
            {history.map((item, i) => (
              <div key={item.id} className="timeline-item">
                <div className={`timeline-dot ${item.severity}`}>
                  <span style={{ fontSize: '0.5rem' }}>●</span>
                </div>
                <div className="timeline-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div className="timeline-title">{item.title}</div>
                    <div className="timeline-time">
                      <span className={`badge ${item.severity}`} style={{ marginRight: '6px' }}>{item.severity}</span>
                      {formatTime(item.timestamp)}
                      {item.resolvedAt && <span style={{ marginLeft: '8px', color: 'var(--accent-emerald)' }}>• Resolved {formatTime(item.resolvedAt)}</span>}
                    </div>
                  </div>
                  <div>
                    {item.acknowledged ? (
                      <span style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={12} /> Acknowledged
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.7rem', color: 'var(--accent-amber)' }}>Pending</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Distribution */}
      {activeTab === 'distribution' && (
        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass-card-header">
            <div className="glass-card-title">Alert Severity Distribution</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={severityDist} dataKey="count" nameKey="severity" cx="50%" cy="50%" outerRadius={110} innerRadius={65} strokeWidth={0} paddingAngle={3}>
                  {severityDist.map((entry, index) => (
                    <Cell key={index} fill={SEVERITY_COLORS[entry.severity] || '#64748b'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a2332', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '8px', color: '#f1f5f9', fontSize: '0.8rem' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '16px' }}>
            {severityDist.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: SEVERITY_COLORS[item.severity] }} />
                {item.severity.charAt(0).toUpperCase() + item.severity.slice(1)}: {item.count}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
