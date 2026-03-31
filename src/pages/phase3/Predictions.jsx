import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Target, Grid3x3, BarChart3 } from 'lucide-react';
import { getRiskForecast, getCategoryTrends, getRiskHeatmap, getPredictedDisruptions } from '../../data/dataEngine';
import { useApi } from '../../hooks/useApi';

const CATEGORY_COLORS = { weather: '#06b6d4', geopolitical: '#8b5cf6', logistics: '#f59e0b', shipping: '#ec4899' };

function getHeatmapColor(val) {
  if (val >= 80) return 'rgba(239, 68, 68, 0.7)';
  if (val >= 60) return 'rgba(249, 115, 22, 0.5)';
  if (val >= 40) return 'rgba(245, 158, 11, 0.4)';
  if (val >= 20) return 'rgba(16, 185, 129, 0.3)';
  return 'rgba(16, 185, 129, 0.15)';
}

export default function Predictions() {
  const [forecast, setForecast] = useState([]);
  const [trends, setTrends] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [disruptions, setDisruptions] = useState([]);

  const { data: bPreds, isUsingFallback } = useApi('/intelligence/predictions?limit=6', { fallbackFn: getPredictedDisruptions });

  useEffect(() => {
    setForecast(getRiskForecast());
    setTrends(getCategoryTrends());
    setHeatmap(getRiskHeatmap());
    
    if (bPreds) {
      if (isUsingFallback) setDisruptions(bPreds);
      else setDisruptions(bPreds.map(p => ({
        id: p.id,
        title: p.title,
        probability: p.probability,
        category: p.category.toLowerCase().includes('weather') ? 'weather' : p.category.toLowerCase().includes('logistic') ? 'logistics' : 'shipping',
        region: p.region,
        timeframe: p.timeline,
        impact: p.impact.toLowerCase().includes('high') ? 'high' : 'medium',
        details: p.model_output
      })));
    }
  }, [bPreds, isUsingFallback]);

  return (
    <div>
      <div className="page-header">
        <h2>Risk Predictions</h2>
        <p>AI-powered predictive analytics for supply chain risk forecasting</p>
      </div>

      {/* Charts */}
      <div className="predictions-charts">
        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="glass-card-header">
            <div className="glass-card-title"><TrendingUp size={16} /> 30-Day Risk Forecast</div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={forecast}>
              <defs>
                <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} interval={4} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#1a2332', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '8px', color: '#f1f5f9', fontSize: '0.8rem' }} />
              <Area type="monotone" dataKey="upper" stroke="none" fill={`url(#confGrad)`} />
              <Area type="monotone" dataKey="lower" stroke="none" fill="transparent" />
              <Area type="monotone" dataKey="risk" stroke="#06b6d4" fill="url(#riskGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="glass-card-header">
            <div className="glass-card-title"><BarChart3 size={16} /> Category Risk Trends (12 Weeks)</div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trends}>
              <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#1a2332', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '8px', color: '#f1f5f9', fontSize: '0.8rem' }} />
              <Legend />
              {Object.entries(CATEGORY_COLORS).map(([key, color]) => (
                <Line key={key} type="monotone" dataKey={key} stroke={color} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Heatmap */}
      <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="glass-card-header">
          <div className="glass-card-title"><Grid3x3 size={16} /> Risk Heatmap — Region × Category</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '3px' }}>
            <thead>
              <tr>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>Region</th>
                {['Weather', 'Geopolitical', 'Logistics', 'Shipping'].map(cat => (
                  <th key={cat} style={{ padding: '8px 12px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>{cat}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heatmap.map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: '8px 12px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{row.region}</td>
                  {['weather', 'geopolitical', 'logistics', 'shipping'].map(cat => (
                    <td key={cat} style={{
                      padding: '8px 12px',
                      textAlign: 'center',
                      background: getHeatmapColor(row[cat]),
                      borderRadius: '6px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: row[cat] >= 60 ? '#fff' : 'var(--text-secondary)',
                    }}>
                      {row[cat]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Predicted Disruptions */}
      <div className="glass-card-header" style={{ marginBottom: 'var(--space-md)' }}>
        <div className="glass-card-title"><Target size={16} /> Predicted Disruptions</div>
      </div>
      <div className="predictions-grid">
        {disruptions.map((d, i) => {
          const probColor = d.probability >= 70 ? '#ef4444' : d.probability >= 50 ? '#f59e0b' : '#10b981';
          return (
            <motion.div key={d.id} className="prediction-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <span className={`badge ${d.impact}`} style={{ marginBottom: '8px', display: 'inline-block' }}>{d.impact} impact</span>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{d.title}</h4>
                </div>
                <div className="prediction-probability" style={{ color: probColor }}>{d.probability}%</div>
              </div>
              <div className="prediction-bar">
                <div className="prediction-bar-fill" style={{ width: `${d.probability}%`, background: `linear-gradient(90deg, ${probColor}88, ${probColor})` }} />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '12px 0', lineHeight: 1.6 }}>{d.details}</p>
              <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                <span>📍 {d.region}</span>
                <span>⏱ {d.timeframe}</span>
                <span className="strategy-tag">{d.category}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
