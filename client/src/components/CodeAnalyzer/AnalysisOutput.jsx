import { useState } from 'react';
import { Layers, Puzzle, Lightbulb, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const SEV = {
  critical: { icon: AlertCircle, color: '#f87171', bg: 'rgba(239,68,68,0.07)', border: 'rgba(239,68,68,0.2)', label: 'Critical' },
  warning:  { icon: AlertTriangle, color: '#fbbf24', bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.2)', label: 'Warning' },
  info:     { icon: Info, color: '#60a5fa', bg: 'rgba(37,99,235,0.07)', border: 'rgba(37,99,235,0.2)', label: 'Info' },
};

const TABS = [
  { key: 'overview',    label: 'Overview',     icon: Layers },
  { key: 'components',  label: 'Components',   icon: Puzzle },
  { key: 'suggestions', label: 'Suggestions',  icon: Lightbulb },
];

export default function AnalysisOutput({ data }) {
  const [tab, setTab] = useState('overview');
  if (!data) return null;

  const criticalCount = data.suggestions?.filter(s => s.severity === 'critical').length || 0;

  return (
    <div style={{ background: '#0f1120', border: '1px solid #1e2136', borderRadius: 16, marginTop: '1.5rem', overflow: 'hidden' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #141826', background: 'rgba(255,255,255,0.015)' }}>
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 1.25rem', fontSize: '0.8125rem', fontWeight: 500, background: 'none', border: 'none', borderBottom: `2px solid ${tab === key ? '#7c3aed' : 'transparent'}`, cursor: 'pointer', color: tab === key ? '#a78bfa' : 'var(--text-3)', transition: 'all 0.15s', fontFamily: 'inherit' }}>
            <Icon size={13} />
            {label}
            {key === 'suggestions' && data.suggestions?.length > 0 && (
              <span style={{ fontSize: '0.6rem', padding: '1px 6px', borderRadius: 99, fontWeight: 700, background: criticalCount > 0 ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: criticalCount > 0 ? '#f87171' : '#fbbf24' }}>
                {data.suggestions.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div style={{ padding: '1.5rem' }}>
        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.875rem' }}>
            <div style={{ background: '#090b14', border: '1px solid #1a1d30', borderRadius: 12, padding: '1rem' }}>
              <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Language</p>
              <p style={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>{data.language || '—'}</p>
            </div>
            <div style={{ background: '#090b14', border: '1px solid #1a1d30', borderRadius: 12, padding: '1rem', gridColumn: 'span 2' }}>
              <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Architecture Pattern</p>
              <p style={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>{data.architecture || '—'}</p>
            </div>
            <div style={{ background: '#090b14', border: '1px solid #1a1d30', borderRadius: 12, padding: '1rem', gridColumn: 'span 3' }}>
              <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Summary</p>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.65 }}>{data.summary}</p>
            </div>
          </div>
        )}

        {tab === 'components' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {data.components?.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid #1a1d30', borderRadius: 12, padding: '1rem', transition: 'border-color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#252840'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#1a1d30'}>
                <div style={{ width: 32, height: 32, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.7rem', fontWeight: 700, color: '#a78bfa' }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'white' }}>{c.name}</span>
                    <span style={{ fontSize: '0.6rem', background: 'rgba(124,58,237,0.12)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.2)', padding: '1px 7px', borderRadius: 99, fontWeight: 600 }}>{c.type}</span>
                    {c.lineReference && <span style={{ fontSize: '0.65rem', color: 'var(--text-3)', fontFamily: 'monospace' }}>{c.lineReference}</span>}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.55 }}>{c.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'suggestions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.suggestions?.map((s, i) => {
              const { icon: Icon, color, bg, border, label } = SEV[s.severity] || SEV.info;
              return (
                <div key={i} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                    <Icon size={14} color={color} />
                    <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color }}>{label}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', marginLeft: '0.25rem' }}>{s.title}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', lineHeight: 1.55, color: '#94a3b8', marginLeft: '1.375rem' }}>{s.description}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
