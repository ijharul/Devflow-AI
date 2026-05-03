import { Sparkles, Send, Lightbulb } from 'lucide-react';

const EXAMPLES = [
  'Chat app like WhatsApp',
  'URL shortener like Bitly',
  'Video streaming like YouTube',
  'E-commerce like Amazon',
  'Ride sharing like Uber',
];

export default function PromptInput({ value, onChange, onSubmit, loading }) {
  const charPct = Math.round((value.length / 500) * 100);

  return (
    <div className="section" style={{ marginBottom: '1.5rem' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ width: 28, height: 28, background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={13} color="#a78bfa" />
        </div>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-2)' }}>Describe your system</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 60, height: 3, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${charPct}%`, background: charPct > 80 ? '#fbbf24' : 'var(--accent)', borderRadius: 99, transition: 'width 0.2s' }} />
          </div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-4)', fontVariantNumeric: 'tabular-nums' }}>{value.length}/500</span>
        </div>
      </div>

      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && (e.ctrlKey || e.metaKey) && onSubmit()}
        placeholder="e.g. Design a real-time chat application like WhatsApp with message delivery, user presence, media sharing and group chats..."
        maxLength={500}
        rows={4}
        className="input"
        style={{ marginBottom: '1rem', lineHeight: 1.7 }}
      />

      {/* Examples */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.625rem' }}>
          <Lightbulb size={11} color="var(--text-4)" />
          <span style={{ fontSize: '0.68rem', color: 'var(--text-4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Quick examples</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {EXAMPLES.map(ex => (
            <button key={ex} onClick={() => onChange(`Design a ${ex}`)} className="chip"
              style={{ fontSize: '0.7rem' }}>
              {ex}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={loading || !value.trim()}
        className="btn-primary"
        style={{ width: '100%', padding: '0.8rem', fontSize: '0.9rem' }}
      >
        {loading ? (
          <>
            <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.25)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
            Generating architecture…
          </>
        ) : (
          <>
            <Send size={15} />
            Generate Architecture
            <span style={{ fontSize: '0.65rem', opacity: 0.5, fontWeight: 400, marginLeft: 4 }}>Ctrl+Enter</span>
          </>
        )}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </button>
    </div>
  );
}
