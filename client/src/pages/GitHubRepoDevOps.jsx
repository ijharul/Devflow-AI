import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { Container, ArrowLeft, GitBranch, Copy, Check, Sparkles, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

const CopyBtn = ({ text, label = 'Copy' }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <button onClick={copy} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#94a3b8', fontSize: '0.7rem', cursor: 'pointer' }}>
      {copied ? <><Check size={11} color="#34d399" /> Copied</> : <><Copy size={11} /> {label}</>}
    </button>
  );
};

const CodeBlock = ({ title, code, language = '', defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  if (!code) return null;
  return (
    <div className="code-card" style={{ marginBottom: 0 }}>
      <div className="code-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{ display: 'flex', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 600 }}>{title}</span>
          {language && <span style={{ fontSize: '0.6rem', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', color: '#60a5fa', padding: '1px 6px', borderRadius: 99 }}>{language}</span>}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <CopyBtn text={code} />
          <button onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.375rem 0.625rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 7, color: '#64748b', fontSize: '0.7rem', cursor: 'pointer' }}>
            {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
        </div>
      </div>
      {open && <pre style={{ margin: 0, padding: '1.25rem', overflowX: 'auto', fontSize: '0.775rem', lineHeight: 1.65, color: '#94a3b8', fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace", background: 'transparent' }}>{code}</pre>}
    </div>
  );
};

export default function GitHubRepoDevOps() {
  const { repoId } = useParams();
  const [repo, setRepo] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient.get(`/github/repos/${repoId}`)
      .then(({ data }) => {
        setRepo(data.data);
        if (data.data.devopsPipeline) setResult(data.data.devopsPipeline);
      })
      .catch(() => setError('Failed to load repository'))
      .finally(() => setFetching(false));
  }, [repoId]);

  const generate = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const { data } = await apiClient.post(`/github/repos/${repoId}/devops`);
      setResult(data.data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  if (fetching) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-3)', fontSize: '0.875rem' }}>Loading repository...</div>;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Back + Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Link to="/github" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-3)', fontSize: '0.75rem', textDecoration: 'none', padding: '0.375rem 0.75rem', border: '1px solid #1e2136', borderRadius: 8, background: '#0a0b14' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'var(--text-4)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = '#1e2136'; }}>
          <ArrowLeft size={12} /> Back
        </Link>
        <div style={{ width: 36, height: 36, background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Container size={16} color="#60a5fa" />
        </div>
        <div>
          <h1 style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>DevOps Pipeline</h1>
          {repo && <p style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>{repo.fullName}</p>}
        </div>
      </div>

      {/* Repo info */}
      {repo && (
        <div style={{ background: '#0f1120', border: '1px solid #1e2136', borderRadius: 12, padding: '0.875rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <GitBranch size={16} color="#4a5070" />
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#e2e8f0' }}>{repo.fullName}</span>
            {repo.description && <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginLeft: '0.75rem' }}>{repo.description}</span>}
          </div>
          {repo.language && <span style={{ fontSize: '0.65rem', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', color: '#a78bfa', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>{repo.language}</span>}
        </div>
      )}

      {/* Generate prompt */}
      {!result && !loading && (
        <div className="section" style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ width: 52, height: 52, background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Container size={22} color="#60a5fa" />
          </div>
          <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '0.5rem' }}>Generate DevOps Pipeline</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginBottom: '1.5rem' }}>AI generates Dockerfile, docker-compose, CI/CD pipeline and deployment guide</p>
          <button onClick={generate} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.75rem' }}>
            <Container size={14} /> Generate Pipeline
          </button>
        </div>
      )}

      {loading && (
        <div className="section" style={{ textAlign: 'center', padding: '2.5rem' }}>
          <div style={{ width: 36, height: 36, border: '3px solid rgba(96,165,250,0.2)', borderTopColor: '#60a5fa', borderRadius: '50%', animation: 'spin 0.9s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-3)', fontSize: '0.875rem' }}>Analyzing repo and generating DevOps configuration...</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 10, padding: '0.75rem 1rem', color: '#f87171', fontSize: '0.8rem', marginBottom: '1rem' }}>
          <AlertCircle size={13} /> {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Deployment Steps */}
          {result.deploymentSteps?.length > 0 && (
            <div className="section">
              <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.875rem' }}>Deployment Steps</p>
              <ol style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {result.deploymentSteps.map((step, i) => (
                  <li key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.6rem', fontWeight: 700, color: '#60a5fa', marginTop: 1 }}>{i + 1}</div>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.55 }}>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Code blocks */}
          <CodeBlock title="Dockerfile" code={result.dockerfile} language="dockerfile" />
          <CodeBlock title="docker-compose.yml" code={result.dockerCompose} language="yaml" />
          <CodeBlock title=".github/workflows/ci-cd.yml" code={result.githubActionsYaml} language="yaml" />

          {/* Environment Variables */}
          {result.environmentVariables?.length > 0 && (
            <div className="section">
              <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.875rem' }}>Required Environment Variables</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {result.environmentVariables.map((env, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#0a0b14', border: '1px solid #1e2136', borderRadius: 8, padding: '0.625rem 0.875rem' }}>
                    <code style={{ fontSize: '0.775rem', color: '#a78bfa', fontFamily: 'monospace', fontWeight: 600, flexShrink: 0 }}>{env.key}</code>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>{env.description}</span>
                    {env.required && <span style={{ marginLeft: 'auto', fontSize: '0.6rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', padding: '1px 6px', borderRadius: 99, fontWeight: 700, flexShrink: 0 }}>required</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deployment Options */}
          {result.deploymentOptions?.length > 0 && (
            <div className="section">
              <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.875rem' }}>Deployment Options</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.625rem' }}>
                {result.deploymentOptions.map((opt, i) => (
                  <div key={i} style={{ background: '#0a0b14', border: '1px solid #1e2136', borderRadius: 10, padding: '0.875rem' }}>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#60a5fa', marginBottom: '0.375rem' }}>{opt.platform}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', lineHeight: 1.5 }}>{opt.description}</p>
                    {opt.cost && <p style={{ fontSize: '0.7rem', color: '#34d399', marginTop: '0.5rem', fontWeight: 500 }}>{opt.cost}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={generate} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', alignSelf: 'flex-start' }}>
            <Sparkles size={13} /> Regenerate
          </button>
        </div>
      )}
    </div>
  );
}
