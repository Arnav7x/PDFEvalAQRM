import React, { useEffect, useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';

const normalizeGrades = (grades = {}) => Object.entries(grades).reduce((acc, [qNum, grade]) => {
  acc[qNum] = {
    score: Number(grade?.score) || 0,
    feedback: grade?.feedback || ''
  };
  return acc;
}, {});

export default function MarksPanel() {
  const { selectedPaper, highlightedRegionId, setHighlightedRegionId, saveGrades } = useWorkspace();
  const [localGrades, setLocalGrades] = useState({});
  const [lastSavedAt, setLastSavedAt] = useState(null);

  useEffect(() => {
    setLocalGrades(selectedPaper?.grades || {});
    setLastSavedAt(null);
  }, [selectedPaper?.id, selectedPaper?.grades]);

  useEffect(() => {
    if (!selectedPaper) return undefined;

    const normalizedLocalGrades = normalizeGrades(localGrades);
    const normalizedSavedGrades = normalizeGrades(selectedPaper.grades || {});

    if (JSON.stringify(normalizedLocalGrades) === JSON.stringify(normalizedSavedGrades)) {
      return undefined;
    }

    const timeoutId = window.setTimeout(async () => {
      await saveGrades(normalizedLocalGrades);
      setLastSavedAt(new Date());
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [localGrades, saveGrades, selectedPaper]);

  const handleGradeChange = (qNum, key, value) => {
    setLocalGrades((current) => ({
      ...current,
      [qNum]: { ...(current[qNum] || {}), [key]: value },
    }));
  };

  const questions = [...(selectedPaper?.regions || [])].sort((a, b) => {
    if (a.page !== b.page) return a.page - b.page;
    return a.y - b.y;
  });
  const totalMarks = Object.values(localGrades).reduce((acc, curr) => acc + (Number(curr.score) || 0), 0);

  return (
    <div className="flex h-full flex-col p-4">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-secondary">Marks Panel</h2>
      <div className="mb-4 rounded-sm border border-glass bg-[#f8fafc] p-3">
        <p className="text-[11px] text-secondary">Calculated Total</p>
        <p className="text-xl font-bold">{totalMarks} / 50</p>
      </div>

      <div className="flex-1 space-y-3 overflow-auto pr-1">
        {questions.length === 0 && (
          <p className="rounded-sm border border-dashed border-glass p-4 text-center text-xs text-secondary">No questions mapped.</p>
        )}
        {questions.map((q, idx) => {
          const qNum = q.questionNumber || `Q${idx + 1}`;
          const active = highlightedRegionId === q.id;
          return (
            <div key={q.id} className={`rounded-sm border p-3 ${active ? 'border-[#101828]' : 'border-glass'} bg-white`}>
              <button onClick={() => setHighlightedRegionId(q.id)} className="mb-2 flex w-full justify-between text-left text-xs font-semibold">
                <span>{qNum}</span>
                <span className="text-secondary">Page {q.page}</span>
              </button>
              <input
                type="number"
                min="0"
                value={localGrades[qNum]?.score || ''}
                onChange={(e) => handleGradeChange(qNum, 'score', e.target.value)}
                className="input mb-2 w-full text-xs"
                placeholder="Marks"
              />
              <textarea
                value={localGrades[qNum]?.feedback || ''}
                onChange={(e) => handleGradeChange(qNum, 'feedback', e.target.value)}
                className="input w-full resize-none text-xs"
                rows={2}
                placeholder="Feedback"
              />
            </div>
          );
        })}
      </div>

      <div className="mt-4 border-t border-glass pt-4">
        <p className="mb-2 text-center text-[11px] text-secondary">
          {lastSavedAt
            ? `Changes auto-saved at ${lastSavedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
            : 'Changes save automatically'}
        </p>
        <button className="btn btn-secondary mb-2 w-full justify-center text-xs" onClick={() => setHighlightedRegionId(null)}>
          Clear Selection
        </button>
      </div>
    </div>
  );
}
