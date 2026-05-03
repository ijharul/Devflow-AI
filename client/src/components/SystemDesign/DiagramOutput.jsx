import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Copy, Check, Server, Database, Cpu, Globe, Layers } from 'lucide-react';

mermaid.initialize({
  startOnLoad: false,
  suppressErrorRendering: true,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#7c3aed',
    primaryTextColor: '#e2e8f0',
    primaryBorderColor: '#5b21b6',
    lineColor: '#4b5563',
    background: '#0f1021',
    mainBkg: '#161829',
    nodeBorder: '#5b21b6',
    clusterBkg: '#161829',
    titleColor: '#e2e8f0',
    edgeLabelBackground: '#161829',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '14px',
  },
  securityLevel: 'loose',
});

const TYPE_CONFIG = {
  'API Gateway':    { icon: Globe,     color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.2)' },
  Database:         { icon: Database,  color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.2)' },
  Cache:            { icon: Cpu,       color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.2)' },
  'Load Balancer':  { icon: Server,    color: '#fb923c', bg: 'rgba(251,146,60,0.1)',  border: 'rgba(251,146,60,0.2)' },
  default:          { icon: Layers,    color: '#a78bfa', bg: 'rgba(124,58,237,0.1)',  border: 'rgba(124,58,237,0.2)' },
};

const getConfig = (type = '') => TYPE_CONFIG[type] || TYPE_CONFIG.default;

const SectionLabel = ({ text, action }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
    <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{text}</p>
    {action}
  </div>
);

const CopyButton = ({ text, label = 'Copy' }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <button onClick={copy} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', padding: '0.375rem 0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: copied ? '#34d399' : '#64748b', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
      {copied ? <><Check size={12} />Copied</> : <><Copy size={12} />{label}</>}
    </button>
  );
};

export default function DiagramOutput({ data }) {
  const mermaidRef = useRef(null);
  const [diagramError, setDiagramError] = useState(false);

  useEffect(() => {
    if (!data?.mermaidDiagram || !mermaidRef.current) return;
    const render = async () => {
      try {
        mermaidRef.current.innerHTML = '';
        setDiagramError(false);
        // Sanitize: strip code fences the AI sometimes wraps around mermaid and fix common AI syntax hallucinations
        const clean = data.mermaidDiagram
          .replace(/^```(?:mermaid)?\s*/i, '')
          .replace(/\s*```\s*$/, '')
          .replace(/\|>/g, '|') // Fix invalid arrows like `-->|Text|>` 
          .replace(/;\s*(?=[A-Za-z])/g, '\n') // Replace semicolons with newlines for better rendering
          .replace(/->>/g, '-->') // Fix sequence diagram arrows used in graph by mistake
          .trim();
        if (!clean) return;
        const { svg } = await mermaid.render(`mermaid-${Date.now()}`, clean);
        if (mermaidRef.current) mermaidRef.current.innerHTML = svg;
      } catch (e) {
        console.warn('Mermaid render error:', e.message);
        setDiagramError(true);
      }
    };
    render();
  }, [data?.mermaidDiagram]);

  if (!data) return null;

  const card = { background: '#0f1120', border: '1px solid #1e2136', borderRadius: 16, padding: '1.5rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
      {/* Overview */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(37,99,235,0.2))', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Layers size={17} color="#a78bfa" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'white', marginBottom: '0.375rem' }}>{data.title}</h2>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.65 }}>{data.overview}</p>
          </div>
        </div>
      </div>

      {/* Components */}
      {data.components?.length > 0 && (
        <div style={card}>
          <SectionLabel text="Components" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '0.75rem' }}>
            {data.components.map((c, i) => {
              const { icon: Icon, color, bg, border } = getConfig(c.type);
              return (
                <div key={i} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                    <Icon size={14} color={color} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'white' }}>{c.name}</span>
                  </div>
                  <span style={{ fontSize: '0.625rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.type}</span>
                  <p style={{ fontSize: '0.775rem', color: '#64748b', marginTop: '0.5rem', lineHeight: 1.55 }}>{c.description}</p>
                  {c.technology && (
                    <code style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.7rem', color: '#fbbf24', background: 'rgba(0,0,0,0.3)', padding: '1px 7px', borderRadius: 5, fontFamily: 'monospace' }}>{c.technology}</code>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tech Stack + Scalability */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        {data.techStack && Object.keys(data.techStack).length > 0 && (
          <div style={card}>
            <SectionLabel text="Tech Stack" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {Object.entries(data.techStack).map(([layer, techs]) => (
                <div key={layer}>
                  <p style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>{layer}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {(techs || []).map(t => (
                      <span key={t} style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: '#cbd5e1', padding: '3px 10px', borderRadius: 8, fontWeight: 500 }}>{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.scalabilityNotes?.length > 0 && (
          <div style={card}>
            <SectionLabel text="Scalability Notes" />
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', margin: 0, padding: 0, listStyle: 'none' }}>
              {data.scalabilityNotes.map((note, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontSize: '0.875rem', color: '#94a3b8' }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#a78bfa' }} />
                  </div>
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Detailed Explanation */}
      {data.detailedExplanation && (
        <div style={{ ...card, marginTop: '1rem' }}>
          <SectionLabel text="Architecture Deep Dive" />
          <div style={{ fontSize: '1rem', color: 'var(--text-2)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
            {data.detailedExplanation}
          </div>
        </div>
      )}

      {/* Mermaid Diagram */}
      {data.mermaidDiagram && (
        <div style={card}>
          <SectionLabel text="Architecture Diagram" action={<CopyButton text={data.mermaidDiagram} label="Copy Mermaid" />} />
          {diagramError ? (
            <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '1rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#f87171', marginBottom: '0.75rem' }}>Diagram rendering failed. Raw Mermaid source:</p>
              <pre style={{ fontSize: '0.75rem', color: '#94a3b8', overflowX: 'auto', fontFamily: 'monospace', margin: 0 }}>{data.mermaidDiagram}</pre>
            </div>
          ) : (
            <div ref={mermaidRef} className="mermaid-container" style={{ overflowX: 'auto', display: 'flex', justifyContent: 'center', background: '#0d0f1c', borderRadius: 12, padding: '1rem' }} />
          )}
        </div>
      )}
    </div>
  );
}
