import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import PromptInput from '../components/SystemDesign/PromptInput';
import DiagramOutput from '../components/SystemDesign/DiagramOutput';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { Network, Download, FileJson, PenSquare } from 'lucide-react';

const exportPDF = (data) => {
  const componentsHtml = (data.components || []).map(c =>
    `<div style="background:#1a1d30;border:1px solid #2a2d46;border-radius:8px;padding:12px;margin:4px 0">
      <strong style="color:#a78bfa">${c.name}</strong>
      <span style="color:#60a5fa;font-size:11px;margin-left:8px;text-transform:uppercase">${c.type || ''}</span>
      <p style="color:#94a3b8;font-size:12px;margin:4px 0 0">${c.description || ''}</p>
      ${c.technology ? `<code style="color:#fbbf24;font-size:11px">${c.technology}</code>` : ''}
    </div>`
  ).join('');

  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><title>${data.title} – Architecture</title>
    <style>body{font-family:system-ui,sans-serif;background:#0f1120;color:#e2e8f0;padding:2rem;max-width:900px;margin:0 auto}
    h1{font-size:1.5rem;margin-bottom:.5rem}p{color:#94a3b8;line-height:1.6}
    section{background:#151728;border:1px solid #1e2136;border-radius:12px;padding:1.25rem;margin:1rem 0}
    h2{font-size:.75rem;text-transform:uppercase;letter-spacing:.1em;color:#3a3d54;margin-bottom:1rem}
    .chip{display:inline-block;background:rgba(167,139,250,.1);border:1px solid rgba(167,139,250,.2);color:#a78bfa;padding:2px 10px;border-radius:99px;font-size:11px;font-weight:600;margin:2px}
    pre{background:#080a14;border:1px solid #1e2136;border-radius:8px;padding:1rem;overflow:auto;font-size:12px;color:#94a3b8}</style>
  </head><body>
    <h1>${data.title || 'Architecture Design'}</h1>
    <p>${data.overview || ''}</p>
    ${componentsHtml ? `<section><h2>Components</h2>${componentsHtml}</section>` : ''}
    ${data.mermaidDiagram ? `<section><h2>Mermaid Diagram</h2><pre>${data.mermaidDiagram}</pre></section>` : ''}
    <script>window.onload=()=>{window.print();window.close();}</script>
  </body></html>`);
  win.document.close();
};

const exportJSON = (data) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `${(data.title || 'architecture').replace(/\s+/g, '-').toLowerCase()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export default function SystemDesign() {
  const [prompt, setPrompt]   = useState('');
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const navigate              = useNavigate();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const { data } = await apiClient.post('/system-design/generate', { prompt });
      setResult(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-icon" style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.2)', boxShadow: '0 4px 14px rgba(167,139,250,0.15)' }}>
          <Network size={20} color="#a78bfa" strokeWidth={1.75} />
        </div>
        <div style={{ flex: 1 }}>
          <h1>System Design Generator</h1>
          <p>Describe any system → get full architecture with Mermaid diagram &amp; component breakdown</p>
        </div>
        {result && (
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, flexWrap: 'wrap' }}>
            <button onClick={() => exportPDF(result)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4375rem 0.875rem', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 8, color: '#a78bfa', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 500, transition: 'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(167,139,250,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(167,139,250,0.08)'}>
              <Download size={12} /> Export PDF
            </button>
            <button onClick={() => exportJSON(result)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4375rem 0.875rem', background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: 8, color: '#60a5fa', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 500, transition: 'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(96,165,250,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(96,165,250,0.08)'}>
              <FileJson size={12} /> Export JSON
            </button>
            <button onClick={() => navigate('/diagram-editor')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4375rem 0.875rem', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 8, color: '#34d399', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 500, transition: 'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(52,211,153,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(52,211,153,0.08)'}>
              <PenSquare size={12} /> Open Editor
            </button>
          </div>
        )}
      </div>

      <PromptInput value={prompt} onChange={setPrompt} onSubmit={handleGenerate} loading={loading} />
      {loading && <LoadingSpinner message="Generating system architecture..." />}
      <ErrorMessage message={error} />
      {!loading && result && <DiagramOutput data={result} />}
    </div>
  );
}
