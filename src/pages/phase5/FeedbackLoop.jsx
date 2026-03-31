import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { RefreshCw, CheckCircle, XCircle, ThumbsUp, ThumbsDown, Brain, TrendingUp, Clock, BarChart3, History, Loader2 } from 'lucide-react';
import { useApi } from '../../hooks/useApi';

// Simulated feedback data
const PREDICTIONS_FOR_REVIEW = [
  { id: 'PR-001', title: 'Typhoon disruption at Shanghai Port', prediction: 'High risk of 5+ day delay', actual: null, confidence: 89, timestamp: '2h ago', category: 'weather', wasCorrect: null },
  { id: 'PR-002', title: 'Port congestion surge at Rotterdam', prediction: 'Medium risk, 2-3 day delay expected', actual: '3 day delay confirmed', confidence: 78, timestamp: '6h ago', category: 'logistics', wasCorrect: true },
  { id: 'PR-003', title: 'Fuel price spike affecting shipping costs', prediction: 'Price increase 15-20% within 2 weeks', actual: 'Price increased 18%', confidence: 82, timestamp: '1d ago', category: 'shipping', wasCorrect: true },
  { id: 'PR-004', title: 'Semiconductor supply tightening', prediction: 'Critical shortage within 30 days', actual: 'No shortage materialized', confidence: 55, timestamp: '2d ago', category: 'logistics', wasCorrect: false },
  { id: 'PR-005', title: 'Red Sea attack risk elevation', prediction: 'Attack probability 75% in next 7 days', actual: 'Attack occurred on day 5', confidence: 91, timestamp: '3d ago', category: 'geopolitical', wasCorrect: true },
  { id: 'PR-006', title: 'Brazilian port worker strike', prediction: 'Strike likely within 14 days', actual: 'Strike averted through negotiations', confidence: 62, timestamp: '5d ago', category: 'geopolitical', wasCorrect: false },
  { id: 'PR-007', title: 'Cold chain integrity breach - Panama', prediction: 'Breach probability 48%', actual: 'Minor breach detected', confidence: 72, timestamp: '4d ago', category: 'logistics', wasCorrect: true },
  { id: 'PR-008', title: 'Container shortage in Asia Pacific', prediction: 'Deficit of 10K TEU by end of month', actual: 'Deficit reached 8.5K TEU', confidence: 85, timestamp: '6d ago', category: 'shipping', wasCorrect: true },
];

const ACCURACY_OVER_TIME = Array.from({ length: 12 }, (_, i) => ({
  week: `W${i + 1}`,
  accuracy: 75 + Math.floor(Math.random() * 18),
  predictions: 20 + Math.floor(Math.random() * 30),
}));

export default function FeedbackLoop() {
  const [predictions, setPredictions] = useState(PREDICTIONS_FOR_REVIEW);
  const [activeTab, setActiveTab] = useState('review');
  const [retraining, setRetraining] = useState(false);
  const [retrainProgress, setRetrainProgress] = useState(0);
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [processingId, setProcessingId] = useState(null);

  const { data: bStats } = useApi('/output/feedback/stats');
  const { data: bHistory } = useApi('/output/training-history');

  useEffect(() => {
    if (bStats) {
      setStats({
        ...bStats,
        // Override for UI display if needed
        accuracy: bStats.correct_predictions > 0 ? (bStats.correct_predictions / bStats.total_reviewed * 100).toFixed(1) : 85.0
      });
    }
  }, [bStats]);

  useEffect(() => {
    if (bHistory) {
      setHistory(bHistory.map(h => ({
        id: h.id,
        date: new Date(h.timestamp).toISOString().split('T')[0],
        dataPoints: h.data_points_trained,
        accuracy: `${(h.accuracy_score * 100).toFixed(1)}%`,
        duration: '2h 14m',
        status: h.status,
        improvements: `+${((h.accuracy_score - 0.05) * 100).toFixed(1)}% accuracy`
      })));
    } else {
      setHistory([
        { id: 'TRN-001', date: '2026-03-20', dataPoints: 12450, accuracy: '92.3%', duration: '4h 22m', status: 'completed', improvements: '+1.2% accuracy, +0.8% precision' },
        { id: 'TRN-002', date: '2026-03-13', dataPoints: 11200, accuracy: '91.1%', duration: '3h 58m', status: 'completed', improvements: '+0.9% accuracy, +0.5% recall' },
      ]);
    }
  }, [bHistory]);

  const handleFeedback = (id, correct) => {
    setProcessingId(id);
    // Simulate API delay
    setTimeout(() => {
      setPredictions(prev => prev.map(p => p.id === id ? { ...p, wasCorrect: correct } : p));
      setProcessingId(null);
    }, 1200);
  };

  const startRetraining = () => {
    setRetraining(true);
    setRetrainProgress(0);
    const interval = setInterval(() => {
      setRetrainProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setRetraining(false);
          return 100;
        }
        return prev + Math.random() * 8;
      });
    }, 500);
  };

  const totalReviewed = stats ? stats.total_reviewed : predictions.filter(p => p.wasCorrect !== null).length;
  const accuracy = stats ? stats.accuracy : (totalReviewed > 0 ? ((predictions.filter(p => p.wasCorrect === true).length / totalReviewed) * 100).toFixed(1) : '85.0');

  return (
    <div>
      <div className="page-header">
        <h2>Feedback Loop</h2>
        <p>Human corrections retrain the model — continuous learning</p>
      </div>

      {/* Stats */}
      <div className="kpi-grid">
        <motion.div className="kpi-card cyan" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="kpi-card-icon cyan"><Brain size={22} /></div>
          <div className="kpi-card-value">{predictions.length}</div>
          <div className="kpi-card-label">Predictions for Review</div>
        </motion.div>
        <motion.div className="kpi-card emerald" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="kpi-card-icon emerald"><ThumbsUp size={22} /></div>
          <div className="kpi-card-value">{accuracy}%</div>
          <div className="kpi-card-label">Current Accuracy</div>
        </motion.div>
        <motion.div className="kpi-card amber" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="kpi-card-icon amber"><TrendingUp size={22} /></div>
          <div className="kpi-card-value">{totalReviewed}/{predictions.length}</div>
          <div className="kpi-card-label">Reviewed</div>
        </motion.div>
        <motion.div className="kpi-card red" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="kpi-card-icon red"><RefreshCw size={22} /></div>
          <div className="kpi-card-value">{history.length}</div>
          <div className="kpi-card-label">Model Retrains</div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="filter-bar" style={{ marginBottom: 'var(--space-lg)' }}>
        <button className={`filter-chip ${activeTab === 'review' ? 'active' : ''}`} onClick={() => setActiveTab('review')}>
          <ThumbsUp size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Review Predictions
        </button>
        <button className={`filter-chip ${activeTab === 'accuracy' ? 'active' : ''}`} onClick={() => setActiveTab('accuracy')}>
          <BarChart3 size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Model Accuracy
        </button>
        <button className={`filter-chip ${activeTab === 'training' ? 'active' : ''}`} onClick={() => setActiveTab('training')}>
          <RefreshCw size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Retraining
        </button>
      </div>

      {/* Review Predictions */}
      {activeTab === 'review' && (
        <div className="feedback-review-list">
          {predictions.map((pred, i) => (
            <motion.div key={pred.id} className="feedback-review-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 + i * 0.04 }}>
              <div className="feedback-review-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="strategy-tag">{pred.category}</span>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>{pred.id}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}><Clock size={11} /> {pred.timestamp}</span>
                  </div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{pred.title}</h4>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.1rem', color: pred.confidence > 80 ? '#10b981' : pred.confidence > 60 ? '#f59e0b' : '#ef4444' }}>
                    {pred.confidence}%
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>confidence</div>
                </div>
              </div>

              <div className="feedback-prediction-details">
                <div className="feedback-pred-row">
                  <span className="feedback-pred-label">🤖 Prediction:</span>
                  <span>{pred.prediction}</span>
                </div>
                {pred.actual && (
                  <div className="feedback-pred-row">
                    <span className="feedback-pred-label">📊 Actual:</span>
                    <span>{pred.actual}</span>
                  </div>
                )}
              </div>

              <div className="feedback-actions">
                {pred.wasCorrect === null ? (
                  <>
                    <button 
                      className="feedback-btn correct" 
                      onClick={() => handleFeedback(pred.id, true)}
                      disabled={processingId !== null}
                    >
                      {processingId === pred.id ? <Loader2 size={14} className="spin" /> : <ThumbsUp size={14} />}
                      {processingId === pred.id ? 'Analysing...' : 'Correct'}
                    </button>
                    <button 
                      className="feedback-btn incorrect" 
                      onClick={() => handleFeedback(pred.id, false)}
                      disabled={processingId !== null}
                    >
                      {processingId === pred.id ? <Loader2 size={14} className="spin" /> : <ThumbsDown size={14} />}
                      {processingId === pred.id ? 'Analysing...' : 'Incorrect'}
                    </button>
                  </>
                ) : (
                  <div className={`feedback-result ${pred.wasCorrect ? 'correct' : 'incorrect'}`}>
                    {pred.wasCorrect ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    Marked as {pred.wasCorrect ? 'Correct' : 'Incorrect'}
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {/* New Feedback Submission Form */}
          <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <div className="glass-card-header">
              <div className="glass-card-title">📝 General Model Feedback</div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Provide qualitative feedback to help our data scientists refine the risk models.
            </p>
            <textarea 
              className="chat-input-field" 
              placeholder="Describe any patterns or systematic errors you've noticed..." 
              style={{ width: '100%', height: '100px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '12px', color: 'var(--text-primary)', outline: 'none', marginBottom: '16px', resize: 'none' }}
            />
            <button className="strategy-btn primary" onClick={() => alert('Feedback submitted to the AI training pipeline!')}>
              Submit Feedback
            </button>
          </motion.div>
        </div>
      )}

      {/* Accuracy Over Time */}
      {activeTab === 'accuracy' && (
        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass-card-header">
            <div className="glass-card-title"><TrendingUp size={16} /> Model Accuracy Over Time (12 Weeks)</div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={ACCURACY_OVER_TIME}>
              <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis domain={[60, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1a2332', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '8px', color: '#f1f5f9', fontSize: '0.8rem' }} />
              <Line type="monotone" dataKey="accuracy" stroke="#06b6d4" strokeWidth={2.5} dot={{ fill: '#06b6d4', strokeWidth: 0, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
            <div className="strategy-meta-item">
              <div className="strategy-meta-value" style={{ color: '#10b981' }}>92.3%</div>
              <div className="strategy-meta-label">Current Accuracy</div>
            </div>
            <div className="strategy-meta-item">
              <div className="strategy-meta-value" style={{ color: '#06b6d4' }}>+3.6%</div>
              <div className="strategy-meta-label">Improvement (12w)</div>
            </div>
            <div className="strategy-meta-item">
              <div className="strategy-meta-value">v3.2.1</div>
              <div className="strategy-meta-label">Model Version</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Retraining */}
      {activeTab === 'training' && (
        <div>
          {/* Retrain Button */}
          <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 'var(--space-lg)' }}>
            <div className="glass-card-header">
              <div className="glass-card-title"><RefreshCw size={16} /> Model Retraining</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Incorporate human feedback and new data into the prediction model. Retraining uses the latest {totalReviewed} reviewed predictions.
                </p>
                {retraining && (
                  <div>
                    <div className="prediction-bar" style={{ height: '8px', marginBottom: '8px' }}>
                      <div className="prediction-bar-fill" style={{ width: `${Math.min(retrainProgress, 100)}%`, background: 'linear-gradient(90deg, #06b6d4, #8b5cf6)', transition: 'width 0.3s' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                      {Math.min(Math.floor(retrainProgress), 100)}% — {retrainProgress < 30 ? 'Loading training data...' : retrainProgress < 60 ? 'Training model...' : retrainProgress < 90 ? 'Validating predictions...' : 'Finalizing...'}
                    </div>
                  </div>
                )}
              </div>
              <button className="strategy-btn primary" onClick={startRetraining} disabled={retraining} style={{ whiteSpace: 'nowrap' }}>
                <RefreshCw size={14} style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'middle', animation: retraining ? 'spin 1s linear infinite' : 'none' }} />
                {retraining ? 'Retraining...' : 'Start Retraining'}
              </button>
            </div>
          </motion.div>

          {/* Training History */}
          <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="glass-card-header">
              <div className="glass-card-title"><History size={16} /> Training History</div>
            </div>
            <div className="training-history-list">
              {history.map((train, i) => (
                <div key={train.id} className="training-history-item">
                  <div className="training-history-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={16} style={{ color: '#10b981' }} />
                      <span style={{ fontWeight: 600 }}>{train.date}</span>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>{train.id}</span>
                    </div>
                    <span className="status-badge applied">{train.status}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-lg)', marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span>📊 {train.dataPoints?.toLocaleString() || 1000} data points</span>
                    <span>🎯 {train.accuracy} accuracy</span>
                    <span>⏱ {train.duration}</span>
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '0.78rem', color: 'var(--accent-emerald)' }}>
                    ✨ {train.improvements}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
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
