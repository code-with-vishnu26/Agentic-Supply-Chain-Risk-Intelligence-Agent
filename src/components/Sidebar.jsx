import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Radio, TrendingUp, ShieldCheck, Bell, Activity, Database, Brain, FileText, RefreshCw, Layers } from 'lucide-react';

const navSections = [
  {
    label: null,
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    label: 'Phase 1 — Event monitoring (data ingestion)',
    items: [
      { to: '/data-ingestion', icon: Layers, label: 'Data Ingestion' },
      { to: '/events', icon: Radio, label: 'Events Monitor' },
    ],
  },
  {
    label: 'Phase 2 — Knowledge retrieval (memory + context)',
    items: [
      { to: '/knowledge-base', icon: Database, label: 'Knowledge Base' },
    ],
  },
  {
    label: 'Phase 3 — Agent intelligence (the brain)',
    items: [
      { to: '/agent-brain', icon: Brain, label: 'Agent Brain' },
      { to: '/predictions', icon: TrendingUp, label: 'Risk Predictions' },
    ],
  },
  {
    label: 'Phase 4 — Decision support (recommendations)',
    items: [
      { to: '/mitigation', icon: ShieldCheck, label: 'Decision Support' },
    ],
  },
  {
    label: 'Phase 5 — Output + continuous feedback',
    items: [
      { to: '/alerts', icon: Bell, label: 'Alerts' },
      { to: '/reports', icon: FileText, label: 'Reports' },
      { to: '/feedback', icon: RefreshCw, label: 'Feedback Loop' },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Activity size={22} color="white" />
        </div>
        <div className="sidebar-logo-text">
          <h1>ChainGuard AI</h1>
          <p>Supply Chain Intelligence</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navSections.map((section, si) => (
          <div key={si} className="sidebar-section">
            {section.label && <div className="sidebar-section-label">{section.label}</div>}
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-status">
        <div className="sidebar-status-dot">
          System Active — Monitoring 247 nodes
        </div>
      </div>
    </aside>
  );
}
