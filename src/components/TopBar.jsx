import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, User, Settings, LogOut, ChevronDown, AlertTriangle, Zap, Cloud, Ship } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const pageTitles = {
  '/': 'Supply Chain Command Center',
  '/data-ingestion': 'Phase 1 — Data Ingestion',
  '/events': 'Events Monitor',
  '/knowledge-base': 'Phase 2 — Knowledge Base',
  '/agent-brain': 'Phase 3 — Agent Brain',
  '/predictions': 'Risk Predictions',
  '/mitigation': 'Phase 4 — Decision Support',
  '/alerts': 'Alerts & Notifications',
  '/reports': 'Reports & API Exports',
  '/feedback': 'Feedback Loop',
};

const SAMPLE_NOTIFICATIONS = [
  { id: 1, icon: AlertTriangle, color: '#ef4444', title: 'Critical: Suez Canal Disruption', time: '2m ago', read: false },
  { id: 2, icon: Zap, color: '#f59e0b', title: 'High Risk: Shanghai Port Congestion', time: '11m ago', read: false },
  { id: 3, icon: Cloud, color: '#06b6d4', title: 'Weather Alert: Typhoon approaching Taiwan', time: '34m ago', read: false },
  { id: 4, icon: Ship, color: '#8b5cf6', title: 'Vessel delay detected: Singapore Strait', time: '1h ago', read: true },
  { id: 5, icon: AlertTriangle, color: '#f59e0b', title: 'Trade ban: New tariffs on steel imports', time: '2h ago', read: true },
];

export default function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);
  const [search, setSearch] = useState('');

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const handleSearch = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      const routes = Object.entries(pageTitles);
      const match = routes.find(([, title]) => title.toLowerCase().includes(search.toLowerCase()));
      if (match) navigate(match[0]);
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h2 className="topbar-title">{pageTitles[location.pathname] || 'ChainGuard AI'}</h2>
      </div>

      <div className="topbar-search">
        <Search size={14} className="topbar-search-icon" />
        <input
          type="text"
          placeholder="Search events, routes, suppliers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>

      <div className="topbar-right">
        <span className="topbar-time">
          {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          {'  '}
          {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>

        {/* Notification Bell */}
        <div className="topbar-notif-container" ref={notifRef}>
          <button 
            className={`topbar-btn ${showNotif ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); setShowNotif(v => !v); setShowProfile(false); }}
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="topbar-notif-badge">{unreadCount}</span>}
          </button>

          {showNotif && (
            <div className="notif-dropdown">
              <div className="notif-dropdown-header">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <button className="notif-mark-all" onClick={e => { e.stopPropagation(); markAllRead(); }}>
                    Mark all read
                  </button>
                )}
              </div>
              <div className="notif-list">
                {notifications.map(n => {
                  const Icon = n.icon;
                  return (
                    <div
                      key={n.id}
                      className={`notif-item ${n.read ? 'read' : 'unread'}`}
                      onClick={e => { e.stopPropagation(); markRead(n.id); }}
                    >
                      <div className="notif-icon" style={{ color: n.color }}>
                        <Icon size={14} />
                      </div>
                      <div className="notif-content">
                        <div className="notif-title">{n.title}</div>
                        <div className="notif-time">{n.time}</div>
                      </div>
                      {!n.read && <span className="notif-dot" />}
                    </div>
                  );
                })}
              </div>
              <div className="notif-footer" onClick={e => { e.stopPropagation(); navigate('/alerts'); setShowNotif(false); }}>
                View all alerts →
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <div className="topbar-profile-container" ref={profileRef}>
          <button 
            className={`topbar-btn avatar-btn ${showProfile ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); setShowProfile(v => !v); setShowNotif(false); }}
            aria-label="User Profile"
          >
            <div className="topbar-avatar">SC</div>
            <ChevronDown size={12} style={{ color: 'var(--text-tertiary)', transition: 'transform 0.2s', transform: showProfile ? 'rotate(180deg)' : 'none' }} />
          </button>

          {showProfile && (
            <div className="profile-dropdown">
              <div className="profile-dropdown-header">
                <div className="profile-avatar-lg">SC</div>
                <div>
                  <div className="profile-name">Supply Chain Admin</div>
                  <div className="profile-email">admin@chainguard.ai</div>
                </div>
              </div>
              <div className="profile-menu">
                <button className="profile-menu-item" onClick={e => { e.stopPropagation(); navigate('/feedback'); setShowProfile(false); }}>
                  <User size={14} /> My Profile
                </button>
                <button className="profile-menu-item" onClick={e => { e.stopPropagation(); navigate('/alerts'); setShowProfile(false); }}>
                  <Settings size={14} /> Settings
                </button>
                <div className="profile-divider" />
                <button className="profile-menu-item danger" onClick={e => { e.stopPropagation(); alert('You have been logged out.'); }}>
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
