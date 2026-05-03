import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/apiClient';
import {
  History as HistoryIcon, Star, Trash2, Eye, Network, Container, MessageSquare,
  Code2, Bug, GraduationCap, Filter, X, AlertCircle, ChevronDown, ChevronUp, Search
} from 'lucide-react';

const TYPE_CONFIG = {
  'system-design': { label: 'System Design', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.2)', icon: Network },
  'devops': { label: 'DevOps', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.2)', icon: Container },
  'chat': { label: 'Chat', color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)', icon: MessageSquare },
  'code-analyzer': { label: 'Code Analysis', color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.2)', icon: Code2 },
  'error-debug': { label: 'Error Debug', color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)', icon: Bug },
  'interview': { label: 'Interview', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)', icon: GraduationCap },
  'whatif': { label: 'What-if', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.2)', icon: Network },
  'comparison': { label: 'Comparison', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.2)', icon: Network },
};

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'system-design', label: 'System Design' },
  { key: 'devops', label: 'DevOps' },
  { key: 'error-debug', label: 'Error Debug' },
  { key: 'interview', label: 'Interview' },
  { key: 'whatif', label: 'What-if' },
  { key: 'comparison', label: 'Comparison' },
  { key: 'code-analyzer', label: 'Code' },
];

const HistoryItem = ({ item, onDelete, onStar, onView }) => {
  const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG['chat'];
  const Icon = cfg.icon;
  const date = new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ background: '#0f1120', border: '1px solid #1e2136', borderRadius: 12, padding: '0.875rem 1.125rem', display: 'flex', alignItems: 'center', gap: '0.875rem', transition: 'border-color 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-4)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#1e2136'}>
      <div style={{ width: 34, height: 34, background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={15} color={cfg.color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 380 }}>
            {item.title || item.prompt?.slice(0, 80) || 'Untitled'}
          </p>
          <span style={{ fontSize: '0.625rem', background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color, padding: '1px 6px', borderRadius: 99, fontWeight: 700, flexShrink: 0 }}>{cfg.label}</span>
        </div>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginTop: '0.2rem' }}>{date}</p>
      </div>
      <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
        <button onClick={() => onStar(item._id, item.starred)} title={item.starred ? 'Unstar' : 'Star'}
          style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${item.starred ? 'rgba(251,191,36,0.3)' : '#1e2136'}`, background: item.starred ? 'rgba(251,191,36,0.1)' : '#151728', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s' }}>
          <Star size={13} color={item.starred ? '#fbbf24' : 'var(--text-3)'} fill={item.starred ? '#fbbf24' : 'none'} />
        </button>
        <button onClick={() => onView(item._id)} title="View full result"
          style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid #1e2136', background: '#151728', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Eye size={13} color="#64748b" />
        </button>
        <button onClick={() => onDelete(item._id)} title="Delete"
          style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Trash2 size={13} color="#f87171" />
        </button>
      </div>
    </div>
  );
};

const ResultModal = ({ item, onClose }) => {
  if (!item) return null;
  const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG['chat'];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: '100%', maxWidth: 760, maxHeight: '85vh', background: '#0f1120', border: '1px solid #2a2d46', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #1e2136', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.625rem', background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color, padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>{cfg.label}</span>
          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.title || item.prompt?.slice(0, 80)}
          </p>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid #2a2d46', background: '#151728', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={13} color="#64748b" />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Prompt</p>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '1.25rem', lineHeight: 1.6 }}>{item.prompt}</p>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Result</p>
          <pre style={{ fontSize: '0.7rem', color: '#94a3b8', background: '#080a12', border: '1px solid #1e2136', borderRadius: 10, padding: '1rem', overflow: 'auto', fontFamily: 'monospace', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {JSON.stringify(item.result, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default function History() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [starredOnly, setStarredOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [viewItem, setViewItem] = useState(null);
  const [loadingItem, setLoadingItem] = useState(null);
  const [error, setError] = useState('');
  const [clearing, setClearing] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ type: activeTab, limit: 50 });
      if (starredOnly) params.append('starred', 'true');
      const { data } = await apiClient.get(`/history?${params}`);
      setItems(data.data.items);
      setTotal(data.data.total);
    } catch { setError('Failed to load history'); }
    finally { setLoading(false); }
  }, [activeTab, starredOnly]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/history/${id}`);
      setItems(prev => prev.filter(i => i._id !== id));
      setTotal(p => p - 1);
    } catch { setError('Failed to delete item'); }
  };

  const handleStar = async (id, currentStarred) => {
    setItems(prev => prev.map(i => i._id === id ? { ...i, starred: !currentStarred } : i));
    try {
      await apiClient.patch(`/history/${id}/star`);
    } catch {
      setItems(prev => prev.map(i => i._id === id ? { ...i, starred: currentStarred } : i));
    }
  };

  const handleView = async (id) => {
    setLoadingItem(id);
    try {
      const { data } = await apiClient.get(`/history/${id}`);
      setViewItem(data.data);
    } catch { setError('Failed to load item'); }
    finally { setLoadingItem(null); }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Delete all non-starred history items for this filter? Starred items are kept.')) return;
    setClearing(true);
    try {
      await apiClient.delete(`/history/clear?type=${activeTab}`);
      fetchHistory();
    } catch { setError('Failed to clear history'); }
    finally { setClearing(false); }
  };

  const filtered = search.trim()
    ? items.filter(i => (i.title || i.prompt || '').toLowerCase().includes(search.toLowerCase()))
    : items;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ width: 40, height: 40, background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <HistoryIcon size={18} color="#94a3b8" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'white' }}>History</h1>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>{total} saved results across all features</p>
        </div>
        <button onClick={handleClearAll} disabled={clearing || items.length === 0}
          style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4375rem 0.875rem', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#f87171', fontSize: '0.75rem', cursor: 'pointer', opacity: clearing || items.length === 0 ? 0.5 : 1 }}>
          <Trash2 size={12} /> Clear
        </button>
      </div>

      {/* Filters row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search history..."
            className="input" style={{ paddingLeft: '2rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }} />
        </div>
        {/* Starred toggle */}
        <button onClick={() => setStarredOnly(p => !p)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4375rem 0.875rem', background: starredOnly ? 'rgba(251,191,36,0.1)' : '#151728', border: `1px solid ${starredOnly ? 'rgba(251,191,36,0.3)' : '#1e2136'}`, borderRadius: 8, color: starredOnly ? '#fbbf24' : '#64748b', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>
          <Star size={12} fill={starredOnly ? '#fbbf24' : 'none'} /> Starred
        </button>
      </div>

      {/* Type tabs */}
      <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{ padding: '0.375rem 0.875rem', borderRadius: 8, border: `1px solid ${activeTab === tab.key ? 'rgba(124,58,237,0.4)' : '#1e2136'}`, background: activeTab === tab.key ? 'rgba(124,58,237,0.12)' : '#0a0b14', color: activeTab === tab.key ? '#a78bfa' : 'var(--text-3)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 10, padding: '0.75rem 1rem', color: '#f87171', fontSize: '0.8rem', marginBottom: '1rem' }}>
          <AlertCircle size={13} /> {error}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-3)', fontSize: '0.875rem' }}>Loading history...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <HistoryIcon size={40} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.15, color: '#94a3b8' }} />
          <p style={{ fontSize: '0.875rem', color: 'var(--text-4)' }}>
            {search ? 'No results match your search.' : 'No history yet. Start using the AI tools to build your history.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {filtered.map(item => (
            <HistoryItem key={item._id} item={item}
              onDelete={handleDelete} onStar={handleStar}
              onView={loadingItem === item._id ? () => {} : handleView} />
          ))}
        </div>
      )}

      <ResultModal item={viewItem} onClose={() => setViewItem(null)} />
    </div>
  );
}
