import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Newspaper, Ship, TrendingUp, Wifi, WifiOff, Activity, Zap, Database, Clock, ArrowUpDown } from 'lucide-react';
import { getWeatherFeed, getNewsFeed, getShippingFeed, getMarketFeed, getIngestionStats, getTotalIngestionMetrics } from '../../data/apiSimulators';
import { useApi } from '../../hooks/useApi';

const API_CONFIG = [
  { key: 'weather', label: 'Weather APIs', desc: 'Storms, floods, cyclones', icon: Cloud, color: '#06b6d4', gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)' },
  { key: 'news', label: 'News APIs', desc: 'Conflicts, sanctions, policy', icon: Newspaper, color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
  { key: 'shipping', label: 'Shipping APIs', desc: 'Ports, vessels, tracking', icon: Ship, color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  { key: 'market', label: 'Market / Trade Data', desc: 'Tariffs, fuel, commodities', icon: TrendingUp, color: '#10b981', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
];

const FEED_FETCHERS = { weather: getWeatherFeed, news: getNewsFeed, shipping: getShippingFeed, market: getMarketFeed };

export default function DataIngestion() {
  const [feeds, setFeeds] = useState({ weather: [], news: [], shipping: [], market: [] });
  const [stats, setStats] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [activeFeed, setActiveFeed] = useState('weather');
  const [rawLog, setRawLog] = useState([]);
  const logRef = useRef(null);

  const { data: backendStats, isUsingFallback } = useApi('/ingestion/stats', {
    fallbackFn: () => getTotalIngestionMetrics()
  });

  useEffect(() => {
    // Initial load
    const initial = {};
    Object.keys(FEED_FETCHERS).forEach(k => { initial[k] = FEED_FETCHERS[k](6); });
    setFeeds(initial);
    setStats(getIngestionStats());
    
    if (backendStats) {
      if (isUsingFallback) {
        setMetrics(backendStats);
      } else {
        setMetrics({
          totalEventsToday: backendStats.total_events_today,
          totalEventsWeek: backendStats.total_events || 5000,
          avgLatency: `${backendStats.avg_latency_ms}ms`,
          dataQuality: `${backendStats.uptime_percentage}%`,
          apiCalls24h: 3450,
          failedCalls24h: 12
        });
      }
    }

    // Build initial raw log
    const allItems = Object.values(initial).flat().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    setRawLog(allItems.slice(0, 20));
  }, [backendStats, isUsingFallback]);

  // Simulate live data arriving
  useEffect(() => {
    const interval = setInterval(() => {
      const source = API_CONFIG[Math.floor(Math.random() * API_CONFIG.length)].key;
      const newItem = FEED_FETCHERS[source](1)[0];
      setFeeds(prev => ({ ...prev, [source]: [newItem, ...prev[source]].slice(0, 15) }));
      setRawLog(prev => [newItem, ...prev].slice(0, 30));
      setStats(getIngestionStats());
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const activeConfig = API_CONFIG.find(c => c.key === activeFeed);
  const severityColor = (s) => s === 'critical' ? '#ef4444' : s === 'high' ? '#f97316' : s === 'medium' ? '#f59e0b' : '#10b981';

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Phase 1 — Event Monitoring</h2>
          <p>Real-time data ingestion from global supply chain intelligence feeds</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => {
            const newItem = FEED_FETCHERS[activeFeed](1)[0];
            setFeeds(prev => ({ ...prev, [activeFeed]: [newItem, ...prev[activeFeed]].slice(0, 15) }));
            setRawLog(prev => [newItem, ...prev].slice(0, 30));
            setStats(getIngestionStats());
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <ArrowUpDown size={16} /> Refresh Feed
        </button>
      </div>

      {/* Ingestion Metrics */}
      {metrics && (
        <div className="kpi-grid">
          <motion.div className="kpi-card cyan" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <div className="kpi-card-icon cyan"><Database size={22} /></div>
            <div className="kpi-card-value">{metrics.totalEventsToday.toLocaleString()}</div>
            <div className="kpi-card-label">Events Ingested Today</div>
          </motion.div>
          <motion.div className="kpi-card emerald" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="kpi-card-icon emerald"><Activity size={22} /></div>
            <div className="kpi-card-value">{metrics.avgLatency}</div>
            <div className="kpi-card-label">Avg Latency</div>
          </motion.div>
          <motion.div className="kpi-card amber" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="kpi-card-icon amber"><Zap size={22} /></div>
            <div className="kpi-card-value">{metrics.dataQuality}</div>
            <div className="kpi-card-label">Data Quality Score</div>
          </motion.div>
          <motion.div className="kpi-card red" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="kpi-card-icon red"><ArrowUpDown size={22} /></div>
            <div className="kpi-card-value">{metrics.apiCalls24h.toLocaleString()}</div>
            <div className="kpi-card-label">API Calls (24h)</div>
          </motion.div>
        </div>
      )}

      {/* API Connection Status Cards */}
      <div className="ingestion-api-grid">
        {stats && API_CONFIG.map((api, i) => {
          const s = stats[api.key];
          const Icon = api.icon;
          const isConnected = s.status === 'connected';
          return (
            <motion.div key={api.key} className={`ingestion-api-card ${activeFeed === api.key ? 'active' : ''}`}
              onClick={() => setActiveFeed(api.key)}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}>
              <div className="ingestion-api-card-top">
                <div className="ingestion-api-icon" style={{ background: `${api.color}18` }}>
                  <Icon size={20} style={{ color: api.color }} />
                </div>
                <div className={`ingestion-status-dot ${isConnected ? 'connected' : 'degraded'}`}>
                  {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
                  <span>{s.status}</span>
                </div>
              </div>
              <h4 className="ingestion-api-name">{api.label}</h4>
              <p className="ingestion-api-desc">{api.desc}</p>
              <div className="ingestion-api-stats">
                <div><span className="ingestion-stat-val">{s.eventsToday}</span><span className="ingestion-stat-lbl">events today</span></div>
                <div><span className="ingestion-stat-val">{s.ratePerMin}/min</span><span className="ingestion-stat-lbl">ingestion rate</span></div>
                <div><span className="ingestion-stat-val">{s.uptime}</span><span className="ingestion-stat-lbl">uptime</span></div>
              </div>
              <div className="ingestion-api-ping">
                <Clock size={10} /> Last ping: {s.lastPing}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Active Feed + Raw Log */}
      <div className="ingestion-content-grid">
        {/* Feed Preview */}
        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="glass-card-header">
            <div className="glass-card-title">
              {activeConfig && <activeConfig.icon size={16} style={{ color: activeConfig.color }} />}
              {activeConfig?.label} — Live Feed
            </div>
            <div className="ingestion-live-indicator">
              <span className="ingestion-live-dot" /> LIVE
            </div>
          </div>
          <div className="ingestion-feed-list">
            <AnimatePresence>
              {feeds[activeFeed]?.map((item, i) => (
                <motion.div key={item.id} className="ingestion-feed-item"
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: Math.min(i * 0.03, 0.2) }}>
                  <div className="ingestion-feed-item-header">
                    <span className={`badge ${item.severity}`}>{item.severity}</span>
                    <span className="ingestion-feed-type">{item.type}</span>
                    <span className="ingestion-feed-time">
                      {new Date(item.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <div className="ingestion-feed-detail">
                    {item.detail || item.reason || `${item.type} — ${item.port || item.region || item.corridor || item.commodity || ''}`}
                  </div>
                  {item.region && <span className="strategy-tag" style={{ marginTop: '4px' }}>{item.region}</span>}
                  {item.port && <span className="strategy-tag" style={{ marginTop: '4px' }}>{item.port}</span>}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Raw Event Log */}
        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div className="glass-card-header">
            <div className="glass-card-title"><Activity size={16} /> Raw Event Stream</div>
          </div>
          <div className="ingestion-raw-log" ref={logRef}>
            {rawLog.map((item, i) => (
              <div key={`${item.id}-${i}`} className="ingestion-log-entry">
                <span className="ingestion-log-time">
                  {new Date(item.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <span className="ingestion-log-source" style={{ color: API_CONFIG.find(c => c.key === item.source)?.color }}>
                  [{item.source.toUpperCase()}]
                </span>
                <span className="ingestion-log-id">{item.id}</span>
                <span className={`ingestion-log-severity ${item.severity}`}>
                  {item.severity}
                </span>
                <span className="ingestion-log-msg">{item.type}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
