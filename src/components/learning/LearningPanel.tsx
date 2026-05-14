import { useState, useEffect } from 'react';
import { useUIStore } from '../../store/uiStore';
import { useTopologyStore } from '../../store/topologyStore';
import { useSimulationStore } from '../../store/simulationStore';
import { simEngine } from '../../simulation/engine';
import { LEARNING_MODULES, type LearningModule } from '../../data/learningModules';
import { SAMPLE_TOPOLOGIES } from '../../data/sampleTopologies';

// ─── Objective checker ────────────────────────────────────────────────────────
function checkObjective(checker: string): boolean {
  const topo = useTopologyStore.getState();
  const sim = useSimulationStore.getState();
  const ui = useUIStore.getState();
  const onus = Object.values(topo.onus);
  switch (checker) {
    case 'has-olt': return Object.keys(topo.olts).length > 0;
    case 'has-onu': return onus.length > 0;
    case 'has-8-onus': return onus.length >= 8;
    case 'olt-selected': return !!(topo.selectedNodeId && topo.olts[topo.selectedNodeId]);
    case 'onu-selected': return !!(topo.selectedNodeId && topo.onus[topo.selectedNodeId]);
    case 'standard-gpon': return Object.values(topo.olts).some(o => o.standard === 'GPON');
    case 'standard-xgspon': return Object.values(topo.olts).some(o => o.standard === 'XGS-PON');
    case 'sim-running': return sim.running;
    case 'events-logged': return sim.events.length > 0;
    case 'registration-event': return sim.events.some(e => e.type === 'ONU_REGISTERED');
    case 'any-registered': return onus.some(o => o.state === 'O5');
    case 'all-registered': return onus.length > 0 && onus.every(o => o.state === 'O5');
    case 'marginal-budget': return onus.some(o => (o.signalMargin_dB ?? 99) < 3);
    case 'bandwidth-open': return ui.activeBottomPanel === 'bandwidth';
    case 'power-budget-open': return ui.activeBottomPanel === 'powerbudget';
    case 'terminal-ont-info': return ui.terminalHistory.some(h => h.includes('display ont info'));
    case 'terminal-service-port': return ui.terminalHistory.some(h => h.includes('service-port') || h.includes('display service'));
    case 'terminal-dba': return ui.terminalHistory.some(h => h.includes('dba-profile'));
    // New checkers for extended modules
    case 'has-odf': return Object.keys(topo.odfs).length > 0;
    case 'has-end-device': return Object.keys(topo.endDevices).length > 0;
    case 'has-wifi-ap': return Object.values(topo.endDevices).some(d => d.deviceType === 'wifi-ap');
    case 'has-router': return Object.values(topo.endDevices).some(d => d.deviceType === 'router');
    case 'has-onu': return Object.keys(topo.onus).length > 0;
    default: return false;
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TheoryView({ module }: { module: LearningModule }) {
  return (
    <div style={{ padding: '8px 10px', overflowY: 'auto', flex: 1 }}>
      {module.theory.map((section, i) => (
        <div key={i} style={{ marginBottom: 16 }}>
          <div style={{ color: '#60a5fa', fontWeight: 700, fontSize: 11, marginBottom: 4, borderBottom: '1px solid #1e293b', paddingBottom: 3 }}>
            {section.heading}
          </div>
          <p style={{ color: '#94a3b8', fontSize: 10, lineHeight: 1.6, margin: '0 0 6px 0' }}>
            {section.body}
          </p>
          {section.bullets && (
            <ul style={{ margin: '4px 0', paddingLeft: 14 }}>
              {section.bullets.map((b, j) => (
                <li key={j} style={{ color: '#64748b', fontSize: 10, lineHeight: 1.5, marginBottom: 2 }}>{b}</li>
              ))}
            </ul>
          )}
          {section.table && (
            <div style={{ overflowX: 'auto', marginTop: 6 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9 }}>
                <thead>
                  <tr>
                    {section.table.headers.map((h, j) => (
                      <th key={j} style={{ color: '#475569', textAlign: 'left', padding: '3px 5px', borderBottom: '1px solid #1e293b', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.table.rows.map((row, j) => (
                    <tr key={j} style={{ background: j % 2 === 0 ? 'transparent' : '#0f172a' }}>
                      {row.map((cell, k) => (
                        <td key={k} style={{ color: '#94a3b8', padding: '3px 5px', borderBottom: '1px solid #1e293b11', fontFamily: k === 0 ? 'monospace' : 'inherit', fontSize: 9 }}>{cell}</td>
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
  );
}

function LabView({ module, objectives }: { module: LearningModule; objectives: Record<string, boolean> }) {
  const { loadProject, reset } = useTopologyStore.getState();
  const completedCount = Object.values(objectives).filter(Boolean).length;
  const total = module.lab.objectives.length;
  const pct = total === 0 ? 0 : Math.round((completedCount / total) * 100);

  const handleLoadTopology = () => {
    if (!module.lab.topologyId) return;
    const topo = SAMPLE_TOPOLOGIES.find(t => t.id === module.lab.topologyId);
    if (!topo) return;
    simEngine.reset();
    reset();
    loadProject(topo.data);
  };

  return (
    <div style={{ padding: '8px 10px', overflowY: 'auto', flex: 1 }}>
      {/* Progress bar */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
          <span style={{ color: '#475569', fontSize: 9 }}>Lab Progress</span>
          <span style={{ color: pct === 100 ? '#22c55e' : '#60a5fa', fontSize: 9, fontWeight: 600 }}>{completedCount}/{total} objectives</span>
        </div>
        <div style={{ height: 4, background: '#1e293b', borderRadius: 2 }}>
          <div style={{ height: '100%', background: pct === 100 ? '#22c55e' : '#3b82f6', borderRadius: 2, width: `${pct}%`, transition: 'width 0.4s' }} />
        </div>
      </div>

      {/* Instructions */}
      <p style={{ color: '#64748b', fontSize: 10, lineHeight: 1.6, margin: '0 0 10px 0', borderLeft: '2px solid #1e3a5f', paddingLeft: 8 }}>
        {module.lab.intro}
      </p>

      {/* Load topology button */}
      {module.lab.topologyId && (
        <button
          onClick={handleLoadTopology}
          style={{
            width: '100%', padding: '6px 0', marginBottom: 10,
            background: '#0f2744', border: '1px solid #1d4ed855',
            borderRadius: 4, color: '#60a5fa', fontSize: 10,
            cursor: 'pointer', fontFamily: 'monospace',
          }}
        >
          ↓ Load Lab Topology
        </button>
      )}

      {/* Objectives */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {module.lab.objectives.map(obj => {
          const done = objectives[obj.id] ?? false;
          return (
            <div key={obj.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: 8,
              padding: '5px 8px', borderRadius: 4,
              background: done ? '#052e16' : '#0f172a',
              border: `1px solid ${done ? '#166534' : '#1e293b'}`,
            }}>
              <span style={{
                fontSize: 14, lineHeight: 1, flexShrink: 0, marginTop: 1,
                color: done ? '#22c55e' : '#334155',
              }}>
                {done ? '✓' : '○'}
              </span>
              <span style={{ color: done ? '#86efac' : '#64748b', fontSize: 10, lineHeight: 1.5 }}>
                {obj.text}
              </span>
            </div>
          );
        })}
      </div>

      {pct === 100 && (
        <div style={{ marginTop: 12, padding: '12px 10px', background: '#052e16', border: '2px solid #166534', borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: 28, marginBottom: 4 }}>🏅</div>
          <div style={{ color: '#22c55e', fontSize: 13, fontWeight: 700 }}>Lab Complete!</div>
          <div style={{ color: '#4ade80', fontSize: 10, marginTop: 4 }}>
            All {total} objectives completed — excellent work!
          </div>
          <div style={{ marginTop: 8, padding: '4px 8px', background: '#14532d', borderRadius: 4, display: 'inline-block', color: '#86efac', fontSize: 9 }}>
            Grade: <strong>A</strong> · Proceed to the Quiz →
          </div>
        </div>
      )}
    </div>
  );
}

function QuizView({ module }: { module: LearningModule }) {
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  // Reset quiz when module changes
  useEffect(() => { setQIdx(0); setSelected(null); setSubmitted(false); setScore(0); setDone(false); }, [module.id]);

  if (done) {
    const pct = Math.round((score / module.quiz.length) * 100);
    const letterGrade = pct === 100 ? 'A+' : pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 67 ? 'C' : pct >= 50 ? 'D' : 'F';
    const gradeLabel  = pct === 100 ? 'Perfect Score!' : pct >= 80 ? 'Excellent' : pct >= 67 ? 'Good' : pct >= 50 ? 'Needs Review' : 'Keep Studying';
    const gradeColor  = pct >= 80 ? '#22c55e' : pct >= 67 ? '#f59e0b' : '#ef4444';
    const passed = pct >= 67;
    return (
      <div style={{ padding: '12px 10px', textAlign: 'center', overflowY: 'auto', flex: 1 }}>
        <div style={{ fontSize: 36, marginBottom: 6 }}>
          {pct === 100 ? '🏆' : pct >= 80 ? '🥇' : pct >= 67 ? '📚' : '🔄'}
        </div>

        {/* Grade badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: gradeColor + '22', border: `2px solid ${gradeColor}44`,
          borderRadius: 10, padding: '6px 16px', marginBottom: 8,
        }}>
          <span style={{ color: gradeColor, fontSize: 24, fontWeight: 900, fontFamily: 'monospace' }}>{letterGrade}</span>
          <span style={{ color: gradeColor, fontSize: 11 }}>{gradeLabel}</span>
        </div>

        <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 4, marginBottom: 12 }}>
          {score}/{module.quiz.length} correct · {pct}%
        </div>

        {/* Certificate (pass only) */}
        {passed && (
          <div style={{
            margin: '0 0 12px 0', padding: '10px 12px',
            background: '#0a0f1e', border: '1px solid #1e3a5f',
            borderRadius: 8, textAlign: 'left',
          }}>
            <div style={{ color: '#60a5fa', fontSize: 10, fontWeight: 700, marginBottom: 4 }}>
              📜 Certificate of Completion
            </div>
            <div style={{ color: '#64748b', fontSize: 9, lineHeight: 1.6 }}>
              This confirms that you have successfully completed<br />
              <strong style={{ color: '#94a3b8' }}>{module.icon} {module.title}</strong><br />
              with a score of <strong style={{ color: gradeColor }}>{pct}% (Grade {letterGrade})</strong>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => { setQIdx(0); setSelected(null); setSubmitted(false); setScore(0); setDone(false); }}
            style={{ flex: 1, padding: '7px 0', background: '#1e293b', border: '1px solid #334155', borderRadius: 5, color: '#94a3b8', cursor: 'pointer', fontSize: 11 }}
          >
            🔄 Retry
          </button>
          {!passed && (
            <button
              onClick={() => { setQIdx(0); setSelected(null); setSubmitted(false); setScore(0); setDone(false); }}
              style={{ flex: 1, padding: '7px 0', background: '#1d4ed8', border: 'none', borderRadius: 5, color: '#fff', cursor: 'pointer', fontSize: 11 }}
            >
              📖 Review Theory
            </button>
          )}
        </div>
      </div>
    );
  }

  const q = module.quiz[qIdx];
  const isCorrect = submitted && selected === q.answer;

  const handleSubmit = () => {
    if (selected === null) return;
    setSubmitted(true);
    if (selected === q.answer) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (qIdx + 1 >= module.quiz.length) {
      setDone(true);
    } else {
      setQIdx(q => q + 1);
      setSelected(null);
      setSubmitted(false);
    }
  };

  return (
    <div style={{ padding: '8px 10px', overflowY: 'auto', flex: 1 }}>
      {/* Progress */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ color: '#475569', fontSize: 9 }}>Question {qIdx + 1} of {module.quiz.length}</span>
        <span style={{ color: '#60a5fa', fontSize: 9 }}>{score} correct so far</span>
      </div>
      <div style={{ height: 3, background: '#1e293b', borderRadius: 2, marginBottom: 10 }}>
        <div style={{ height: '100%', background: '#3b82f6', borderRadius: 2, width: `${((qIdx + (submitted ? 1 : 0)) / module.quiz.length) * 100}%`, transition: 'width 0.3s' }} />
      </div>

      {/* Question */}
      <div style={{ color: '#e2e8f0', fontSize: 11, lineHeight: 1.6, marginBottom: 12, fontWeight: 500 }}>
        {q.question}
      </div>

      {/* Choices */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
        {q.choices.map((choice, i) => {
          let bg = '#0f172a';
          let border = '#1e293b';
          let color = '#64748b';
          if (selected === i && !submitted) { bg = '#0f2744'; border = '#3b82f6'; color = '#93c5fd'; }
          if (submitted && i === q.answer) { bg = '#052e16'; border = '#166534'; color = '#4ade80'; }
          if (submitted && selected === i && i !== q.answer) { bg = '#450a0a'; border = '#7f1d1d'; color = '#fca5a5'; }
          return (
            <button
              key={i}
              onClick={() => !submitted && setSelected(i)}
              style={{
                textAlign: 'left', padding: '7px 9px', background: bg,
                border: `1px solid ${border}`, borderRadius: 4,
                color, fontSize: 10, cursor: submitted ? 'default' : 'pointer',
                lineHeight: 1.4,
              }}
            >
              <span style={{ fontWeight: 600, marginRight: 6 }}>{String.fromCharCode(65 + i)}.</span>
              {choice}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {submitted && (
        <div style={{
          padding: '6px 8px', borderRadius: 4, marginBottom: 10,
          background: isCorrect ? '#052e16' : '#1c0a00',
          border: `1px solid ${isCorrect ? '#166534' : '#78350f'}`,
        }}>
          <div style={{ color: isCorrect ? '#22c55e' : '#f59e0b', fontSize: 10, fontWeight: 600, marginBottom: 2 }}>
            {isCorrect ? '✓ Correct!' : `✗ The correct answer is: ${String.fromCharCode(65 + q.answer)}`}
          </div>
          <div style={{ color: '#94a3b8', fontSize: 9, lineHeight: 1.5 }}>{q.explanation}</div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6 }}>
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={selected === null}
            style={{
              flex: 1, padding: '6px 0', borderRadius: 4,
              background: selected !== null ? '#1d4ed8' : '#1e293b',
              border: 'none', color: selected !== null ? '#fff' : '#334155',
              cursor: selected !== null ? 'pointer' : 'not-allowed', fontSize: 11,
            }}
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            style={{ flex: 1, padding: '6px 0', borderRadius: 4, background: '#166534', border: 'none', color: '#4ade80', cursor: 'pointer', fontSize: 11 }}
          >
            {qIdx + 1 >= module.quiz.length ? 'See Results →' : 'Next Question →'}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export function LearningPanel() {
  const activeModuleId = useUIStore(s => s.activeModuleId);
  const moduleSubTab = useUIStore(s => s.moduleSubTab);
  const setActiveModule = useUIStore(s => s.setActiveModule);
  const setModuleSubTab = useUIStore(s => s.setModuleSubTab);

  const module = LEARNING_MODULES.find(m => m.id === activeModuleId) ?? LEARNING_MODULES[0];

  // Live objective checking
  const [objectives, setObjectives] = useState<Record<string, boolean>>({});
  useEffect(() => {
    const check = () => {
      const states: Record<string, boolean> = {};
      module.lab.objectives.forEach(obj => { states[obj.id] = checkObjective(obj.checker); });
      setObjectives(prev => {
        const changed = Object.keys(states).some(k => states[k] !== prev[k]);
        return changed ? states : prev;
      });
    };
    check();
    const id = setInterval(check, 600);
    return () => clearInterval(id);
  }, [module]);

  const tabStyle = (active: boolean) => ({
    flex: 1, padding: '4px 0', background: 'none',
    border: 'none', borderBottom: `2px solid ${active ? '#3b82f6' : 'transparent'}`,
    color: active ? '#3b82f6' : '#475569', cursor: 'pointer', fontSize: 10, fontFamily: 'monospace',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0a0f1e' }}>
      {/* Header */}
      <div style={{ padding: '8px 10px 4px', borderBottom: '1px solid #1e293b', flexShrink: 0 }}>
        <div style={{ color: '#60a5fa', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>📚 Learning Center</div>
        <div style={{ color: '#334155', fontSize: 9 }}>PON/GPON · XG-PON · XGS-PON · FTTH</div>
      </div>

      {/* Module selector */}
      <div style={{ padding: '6px 8px', borderBottom: '1px solid #1e293b', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 4, justifyContent: 'space-between' }}>
          {LEARNING_MODULES.map((m) => {
            const active = m.id === activeModuleId;
            return (
              <button
                key={m.id}
                onClick={() => setActiveModule(m.id)}
                title={m.title}
                style={{
                  flex: 1, padding: '5px 2px', borderRadius: 4,
                  background: active ? '#1e3a5f' : '#0f172a',
                  border: `1px solid ${active ? '#3b82f6' : '#1e293b'}`,
                  cursor: 'pointer', fontSize: 14, lineHeight: 1,
                }}
              >
                {m.icon}
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: 4 }}>
          <div style={{ color: '#94a3b8', fontSize: 10, fontWeight: 600 }}>{module.icon} {module.title}</div>
          <div style={{ color: '#334155', fontSize: 9 }}>{module.subtitle} · ~{module.estimatedMinutes} min</div>
        </div>
      </div>

      {/* Sub-tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1e293b', flexShrink: 0 }}>
        {(['theory', 'lab', 'quiz'] as const).map(tab => (
          <button key={tab} onClick={() => setModuleSubTab(tab)} style={tabStyle(moduleSubTab === tab)}>
            {tab === 'theory' ? '📖 Theory' : tab === 'lab' ? '🔬 Lab' : '❓ Quiz'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {moduleSubTab === 'theory' && <TheoryView module={module} />}
        {moduleSubTab === 'lab' && <LabView module={module} objectives={objectives} />}
        {moduleSubTab === 'quiz' && <QuizView module={module} />}
      </div>
    </div>
  );
}
