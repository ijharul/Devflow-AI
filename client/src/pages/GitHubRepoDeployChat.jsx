import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import MessageBubble from '../components/Chat/MessageBubble';
import { MessageSquare, ArrowLeft, GitBranch, Send, RotateCcw, AlertCircle } from 'lucide-react';

const DEPLOY_SUGGESTIONS = [
  'How do I deploy this to AWS?',
  'Generate a Dockerfile for this project',
  'How to set up CI/CD with GitHub Actions?',
  'What environment variables do I need?',
  'How to deploy to Railway or Render?',
  'Set up Nginx reverse proxy',
];

export default function GitHubRepoDeployChat() {
  const { repoId } = useParams();
  const [repo, setRepo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    apiClient.get(`/github/repos/${repoId}`)
      .then(({ data }) => {
        setRepo(data.data);
        setMessages([{
          role: 'assistant',
          content: `Hi! I'm your AI Deploy Assistant for **${data.data.fullName}**. I have full context of this repository's structure, stack, and files. Ask me anything about deploying, scaling, or setting up CI/CD for this project!`,
        }]);
      })
      .catch(() => setError('Failed to load repository'))
      .finally(() => setFetching(false));
  }, [repoId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput(''); setError('');
    setMessages(p => [...p, { role: 'user', content: msg }]);
    setLoading(true);
    try {
      const { data } = await apiClient.post(`/github/repos/${repoId}/deploy-chat`, {
        message: msg,
        history: messages.map(({ role, content }) => ({ role, content })),
      });
      setMessages(p => [...p, { role: 'assistant', content: data.data.reply }]);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); inputRef.current?.focus(); }
  };

  if (fetching) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-3)', fontSize: '0.875rem' }}>Loading repository...</div>;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 7rem)' }}>
      {/* Back + Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
        <Link to="/github" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-3)', fontSize: '0.75rem', textDecoration: 'none', padding: '0.375rem 0.75rem', border: '1px solid #1e2136', borderRadius: 8, background: '#0a0b14', flexShrink: 0 }}
          onMouseEnter={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'var(--text-4)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = '#1e2136'; }}>
          <ArrowLeft size={12} /> Back
        </Link>
        <div style={{ width: 36, height: 36, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <MessageSquare size={16} color="#34d399" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>Deploy Assistant</h1>
          {repo && <p style={{ fontSize: '0.7rem', color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{repo.fullName}</p>}
        </div>
        {repo && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.75rem', background: '#0f1120', border: '1px solid #1e2136', borderRadius: 8, flexShrink: 0 }}>
            <GitBranch size={12} color="#4a5070" />
            <span style={{ fontSize: '0.7rem', color: '#4a5070' }}>Context loaded</span>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399' }} />
          </div>
        )}
        <button onClick={() => repo && setMessages([{ role: 'assistant', content: `Chat cleared! Ask me anything about deploying **${repo.fullName}**.` }])}
          className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', flexShrink: 0 }}>
          <RotateCcw size={12} /> Clear
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', background: '#0f1120', border: '1px solid #1e2136', borderRadius: 16, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '0.75rem' }}>
        {messages.map((msg, i) => <MessageBubble key={i} message={msg} />)}
        {loading && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#34d399', flexShrink: 0 }}>AI</div>
            <div style={{ background: '#151728', border: '1px solid #1e2136', borderRadius: '16px 16px 16px 4px', padding: '0.75rem 1rem', display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
              {[0, 1, 2].map(i => <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399', opacity: 0.6, display: 'block', animation: 'bounce 1s infinite', animationDelay: `${i * 0.15}s` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
        <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {DEPLOY_SUGGESTIONS.map(s => <button key={s} onClick={() => sendMessage(s)} className="chip">{s}</button>)}
        </div>
      )}

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 10, padding: '0.625rem 0.875rem', color: '#f87171', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
          <AlertCircle size={13} /> {error}
        </div>
      )}

      {/* Input */}
      <div style={{ display: 'flex', gap: '0.625rem' }}>
        <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder="Ask about deployment, Docker, CI/CD... (Enter to send)" rows={2}
          style={{ flex: 1, background: '#0f1120', border: '1px solid #1e2136', borderRadius: 12, padding: '0.75rem 1rem', color: '#e2e8f0', fontSize: '0.875rem', resize: 'none', outline: 'none', fontFamily: 'inherit', lineHeight: 1.5, transition: 'border-color 0.15s' }}
          onFocus={e => e.target.style.borderColor = '#134e26'}
          onBlur={e => e.target.style.borderColor = '#1e2136'} />
        <button onClick={() => sendMessage()} disabled={loading || !input.trim()} className="btn-primary"
          style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, alignSelf: 'flex-end', padding: 0 }}>
          <Send size={16} color="white" />
        </button>
      </div>
    </div>
  );
}
