import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Brain, Cpu, Target, TrendingUp, ArrowRight, CheckCircle, Zap, Activity, Shield, Clock } from 'lucide-react';
import { parseEvent, getParserStats, getSupplierRiskScores, getRouteRiskScores, getPredictions, getPipelineStats } from '../../data/agentIntelligence';
import { useApi } from '../../hooks/useApi';

const PIPELINE_STAGES = [
  { key: 'parser', label: 'Event Parser', desc: 'Classify event type, severity, location', icon: Cpu, color: '#06b6d4' },
  { key: 'scorer', label: 'Risk Scorer', desc: 'Score impact on each supplier and route', icon: Target, color: '#f59e0b' },
  { key: 'predictor', label: 'Predictive Engine', desc: 'Forecast disruption probability + timeline', icon: TrendingUp, color: '#8b5cf6' },
];

export default function AgentBrain() {
  const [parsedEvents, setParsedEvents] = useState([]);
  const [parserStats, setParserStats] = useState(getParserStats());
  const [supplierScores, setSupplierScores] = useState([]);
  const [routeScores, setRouteScores] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [pipelineStats, setPipelineStats] = useState(null);
  const [activeStage, setActiveStage] = useState('parser');
  const [processingEvent, setProcessingEvent] = useState(null);

  const { data: bStats, isUsingFallback: fStats } = useApi('/intelligence/pipeline-stats', { fallbackFn: getPipelineStats });
  const { data: bSuppliers, isUsingFallback: fSupp } = useApi('/intelligence/risk-scores/suppliers', { fallbackFn: getSupplierRiskScores });
  const { data: bRoutes, isUsingFallback: fRoute } = useApi('/intelligence/risk-scores/routes', { fallbackFn: getRouteRiskScores });
  const { data: bPreds, isUsingFallback: fPreds } = useApi('/intelligence/predictions?limit=6', { fallbackFn: getPredictions });

  useEffect(() => {
    setParsedEvents(Array.from({ length: 8 }, () => parseEvent()));
    
    if (bStats) {
      if (fStats) setPipelineStats(bStats);
      else setPipelineStats({
        eventsProcessed: bStats.events_processed_today,
        avgPipelineLatency: `${bStats.avg_pipeline_latency_ms}ms`,
        predictionsGenerated: bStats.predictions_generated,
        modelAccuracy: `${bStats.model_confidence_avg}%`,
        lastTraining: '2 days ago',
        nextRetraining: 'in 5 days'
      });
    }

    if (bSuppliers) {
      if (fSupp) setSupplierScores(bSuppliers);
      else setSupplierScores(bSuppliers.map(s => ({
        supplier: s.name,
        location: s.location,
        baseRisk: Math.floor(s.risk_score * 0.7),
        eventRisk: Math.floor(s.risk_score * 0.3),
        totalRisk: Math.min(100, Math.round(s.risk_score)),
        trend: s.trend,
        impactedBy: ['Monitored automatically']
      })));
    }

    if (bRoutes) {
      if (fRoute) setRouteScores(bRoutes);
      else setRouteScores(bRoutes.map(r => ({
        route: r.path,
        baseRisk: Math.floor(r.risk_score * 0.8),
        eventRisk: Math.floor(r.risk_score * 0.2),
        totalRisk: Math.min(100, Math.round(r.risk_score)),
        transitDays: r.transit_days || 14,
        status: r.status
      })));
    }

    if (bPreds) {
      if (fPreds) setPredictions(bPreds);
      else setPredictions(bPreds.map(p => ({
        id: p.id,
        title: p.title,
        probability: p.probability,
        timeline: p.timeline,
        impact: p.impact,
        region: p.region,
        category: p.category,
        confidence: p.confidence,
        modelOutput: p.model_output
      })));
    }
  }, [bStats, bSuppliers, bRoutes, bPreds, fStats, fSupp, fRoute, fPreds]);

  // Simulate live processing
  useEffect(() => {
    const interval = setInterval(() => {
      const newEvt = parseEvent();
      setProcessingEvent(newEvt);
      setTimeout(() => {
        setParsedEvents(prev => [newEvt, ...prev].slice(0, 12));
        setProcessingEvent(null);
      }, 1500);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const riskColor = (v) => v > 70 ? '#ef4444' : v > 50 ? '#f59e0b' : v > 30 ? '#06b6d4' : '#10b981';
  const statusColor = (s) => s === 'critical' ? '#ef4444' : s === 'elevated' ? '#f59e0b' : '#10b981';

  return (
    <div>
      <div className="page-header">
        <h2>Phase 3 — Agent Intelligence</h2>
        <p>LLM-powered reasoning that interprets events and predicts risk</p>
      </div>

      {/* Pipeline Stats */}
      {pipelineStats && (
        <div className="kpi-grid">
          <motion.div className="kpi-card cyan" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <div className="kpi-card-icon cyan"><Cpu size={22} /></div>
            <div className="kpi-card-value">{pipelineStats.eventsProcessed}</div>
            <div className="kpi-card-label">Events Processed</div>
          </motion.div>
          <motion.div className="kpi-card emerald" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="kpi-card-icon emerald"><Activity size={22} /></div>
            <div className="kpi-card-value">{pipelineStats.avgPipelineLatency}</div>
            <div className="kpi-card-label">Avg Pipeline Latency</div>
          </motion.div>
          <motion.div className="kpi-card amber" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="kpi-card-icon amber"><Target size={22} /></div>
            <div className="kpi-card-value">{pipelineStats.modelAccuracy}</div>
            <div className="kpi-card-label">Model Accuracy</div>
          </motion.div>
          <motion.div className="kpi-card red" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="kpi-card-icon red"><Brain size={22} /></div>
            <div className="kpi-card-value">{pipelineStats.predictionsGenerated}</div>
            <div className="kpi-card-label">Predictions Generated</div>
          </motion.div>
        </div>
      )}

      {/* Pipeline Visualization */}
      <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="glass-card-header">
          <div className="glass-card-title"><Brain size={16} /> Processing Pipeline</div>
          {processingEvent && <div className="ingestion-live-indicator"><span className="ingestion-live-dot" /> PROCESSING</div>}
        </div>
        <div className="brain-pipeline">
          {PIPELINE_STAGES.map((stage, i) => (
            <div key={stage.key} className="brain-pipeline-stage-wrapper">
              <motion.div
                className={`brain-pipeline-stage ${activeStage === stage.key ? 'active' : ''}`}
                onClick={() => setActiveStage(stage.key)}
                whileHover={{ scale: 1.02 }}
                style={{ borderColor: activeStage === stage.key ? stage.color : undefined }}
              >
                <div className="brain-stage-icon" style={{ background: `${stage.color}18`, color: stage.color }}>
                  <stage.icon size={24} />
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '2px' }}>{stage.label}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{stage.desc}</p>
              </motion.div>
              {i < PIPELINE_STAGES.length - 1 && (
                <div className="brain-pipeline-arrow">
                  <ArrowRight size={20} style={{ color: 'var(--text-tertiary)' }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Stage Content */}
      {activeStage === 'parser' && (
        <div className="brain-content-grid">
          {/* Parser Stats */}
          <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="glass-card-header">
              <div className="glass-card-title"><Cpu size={16} /> Event Parser — Classification Engine</div>
            </div>
            {parserStats && (
              <div className="brain-parser-stats">
                <div className="brain-stat"><div className="brain-stat-val">{parserStats.totalParsed}</div><div className="brain-stat-lbl">Total Parsed</div></div>
                <div className="brain-stat"><div className="brain-stat-val">{parserStats.avgConfidence}</div><div className="brain-stat-lbl">Avg Confidence</div></div>
                <div className="brain-stat"><div className="brain-stat-val">{parserStats.classificationAccuracy}</div><div className="brain-stat-lbl">Accuracy</div></div>
                <div className="brain-stat"><div className="brain-stat-val">{parserStats.avgProcessingTime}</div><div className="brain-stat-lbl">Avg Time</div></div>
              </div>
            )}
            <div className="brain-parsed-list">
              {parsedEvents.map((evt, i) => (
                <div key={`${evt.eventId}-${i}`} className="brain-parsed-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <CheckCircle size={14} style={{ color: '#10b981' }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{evt.eventId}</span>
                    <span className={`badge ${evt.classifiedSeverity}`}>{evt.classifiedSeverity}</span>
                    <span className="strategy-tag">{evt.classifiedType}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '22px' }}>
                    📍 {evt.classifiedLocation} • Confidence: <strong style={{ color: evt.confidence > 90 ? '#10b981' : '#f59e0b' }}>{evt.confidence}%</strong> • {evt.processingTime}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Currently Processing */}
          <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="glass-card-header">
              <div className="glass-card-title"><Zap size={16} /> Live Classification</div>
            </div>
            {processingEvent ? (
              <div className="brain-processing-card">
                <div className="brain-processing-spinner" />
                <h4 style={{ marginBottom: '8px' }}>Processing Event...</h4>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div className="brain-proc-row"><span>Event ID:</span><span>{processingEvent.eventId}</span></div>
                  <div className="brain-proc-row"><span>Type:</span><span className="strategy-tag">{processingEvent.classifiedType}</span></div>
                  <div className="brain-proc-row"><span>Severity:</span><span className={`badge ${processingEvent.classifiedSeverity}`}>{processingEvent.classifiedSeverity}</span></div>
                  <div className="brain-proc-row"><span>Location:</span><span>{processingEvent.classifiedLocation}</span></div>
                  <div className="brain-proc-row"><span>Confidence:</span><span style={{ color: '#10b981', fontWeight: 600 }}>{processingEvent.confidence}%</span></div>
                  <div className="brain-proc-row"><span>Model:</span><span>{processingEvent.modelVersion}</span></div>
                </div>
              </div>
            ) : (
              <div className="brain-idle-card">
                <Shield size={32} style={{ color: 'var(--accent-cyan)', marginBottom: '8px' }} />
                <p>Waiting for next event...</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Pipeline active • Next event in ~6s</p>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {activeStage === 'scorer' && (
        <div className="brain-content-grid">
          {/* Supplier Risk Scores */}
          <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="glass-card-header">
              <div className="glass-card-title"><Target size={16} /> Supplier Risk Scores</div>
            </div>
            <div className="brain-score-list">
              {supplierScores.map((s, i) => (
                <div key={i} className="brain-score-item">
                  <div className="brain-score-item-header">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.supplier}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{s.location}</div>
                    </div>
                    <div className="brain-score-badge" style={{ background: `${riskColor(s.totalRisk)}18`, color: riskColor(s.totalRisk), border: `1px solid ${riskColor(s.totalRisk)}40` }}>
                      {s.totalRisk}
                    </div>
                  </div>
                  <div className="brain-score-bar-container">
                    <div className="brain-score-bar">
                      <div style={{ width: `${s.baseRisk}%`, background: '#06b6d488', height: '100%', borderRadius: '4px 0 0 4px' }} />
                      <div style={{ width: `${s.eventRisk}%`, background: `${riskColor(s.totalRisk)}`, height: '100%', borderRadius: '0 4px 4px 0' }} />
                    </div>
                    <div className="brain-score-legend">
                      <span>Base: {s.baseRisk}</span>
                      <span>Event: +{s.eventRisk}</span>
                      <span style={{ color: s.trend === 'up' ? '#ef4444' : s.trend === 'down' ? '#10b981' : '#64748b' }}>
                        {s.trend === 'up' ? '↑' : s.trend === 'down' ? '↓' : '→'} {s.trend}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {s.impactedBy.map((impact, j) => <span key={j} className="strategy-tag" style={{ fontSize: '0.65rem' }}>{impact}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Route Risk Scores */}
          <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="glass-card-header">
              <div className="glass-card-title"><Activity size={16} /> Route Risk Scores</div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={routeScores} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis dataKey="route" type="category" width={130} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#1a2332', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '8px', color: '#f1f5f9', fontSize: '0.8rem' }} />
                <Bar dataKey="totalRisk" radius={[0, 6, 6, 0]}>
                  {routeScores.map((entry, index) => (
                    <Cell key={index} fill={riskColor(entry.totalRisk)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="brain-route-status-list">
              {routeScores.map((r, i) => (
                <div key={i} className="brain-route-status-item">
                  <span>{r.route}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{r.transitDays}d transit</span>
                    <span className="badge" style={{ background: `${statusColor(r.status)}18`, color: statusColor(r.status), border: `1px solid ${statusColor(r.status)}40` }}>
                      {r.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {activeStage === 'predictor' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="glass-card-header" style={{ marginBottom: 'var(--space-md)' }}>
            <div className="glass-card-title"><TrendingUp size={16} /> Prediction Outputs</div>
          </div>
          <div className="predictions-grid">
            {predictions.map((p, i) => {
              const probColor = p.probability >= 70 ? '#ef4444' : p.probability >= 50 ? '#f59e0b' : '#10b981';
              return (
                <motion.div key={p.id} className="prediction-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <span className={`badge ${p.impact}`} style={{ marginBottom: '8px', display: 'inline-block' }}>{p.impact} impact</span>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{p.title}</h4>
                    </div>
                    <div className="prediction-probability" style={{ color: probColor }}>{p.probability}%</div>
                  </div>
                  <div className="prediction-bar">
                    <div className="prediction-bar-fill" style={{ width: `${p.probability}%`, background: `linear-gradient(90deg, ${probColor}88, ${probColor})` }} />
                  </div>
                  <div style={{ padding: '10px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', margin: '12px 0', fontSize: '0.78rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', lineHeight: 1.5 }}>
                    🤖 {p.modelOutput}
                  </div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    <span>📍 {p.region}</span>
                    <span><Clock size={11} style={{ verticalAlign: 'middle' }} /> {p.timeline}</span>
                    <span>Confidence: {p.confidence}%</span>
                    <span className="strategy-tag">{p.category}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
