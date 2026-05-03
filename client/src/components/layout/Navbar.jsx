import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, ChevronRight, Zap } from 'lucide-react';

const ROUTES = {
  '/':                 { label: 'Dashboard' },
  '/system-design':    { label: 'System Design' },
  '/devops':           { label: 'DevOps' },
  '/chat':             { label: 'AI Assistant' },
  '/code-analyzer':    { label: 'Code Analyzer' },
  '/debug':            { label: 'Error Debugger' },
  '/interview':        { label: 'Interview Mode' },
  '/diagram-editor':   { label: 'Diagram Editor' },
  '/whatif':           { label: 'What-if Simulator' },
  '/compare':          { label: 'Architecture Compare' },
  '/github':           { label: 'GitHub Repos' },
  '/history':          { label: 'Saved History' },
};

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const route = ROUTES[pathname] || ROUTES['/'];
  const initial = user?.name?.[0]?.toUpperCase() || '?';

  return (
    <div className="topbar">
      {/* Left: breadcrumb + Mobile Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button 
          onClick={onToggleSidebar}
          className="mobile-menu-toggle"
          style={{ 
            background: 'none', border: 'none', color: 'var(--text-3)', 
            padding: '4px', cursor: 'pointer', display: 'none',
            alignItems: 'center', justifyContent: 'center'
          }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-4)', fontWeight: 500 }}>DevFlow AI</span>
        <ChevronRight size={13} style={{ color: 'var(--text-4)' }} className="desktop-only" />
        <span className="desktop-only" style={{ fontSize: '0.75rem', color: 'var(--text-2)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          {route.label}
        </span>
      </div>

      {/* Right: user */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.5rem', borderRadius: 99, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '0.7rem', fontWeight: 700,
            boxShadow: '0 0 10px rgba(124,58,237,0.4)',
            flexShrink: 0,
          }}>
            {initial}
          </div>
          <span className="desktop-only" style={{ fontSize: '0.75rem', color: 'var(--text-2)', fontWeight: 500, maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.name?.split(' ')[0]}
          </span>
        </div>

        {/* Logout */}
        <button
          onClick={() => { logout(); navigate('/login'); }}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.35rem',
            fontSize: '0.7rem', color: 'var(--text-4)',
            background: 'none', border: '1px solid transparent',
            borderRadius: 7, padding: '0.35rem 0.6rem',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.25)'; e.currentTarget.style.background = 'rgba(248,113,113,0.07)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-4)'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'none'; }}
        >
          <LogOut size={12} /> <span className="desktop-only">Sign out</span>
        </button>
      </div>
    </div>
  );
}
