import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import CalendarPage from './pages/CalendarPage';
import EventFormPage from './pages/EventFormPage';
import ReportsPage from './pages/ReportsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AuditPage from './pages/AuditPage';
import SettingsPage from './pages/SettingsPage';

const NAV = [
  { id: 'calendar',  path: '/calendar',  icon: '◈', label: 'Calendar'  },
  { id: 'events',    path: '/events',    icon: '◉', label: 'Events'    },
  { id: 'reports',   path: '/reports',   icon: '◧', label: 'Reports'   },
  { id: 'analytics', path: '/analytics', icon: '◬', label: 'Analytics' },
  { id: 'audit',     path: '/audit',     icon: '◎', label: 'Audit'     },
  { id: 'settings',  path: '/settings',  icon: '◐', label: 'Settings'  },
];

const Sidebar = ({ active, onNav }) => (
  <aside style={{ width: 200, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '20px 0', flexShrink: 0 }}>
    <div style={{ padding: '0 18px 24px' }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--amber)', letterSpacing: '-0.02em' }}>EVENT</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>STUDIO</div>
      <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 3, letterSpacing: '0.1em' }}>MANAGEMENT PLATFORM</div>
    </div>
    <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '0 10px' }}>
      {NAV.map(n => (
        <button key={n.id} onClick={() => onNav(n.path)} style={{
          display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px',
          borderRadius: 'var(--r)', border: 'none', cursor: 'pointer',
          background: active === n.id ? 'var(--amber)18' : 'transparent',
          color: active === n.id ? 'var(--amber)' : 'var(--muted)',
          fontFamily: 'var(--mono)', fontSize: 12, fontWeight: active === n.id ? 700 : 400,
          textAlign: 'left', borderLeft: active === n.id ? '2px solid var(--amber)' : '2px solid transparent',
          transition: 'all 120ms',
        }}>
          <span style={{ fontSize: 14 }}>{n.icon}</span> {n.label}
        </button>
      ))}
    </nav>
    <div style={{ marginTop: 'auto', padding: '14px 18px', borderTop: '1px solid var(--border)' }}>
      <div style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.06em' }}>LOGGED IN AS</div>
      <div style={{ fontSize: 12, fontWeight: 600, marginTop: 2 }}>Admin</div>
    </div>
  </aside>
);

const BottomNav = ({ active, onNav }) => (
  <nav className="no-print" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 'var(--nav-h)', background: 'var(--surface)', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', zIndex: 100, paddingBottom: 'env(safe-area-inset-bottom)' }}>
    {NAV.map(n => (
      <button key={n.id} onClick={() => onNav(n.path)} style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 3, border: 'none', background: 'none', cursor: 'pointer',
        color: active === n.id ? 'var(--amber)' : 'var(--muted)', transition: 'color 120ms', padding: '6px 0',
      }}>
        <span style={{ fontSize: 18 }}>{n.icon}</span>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.04em', fontFamily: 'var(--mono)' }}>{n.label.slice(0, 3).toUpperCase()}</span>
      </button>
    ))}
  </nav>
);

export default function App() {
  const [isMobile, setMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fn = () => setMobile(window.innerWidth <= 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  const activeId = NAV.find(n => location.pathname.startsWith(n.path))?.id || 'calendar';

  return (
    <div style={{ display: 'flex', height: '100dvh', overflow: 'hidden' }}>
      {!isMobile && <Sidebar active={activeId} onNav={navigate} />}
      <main style={{ flex: 1, overflowY: 'auto', paddingBottom: isMobile ? 'var(--nav-h)' : 0 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/calendar" replace />} />
          <Route path="/calendar" element={<CalendarPage isMobile={isMobile} />} />
          <Route path="/events" element={<EventFormPage isMobile={isMobile} listMode />} />
          <Route path="/events/new" element={<EventFormPage isMobile={isMobile} />} />
          <Route path="/events/:id" element={<EventFormPage isMobile={isMobile} />} />
          <Route path="/reports" element={<ReportsPage isMobile={isMobile} />} />
          <Route path="/analytics" element={<AnalyticsPage isMobile={isMobile} />} />
          <Route path="/audit" element={<AuditPage isMobile={isMobile} />} />
          <Route path="/settings" element={<SettingsPage isMobile={isMobile} />} />
        </Routes>
      </main>
      {isMobile && <BottomNav active={activeId} onNav={navigate} />}
    </div>
  );
}
