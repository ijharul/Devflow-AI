import { useState, useRef, useEffect } from 'react';
import apiClient from '../api/apiClient';
import {
  Zap, Send, RotateCcw, TrendingUp, TrendingDown, Minus,
  AlertTriangle, CheckCircle, XCircle, ChevronRight, Lightbulb,
  ArrowRight, AlertCircle, Layers
} from 'lucide-react';

const IMPACT_ICON = {
  positive: { Icon: TrendingUp, color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)' },
  neutral:  { Icon: Minus,      color: '#94a3b8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.15)' },
  negative: { Icon: TrendingDown, color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)' },
};

const VERDICT_CONFIG = {
  'Recommended':     { color: '#34d399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.2)', Icon: CheckCircle },
  'Conditional':     { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)',  Icon: AlertTriangle },
  'Not Recommended': { color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)', Icon: XCircle },
};

const COMPLEXITY_COLOR = { Low: '#34d399', Medium: '#fbbf24', High: '#fb923c', 'Very High': '#f87171' };

const EXAMPLES = [
  { scenario: 'What if I switch from MongoDB to PostgreSQL?', system: 'MERN stack e-commerce app with complex product catalog' },
  { scenario: 'What if I break the monolith into microservices?', system: 'Node.js monolith serving 10k daily users' },
  { scenario: 'What if I replace REST API with GraphQL?', system: 'React frontend consuming 15 different REST endpoints' },
  { scenario: 'What if I move from AWS to GCP?', system: 'Multi-service deployment on AWS EC2 + RDS + S3' },
  { scenario: 'What if I add Redis caching?', system: 'Express API with heavy database reads, 500ms avg response time' },
  { scenario: 'What if I use server-side rendering instead of CSR?', system: 'React SPA with SEO requirements' },
];

const ImpactCard = ({ label, data }) => {
  if (!data) return null;
  const cfg = IMPACT_ICON[data.rating] || IMPACT_ICON.neutral;
  const Icon = cfg.Icon;
  return (
    <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 10, padding: '0.875rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
        <Icon size={13} color={cfg.color} />
        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      </div>
      <p style={{ fontSize: '0.775rem', color: '#94a3b8', lineHeight: 1.5 }}>{data.description}</p>
    </div>
  );
};

const ResultCard = ({ result, scenario }) => {
  const verdictCfg = VERDICT_CONFIG[result.verdict] || VERDICT_CONFIG['Conditional'];
  const VIcon = verdictCfg.Icon;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      {/* Scenario + verdict banner */}
      <div style={{ background: verdictCfg.bg, border: `1px solid ${verdictCfg.border}`, borderRadius: 14, padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
          <VIcon size={18} color={verdictCfg.color} />
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: verdictCfg.color }}>{result.verdict}</span>
          <span style={{ marginLeft: 'auto', fontSize: '0.7rem', background: `rgba(0,0,0,0.2)`, border: `1px solid ${COMPLEXITY_COLOR[result.migrationComplexity]}30`, color: COMPLEXITY_COLOR[result.migrationComplexity], padding: '2px 10px', borderRadius: 99, fontWeight: 700 }}>
            {result.migrationComplexity} Migration
          </span>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#e2e8f0', fontWeight: 600, marginBottom: '0.375rem' }}>{result.scenario}</p>
        <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.6 }}>{result.recommendation}</p>
      </div>

      {/* Impact grid */}
      {result.impact && (
        <div>
          <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.625rem' }}>Impact Analysis</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            {Object.entries(result.impact).map(([key, val]) => (
              <ImpactCard key={key} label={key.replace(/([A-Z])/g, ' $1').trim()} data={val} />
            ))}
          </div>
        </div>
      )}

      {/* Pros / Cons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
        <div style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.15)', borderRadius: 12, padding: '1rem' }}>
          <p style={{ fontSize: '0.625rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Pros</p>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {(result.pros || []).map((p, i) => (
              <li key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <CheckCircle size={12} color="#34d399" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: '0.775rem', color: '#94a3b8', lineHeight: 1.5 }}>{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 12, padding: '1rem' }}>
          <p style={{ fontSize: '0.625rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Cons</p>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {(result.cons || []).map((c, i) => (
              <li key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <XCircle size={12} color="#f87171" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: '0.775rem', color: '#94a3b8', lineHeight: 1.5 }}>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Migration steps */}
      {result.migrationSteps?.length > 0 && (
        <div className="section">
          <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.875rem' }}>
            Migration Steps
            <span style={{ marginLeft: '0.5rem', color: COMPLEXITY_COLOR[result.migrationComplexity], fontWeight: 700 }}>· {result.migrationComplexity} Complexity</span>
          </p>
          <ol style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {result.migrationSteps.map((step, i) => (
              <li key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.6rem', fontWeight: 700, color: '#a78bfa', marginTop: 1 }}>{i + 1}</div>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.55 }}>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Risks + Alternatives */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
        {result.risks?.length > 0 && (
          <div className="section">
            <p style={{ fontSize: '0.625rem', fontWeight: 700, color: '#fb923c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Risks</p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {result.risks.map((r, i) => (
                <li key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <AlertTriangle size={12} color="#fb923c" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: '0.775rem', color: '#94a3b8', lineHeight: 1.5 }}>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {result.alternatives?.length > 0 && (
          <div className="section">
            <p style={{ fontSize: '0.625rem', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Alternatives to Consider</p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {result.alternatives.map((a, i) => (
                <li key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <Lightbulb size={12} color="#60a5fa" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: '0.775rem', color: '#94a3b8', lineHeight: 1.5 }}>{a}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default function WhatIfSimulator() {
  const [currentSystem, setCurrentSystem] = useState('');
  const [scenario, setScenario] = useState('');
  const [history, setHistory] = useState([]); // explored scenarios
  const [results, setResults] = useState([]); // [{scenario, result}]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [results]);

  const analyze = async (scenarioToAnalyze) => {
    const q = scenarioToAnalyze || scenario;
    if (!q.trim() || loading) return;
    setLoading(true); setError('');
    setScenario('');
    try {
      const { data } = await apiClient.post('/whatif/analyze', {
        currentSystem,
        scenario: q,
        history: history.slice(-5),
      });
      setResults(prev => [...prev, { scenario: q, result: data.data }]);
      setHistory(prev => [...prev, q]);
    } catch (err) { setError(err.message || 'Analysis failed'); }
    finally { setLoading(false); }
  };

  const reset = () => {
    setCurrentSystem(''); setScenario(''); setHistory([]);
    setResults([]); setError(''); setFollowUp('');
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ width: 40, height: 40, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Zap size={18} color="#a78bfa" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'white' }}>What-if Simulator</h1>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>Explore architectural decisions before committing — impact, trade-offs, migration path</p>
        </div>
        {results.length > 0 && (
          <button onClick={reset} className="btn-secondary" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.875rem' }}>
            <RotateCcw size={12} /> New Session
          </button>
        )}
      </div>

      {/* System context (shown only before first result, or collapsible) */}
      {results.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.25rem' }}>
          {/* Example scenarios */}
          <div className="section">
            <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.625rem' }}>Try an Example</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              {EXAMPLES.map((ex, i) => (
                <button key={i} onClick={() => { setScenario(ex.scenario); setCurrentSystem(ex.system); }}
                  style={{ textAlign: 'left', padding: '0.75rem', borderRadius: 10, border: '1px solid #1e2136', background: '#0a0b14', cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-4)'; e.currentTarget.style.background = '#0f1120'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e2136'; e.currentTarget.style.background = '#0a0b14'; }}>
                  <p style={{ fontSize: '0.775rem', fontWeight: 600, color: '#a78bfa', marginBottom: '0.25rem' }}>{ex.scenario}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>{ex.system}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Current system context */}
          <div>
            <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
              Current System <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional — improves accuracy)</span>
            </p>
            <textarea value={currentSystem} onChange={e => setCurrentSystem(e.target.value)}
              placeholder="Describe your current architecture, stack, scale, constraints...&#10;e.g. MERN stack, 50k daily users, hosted on AWS, PostgreSQL for user data, MongoDB for product catalog"
              rows={3}
              style={{ width: '100%', background: '#0f1120', border: '1px solid #1e2136', borderRadius: 12, padding: '0.875rem 1rem', color: '#e2e8f0', fontSize: '0.875rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none', lineHeight: 1.6, transition: 'border-color 0.15s' }}
              onFocus={e => e.target.style.borderColor = '#4c1d95'}
              onBlur={e => e.target.style.borderColor = '#1e2136'} />
          </div>
        </div>
      )}

      {/* Results stream */}
      {results.map(({ scenario: s, result }, i) => (
        <div key={i} style={{ marginBottom: '1.5rem' }}>
          {/* User question bubble */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.875rem' }}>
            <div style={{ maxWidth: 600, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: '14px 14px 4px 14px', padding: '0.75rem 1rem' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#c4b5fd' }}>{s}</p>
            </div>
          </div>
          <ResultCard result={result} scenario={s} />
          {i < results.length - 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.5rem 0' }}>
              <div style={{ flex: 1, height: 1, background: '#1e2136' }} />
              <ArrowRight size={14} color="var(--text-4)" />
              <div style={{ flex: 1, height: 1, background: '#1e2136' }} />
            </div>
          )}
        </div>
      ))}

      {/* Loading state */}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#0f1120', border: '1px solid #1e2136', borderRadius: 14, padding: '1.25rem' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Zap size={14} color="#a78bfa" />
          </div>
          <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
            {[0,1,2].map(i => <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#a78bfa', opacity: 0.6, display: 'block', animation: 'bounce 1s infinite', animationDelay: `${i*0.15}s` }} />)}
            <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Analyzing trade-offs...</span>
        </div>
      )}

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 10, padding: '0.75rem 1rem', color: '#f87171', fontSize: '0.8rem', marginBottom: '0.875rem' }}>
          <AlertCircle size={13} /> {error}
        </div>
      )}

      <div ref={bottomRef} />

      {/* Input — always visible */}
      <div style={{ position: 'sticky', bottom: 0, background: 'linear-gradient(transparent, #08090e 30%)', paddingTop: '1.5rem', paddingBottom: '0.25rem', marginTop: '1rem' }}>
        {results.length > 0 && (
          <p style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginBottom: '0.5rem', textAlign: 'center' }}>
            {history.length} scenario{history.length !== 1 ? 's' : ''} explored · Keep exploring with follow-up questions
          </p>
        )}
        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <input value={scenario} onChange={e => setScenario(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && analyze()}
            placeholder={results.length === 0 ? 'What if I switch from MongoDB to PostgreSQL?' : 'Ask a follow-up: What if I also add Redis caching?'}
            style={{ flex: 1, background: '#0f1120', border: '1px solid #1e2136', borderRadius: 12, padding: '0.875rem 1rem', color: '#e2e8f0', fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.15s' }}
            onFocus={e => e.target.style.borderColor = '#4c1d95'}
            onBlur={e => e.target.style.borderColor = '#1e2136'} />
          <button onClick={() => analyze()} disabled={loading || !scenario.trim()} className="btn-primary"
            style={{ padding: '0 1.25rem', borderRadius: 12, display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0, whiteSpace: 'nowrap' }}>
            {loading
              ? <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
              : <><Zap size={14} /> Simulate</>}
          </button>
        </div>
      </div>
    </div>
  );
}
