import { useState, useEffect, useRef, useCallback } from 'react';
import mermaid from 'mermaid';
import { PenSquare, Eye, Copy, Check, Download, RotateCcw, Maximize2, Minimize2, Sparkles, AlertCircle } from 'lucide-react';

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
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '14px',
  },
});

const TEMPLATES = [
  {
    label: 'Microservices',
    code: `graph TD
    Client[Client App] --> Gateway[API Gateway]
    Gateway --> Auth[Auth Service]
    Gateway --> Users[User Service]
    Gateway --> Orders[Order Service]
    Users --> UserDB[(User DB)]
    Orders --> OrderDB[(Order DB)]
    Orders --> Queue[Message Queue]
    Queue --> Notify[Notification Service]`,
  },
  {
    label: 'CI/CD Pipeline',
    code: `graph LR
    Dev[Developer] --> Push[Git Push]
    Push --> CI[CI Runner]
    CI --> Test[Run Tests]
    CI --> Lint[Lint & Type Check]
    Test --> Build[Docker Build]
    Lint --> Build
    Build --> Registry[Container Registry]
    Registry --> Stage[Staging Deploy]
    Stage --> Manual{Manual Approval}
    Manual -->|Approved| Prod[Production Deploy]`,
  },
  {
    label: 'Auth Flow',
    code: `sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as Auth Service
    participant DB as Database
    U->>F: Login with credentials
    F->>A: POST /auth/login
    A->>DB: Verify user
    DB-->>A: User found
    A-->>F: JWT Token
    F->>F: Store token
    F-->>U: Redirect to dashboard`,
  },
  {
    label: 'System Design',
    code: `graph TD
    User[👤 User] --> CDN[CDN / Edge]
    CDN --> LB[Load Balancer]
    LB --> API1[API Server 1]
    LB --> API2[API Server 2]
    API1 --> Cache[(Redis Cache)]
    API2 --> Cache
    API1 --> Primary[(Primary DB)]
    API2 --> Primary
    Primary --> Replica[(Read Replica)]
    API1 --> S3[(Object Storage)]`,
  },
  {
    label: 'User Journey',
    code: `graph LR
    A([Start]) --> B[Land on Homepage]
    B --> C{Has Account?}
    C -->|No| D[Register]
    C -->|Yes| E[Login]
    D --> F[Verify Email]
    F --> E
    E --> G[Dashboard]
    G --> H[Use Feature]
    H --> I([Complete])`,
  },
  {
    label: 'Database Schema',
    code: `erDiagram
    USER {
        string id PK
        string email
        string name
        datetime createdAt
    }
    POST {
        string id PK
        string title
        string content
        string userId FK
        datetime createdAt
    }
    COMMENT {
        string id PK
        string content
        string postId FK
        string userId FK
    }
    USER ||--o{ POST : "creates"
    POST ||--o{ COMMENT : "has"
    USER ||--o{ COMMENT : "writes"`,
  },
];

const CopyBtn = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <button onClick={copy} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4375rem 0.875rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#94a3b8', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 500 }}>
      {copied ? <><Check size={12} color="#34d399" />Copied</> : <><Copy size={12} />Copy Code</>}
    </button>
  );
};

export default function DiagramEditor() {
  const [code, setCode] = useState(TEMPLATES[0].code);
  const [svgOutput, setSvgOutput] = useState('');
  const [renderError, setRenderError] = useState('');
  const [rendering, setRendering] = useState(false);
  const [expandPreview, setExpandPreview] = useState(false);
  const previewRef = useRef(null);
  const debounceTimer = useRef(null);
  const renderCount = useRef(0);

  const renderDiagram = useCallback(async (src) => {
    if (!src.trim()) { setSvgOutput(''); setRenderError(''); return; }
    setRendering(true);
    try {
      // Strip any markdown code fences (``` or ```mermaid) that might be pasted
      const clean = src
        .replace(/^```(?:mermaid)?\s*/im, '')
        .replace(/\s*```\s*$/m, '')
        .replace(/\|>/g, '|') // Auto-fix invalid arrows
        .replace(/;\s*(?=[A-Za-z])/g, '\n') // Auto-fix semicolons to newlines (only before text)
        .trim();
      const id = `mermaid-editor-${++renderCount.current}`;
      const { svg } = await mermaid.render(id, clean);
      setSvgOutput(svg);
      setRenderError('');
    } catch (e) {
      const msg = e.message || 'Syntax error in diagram';
      // Show only the relevant part, not the full stack
      setRenderError(msg.split('\n')[0]);
      setSvgOutput('');
    } finally {
      setRendering(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => renderDiagram(code), 600);
    return () => clearTimeout(debounceTimer.current);
  }, [code, renderDiagram]);

  const downloadSVG = () => {
    if (!svgOutput) return;
    const blob = new Blob([svgOutput], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'diagram.svg';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPNG = async () => {
    if (!svgOutput) return;
    const svgEl = previewRef.current?.querySelector('svg');
    if (!svgEl) return;
    const canvas = document.createElement('canvas');
    const scale = 2;
    const bbox = svgEl.getBoundingClientRect();
    canvas.width = (bbox.width || 800) * scale;
    canvas.height = (bbox.height || 600) * scale;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0d0f1c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const img = new Image();
    const svgBlob = new Blob([svgOutput], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      const a = document.createElement('a');
      a.download = 'diagram.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = url;
  };

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ width: 40, height: 40, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <PenSquare size={18} color="#34d399" />
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'white' }}>Interactive Diagram Editor</h1>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>Write Mermaid syntax → live preview → export as SVG or PNG</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <CopyBtn text={code} />
          <button onClick={downloadSVG} disabled={!svgOutput}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4375rem 0.875rem', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 8, color: svgOutput ? '#34d399' : 'var(--text-4)', fontSize: '0.75rem', cursor: svgOutput ? 'pointer' : 'not-allowed', fontWeight: 500 }}>
            <Download size={12} />SVG
          </button>
          <button onClick={downloadPNG} disabled={!svgOutput}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4375rem 0.875rem', background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: 8, color: svgOutput ? '#60a5fa' : 'var(--text-4)', fontSize: '0.75rem', cursor: svgOutput ? 'pointer' : 'not-allowed', fontWeight: 500 }}>
            <Download size={12} />PNG
          </button>
          <button onClick={() => setCode(TEMPLATES[0].code)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4375rem 0.875rem', background: '#151728', border: '1px solid #1e2136', borderRadius: 8, color: '#64748b', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 500 }}>
            <RotateCcw size={12} />Reset
          </button>
        </div>
      </div>

      {/* Templates */}
      <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '1.125rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', marginRight: '0.25rem' }}>
          <Sparkles size={11} style={{ marginRight: '0.25rem' }} />Templates:
        </span>
        {TEMPLATES.map(t => (
          <button key={t.label} onClick={() => setCode(t.code)} className="chip">{t.label}</button>
        ))}
      </div>

      {/* Split Editor */}
      <div style={{ display: 'grid', gridTemplateColumns: expandPreview ? '1fr' : '1fr 1fr', gap: '0.875rem', transition: 'all 0.3s ease' }}>
        {/* Code Editor */}
        {!expandPreview && (
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: 520 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 0.875rem', background: '#0d0e1c', border: '1px solid #1e2136', borderBottom: 'none', borderRadius: '12px 12px 0 0' }}>
              <div style={{ display: 'flex', gap: 5 }}>
                {['#ff5f57', '#febc2e', '#28c840'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 600 }}>diagram.mmd</span>
              {rendering && <div style={{ width: 12, height: 12, border: '2px solid rgba(167,139,250,0.3)', borderTopColor: '#a78bfa', borderRadius: '50%', animation: 'spin 0.9s linear infinite', marginLeft: 'auto' }} />}
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
            <textarea value={code} onChange={e => setCode(e.target.value)}
              spellCheck={false}
              style={{ flex: 1, background: '#080a14', border: '1px solid #1e2136', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '1rem', color: '#94a3b8', fontSize: '0.825rem', fontFamily: "'JetBrains Mono','Fira Code',ui-monospace,monospace", resize: 'none', outline: 'none', lineHeight: 1.75, tabSize: 2 }}
              onKeyDown={e => {
                if (e.key === 'Tab') {
                  e.preventDefault();
                  const s = e.target.selectionStart, end = e.target.selectionEnd;
                  const val = e.target.value;
                  setCode(val.substring(0, s) + '    ' + val.substring(end));
                  setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = s + 4; }, 0);
                }
              }} />
          </div>
        )}

        {/* Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 520 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 0.875rem', background: '#0d0e1c', border: '1px solid #1e2136', borderBottom: 'none', borderRadius: '12px 12px 0 0' }}>
            <Eye size={13} color="#34d399" />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 600, flex: 1 }}>Preview</span>
            {svgOutput && !renderError && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399' }} />}
            {renderError && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f87171' }} />}
            <button onClick={() => setExpandPreview(o => !o)} style={{ display: 'flex', alignItems: 'center', padding: '0.25rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}>
              {expandPreview ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
          </div>
          <div ref={previewRef} style={{ flex: 1, background: '#0a0b14', border: '1px solid #1e2136', borderTop: 'none', borderRadius: '0 0 12px 12px', overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem', minHeight: 460 }}>
            {renderError ? (
              <div style={{ textAlign: 'center', maxWidth: 400 }}>
                <AlertCircle size={28} color="#f87171" style={{ margin: '0 auto 0.75rem' }} />
                <p style={{ fontSize: '0.8rem', color: '#f87171', fontWeight: 600, marginBottom: '0.5rem' }}>Syntax Error</p>
                <p style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace', background: '#0f1120', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '0.75rem', textAlign: 'left', lineHeight: 1.6 }}>{renderError}</p>
              </div>
            ) : !code.trim() ? (
              <div style={{ textAlign: 'center', color: 'var(--text-4)' }}>
                <PenSquare size={36} style={{ margin: '0 auto 0.75rem', display: 'block' }} />
                <p style={{ fontSize: '0.875rem' }}>Start typing Mermaid syntax to see the preview</p>
              </div>
            ) : svgOutput ? (
              <div dangerouslySetInnerHTML={{ __html: svgOutput }} style={{ maxWidth: '100%', overflow: 'auto' }} />
            ) : (
              <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                {[0,1,2].map(i => <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', opacity: 0.6, animation: 'bounce 1s infinite', animationDelay: `${i*0.15}s` }} />)}
                <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}`}</style>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Syntax reference */}
      <div style={{ marginTop: '1.25rem', background: '#0f1120', border: '1px solid #1e2136', borderRadius: 12, padding: '1rem 1.25rem' }}>
        <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Mermaid Quick Reference</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
          {[
            { type: 'Flowchart', syntax: 'graph TD / graph LR' },
            { type: 'Sequence', syntax: 'sequenceDiagram' },
            { type: 'ER Diagram', syntax: 'erDiagram' },
            { type: 'Gantt', syntax: 'gantt' },
            { type: 'Class', syntax: 'classDiagram' },
            { type: 'State', syntax: 'stateDiagram-v2' },
          ].map(({ type, syntax }) => (
            <div key={type} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.725rem', color: '#64748b', minWidth: 80 }}>{type}</span>
              <code style={{ fontSize: '0.7rem', color: '#a78bfa', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.15)', padding: '1px 6px', borderRadius: 6, fontFamily: 'monospace' }}>{syntax}</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
