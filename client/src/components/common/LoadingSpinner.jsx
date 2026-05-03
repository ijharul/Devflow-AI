import { Cpu } from 'lucide-react';

export default function LoadingSpinner({ message = 'Generating with AI...' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '3.5rem 2rem', gap: '1.25rem',
      animation: 'fadeIn 0.3s ease both',
    }}>
      <div style={{ position: 'relative', width: 56, height: 56 }}>
        <div style={{
          position: 'absolute', inset: 0,
          border: '2px solid rgba(124,58,237,0.12)',
          borderTopColor: '#7c3aed',
          borderRadius: '50%',
          animation: 'spin 0.9s linear infinite',
        }} />
        <div style={{
          position: 'absolute', inset: 8,
          border: '2px solid rgba(59,130,246,0.1)',
          borderTopColor: 'rgba(59,130,246,0.5)',
          borderRadius: '50%',
          animation: 'spinR 1.4s linear infinite',
        }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Cpu size={18} color="#a78bfa" />
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', fontWeight: 600 }}>{message}</p>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-4)', marginTop: '0.25rem' }}>LLaMA 3.3 70B · This may take a few seconds</p>
      </div>

      <div style={{ display: 'flex', gap: '0.375rem' }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%', background: '#7c3aed',
            animation: 'dotBounce 1.2s ease infinite',
            animationDelay: `${i * 0.18}s`,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes spinR  { to { transform: rotate(-360deg); } }
        @keyframes dotBounce { 0%,80%,100%{transform:translateY(0);opacity:0.4} 40%{transform:translateY(-7px);opacity:1} }
      `}</style>
    </div>
  );
}
