import { useState } from 'react';
import { Copy, Check, Terminal, GitBranch, ListChecks, Container } from 'lucide-react';

const ACCENT = {
  violet: { color: '#a78bfa', bg: 'rgba(124,58,237,0.1)', border: 'rgba(124,58,237,0.2)' },
  blue:   { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.2)' },
};

const CodeBlock = ({ title, icon: Icon, code, language, accent = 'violet' }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const a = ACCENT[accent];

  return (
    <div style={{ background: '#0a0b14', border: '1px solid #1e2136', borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.25rem', borderBottom: '1px solid #141826', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: a.bg, border: `1px solid ${a.border}` }}>
            <Icon size={13} color={a.color} />
          </div>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#cbd5e1' }}>{title}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontFamily: 'monospace', background: '#0f1120', border: '1px solid #1e2136', padding: '1px 8px', borderRadius: 6 }}>{language}</span>
        </div>
        <button onClick={copy} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', padding: '0.375rem 0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: copied ? '#34d399' : '#64748b', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
          {copied ? <><Check size={11} />Copied</> : <><Copy size={11} />Copy</>}
        </button>
      </div>
      <div style={{ background: '#080a12', padding: '1.25rem', overflowX: 'auto' }}>
        <pre style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.65, fontFamily: 'monospace', margin: 0 }}><code>{code}</code></pre>
      </div>
    </div>
  );
};

export default function PipelineOutput({ data }) {
  if (!data) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
      {data.dockerfile && (
        <CodeBlock title="Dockerfile" icon={Terminal} language="dockerfile" code={data.dockerfile} accent="violet" />
      )}
      {data.dockerCompose && (
        <CodeBlock title="docker-compose.yml" icon={Container} language="yaml" code={data.dockerCompose} accent="violet" />
      )}
      {data.githubActionsYaml && (
        <CodeBlock title="GitHub Actions CI/CD" icon={GitBranch} language="yaml" code={data.githubActionsYaml} accent="blue" />
      )}

      {data.deploymentSteps?.length > 0 && (
        <div style={{ background: '#0f1120', border: '1px solid #1e2136', borderRadius: 16, padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <ListChecks size={15} color="#34d399" />
            <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Deployment Steps</p>
          </div>
          <ol style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: 0, padding: 0, listStyle: 'none' }}>
            {data.deploymentSteps.map((step, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <span style={{ flexShrink: 0, width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(37,99,235,0.15))', border: '1px solid rgba(124,58,237,0.25)', color: '#a78bfa', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, marginTop: 1 }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.6 }}>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
