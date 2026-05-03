import { useState, useRef, useEffect } from 'react';
import apiClient from '../api/apiClient';
import MessageBubble from '../components/Chat/MessageBubble';
import ErrorMessage from '../components/common/ErrorMessage';
import { MessageSquare, Send, RotateCcw, Sparkles } from 'lucide-react';

const SUGGESTIONS = [
  'Explain the CAP theorem',
  'What is CQRS pattern?',
  'How does a load balancer work?',
  'Explain microservices vs monolith',
  'How to design a rate limiter?',
  'What is event sourcing?',
];

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm DevFlow AI — your expert in system design, DevOps, and architecture patterns. What would you like to explore today? 🚀" }
  ]);
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const bottomRef           = useRef(null);
  const inputRef            = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput(''); setError('');
    setMessages(p => [...p, { role: 'user', content: msg }]);
    setLoading(true);
    try {
      const { data } = await apiClient.post('/chat/message', {
        message: msg,
        history: messages.map(({ role, content }) => ({ role, content })),
      });
      setMessages(p => [...p, { role: 'assistant', content: data.data.reply }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 7.5rem)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{
            width: 42, height: 42,
            background: 'rgba(52,211,153,0.12)',
            border: '1px solid rgba(52,211,153,0.2)',
            borderRadius: 13,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(52,211,153,0.15)',
          }}>
            <MessageSquare size={19} color="#34d399" strokeWidth={1.75} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.3 }}>AI Dev Assistant</h1>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: 1 }}>Expert in system design, DevOps &amp; architecture</p>
          </div>
        </div>
        <button
          onClick={() => setMessages([{ role: 'assistant', content: "Chat cleared! What would you like to know?" }])}
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
        >
          <RotateCcw size={12} /> Clear chat
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 18, padding: '1.25rem',
        display: 'flex', flexDirection: 'column', gap: '1rem',
        marginBottom: '0.75rem',
      }}>
        {messages.map((msg, i) => <MessageBubble key={i} message={msg} />)}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'rgba(52,211,153,0.12)',
              border: '1px solid rgba(52,211,153,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.6rem', fontWeight: 700, color: '#34d399',
              flexShrink: 0,
            }}>
              AI
            </div>
            <div style={{
              background: 'var(--bg-overlay)',
              border: '1px solid var(--border)',
              borderRadius: '18px 18px 18px 4px',
              padding: '0.75rem 1.125rem',
              display: 'flex', gap: '5px', alignItems: 'center',
            }}>
              {[0,1,2].map(i => (
                <span key={i} style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: '#34d399', display: 'block',
                  animation: 'typingDot 1.2s ease infinite',
                  animationDelay: `${i * 0.18}s`,
                }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
        <style>{`
          @keyframes typingDot { 0%,80%,100%{transform:translateY(0);opacity:0.35} 40%{transform:translateY(-6px);opacity:1} }
        `}</style>
      </div>

      {/* Suggestions (only at start) */}
      {messages.length === 1 && (
        <div style={{ marginBottom: '0.75rem', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
            <Sparkles size={11} color="var(--text-4)" />
            <span style={{ fontSize: '0.65rem', color: 'var(--text-4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Try asking</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => sendMessage(s)} className="chip" style={{ fontSize: '0.72rem' }}>{s}</button>
            ))}
          </div>
        </div>
      )}

      <ErrorMessage message={error} />

      {/* Input */}
      <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-end', flexShrink: 0, marginTop: error ? '0.5rem' : 0 }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder="Ask anything… (Enter to send, Shift+Enter for new line)"
          rows={2}
          className="input"
          style={{ flex: 1, borderRadius: 14, lineHeight: 1.6 }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="btn-primary"
          style={{ width: 46, height: 46, borderRadius: 13, padding: 0, flexShrink: 0 }}
        >
          <Send size={17} color="white" />
        </button>
      </div>
    </div>
  );
}
