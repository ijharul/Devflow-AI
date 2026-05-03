import { useState } from 'react';
import apiClient from '../api/apiClient';
import AnalysisOutput from '../components/CodeAnalyzer/AnalysisOutput';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { Code2, Send } from 'lucide-react';

const LANGS = ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C++', 'PHP'];

const SAMPLE = `const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

app.post('/register', async (req, res) => {
  const user = await User.create(req.body);
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ token });
});

app.listen(3000);`;

export default function CodeAnalyzer() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = async () => {
    if (!code.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const { data } = await apiClient.post('/code/analyze', { code, language });
      setResult(data.data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ width: 40, height: 40, background: 'rgba(251,146,60,0.12)', border: '1px solid rgba(251,146,60,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Code2 size={18} color="#fb923c" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'white' }}>Code → Architecture Analyzer</h1>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>Paste code to get architecture breakdown, components, and improvement suggestions</p>
        </div>
      </div>

      <div className="code-card">
        {/* Toolbar */}
        <div className="code-toolbar">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
            {LANGS.map(lang => (
              <button key={lang} onClick={() => setLanguage(language === lang ? '' : lang)} className={`chip${language === lang ? ' active' : ''}`}>{lang}</button>
            ))}
          </div>
          <button onClick={() => setCode(SAMPLE)} className="btn-secondary" style={{ padding: '0.3rem 0.75rem', flexShrink: 0 }}>Load sample</button>
        </div>

        {/* Editor */}
        <div style={{ position: 'relative', background: '#060810' }}>
          <textarea value={code} onChange={e => setCode(e.target.value)} placeholder="// Paste your code here..." rows={16} maxLength={10000}
            style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', padding: '1.25rem', color: '#94a3b8', fontSize: '0.8rem', fontFamily: "'JetBrains Mono','Fira Code',ui-monospace,monospace", resize: 'none', lineHeight: 1.7 }} />
          <span style={{ position: 'absolute', bottom: 10, right: 14, fontSize: '0.65rem', color: 'var(--text-4)', fontFamily: 'monospace' }}>{code.length}/10,000</span>
        </div>

        {/* Footer */}
        <div style={{ padding: '0.875rem 1rem', borderTop: '1px solid #1e2136', background: '#0d0e1c' }}>
          <button onClick={handle} disabled={loading || !code.trim()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #c2410c, #b45309)', color: 'white', fontWeight: 600, fontSize: '0.8125rem', border: 'none', borderRadius: 8, padding: '0.5625rem 1.25rem', cursor: loading || !code.trim() ? 'not-allowed' : 'pointer', opacity: loading || !code.trim() ? 0.45 : 1, boxShadow: '0 2px 12px rgba(194,65,12,0.3)', transition: 'opacity 0.15s' }}>
            {loading ? <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />Analyzing...</> : <><Send size={13} />Analyze Architecture</>}
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </button>
        </div>
      </div>

      {loading && <LoadingSpinner message="Analyzing code architecture..." />}
      <ErrorMessage message={error} />
      {!loading && result && <AnalysisOutput data={result} />}
    </div>
  );
}
