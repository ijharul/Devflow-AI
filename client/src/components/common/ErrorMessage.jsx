import { AlertCircle, X } from 'lucide-react';
import { useState } from 'react';

export default function ErrorMessage({ message }) {
  const [dismissed, setDismissed] = useState(false);
  if (!message || dismissed) return null;
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
      background: 'rgba(239,68,68,0.08)',
      border: '1px solid rgba(239,68,68,0.25)',
      borderRadius: 12, padding: '0.875rem 1rem',
      color: '#fca5a5', fontSize: '0.8125rem',
      marginTop: '1rem', lineHeight: 1.5,
      animation: 'fadeUp 0.2s ease both',
    }}>
      <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1, color: '#f87171' }} />
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={() => setDismissed(true)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', opacity: 0.6, padding: 2, flexShrink: 0, display: 'flex' }}
      >
        <X size={13} />
      </button>
    </div>
  );
}
