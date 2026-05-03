import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Network, Container, MessageSquare, Code2, ArrowRight, Sparkles, Zap,
  GitBranch, Bug, GraduationCap, PenSquare, FlaskConical, GitCompare, History,
  TrendingUp, Shield, Cpu
} from 'lucide-react';

const AI_TOOLS = [
  {
    to: '/system-design', icon: Network, title: 'System Design',
    desc: 'Generate full architecture with Mermaid diagrams, component map & tech stack.',
    color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.2)', badge: 'Popular',
    gradient: 'rgba(167,139,250,0.06)',
  },
  {
    to: '/devops', icon: Container, title: 'DevOps',
    desc: 'Generate Dockerfile, docker-compose, GitHub Actions CI/CD and deployment checklists.',
    color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.2)',
    gradient: 'rgba(96,165,250,0.06)',
  },
  {
    to: '/chat', icon: MessageSquare, title: 'AI Assistant',
    desc: 'Chat with an AI expert about architecture, debugging, and DevOps patterns.',
    color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)',
    gradient: 'rgba(52,211,153,0.06)',
  },
  {
    to: '/code-analyzer', icon: Code2, title: 'Code Analyzer',
    desc: 'Paste code → get architecture breakdown, pattern detection & improvement tips.',
    color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.2)', badge: 'Unique',
    gradient: 'rgba(251,146,60,0.06)',
  },
  {
    to: '/debug', icon: Bug, title: 'Error Debugger',
    desc: 'Paste any error + code → root cause analysis, explanation, and fixed code.',
    color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)',
    gradient: 'rgba(248,113,113,0.06)',
  },
  {
    to: '/interview', icon: GraduationCap, title: 'Interview Mode',
    desc: 'Practice system design interviews with AI questions, hints, and scoring.',
    color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)',
    gradient: 'rgba(251,191,36,0.06)',
  },
];

const ARCH_TOOLS = [
  {
    to: '/whatif', icon: FlaskConical, title: 'What-if Simulator',
    desc: 'Explore architectural decisions: "What if I switch to microservices?"',
    color: '#c084fc', bg: 'rgba(192,132,252,0.1)', border: 'rgba(192,132,252,0.2)',
  },
  {
    to: '/compare', icon: GitCompare, title: 'Arch Comparison',
    desc: 'Compare two architectures side-by-side across 8 dimensions.',
    color: '#38bdf8', bg: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.2)',
  },
  {
    to: '/diagram-editor', icon: PenSquare, title: 'Diagram Editor',
    desc: 'Live Mermaid editor with instant preview and SVG/PNG export.',
    color: '#4ade80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.2)',
  },
];

const STATS = [
  { icon: Cpu,       val: 'LLaMA 3.3', lbl: '70B Model',    color: '#a78bfa' },
  { icon: Zap,       val: '10+',        lbl: 'AI Tools',     color: '#60a5fa' },
  { icon: Shield,    val: 'Free',       lbl: 'Groq Powered', color: '#34d399' },
  { icon: TrendingUp,val: 'Fast',       lbl: 'Sub-2s resp.', color: '#fbbf24' },
];

const ToolCard = ({ to, icon: Icon, title, desc, color, bg, border, badge, gradient, delay = 0 }) => (
  <Link to={to} style={{ textDecoration: 'none', display: 'block', animationDelay: `${delay}ms` }}
    className="animate-fade-up">
    <div
      style={{
        background: `linear-gradient(145deg, var(--bg-elevated), ${gradient || 'var(--bg-elevated)'})`,
        border: `1px solid var(--border)`,
        borderRadius: 20,
        padding: '1.75rem',
        transition: 'all 0.22s ease',
        height: '100%',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = color + '55';
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px ${color}22`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Top glow */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 100, height: 100,
        background: `radial-gradient(circle, ${color}18, transparent 70%)`,
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{
          width: 48, height: 48,
          background: bg,
          border: `1px solid ${border}`,
          borderRadius: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 12px ${color}22`,
        }}>
          <Icon size={24} color={color} strokeWidth={1.75} />
        </div>
        {badge && (
          <span style={{
            fontSize: '0.65rem', fontWeight: 700,
            background: bg, border: `1px solid ${border}`,
            color, padding: '3px 10px', borderRadius: 99,
            letterSpacing: '0.05em',
          }}>
            {badge}
          </span>
        )}
      </div>

      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-1)', marginBottom: '0.5rem' }}>{title}</h3>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-3)', lineHeight: 1.6, marginBottom: '1.25rem' }}>{desc}</p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', color, fontWeight: 600 }}>
        Open tool <ArrowRight size={14} />
      </div>
    </div>
  </Link>
);

const SectionLabel = ({ children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
    <span style={{
      fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-4)',
      textTransform: 'uppercase', letterSpacing: '0.15em',
    }}>
      {children}
    </span>
    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, var(--border), transparent)' }} />
  </div>
);

export default function Home() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] || 'Developer';

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', width: '100%' }}>

      {/* ── Hero ── */}
      <div style={{ 
        position: 'relative', 
        borderRadius: 24, 
        padding: '2rem 2.25rem', 
        marginBottom: '1.5rem',
        background: 'linear-gradient(135deg, #0a0e1a 0%, #050812 100%)',
        border: '1px solid rgba(255,255,255,0.04)',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
      }}>
        {/* Background glow effects */}
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '40%', height: '60%', background: 'radial-gradient(circle, rgba(124,58,237,0.12), transparent 70%)', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '10%', width: '30%', height: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.08), transparent 70%)', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '3rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 500px' }}>
            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: 'rgba(167,139,250,0.1)',
              border: '1px solid rgba(167,139,250,0.15)',
              borderRadius: 99, padding: '5px 12px',
              marginBottom: '1rem',
            }}>
              <Sparkles size={12} color="#a78bfa" />
              <span style={{ fontSize: '0.65rem', color: '#a78bfa', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                AI-Powered Developer Playground
              </span>
            </div>

            <h1 className="hero-title" style={{ fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem', lineHeight: 1.1, letterSpacing: '-0.03em', wordBreak: 'break-word', whiteSpace: 'normal' }}>
              Welcome, {firstName}
              <div style={{ height: '0.25rem' }} className="desktop-only" />
              <span style={{ 
                background: 'linear-gradient(90deg, #a78bfa, #818cf8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'block'
              }}>what are we building?</span>
            </h1>
            
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', maxWidth: '100%', width: '480px', lineHeight: 1.6, fontWeight: 500 }}>
              Generate architectures, pipelines, debug errors, and chat with your personal AI dev assistant.
            </p>
          </div>

          {/* Stats Grid - Fixed 2x2 for desktop */}
          <div className="hero-stats-grid" style={{ 
            flex: '0 0 340px', 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '0.75rem',
          }}>
            {STATS.map(({ icon: Icon, val, lbl, color }) => (
              <div key={lbl} style={{ 
                background: 'rgba(255,255,255,0.03)', 
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.06)', 
                borderRadius: 16, 
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.625rem',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'default',
              }} onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.borderColor = color + '50';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }} onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <div style={{
                  width: 32, height: 32,
                  background: `${color}15`,
                  border: `1px solid ${color}25`,
                  borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={16} color={color} />
                </div>
                <div>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', display: 'block', lineHeight: 1.2 }}>{val}</span>
                  <span style={{ fontSize: '0.55rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>{lbl}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── GitHub Quick-start ── */}
      <Link to="/github" style={{ textDecoration: 'none', display: 'block', marginBottom: '2rem' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(59,130,246,0.06))',
            border: '1px solid rgba(124,58,237,0.25)',
            borderRadius: 16, padding: '1.125rem 1.5rem',
            display: 'flex', alignItems: 'center', gap: '1.125rem',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.25)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <div style={{
            width: 46, height: 46,
            background: 'rgba(124,58,237,0.18)',
            border: '1px solid rgba(124,58,237,0.35)',
            borderRadius: 13,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 16px rgba(124,58,237,0.25)',
          }}>
            <GitBranch size={20} color="#c4b5fd" strokeWidth={1.75} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#eef2ff', marginBottom: 3 }}>GitHub Repo Analyzer</p>
            <p style={{ fontSize: '0.775rem', color: 'var(--text-3)', lineHeight: 1.6 }}>
              Import any repo → auto-generate system design, Dockerfile, CI/CD pipeline &amp; deploy assistant in one click
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
            <span style={{
              fontSize: '0.6rem', fontWeight: 700,
              background: 'rgba(124,58,237,0.18)',
              border: '1px solid rgba(124,58,237,0.35)',
              color: '#c4b5fd', padding: '3px 10px', borderRadius: 99,
            }}>
              Auto-generate
            </span>
            <ArrowRight size={16} color="#a78bfa" />
          </div>
        </div>
      </Link>

      {/* ── AI Tools ── */}
      <SectionLabel>AI Tools</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {AI_TOOLS.map((t, i) => <ToolCard key={t.to} {...t} delay={i * 40} />)}
      </div>

      {/* ── Architecture Tools ── */}
      <SectionLabel>Architecture</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {ARCH_TOOLS.map((t, i) => <ToolCard key={t.to} {...t} delay={i * 40} />)}
      </div>

      {/* ── History ── */}
      <Link to="/history" style={{ textDecoration: 'none', display: 'block' }}>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: '0.875rem',
            padding: '0.875rem 1.25rem',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            transition: 'all 0.18s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hi)'; e.currentTarget.style.background = '#0f1628'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
        >
          <div style={{ width: 36, height: 36, background: 'rgba(148,163,196,0.08)', border: '1px solid rgba(148,163,196,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <History size={16} color="var(--text-3)" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-1)' }}>Saved History</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-4)' }}>Browse and revisit your past AI results</p>
          </div>
          <ArrowRight size={15} color="var(--text-4)" />
        </div>
      </Link>
    </div>
  );
}
