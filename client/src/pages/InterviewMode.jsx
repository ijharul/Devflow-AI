import { useState, useRef, useEffect } from 'react';
import apiClient from '../api/apiClient';
import {
  GraduationCap, Send, RotateCcw, Trophy, Target, ChevronRight,
  CheckCircle, XCircle, AlertCircle, Lightbulb, Star
} from 'lucide-react';

const TOPICS = [
  { key: 'System Design', label: 'System Design', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.2)' },
  { key: 'JavaScript', label: 'JavaScript', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)' },
  { key: 'React', label: 'React', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.2)' },
  { key: 'Node.js', label: 'Node.js', color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)' },
  { key: 'DevOps & Docker', label: 'DevOps', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.2)' },
  { key: 'Data Structures & Algorithms', label: 'DSA', color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.2)' },
  { key: 'Databases & SQL', label: 'Databases', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.2)' },
  { key: 'TypeScript', label: 'TypeScript', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.2)' },
  { key: 'Python', label: 'Python', color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)' },
  { key: 'Security & Auth', label: 'Security', color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)' },
];

const LEVELS = [
  { key: 'Junior', label: 'Junior', desc: '0-2 years', color: '#34d399' },
  { key: 'Mid-level', label: 'Mid-level', desc: '2-5 years', color: '#fbbf24' },
  { key: 'Senior', label: 'Senior', desc: '5+ years', color: '#f87171' },
];

const GRADE_CONFIG = {
  'Excellent': { color: '#34d399', icon: Trophy },
  'Good': { color: '#a78bfa', icon: Star },
  'Satisfactory': { color: '#fbbf24', icon: CheckCircle },
  'Needs Improvement': { color: '#fb923c', icon: AlertCircle },
  'Poor': { color: '#f87171', icon: XCircle },
};

const ScoreBar = ({ score }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
    <div style={{ flex: 1, height: 8, background: '#1e2136', borderRadius: 99, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${score * 10}%`, borderRadius: 99, background: score >= 8 ? '#34d399' : score >= 6 ? '#a78bfa' : score >= 4 ? '#fbbf24' : '#f87171', transition: 'width 0.5s ease' }} />
    </div>
    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: score >= 8 ? '#34d399' : score >= 6 ? '#a78bfa' : score >= 4 ? '#fbbf24' : '#f87171', flexShrink: 0, minWidth: '2.5rem', textAlign: 'right' }}>{score}/10</span>
  </div>
);

export default function InterviewMode() {
  const [phase, setPhase] = useState('setup'); // setup | interview | complete
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('');
  const [questionNum, setQuestionNum] = useState(0);
  const [totalQ] = useState(5);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [previousQuestions, setPreviousQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const answerRef = useRef(null);

  const avgScore = evaluations.length ? Math.round(evaluations.reduce((s, e) => s + e.score, 0) / evaluations.length * 10) / 10 : 0;

  const startInterview = async () => {
    if (!topic || !level) return;
    setLoading(true); setError('');
    try {
      const { data } = await apiClient.post('/interview/question', { topic, level, previousQuestions: [] });
      setCurrentQuestion(data.data);
      setQuestionNum(1);
      setPhase('interview');
      setEvaluation(null);
      setEvaluations([]);
      setPreviousQuestions([data.data.question]);
    } catch { setError('Failed to load question. Try again.'); }
    finally { setLoading(false); }
  };

  const submitAnswer = async () => {
    if (!answer.trim() || loading) return;
    setLoading(true); setError('');
    try {
      const { data } = await apiClient.post('/interview/evaluate', {
        topic, level,
        question: currentQuestion.question,
        answer,
      });
      setEvaluation(data.data);
      setEvaluations(prev => [...prev, { ...data.data, question: currentQuestion.question }]);
    } catch { setError('Evaluation failed. Try again.'); }
    finally { setLoading(false); }
  };

  const nextQuestion = async () => {
    if (questionNum >= totalQ) { setPhase('complete'); return; }
    setLoading(true); setError(''); setAnswer(''); setEvaluation(null); setShowHints(false); setShowModelAnswer(false);
    try {
      const newPrev = [...previousQuestions];
      if (evaluation?.followUpQuestion) {
        setCurrentQuestion({ question: evaluation.followUpQuestion, questionType: 'follow-up', difficulty: level, hints: [], keyPoints: [] });
        newPrev.push(evaluation.followUpQuestion);
      } else {
        const { data } = await apiClient.post('/interview/question', { topic, level, previousQuestions: newPrev });
        setCurrentQuestion(data.data);
        newPrev.push(data.data.question);
      }
      setPreviousQuestions(newPrev);
      setQuestionNum(n => n + 1);
      setTimeout(() => answerRef.current?.focus(), 100);
    } catch { setError('Failed to load next question.'); }
    finally { setLoading(false); }
  };

  const restart = () => {
    setPhase('setup'); setTopic(''); setLevel(''); setQuestionNum(0);
    setCurrentQuestion(null); setAnswer(''); setEvaluation(null);
    setEvaluations([]); setPreviousQuestions([]); setError('');
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ width: 40, height: 40, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <GraduationCap size={18} color="#fbbf24" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'white' }}>Interview Mode</h1>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>AI-powered technical interview practice with real-time evaluation</p>
        </div>
        {phase !== 'setup' && (
          <button onClick={restart} className="btn-secondary" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.875rem' }}>
            <RotateCcw size={12} /> Restart
          </button>
        )}
      </div>

      {/* ─── SETUP PHASE ─── */}
      {phase === 'setup' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Topic */}
          <div className="section">
            <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.875rem' }}>Select Topic</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem' }}>
              {TOPICS.map(t => (
                <button key={t.key} onClick={() => setTopic(t.key)}
                  style={{ padding: '0.75rem', borderRadius: 10, border: `1px solid ${topic === t.key ? t.border : '#1e2136'}`, background: topic === t.key ? t.bg : '#0a0b14', color: topic === t.key ? t.color : 'var(--text-3)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center' }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Level */}
          <div className="section">
            <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.875rem' }}>Experience Level</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.625rem' }}>
              {LEVELS.map(l => (
                <button key={l.key} onClick={() => setLevel(l.key)}
                  style={{ padding: '1rem', borderRadius: 10, border: `1px solid ${level === l.key ? 'rgba(124,58,237,0.4)' : '#1e2136'}`, background: level === l.key ? 'rgba(124,58,237,0.1)' : '#0a0b14', cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700, color: level === l.key ? '#a78bfa' : '#94a3b8', marginBottom: '0.25rem' }}>{l.label}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>{l.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 10, padding: '0.75rem 1rem', color: '#f87171', fontSize: '0.8rem' }}>
              <AlertCircle size={13} /> {error}
            </div>
          )}

          <button onClick={startInterview} disabled={loading || !topic || !level} className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.875rem' }}>
            {loading
              ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />Loading question...</>
              : <><GraduationCap size={15} />Start {totalQ}-Question Interview<ChevronRight size={15} /></>}
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </button>
        </div>
      )}

      {/* ─── INTERVIEW PHASE ─── */}
      {phase === 'interview' && currentQuestion && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ flex: 1, height: 4, background: '#1e2136', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(questionNum / totalQ) * 100}%`, background: 'linear-gradient(90deg, #7c3aed, #2563eb)', borderRadius: 99, transition: 'width 0.4s ease' }} />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 600, flexShrink: 0 }}>Q{questionNum}/{totalQ}</span>
            <span style={{ fontSize: '0.65rem', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', color: '#a78bfa', padding: '2px 8px', borderRadius: 99, fontWeight: 700, flexShrink: 0 }}>{topic}</span>
            <span style={{ fontSize: '0.65rem', background: '#151728', border: '1px solid #1e2136', color: '#64748b', padding: '2px 8px', borderRadius: 99, fontWeight: 600, flexShrink: 0 }}>{level}</span>
          </div>

          {/* Question card */}
          <div style={{ background: '#0f1120', border: '1px solid #2a2d46', borderRadius: 14, padding: '1.5rem' }}>
            {currentQuestion.questionType && (
              <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.75rem' }}>{currentQuestion.questionType}</span>
            )}
            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'white', lineHeight: 1.6, marginBottom: currentQuestion.hints?.length ? '1.25rem' : 0 }}>{currentQuestion.question}</p>

            {currentQuestion.hints?.length > 0 && (
              <div>
                <button onClick={() => setShowHints(o => !o)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 8, color: '#fbbf24', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>
                  <Lightbulb size={12} /> {showHints ? 'Hide hints' : 'Show hints'}
                </button>
                {showHints && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {currentQuestion.hints.map((h, i) => (
                      <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fbbf24', flexShrink: 0, marginTop: 1 }}>💡</span>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{h}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Answer area (only if not yet evaluated) */}
          {!evaluation && (
            <>
              <textarea ref={answerRef} value={answer} onChange={e => setAnswer(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submitAnswer(); }}
                placeholder="Type your answer here... (Ctrl+Enter to submit)"
                rows={8}
                style={{ width: '100%', background: '#0f1120', border: '1px solid #1e2136', borderRadius: 12, padding: '1rem', color: '#e2e8f0', fontSize: '0.875rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none', lineHeight: 1.65, transition: 'border-color 0.15s' }}
                onFocus={e => e.target.style.borderColor = '#4c1d95'}
                onBlur={e => e.target.style.borderColor = '#1e2136'} />

              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 10, padding: '0.625rem 0.875rem', color: '#f87171', fontSize: '0.8rem' }}>
                  <AlertCircle size={13} /> {error}
                </div>
              )}

              <button onClick={submitAnswer} disabled={loading || !answer.trim()} className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem' }}>
                {loading
                  ? <><div style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />Evaluating...</>
                  : <><Send size={14} />Submit Answer</>}
              </button>
            </>
          )}

          {/* Evaluation result */}
          {evaluation && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {/* Score banner */}
              <div style={{ background: '#0f1120', border: '1px solid #2a2d46', borderRadius: 14, padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
                  {(() => { const cfg = GRADE_CONFIG[evaluation.grade] || GRADE_CONFIG['Good']; const Icon = cfg.icon; return <><Icon size={20} color={cfg.color} /><span style={{ fontSize: '1rem', fontWeight: 700, color: cfg.color }}>{evaluation.grade}</span></>; })()}
                </div>
                <ScoreBar score={evaluation.score} />
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.75rem', lineHeight: 1.6 }}>{evaluation.feedback}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                {/* Strengths */}
                {evaluation.strengths?.length > 0 && (
                  <div style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.15)', borderRadius: 12, padding: '1rem' }}>
                    <p style={{ fontSize: '0.625rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Strengths</p>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {evaluation.strengths.map((s, i) => (
                        <li key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                          <CheckCircle size={13} color="#34d399" style={{ flexShrink: 0, marginTop: 1 }} />
                          <span style={{ fontSize: '0.775rem', color: '#94a3b8', lineHeight: 1.5 }}>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Improvements */}
                {evaluation.improvements?.length > 0 && (
                  <div style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)', borderRadius: 12, padding: '1rem' }}>
                    <p style={{ fontSize: '0.625rem', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Improve On</p>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {evaluation.improvements.map((s, i) => (
                        <li key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                          <AlertCircle size={13} color="#fbbf24" style={{ flexShrink: 0, marginTop: 1 }} />
                          <span style={{ fontSize: '0.775rem', color: '#94a3b8', lineHeight: 1.5 }}>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Model Answer */}
              {evaluation.modelAnswer && (
                <div style={{ background: '#0f1120', border: '1px solid #1e2136', borderRadius: 12, overflow: 'hidden' }}>
                  <button onClick={() => setShowModelAnswer(o => !o)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.875rem 1.125rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                    <Target size={15} color="#a78bfa" />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#e2e8f0', flex: 1 }}>Model Answer</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>{showModelAnswer ? 'Hide' : 'Show'}</span>
                  </button>
                  {showModelAnswer && (
                    <div style={{ padding: '0 1.125rem 1rem', borderTop: '1px solid #1a1d30' }}>
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.7, paddingTop: '0.875rem', whiteSpace: 'pre-wrap' }}>{evaluation.modelAnswer}</p>
                    </div>
                  )}
                </div>
              )}

              <button onClick={nextQuestion} disabled={loading} className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem' }}>
                {loading
                  ? <><div style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />Loading...</>
                  : questionNum >= totalQ
                    ? <><Trophy size={14} />View Final Results</>
                    : <><ChevronRight size={14} />Next Question ({questionNum + 1}/{totalQ})</>}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── COMPLETE PHASE ─── */}
      {phase === 'complete' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Final score */}
          <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(37,99,235,0.1))', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 16, padding: '2rem', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Trophy size={28} color="#fbbf24" />
            </div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Interview Complete</p>
            <p style={{ fontSize: '2.5rem', fontWeight: 800, color: avgScore >= 8 ? '#34d399' : avgScore >= 6 ? '#a78bfa' : avgScore >= 4 ? '#fbbf24' : '#f87171', lineHeight: 1 }}>{avgScore}<span style={{ fontSize: '1rem', color: 'var(--text-3)', fontWeight: 600 }}>/10</span></p>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>Average across {evaluations.length} questions • {topic} • {level}</p>
          </div>

          {/* Per-question breakdown */}
          <div className="section">
            <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.875rem' }}>Question Breakdown</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {evaluations.map((ev, i) => (
                <div key={i} style={{ background: '#0a0b14', border: '1px solid #1e2136', borderRadius: 10, padding: '0.875rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#a78bfa', flexShrink: 0, marginTop: 1 }}>Q{i + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.8rem', color: '#e2e8f0', lineHeight: 1.5, marginBottom: '0.5rem' }}>{ev.question}</p>
                      <ScoreBar score={ev.score} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={startInterview} disabled={loading} className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem' }}>
              <RotateCcw size={14} /> Retry Same Topic
            </button>
            <button onClick={restart} className="btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem' }}>
              <GraduationCap size={14} /> New Interview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
