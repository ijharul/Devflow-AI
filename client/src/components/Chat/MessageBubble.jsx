import { Copy, Check, Zap } from 'lucide-react';
import { useState } from 'react';

const CodeBlock = ({ code, lang }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ margin: '0.625rem 0', borderRadius: 11, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', background: '#06080f' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.875rem', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-4)', fontFamily: 'monospace', fontWeight: 600 }}>{lang || 'code'}</span>
        <button onClick={copy} style={{ fontSize: '0.65rem', color: copied ? '#34d399' : 'var(--text-4)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, transition: 'color 0.15s' }}>
          {copied ? <><Check size={10} /> copied</> : <><Copy size={10} /> copy</>}
        </button>
      </div>
      <pre style={{ padding: '0.875rem', overflowX: 'auto', fontSize: '0.75rem', color: '#94a3c4', lineHeight: 1.65, fontFamily: "'JetBrains Mono', 'Fira Code', monospace", margin: 0 }}>
        <code>{code}</code>
      </pre>
    </div>
  );
};

const renderContent = (text) => {
  const parts = text.split(/(```[\w]*\n[\s\S]*?```)/g);
  return parts.map((part, i) => {
    if (part.startsWith('```')) {
      const match = part.match(/^```(\w*)\n([\s\S]*?)```$/);
      if (match) return <CodeBlock key={i} lang={match[1]} code={match[2]} />;
    }
    const inlineParts = part.split(/(`[^`]+`)/g);
    return (
      <span key={i}>
        {inlineParts.map((p, j) =>
          p.startsWith('`')
            ? <code key={j} style={{ background: 'rgba(167,139,250,0.14)', color: '#c4b5fd', padding: '2px 6px', borderRadius: 5, fontSize: '0.8em', fontFamily: 'monospace' }}>{p.slice(1,-1)}</code>
            : <span key={j} style={{ whiteSpace: 'pre-wrap' }}>{p}</span>
        )}
      </span>
    );
  });
};

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexDirection: isUser ? 'row-reverse' : 'row', animation: 'fadeUp 0.2s ease both' }}>
      {/* Avatar */}
      <div style={{
        width: 30, height: 30, borderRadius: '50%',
        flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.625rem', fontWeight: 700,
        background: isUser ? 'linear-gradient(135deg, #7c3aed, #3b82f6)' : 'rgba(52,211,153,0.12)',
        border: isUser ? 'none' : '1px solid rgba(52,211,153,0.25)',
        color: isUser ? 'white' : '#34d399',
        boxShadow: isUser ? '0 2px 10px rgba(124,58,237,0.4)' : 'none',
      }}>
        {isUser ? 'U' : <Zap size={12} strokeWidth={2.5} />}
      </div>

      {/* Bubble */}
      <div style={{
        maxWidth: '78%',
        borderRadius: isUser ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
        padding: '0.75rem 1rem',
        fontSize: '0.875rem',
        lineHeight: 1.7,
        background: isUser
          ? 'linear-gradient(135deg, rgba(124,58,237,0.8), rgba(59,130,246,0.7))'
          : 'rgba(255,255,255,0.04)',
        border: isUser ? '1px solid rgba(124,58,237,0.3)' : '1px solid rgba(255,255,255,0.07)',
        color: isUser ? '#eef2ff' : 'var(--text-2)',
        boxShadow: isUser ? '0 4px 20px rgba(124,58,237,0.2)' : 'none',
      }}>
        {renderContent(message.content)}
      </div>

      <style>{`@keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  );
}
