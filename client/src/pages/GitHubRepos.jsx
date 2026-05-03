import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { GitBranch, Plus, Star, ExternalLink, Network, Container, MessageSquare, ArrowRight, AlertCircle } from 'lucide-react';

export default function GitHubRepos() {
  const [repos, setRepos] = useState([]);
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [importedRepo, setImportedRepo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    apiClient.get('/github/repos')
      .then(({ data }) => setRepos(data.data))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  const handleImport = async () => {
    if (!repoUrl.trim()) return;
    setLoading(true); setError(''); setImportedRepo(null);
    try {
      const { data } = await apiClient.post('/github/repos/import', { repoUrl });
      setRepoUrl('');
      // Navigate to the hub which will auto-generate everything
      navigate(`/github/${data.data.id}`);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.06)', border: '1px solid #2a2d46', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <GitBranch size={18} color="#e2e8f0" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'white' }}>GitHub Repo Analyzer</h1>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>Import any repo → generate system design, DevOps pipeline & deploy with AI</p>
        </div>
        <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/github/auth`} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.875rem', background: '#151728', border: '1px solid #2a2d46', borderRadius: 8, color: '#94a3b8', fontSize: '0.75rem', fontWeight: 500, textDecoration: 'none', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#4a5070'; e.currentTarget.style.color = '#e2e8f0'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--text-4)'; e.currentTarget.style.color = '#94a3b8'; }}>
          <GitBranch size={13} /> Connect GitHub
        </a>
      </div>

      {/* Import Box */}
      <div className="section" style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>Import Repository</p>
        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <GitBranch size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
            <input type="text" value={repoUrl} onChange={e => setRepoUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleImport()}
              className="input" style={{ paddingLeft: '2.25rem', paddingRight: '1rem', paddingTop: '0.6875rem', paddingBottom: '0.6875rem' }}
              placeholder="https://github.com/owner/repository" />
          </div>
          <button onClick={handleImport} disabled={loading || !repoUrl.trim()} className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 1.25rem', whiteSpace: 'nowrap' }}>
            {loading ? <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />Importing...</>
              : <><Plus size={14} />Import Repo</>}
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </button>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 10, padding: '0.625rem 0.875rem', color: '#f87171', fontSize: '0.8rem', marginTop: '0.75rem' }}>
            <AlertCircle size={13} /> {error}
          </div>
        )}

        {/* Success */}
        {importedRepo && (
          <div style={{ background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 10, padding: '0.875rem', marginTop: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399' }} />
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#34d399' }}>{importedRepo.fullName} imported!</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#4a5070' }}>
              {importedRepo.fileCount} files found · Key files: {importedRepo.keyFilesFound?.join(', ') || 'none'}
            </p>
          </div>
        )}
      </div>

      {/* Repo List */}
      {fetching ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-3)', fontSize: '0.875rem' }}>Loading repos...</div>
      ) : repos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-4)' }}>
          <GitBranch size={40} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.3 }} />
          <p style={{ fontSize: '0.875rem' }}>No repos imported yet. Paste a GitHub URL above to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {repos.map((repo) => (
            <RepoCard key={repo._id || repo.fullName} repo={repo} />
          ))}
        </div>
      )}
    </div>
  );
}

const RepoCard = ({ repo }) => {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ background: '#0f1120', border: '1px solid #1e2136', borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-4)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#1e2136'}>
      {/* Click whole card → open hub */}
      <Link to={`/github/${repo._id}`} style={{ textDecoration: 'none', display: 'block', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 36, height: 36, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <GitBranch size={16} color="#a78bfa" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white' }}>{repo.fullName}</span>
              {repo.language && <span style={{ fontSize: '0.65rem', background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.2)', color: '#a78bfa', padding: '2px 7px', borderRadius: 99, fontWeight: 600 }}>{repo.language}</span>}
              {repo.stars > 0 && <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 3 }}><Star size={10} fill="#fbbf24" color="#fbbf24" />{repo.stars}</span>}
            </div>
            {repo.description && <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', marginTop: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{repo.description}</p>}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.65rem', flexShrink: 0, alignItems: 'center' }}>
            {repo.systemDesign && <span style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399', padding: '2px 8px', borderRadius: 99 }}>Design ✓</span>}
            {repo.devopsPipeline && <span style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)', color: '#60a5fa', padding: '2px 8px', borderRadius: 99 }}>DevOps ✓</span>}
            <ArrowRight size={13} color="var(--text-3)" />
          </div>
        </div>
      </Link>

      {/* Quick-launch row */}
      <div style={{ borderTop: '1px solid #141826', padding: '0.625rem 1.25rem', display: 'flex', gap: '0.5rem' }}>
        {[
          { to: `/github/${repo._id}`, icon: Network, label: 'System Design', color: '#a78bfa' },
          { to: `/github/${repo._id}`, icon: Container, label: 'DevOps', color: '#60a5fa' },
          { to: `/github/${repo._id}`, icon: MessageSquare, label: 'Deploy Chat', color: '#34d399' },
        ].map(({ to, icon: Icon, label, color }) => (
          <Link key={label} to={to} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, color: 'var(--text-3)', fontSize: '0.7rem', fontWeight: 500, textDecoration: 'none', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.color = color; e.currentTarget.style.borderColor = color + '40'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}>
            <Icon size={11} /> {label}
          </Link>
        ))}
      </div>
    </div>
  );
};
