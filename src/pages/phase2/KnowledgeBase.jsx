import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, Database, Users, History, FileText, Globe, Shield, ChevronRight, Clock, Hash, Loader2 } from 'lucide-react';
import { getVectorDBStats, searchVectorDB, getSupplierProfiles, getHistoricalPatterns } from '../../data/knowledgeBase';
import { useApi } from '../../hooks/useApi';

export default function KnowledgeBase() {
  const [dbStats, setDbStats] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [activeTab, setActiveTab] = useState('vectordb');
  const [searchQuery, setSearchQuery] = useState('supply chain disruption');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const { data: bgStats, isUsingFallback: fallbackStats } = useApi('/knowledge/stats', { fallbackFn: getVectorDBStats });
  const { data: bgSuppliers, isUsingFallback: fallbackSups } = useApi('/knowledge/suppliers', { fallbackFn: getSupplierProfiles });
  const { data: bgSearch, refetch: doSearch } = useApi(`/knowledge/search?q=${encodeURIComponent(searchQuery)}`, { fallbackFn: () => searchVectorDB(searchQuery), skip: activeTab !== 'vectordb' });

  useEffect(() => {
    if (bgStats) {
      if (fallbackStats) setDbStats(bgStats);
      else setDbStats({
        totalDocuments: bgStats.total_documents,
        totalVectors: bgStats.vector_embeddings,
        avgQueryTime: `${bgStats.avg_query_time_ms}ms`,
        indexSize: `${bgStats.index_size_gb} GB`,
        collections: ['events', 'suppliers', 'routes', 'disruptions', 'resolutions']
      });
    }
    
    if (bgSuppliers) {
      if (fallbackSups) setSuppliers(bgSuppliers);
      else setSuppliers(bgSuppliers.map(s => ({
        ...s,
        reliability: s.reliability || 90,
        leadTime: s.lead_time_days ? `${s.lead_time_days} days` : '14 days',
        capacity: `${s.capacity_utilization || 80}%`,
        riskHistory: Array.from({ length: 12 }, (_, i) => ({ month: `M${i + 1}`, risk: Math.random() * 50 + 20 })),
        certifications: ['ISO 9001'],
        alternates: [],
        recentEvents: ['Monitored automatically']
      })));
    }
    
    if (bgSearch) {
      setSearchResults(bgSearch.results || bgSearch);
      setIsSearching(false);
    }
    
    setPatterns(getHistoricalPatterns());
  }, [bgStats, bgSuppliers, bgSearch, fallbackStats, fallbackSups]);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    doSearch();
  };

  const tierColor = (t) => t === 1 ? '#10b981' : '#f59e0b';

  return (
    <div>
      <div className="page-header">
        <h2>Phase 2 — Knowledge Retrieval</h2>
        <p>Store, index, and retrieve relevant risk history and supplier data</p>
      </div>

      {/* DB Stats */}
      {dbStats && (
        <div className="kpi-grid">
          <motion.div className="kpi-card cyan" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <div className="kpi-card-icon cyan"><Database size={22} /></div>
            <div className="kpi-card-value">{dbStats.totalDocuments.toLocaleString()}</div>
            <div className="kpi-card-label">Total Documents</div>
          </motion.div>
          <motion.div className="kpi-card emerald" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="kpi-card-icon emerald"><Hash size={22} /></div>
            <div className="kpi-card-value">{dbStats.totalVectors.toLocaleString()}</div>
            <div className="kpi-card-label">Vector Embeddings</div>
          </motion.div>
          <motion.div className="kpi-card amber" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="kpi-card-icon amber"><Clock size={22} /></div>
            <div className="kpi-card-value">{dbStats.avgQueryTime}</div>
            <div className="kpi-card-label">Avg Query Time</div>
          </motion.div>
          <motion.div className="kpi-card red" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="kpi-card-icon red"><FileText size={22} /></div>
            <div className="kpi-card-value">{dbStats.indexSize}</div>
            <div className="kpi-card-label">Index Size</div>
          </motion.div>
        </div>
      )}

      {/* Tabs */}
      <div className="filter-bar" style={{ marginBottom: 'var(--space-lg)' }}>
        <button className={`filter-chip ${activeTab === 'vectordb' ? 'active' : ''}`} onClick={() => setActiveTab('vectordb')}>
          <Database size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Vector DB (Past Events)
        </button>
        <button className={`filter-chip ${activeTab === 'suppliers' ? 'active' : ''}`} onClick={() => setActiveTab('suppliers')}>
          <Users size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Supplier Profiles + Routes
        </button>
        <button className={`filter-chip ${activeTab === 'patterns' ? 'active' : ''}`} onClick={() => setActiveTab('patterns')}>
          <History size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Historical Disruption Patterns
        </button>
      </div>

      {/* Vector DB Tab */}
      {activeTab === 'vectordb' && (
        <div>
          <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 'var(--space-md)' }}>
            <div className="glass-card-header">
              <div className="glass-card-title"><Search size={16} /> Semantic Search</div>
            </div>
            <div className="kb-search-bar">
              <input
                type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search across knowledge base..."
                className="kb-search-input"
                disabled={isSearching}
              />
              <button className="strategy-btn primary" onClick={handleSearch} disabled={isSearching}>
                {isSearching ? <Loader2 size={16} className="spin" /> : 'Search'}
              </button>
            </div>
            {dbStats && (
              <div className="kb-collections">
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginRight: '8px' }}>Collections:</span>
                {dbStats.collections.map(c => (
                  <span key={c} className="strategy-tag">{c}</span>
                ))}
              </div>
            )}
          </motion.div>

          <div className="kb-results-grid">
            {searchResults.map((result, i) => (
              <motion.div key={result.id} className="kb-result-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }}>
                <div className="kb-result-header">
                  <span className="strategy-tag">{result.collection}</span>
                  <span className="kb-similarity" style={{ color: result.similarity > 0.9 ? '#10b981' : result.similarity > 0.8 ? '#f59e0b' : '#94a3b8' }}>
                    {(result.similarity * 100).toFixed(0)}% match
                  </span>
                </div>
                <h4 className="kb-result-title">{result.title}</h4>
                <p className="kb-result-snippet">{result.snippet}</p>
                <div className="kb-result-id">{result.id}</div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Suppliers Tab */}
      {activeTab === 'suppliers' && (
        <div className="kb-suppliers-grid">
          {suppliers.map((supplier, i) => (
            <motion.div key={supplier.id} className={`kb-supplier-card ${selectedSupplier === supplier.id ? 'expanded' : ''}`}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + i * 0.06 }}
              onClick={() => setSelectedSupplier(selectedSupplier === supplier.id ? null : supplier.id)}>
              <div className="kb-supplier-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{supplier.name}</h4>
                    <span className="badge" style={{ background: `${tierColor(supplier.tier)}20`, color: tierColor(supplier.tier), border: `1px solid ${tierColor(supplier.tier)}40` }}>
                      Tier {supplier.tier}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Globe size={12} /> {supplier.location} • {supplier.category}
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--text-tertiary)', transition: 'transform 0.2s', transform: selectedSupplier === supplier.id ? 'rotate(90deg)' : '' }} />
              </div>

              <div className="kb-supplier-stats">
                <div className="kb-supplier-stat">
                  <div className="kb-supplier-stat-val" style={{ color: supplier.reliability > 90 ? '#10b981' : supplier.reliability > 80 ? '#f59e0b' : '#ef4444' }}>{supplier.reliability}%</div>
                  <div className="kb-supplier-stat-lbl">Reliability</div>
                </div>
                <div className="kb-supplier-stat">
                  <div className="kb-supplier-stat-val" style={{ color: supplier.riskScore > 50 ? '#ef4444' : supplier.riskScore > 30 ? '#f59e0b' : '#10b981' }}>{supplier.riskScore}</div>
                  <div className="kb-supplier-stat-lbl">Risk Score</div>
                </div>
                <div className="kb-supplier-stat">
                  <div className="kb-supplier-stat-val">{supplier.leadTime}</div>
                  <div className="kb-supplier-stat-lbl">Lead Time</div>
                </div>
                <div className="kb-supplier-stat">
                  <div className="kb-supplier-stat-val">{supplier.capacity}</div>
                  <div className="kb-supplier-stat-lbl">Capacity</div>
                </div>
              </div>

              {selectedSupplier === supplier.id && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="kb-supplier-expanded">
                  <div style={{ marginBottom: 'var(--space-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Risk History (12 Months)</div>
                    <ResponsiveContainer width="100%" height={120}>
                      <LineChart data={supplier.riskHistory}>
                        <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 9 }} />
                        <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} width={30} />
                        <Tooltip contentStyle={{ background: '#1a2332', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '8px', color: '#f1f5f9', fontSize: '0.75rem' }} />
                        <Line type="monotone" dataKey="risk" stroke="#06b6d4" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Certifications</div>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {supplier.certifications.map(c => <span key={c} className="strategy-tag">{c}</span>)}
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Alternates</div>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {supplier.alternates.map(a => <span key={a} className="strategy-tag" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', borderColor: 'rgba(16,185,129,0.2)' }}>{a}</span>)}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Recent Events</div>
                    {supplier.recentEvents.map((evt, j) => (
                      <div key={j} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent-cyan)', flexShrink: 0 }} />
                        {evt}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Historical Patterns Tab */}
      {activeTab === 'patterns' && (
        <div className="kb-patterns-grid">
          {patterns.map((pattern, i) => (
            <motion.div key={pattern.id} className="kb-pattern-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + i * 0.06 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '4px' }}>{pattern.pattern}</h4>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    <Shield size={11} style={{ verticalAlign: 'middle', marginRight: '3px' }} />
                    {pattern.frequency} • {pattern.historicalOccurrences} occurrences
                  </div>
                </div>
                <div className="prediction-probability" style={{ color: pattern.probability > 70 ? '#ef4444' : pattern.probability > 40 ? '#f59e0b' : '#10b981', fontSize: '1.5rem' }}>
                  {pattern.probability}%
                </div>
              </div>
              <div className="prediction-bar" style={{ marginBottom: '12px' }}>
                <div className="prediction-bar-fill" style={{
                  width: `${pattern.probability}%`,
                  background: `linear-gradient(90deg, ${pattern.probability > 70 ? '#ef444488' : pattern.probability > 40 ? '#f59e0b88' : '#10b98188'}, ${pattern.probability > 70 ? '#ef4444' : pattern.probability > 40 ? '#f59e0b' : '#10b981'})`
                }} />
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '12px' }}>{pattern.description}</p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                {pattern.regions.map(r => <span key={r} className="strategy-tag">{r}</span>)}
                <span className="strategy-tag" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}>
                  Avg {pattern.avgImpactDays}d impact
                </span>
              </div>
              <div style={{ padding: '10px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--accent-emerald)' }}>
                <strong>Mitigation:</strong> {pattern.mitigation}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
