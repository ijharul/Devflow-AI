import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Network, Container, MessageSquare, Code2,
  Zap, GitBranch, Bug, GraduationCap, PenSquare, History,
  GitCompare, FlaskConical, ChevronRight
} from 'lucide-react';

const sections = [
  {
    label: 'Overview',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    label: 'AI Tools',
    items: [
      { to: '/system-design',  icon: Network,       label: 'System Design',  color: '#a78bfa' },
      { to: '/devops',         icon: Container,     label: 'DevOps',         color: '#60a5fa' },
      { to: '/chat',           icon: MessageSquare, label: 'AI Assistant',   color: '#34d399' },
      { to: '/code-analyzer',  icon: Code2,         label: 'Code Analyzer',  color: '#fb923c' },
      { to: '/debug',          icon: Bug,           label: 'Error Debugger', color: '#f87171' },
      { to: '/diagram-editor', icon: PenSquare,     label: 'Diagram Editor', color: '#4ade80' },
    ],
  },
  {
    label: 'Architecture',
    items: [
      { to: '/whatif',  icon: FlaskConical, label: 'What-if Simulator', color: '#c084fc' },
      { to: '/compare', icon: GitCompare,   label: 'Arch Comparison',   color: '#38bdf8' },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { to: '/github',    icon: GitBranch,    label: 'GitHub Repos',  color: '#a78bfa' },
      { to: '/interview', icon: GraduationCap,label: 'Interview Mode', color: '#fbbf24' },
      { to: '/history',   icon: History,      label: 'Saved History',  color: '#94a3b8' },
    ],
  },
];

export default function Sidebar() {
  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div style={{
          width: 36, height: 36,
          background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
          borderRadius: 11,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 4px 16px rgba(124,58,237,0.5)',
        }}>
          <Zap size={16} color="white" strokeWidth={2.5} />
        </div>
        <div>
          <p style={{ fontSize: '0.9rem', fontWeight: 800, color: '#eef2ff', lineHeight: 1, letterSpacing: '-0.02em' }}>DevFlow</p>
          <p style={{ fontSize: '0.575rem', color: '#7c3aed', fontWeight: 700, marginTop: 3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>AI Playground</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {sections.map(({ label, items }) => (
          <div key={label} style={{ marginBottom: '0.125rem' }}>
            <p className="nav-section-label">{label}</p>
            {items.map(({ to, icon: Icon, label: itemLabel, color }) => (
              <NavLink key={to} to={to} end={to === '/'}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                {({ isActive }) => (
                  <>
                    <Icon
                      size={15}
                      className="nav-icon"
                      style={{ color: isActive ? (color || '#a78bfa') : undefined }}
                    />
                    <span style={{ flex: 1 }}>{itemLabel}</span>
                    {isActive && (
                      <ChevronRight size={11} style={{ color: '#a78bfa', opacity: 0.6 }} />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="status-dot online" />
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-4)', fontWeight: 500 }}>LLaMA 3.3 70B · Groq</span>
        </div>
      </div>
    </div>
  );
}
