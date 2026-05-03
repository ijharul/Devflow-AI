import { useState } from 'react';
import apiClient from '../api/apiClient';
import PipelineOutput from '../components/DevOps/PipelineOutput';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { Container, Send, Download } from 'lucide-react';

const downloadFile = (content, filename, mimeType = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  a.click(); URL.revokeObjectURL(url);
};

const downloadAll = (data) => {
  if (data.dockerfile) { setTimeout(() => downloadFile(data.dockerfile, 'Dockerfile'), 0); }
  if (data.dockerCompose) { setTimeout(() => downloadFile(data.dockerCompose, 'docker-compose.yml', 'text/yaml'), 200); }
  if (data.githubActionsYaml) { setTimeout(() => downloadFile(data.githubActionsYaml, 'ci-cd.yml', 'text/yaml'), 400); }
};

const APP_TYPES = [
  { label: 'MERN', desc: 'MongoDB + Express + React + Node' },
  { label: 'Node.js', desc: 'Express REST API' },
  { label: 'React', desc: 'Vite / CRA frontend' },
  { label: 'Next.js', desc: 'Full-stack React' },
  { label: 'Python/FastAPI', desc: 'Async Python API' },
  { label: 'Python/Django', desc: 'Django REST Framework' },
];

export default function DevOps() {
  const [appType, setAppType] = useState('');
  const [framework, setFramework] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = async () => {
    if (!appType) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const { data } = await apiClient.post('/devops/generate', { appType, framework });
      setResult(data.data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ width: 40, height: 40, background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Container size={18} color="#60a5fa" />
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'white' }}>DevOps</h1>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>Generate production-ready CI/CD pipelines and Docker images.</p>
        </div>
        {result && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {result.dockerfile && (
              <button onClick={() => downloadFile(result.dockerfile, 'Dockerfile')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4375rem 0.875rem', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 8, color: '#a78bfa', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 500 }}>
                <Download size={12} /> Dockerfile
              </button>
            )}
            {result.dockerCompose && (
              <button onClick={() => downloadFile(result.dockerCompose, 'docker-compose.yml', 'text/yaml')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4375rem 0.875rem', background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.2)', borderRadius: 8, color: '#ec4899', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 500 }}>
                <Download size={12} /> docker-compose
              </button>
            )}
            {result.githubActionsYaml && (
              <button onClick={() => downloadFile(result.githubActionsYaml, 'ci-cd.yml')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4375rem 0.875rem', background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: 8, color: '#60a5fa', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 500 }}>
                <Download size={12} /> CI/CD YAML
              </button>
            )}
            <button onClick={() => downloadAll(result)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4375rem 0.875rem', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 8, color: '#34d399', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 500 }}>
              <Download size={12} /> Download All
            </button>
          </div>
        )}
      </div>

      <div className="section" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Select App Type</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            {APP_TYPES.map(({ label, desc }) => (
              <button key={label} onClick={() => setAppType(label)}
                style={{ textAlign: 'left', padding: '0.875rem', borderRadius: 10, border: `1px solid ${appType === label ? 'rgba(124,58,237,0.4)' : '#1e2136'}`, background: appType === label ? 'rgba(124,58,237,0.1)' : '#0a0b14', cursor: 'pointer', transition: 'all 0.15s' }}>
                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: appType === label ? '#a78bfa' : '#94a3b8', marginBottom: '0.25rem' }}>{label}</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>{desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Additional Context <span style={{ textTransform: 'none', fontWeight: 400 }}>(optional)</span></p>
          <input type="text" value={framework} onChange={e => setFramework(e.target.value)} className="input"
            style={{ padding: '0.6875rem 1rem' }}
            placeholder="e.g. uses PostgreSQL, Redis cache, deploys to AWS ECS..." />
        </div>

        <button onClick={handle} disabled={loading || !appType} className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem' }}>
          {loading ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />Generating...</> : <><Send size={14} />Generate DevOps Setup</>}
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </button>
      </div>

      {loading && <LoadingSpinner message="Generating Docker images & CI/CD pipeline..." />}
      <ErrorMessage message={error} />
      {!loading && result && <PipelineOutput data={result} />}
    </div>
  );
}
