import { useState, useEffect, useRef } from 'react';
import {
  CERT_QUESTIONS,
  CERT_STUDY_DOMAINS,
  type CertDomain,
  type CertQuestion,
  type CertStudyDomain,
} from '../../data/certificationData';

// ─── Colour helpers ───────────────────────────────────────────────────────────

function domainColor(domain: CertDomain): string {
  return CERT_STUDY_DOMAINS.find((d) => d.domain === domain)?.color ?? '#64748b';
}

function domainIcon(domain: CertDomain): string {
  return CERT_STUDY_DOMAINS.find((d) => d.domain === domain)?.icon ?? '📚';
}

// ─── Types ────────────────────────────────────────────────────────────────────

type AppView = 'home' | 'study' | 'exam';

interface DomainScore {
  domain: CertDomain;
  correct: number;
  total: number;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = {
  root: {
    background: '#0a0f1e',
    color: '#e2e8f0',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    minHeight: '100%',
    padding: '16px',
    boxSizing: 'border-box' as const,
    fontSize: 13,
  },
  card: {
    background: '#111827',
    border: '1px solid #1e293b',
    borderRadius: 10,
    padding: '16px',
    marginBottom: 12,
  },
  h1: {
    fontSize: 22,
    fontWeight: 700,
    margin: '0 0 4px 0',
    color: '#f1f5f9',
  },
  h2: {
    fontSize: 16,
    fontWeight: 600,
    margin: '0 0 10px 0',
    color: '#f1f5f9',
  },
  h3: {
    fontSize: 13,
    fontWeight: 600,
    margin: '0 0 8px 0',
    color: '#cbd5e1',
  },
  sub: {
    color: '#94a3b8',
    fontSize: 12,
    margin: 0,
  },
  btn: (bg: string, fg = '#fff') => ({
    background: bg,
    color: fg,
    border: 'none',
    borderRadius: 7,
    padding: '10px 18px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 13,
    transition: 'opacity .15s',
  }),
  btnOutline: (color: string) => ({
    background: 'transparent',
    color,
    border: `1px solid ${color}`,
    borderRadius: 7,
    padding: '8px 14px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: 12,
  }),
  badge: (color: string) => ({
    display: 'inline-block',
    background: color + '22',
    color,
    border: `1px solid ${color}55`,
    borderRadius: 5,
    padding: '2px 8px',
    fontSize: 11,
    fontWeight: 600,
  }),
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #1e293b',
    margin: '12px 0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: 11,
  },
  th: {
    background: '#1e293b',
    color: '#94a3b8',
    padding: '6px 8px',
    textAlign: 'left' as const,
    fontWeight: 600,
    borderBottom: '1px solid #334155',
  },
  td: {
    padding: '5px 8px',
    borderBottom: '1px solid #1e293b',
    color: '#cbd5e1',
    verticalAlign: 'top' as const,
  },
};

// ─── Grade helper ─────────────────────────────────────────────────────────────

function letterGrade(pct: number): string {
  if (pct >= 100) return 'A+';
  if (pct >= 90) return 'A';
  if (pct >= 80) return 'B';
  if (pct >= 70) return 'C';
  if (pct >= 60) return 'D';
  return 'F';
}

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ─── HOME VIEW ────────────────────────────────────────────────────────────────

function HomeView({
  onStudy,
  onExam,
  domainScores,
}: {
  onStudy: () => void;
  onExam: () => void;
  domainScores: DomainScore[];
}) {
  return (
    <div>
      {/* Header */}
      <div style={S.card}>
        <div style={S.row}>
          <span style={{ fontSize: 32 }}>🎓</span>
          <div>
            <h1 style={S.h1}>CFOS(H) Exam Prep</h1>
            <p style={S.sub}>FOA Certified Fiber Optic Specialist – FTTH</p>
          </div>
        </div>
      </div>

      {/* Exam info */}
      <div style={{ ...S.card, background: '#0f172a' }}>
        <h2 style={S.h2}>Exam Overview</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 8,
            textAlign: 'center',
          }}
        >
          {[
            { label: 'Questions', val: '100', icon: '📝' },
            { label: 'Pass Score', val: '70%', icon: '✅' },
            { label: 'Duration', val: '~2 hrs', icon: '⏱️' },
            { label: 'Format', val: 'MCQ', icon: '🔘' },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: '#1e293b',
                borderRadius: 8,
                padding: '10px 4px',
              }}
            >
              <div style={{ fontSize: 20 }}>{item.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#f1f5f9' }}>
                {item.val}
              </div>
              <div style={{ fontSize: 10, color: '#64748b' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Domain progress */}
      <div style={S.card}>
        <h2 style={S.h2}>Domain Progress</h2>
        {domainScores.map((ds) => {
          const pct = ds.total === 0 ? 0 : Math.round((ds.correct / ds.total) * 100);
          const color = domainColor(ds.domain);
          return (
            <div key={ds.domain} style={{ marginBottom: 10 }}>
              <div
                style={{
                  ...S.row,
                  justifyContent: 'space-between',
                  marginBottom: 3,
                }}
              >
                <span style={{ fontSize: 12, color: '#e2e8f0' }}>
                  {domainIcon(ds.domain)} {ds.domain}
                </span>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>
                  {ds.correct}/{ds.total}
                  {ds.total > 0 && ` (${pct}%)`}
                </span>
              </div>
              <div
                style={{
                  height: 5,
                  background: '#1e293b',
                  borderRadius: 3,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: color,
                    borderRadius: 3,
                    transition: 'width .4s',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Action buttons */}
      <div style={S.grid2}>
        <button onClick={onStudy} style={{ ...S.btn('#1d4ed8'), padding: '14px 0', fontSize: 14 }}>
          📖 Study Guide
        </button>
        <button onClick={onExam} style={{ ...S.btn('#7c3aed'), padding: '14px 0', fontSize: 14 }}>
          🎯 Practice Exam
        </button>
      </div>

      <p style={{ ...S.sub, textAlign: 'center', marginTop: 14 }}>
        Based on FOA CFOS(H) exam blueprint. For exam preparation only.
      </p>
    </div>
  );
}

// ─── STUDY VIEW ───────────────────────────────────────────────────────────────

function StudyView({
  onBack,
  selectedDomain,
  onSelectDomain,
}: {
  onBack: () => void;
  selectedDomain: CertDomain | null;
  onSelectDomain: (d: CertDomain | null) => void;
}) {
  const activeDomain: CertStudyDomain | undefined = CERT_STUDY_DOMAINS.find(
    (d) => d.domain === selectedDomain,
  );

  return (
    <div>
      {/* Top bar */}
      <div style={{ ...S.row, marginBottom: 14, justifyContent: 'space-between' }}>
        <button
          onClick={onBack}
          style={S.btnOutline('#94a3b8')}
        >
          ← Back
        </button>
        <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 15 }}>
          📖 Study Guide
        </span>
        <span style={{ width: 70 }} />
      </div>

      {/* Domain selector */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap' as const,
          gap: 7,
          marginBottom: 14,
        }}
      >
        {CERT_STUDY_DOMAINS.map((d) => {
          const active = selectedDomain === d.domain;
          return (
            <button
              key={d.domain}
              onClick={() => onSelectDomain(active ? null : d.domain)}
              style={{
                background: active ? d.color : '#1e293b',
                color: active ? '#fff' : '#94a3b8',
                border: `1px solid ${active ? d.color : '#334155'}`,
                borderRadius: 7,
                padding: '7px 12px',
                cursor: 'pointer',
                fontWeight: active ? 600 : 400,
                fontSize: 11,
                transition: 'all .15s',
              }}
            >
              {d.icon} {d.domain.split(' ').slice(0, 2).join(' ')}
            </button>
          );
        })}
      </div>

      {/* Domain content */}
      {!activeDomain && (
        <div style={{ ...S.card, textAlign: 'center', padding: '32px 16px' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>📚</div>
          <p style={{ color: '#64748b', margin: 0 }}>
            Select a domain above to begin studying.
          </p>
        </div>
      )}

      {activeDomain && (
        <div>
          {/* Domain header */}
          <div
            style={{
              ...S.card,
              borderLeft: `4px solid ${activeDomain.color}`,
              background: activeDomain.color + '11',
            }}
          >
            <div style={{ ...S.row, marginBottom: 6 }}>
              <span style={{ fontSize: 28 }}>{activeDomain.icon}</span>
              <h2 style={{ ...S.h2, margin: 0, color: activeDomain.color }}>
                {activeDomain.domain}
              </h2>
            </div>
            <p style={{ ...S.sub, lineHeight: 1.6 }}>{activeDomain.overview}</p>
          </div>

          {/* Topics */}
          {activeDomain.topics.map((topic, ti) => (
            <div key={ti} style={S.card}>
              <h3
                style={{
                  ...S.h3,
                  color: activeDomain.color,
                  fontSize: 14,
                  marginBottom: 8,
                }}
              >
                {topic.title}
              </h3>
              <p style={{ color: '#cbd5e1', lineHeight: 1.65, margin: '0 0 10px 0', fontSize: 12 }}>
                {topic.body}
              </p>

              {/* Bullets */}
              {topic.bullets && (
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {topic.bullets.map((b, bi) => (
                    <li
                      key={bi}
                      style={{
                        color: '#94a3b8',
                        fontSize: 11,
                        lineHeight: 1.7,
                        marginBottom: 2,
                      }}
                    >
                      {b}
                    </li>
                  ))}
                </ul>
              )}

              {/* Table */}
              {topic.table && (
                <div style={{ overflowX: 'auto' as const, marginTop: 6 }}>
                  <table style={S.table}>
                    <thead>
                      <tr>
                        {topic.table.headers.map((h, hi) => (
                          <th key={hi} style={S.th}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {topic.table.rows.map((row, ri) => (
                        <tr key={ri} style={{ background: ri % 2 === 0 ? 'transparent' : '#0f172a' }}>
                          {row.map((cell, ci) => (
                            <td key={ci} style={S.td}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── EXAM VIEW ────────────────────────────────────────────────────────────────

function ExamView({
  onBack,
  onUpdateScores,
}: {
  onBack: () => void;
  onUpdateScores: (scores: DomainScore[]) => void;
}) {
  const [examState, setExamState] = useState<'idle' | 'running' | 'results'>('idle');
  const [questions, setQuestions] = useState<CertQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [submitted, setSubmitted] = useState<boolean[]>([]);
  const [flagged, setFlagged] = useState<boolean[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(7200);
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start exam
  function startExam() {
    const shuffled = [...CERT_QUESTIONS].sort(() => Math.random() - 0.5);
    const n = shuffled.length;
    setQuestions(shuffled);
    setCurrentQ(0);
    setAnswers(new Array(n).fill(null));
    setSubmitted(new Array(n).fill(false));
    setFlagged(new Array(n).fill(false));
    setSelectedChoice(null);
    setTimeLeft(7200);
    setReviewMode(false);
    setReviewIndex(0);
    setExamState('running');
  }

  // Timer
  useEffect(() => {
    if (examState !== 'running') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setExamState('results');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examState]);

  // When all questions answered → auto-finish
  useEffect(() => {
    if (examState === 'running' && submitted.length > 0 && submitted.every(Boolean)) {
      setExamState('results');
    }
  }, [submitted, examState]);

  // Build domain scores from submitted answers
  function buildDomainScores(): DomainScore[] {
    return CERT_STUDY_DOMAINS.map((sd) => {
      const qs = questions.filter((q) => q.domain === sd.domain);
      const total = qs.filter((_, i) => submitted[questions.indexOf(qs[i])]).length;
      const correct = qs.filter((q) => {
        const idx = questions.indexOf(q);
        return submitted[idx] && answers[idx] === q.answer;
      }).length;
      return { domain: sd.domain, correct, total };
    });
  }

  // Submit current answer
  function submitAnswer() {
    if (selectedChoice === null) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[currentQ] = selectedChoice;
      return next;
    });
    setSubmitted((prev) => {
      const next = [...prev];
      next[currentQ] = true;
      return next;
    });
  }

  function goNext() {
    const nextUnsubmitted = questions.findIndex((_, i) => i > currentQ && !submitted[i]);
    if (nextUnsubmitted !== -1) {
      setCurrentQ(nextUnsubmitted);
    } else {
      // Try from beginning
      const fromStart = questions.findIndex((_, i) => !submitted[i]);
      if (fromStart !== -1) setCurrentQ(fromStart);
    }
    setSelectedChoice(null);
  }

  // ── IDLE ──
  if (examState === 'idle') {
    return (
      <div>
        <div style={{ ...S.row, marginBottom: 14, justifyContent: 'space-between' }}>
          <button onClick={onBack} style={S.btnOutline('#94a3b8')}>
            ← Back
          </button>
          <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 15 }}>
            🎯 Practice Exam
          </span>
          <span style={{ width: 70 }} />
        </div>

        <div style={{ ...S.card, textAlign: 'center', padding: '32px 16px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
          <h2 style={{ ...S.h2, fontSize: 18 }}>CFOS(H) Practice Exam</h2>
          <p style={{ color: '#94a3b8', marginBottom: 20, lineHeight: 1.7, fontSize: 12 }}>
            100 questions · 120 minutes · 70% required to pass
            <br />
            Questions will be shuffled randomly each attempt.
          </p>
          <button onClick={startExam} style={{ ...S.btn('#7c3aed'), padding: '12px 32px', fontSize: 15 }}>
            🚀 Start Exam
          </button>
        </div>
      </div>
    );
  }

  // ── RESULTS ──
  if (examState === 'results') {
    const scores = buildDomainScores();
    const totalAnswered = submitted.filter(Boolean).length;
    const totalCorrect = questions.filter((q, i) => submitted[i] && answers[i] === q.answer).length;
    const pct = totalAnswered === 0 ? 0 : Math.round((totalCorrect / totalAnswered) * 100);
    const passed = pct >= 70;
    const grade = letterGrade(pct);
    const wrongQs = questions.filter((_, i) => submitted[i] && answers[i] !== questions[i].answer);

    // Update parent domain scores
    // (called once when results become visible)

    if (reviewMode) {
      const rq = wrongQs[reviewIndex];
      if (!rq) {
        return (
          <div style={S.card}>
            <p>No more wrong answers to review.</p>
            <button onClick={() => setReviewMode(false)} style={S.btn('#1d4ed8')}>
              Back to Results
            </button>
          </div>
        );
      }
      const userAns = answers[questions.indexOf(rq)];
      return (
        <div>
          <div style={{ ...S.row, marginBottom: 14, justifyContent: 'space-between' }}>
            <button onClick={() => setReviewMode(false)} style={S.btnOutline('#94a3b8')}>
              ← Results
            </button>
            <span style={{ color: '#94a3b8', fontSize: 12 }}>
              {reviewIndex + 1} / {wrongQs.length} wrong
            </span>
          </div>
          <QuestionCard
            question={rq}
            selectedChoice={userAns ?? null}
            isSubmitted={true}
            isFlagged={false}
            onSelect={() => {}}
            onSubmit={() => {}}
            onToggleFlag={() => {}}
            readOnly
          />
          <div style={{ ...S.row, marginTop: 12 }}>
            {reviewIndex > 0 && (
              <button onClick={() => setReviewIndex((p) => p - 1)} style={S.btn('#334155')}>
                ← Prev
              </button>
            )}
            {reviewIndex < wrongQs.length - 1 && (
              <button onClick={() => setReviewIndex((p) => p + 1)} style={S.btn('#7c3aed')}>
                Next →
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div>
        <div style={{ ...S.row, marginBottom: 14, justifyContent: 'space-between' }}>
          <button
            onClick={() => {
              onUpdateScores(scores);
              onBack();
            }}
            style={S.btnOutline('#94a3b8')}
          >
            ← Home
          </button>
          <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 15 }}>
            Results
          </span>
          <span style={{ width: 70 }} />
        </div>

        {/* Score card */}
        <div
          style={{
            ...S.card,
            textAlign: 'center',
            borderColor: passed ? '#16a34a' : '#dc2626',
            background: (passed ? '#16a34a' : '#dc2626') + '11',
          }}
        >
          <div style={{ fontSize: 48, fontWeight: 800, color: '#f1f5f9' }}>
            {totalCorrect}/{totalAnswered}
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: passed ? '#4ade80' : '#f87171' }}>
            {pct}%
          </div>
          <div style={{ marginTop: 8 }}>
            <span
              style={{
                ...S.badge(passed ? '#16a34a' : '#dc2626'),
                fontSize: 14,
                padding: '4px 16px',
              }}
            >
              {passed ? '✅ PASS' : '❌ FAIL'}
            </span>
            <span
              style={{
                ...S.badge('#64748b'),
                fontSize: 14,
                padding: '4px 12px',
                marginLeft: 8,
              }}
            >
              Grade: {grade}
            </span>
          </div>
          <p style={{ ...S.sub, marginTop: 8 }}>Pass threshold: 70%</p>
        </div>

        {/* Certificate */}
        {passed && (
          <div
            style={{
              ...S.card,
              border: '1px solid #d97706',
              background: '#d9770611',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 28 }}>📜</div>
            <h3 style={{ ...S.h3, color: '#fbbf24', fontSize: 14 }}>
              Certificate of Achievement
            </h3>
            <p style={{ color: '#fde68a', fontSize: 13, margin: '4px 0' }}>
              [Your Name]
            </p>
            <p style={{ ...S.sub, fontSize: 11 }}>
              has successfully passed the CFOS(H) Practice Exam with a score of {pct}%
            </p>
            <p style={{ ...S.sub, fontSize: 10, marginTop: 4 }}>
              Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        )}

        {/* Domain breakdown */}
        <div style={S.card}>
          <h3 style={{ ...S.h3, marginBottom: 10 }}>Domain Breakdown</h3>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Domain</th>
                <th style={{ ...S.th, textAlign: 'center' as const }}>Score</th>
                <th style={{ ...S.th, textAlign: 'center' as const }}>%</th>
                <th style={{ ...S.th, textAlign: 'center' as const }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((ds, i) => {
                const dpct = ds.total === 0 ? 0 : Math.round((ds.correct / ds.total) * 100);
                const dpass = dpct >= 70;
                return (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : '#0f172a' }}>
                    <td style={S.td}>
                      <span style={{ color: domainColor(ds.domain) }}>
                        {domainIcon(ds.domain)}
                      </span>{' '}
                      {ds.domain}
                    </td>
                    <td style={{ ...S.td, textAlign: 'center' as const }}>
                      {ds.correct}/{ds.total}
                    </td>
                    <td style={{ ...S.td, textAlign: 'center' as const }}>{ds.total > 0 ? `${dpct}%` : '—'}</td>
                    <td style={{ ...S.td, textAlign: 'center' as const }}>
                      {ds.total > 0 ? (
                        <span style={S.badge(dpass ? '#16a34a' : '#dc2626')}>
                          {dpass ? 'Pass' : 'Fail'}
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
          {wrongQs.length > 0 && (
            <button
              onClick={() => {
                setReviewMode(true);
                setReviewIndex(0);
              }}
              style={S.btn('#b45309')}
            >
              🔍 Review Wrong ({wrongQs.length})
            </button>
          )}
          <button onClick={startExam} style={S.btn('#7c3aed')}>
            🔄 Retake Exam
          </button>
          <button
            onClick={() => {
              onUpdateScores(scores);
              onBack();
            }}
            style={S.btn('#334155')}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  // ── RUNNING ──
  const q = questions[currentQ];
  if (!q) return null;

  const isSubmitted = submitted[currentQ];
  const userAnswer = answers[currentQ];
  const answeredCount = submitted.filter(Boolean).length;
  const correctCount = questions.filter((qq, i) => submitted[i] && answers[i] === qq.answer).length;

  // Progress dots (compact: show 100 dots in groups)
  function dotColor(i: number): string {
    if (!submitted[i]) return flagged[i] ? '#eab308' : '#334155';
    return answers[i] === questions[i].answer ? '#16a34a' : '#dc2626';
  }

  return (
    <div>
      {/* Top bar */}
      <div
        style={{
          ...S.card,
          padding: '10px 14px',
          marginBottom: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap' as const,
          gap: 6,
        }}
      >
        <span style={{ color: '#94a3b8', fontSize: 12 }}>
          Q <strong style={{ color: '#f1f5f9' }}>{currentQ + 1}</strong> / {questions.length}
        </span>
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: 14,
            fontWeight: 700,
            color: timeLeft < 300 ? '#f87171' : '#4ade80',
          }}
        >
          ⏱ {formatTime(timeLeft)}
        </span>
        <span style={{ fontSize: 12, color: '#94a3b8' }}>
          ✅ {correctCount}/{answeredCount}
        </span>
      </div>

      {/* Question */}
      <QuestionCard
        question={q}
        selectedChoice={isSubmitted ? (userAnswer ?? null) : selectedChoice}
        isSubmitted={isSubmitted}
        isFlagged={flagged[currentQ]}
        onSelect={(idx) => {
          if (!isSubmitted) setSelectedChoice(idx);
        }}
        onSubmit={submitAnswer}
        onToggleFlag={() =>
          setFlagged((prev) => {
            const next = [...prev];
            next[currentQ] = !next[currentQ];
            return next;
          })
        }
        readOnly={false}
      />

      {/* Next button */}
      {isSubmitted && (
        <div style={{ marginTop: 10 }}>
          <button onClick={goNext} style={{ ...S.btn('#7c3aed'), width: '100%', padding: '12px 0' }}>
            Next → ({questions.filter((_, i) => !submitted[i]).length} remaining)
          </button>
        </div>
      )}

      {/* Progress dots */}
      <div
        style={{
          marginTop: 14,
          display: 'flex',
          flexWrap: 'wrap' as const,
          gap: 3,
        }}
      >
        {questions.map((_, i) => (
          <div
            key={i}
            title={`Q${i + 1}`}
            onClick={() => {
              setCurrentQ(i);
              setSelectedChoice(null);
            }}
            style={{
              width: 8,
              height: 8,
              borderRadius: 2,
              background: dotColor(i),
              cursor: 'pointer',
              border: i === currentQ ? '1px solid #e2e8f0' : '1px solid transparent',
              boxSizing: 'border-box' as const,
            }}
          />
        ))}
      </div>
      <div style={{ ...S.row, gap: 12, marginTop: 6 }}>
        {[
          { color: '#334155', label: 'Unanswered' },
          { color: '#16a34a', label: 'Correct' },
          { color: '#dc2626', label: 'Wrong' },
          { color: '#eab308', label: 'Flagged' },
        ].map((item) => (
          <span key={item.label} style={{ ...S.row, gap: 4, fontSize: 10, color: '#64748b' }}>
            <span
              style={{ width: 8, height: 8, background: item.color, borderRadius: 2, display: 'inline-block' }}
            />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── QUESTION CARD ────────────────────────────────────────────────────────────

function QuestionCard({
  question,
  selectedChoice,
  isSubmitted,
  isFlagged,
  onSelect,
  onSubmit,
  onToggleFlag,
  readOnly,
}: {
  question: CertQuestion;
  selectedChoice: number | null;
  isSubmitted: boolean;
  isFlagged: boolean;
  onSelect: (i: number) => void;
  onSubmit: () => void;
  onToggleFlag: () => void;
  readOnly: boolean;
}) {
  const color = domainColor(question.domain);

  function choiceBg(i: number): string {
    if (!isSubmitted) {
      return selectedChoice === i ? '#1e3a5f' : '#1e293b';
    }
    if (i === question.answer) return '#14532d';
    if (i === selectedChoice && i !== question.answer) return '#450a0a';
    return '#1e293b';
  }

  function choiceBorder(i: number): string {
    if (!isSubmitted) {
      return selectedChoice === i ? '#3b82f6' : '#334155';
    }
    if (i === question.answer) return '#16a34a';
    if (i === selectedChoice && i !== question.answer) return '#dc2626';
    return '#334155';
  }

  const diffColor: Record<string, string> = { easy: '#16a34a', medium: '#d97706', hard: '#dc2626' };

  return (
    <div style={S.card}>
      {/* Domain + difficulty badges */}
      <div style={{ ...S.row, marginBottom: 10, flexWrap: 'wrap' as const, gap: 6 }}>
        <span style={S.badge(color)}>
          {domainIcon(question.domain)} {question.domain}
        </span>
        <span style={S.badge(diffColor[question.difficulty])}>
          {question.difficulty}
        </span>
        <span style={{ ...S.sub, fontSize: 10, marginLeft: 'auto' }}>
          {question.id}
        </span>
      </div>

      {/* Question text */}
      <p
        style={{
          color: '#f1f5f9',
          fontSize: 13,
          lineHeight: 1.65,
          marginBottom: 14,
          fontWeight: 500,
        }}
      >
        {question.question}
      </p>

      {/* Choices */}
      {question.choices.map((choice, i) => (
        <button
          key={i}
          onClick={() => !isSubmitted && onSelect(i)}
          style={{
            display: 'block',
            width: '100%',
            padding: '8px 10px',
            border: `1px solid ${choiceBorder(i)}`,
            borderRadius: 5,
            cursor: isSubmitted || readOnly ? 'default' : 'pointer',
            textAlign: 'left',
            fontSize: 12,
            lineHeight: 1.5,
            marginBottom: 6,
            background: choiceBg(i),
            color: '#e2e8f0',
            transition: 'all .15s',
          }}
        >
          <span style={{ color: '#94a3b8', marginRight: 8 }}>
            {['A', 'B', 'C', 'D'][i]}.
          </span>
          {choice}
          {isSubmitted && i === question.answer && (
            <span style={{ float: 'right', color: '#4ade80' }}>✓</span>
          )}
          {isSubmitted && i === selectedChoice && i !== question.answer && (
            <span style={{ float: 'right', color: '#f87171' }}>✗</span>
          )}
        </button>
      ))}

      {/* Explanation */}
      {isSubmitted && (
        <div
          style={{
            marginTop: 10,
            padding: '10px 12px',
            background: '#0f172a',
            borderRadius: 6,
            borderLeft: `3px solid ${selectedChoice === question.answer ? '#16a34a' : '#dc2626'}`,
          }}
        >
          <p style={{ margin: 0, fontSize: 11, lineHeight: 1.7, color: '#cbd5e1' }}>
            <strong style={{ color: '#f1f5f9' }}>Explanation: </strong>
            {question.explanation}
          </p>
        </div>
      )}

      {/* Controls */}
      {!readOnly && (
        <div style={{ ...S.row, marginTop: 12, justifyContent: 'space-between' }}>
          <label
            style={{
              ...S.row,
              gap: 6,
              cursor: 'pointer',
              fontSize: 11,
              color: isFlagged ? '#eab308' : '#64748b',
            }}
          >
            <input
              type="checkbox"
              checked={isFlagged}
              onChange={onToggleFlag}
              style={{ cursor: 'pointer' }}
            />
            🚩 Flag for Review
          </label>

          {!isSubmitted && (
            <button
              onClick={onSubmit}
              disabled={selectedChoice === null}
              style={{
                ...S.btn(selectedChoice === null ? '#334155' : '#7c3aed'),
                opacity: selectedChoice === null ? 0.5 : 1,
                padding: '8px 18px',
              }}
            >
              Submit Answer
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export function CertificationPanel() {
  const [view, setView] = useState<AppView>('home');
  const [studyDomain, setStudyDomain] = useState<CertDomain | null>(null);
  const [domainScores, setDomainScores] = useState<DomainScore[]>(
    CERT_STUDY_DOMAINS.map((d) => ({ domain: d.domain, correct: 0, total: 0 })),
  );

  function handleUpdateScores(scores: DomainScore[]) {
    setDomainScores(scores);
  }

  return (
    <div style={S.root}>
      {view === 'home' && (
        <HomeView
          onStudy={() => setView('study')}
          onExam={() => setView('exam')}
          domainScores={domainScores}
        />
      )}

      {view === 'study' && (
        <StudyView
          onBack={() => setView('home')}
          selectedDomain={studyDomain}
          onSelectDomain={setStudyDomain}
        />
      )}

      {view === 'exam' && (
        <ExamView
          onBack={() => setView('home')}
          onUpdateScores={handleUpdateScores}
        />
      )}
    </div>
  );
}
