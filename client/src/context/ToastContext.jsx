import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastCtx = createContext(null);

let uid = 0;

const ICONS = {
  success: CheckCircle,
  error:   XCircle,
  warning: AlertTriangle,
  info:    Info,
};
const COLORS = {
  success: '#10b981',
  error:   '#ef4444',
  warning: '#f59e0b',
  info:    '#60a5fa',
};

function ToastItem({ toast, onRemove }) {
  const Icon = ICONS[toast.type] || Info;
  const color = COLORS[toast.type] || COLORS.info;

  return (
    <div className={`toast toast-${toast.type}`} role="alert">
      <Icon size={16} color={color} style={{ flexShrink: 0, marginTop: 1 }} />
      <div className="toast-body">
        {toast.title && <p className="toast-title">{toast.title}</p>}
        {toast.message && <p className={toast.title ? 'toast-msg' : 'toast-title'}>{toast.message}</p>}
      </div>
      <button onClick={() => onRemove(toast.id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 0 0.25rem', color: '#4a5270', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        <X size={13} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const add = useCallback((type, message, { title, duration = 4000 } = {}) => {
    const id = ++uid;
    setToasts(prev => [...prev.slice(-4), { id, type, message, title }]);
    if (duration > 0) setTimeout(() => remove(id), duration);
  }, [remove]);

  const toast = {
    success: (msg, opts) => add('success', msg, opts),
    error:   (msg, opts) => add('error', msg, opts),
    warning: (msg, opts) => add('warning', msg, opts),
    info:    (msg, opts) => add('info', msg, opts),
  };

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="toast-container">
        {toasts.map(t => <ToastItem key={t.id} toast={t} onRemove={remove} />)}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
};
