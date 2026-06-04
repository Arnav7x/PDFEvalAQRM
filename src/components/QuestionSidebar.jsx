import React from 'react';
import { useWorkspace } from '../context/WorkspaceContext';

export default function QuestionSidebar() {
  const { selectedPaper, selectedTemplate, highlightedRegionId, setHighlightedRegionId, setSelectedArea } = useWorkspace();
  const questions = [...(selectedTemplate?.regions || selectedPaper?.regions || [])].sort((a, b) => {
    if (a.page !== b.page) return a.page - b.page;
    return a.y - b.y;
  });

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-secondary">Questions</h2>
        <span className="rounded-sm bg-[#f8fafc] px-2 py-1 text-[10px] text-secondary">{questions.length}</span>
      </div>
      <div className="flex-1 space-y-2 overflow-auto">
        {questions.length === 0 && (
          <p className="rounded-sm border border-dashed border-glass p-4 text-center text-xs text-secondary">
            Draw a region on the PDF to create your first question.
          </p>
        )}
        {questions.map((q, idx) => {
          const active = highlightedRegionId === q.id;
          return (
            <button
              key={q.id}
              onClick={() => {
                setHighlightedRegionId(q.id);
                setSelectedArea(null);
              }}
              className={`w-full rounded-sm border px-3 py-2 text-left text-xs transition ${
                active ? 'border-[#101828] bg-[#101828] text-white' : 'border-glass bg-white text-primary hover:border-[#b9c2d0]'
              }`}
            >
              <span className="block font-semibold">{q.questionNumber || `Q${idx + 1}`}</span>
              <span className={active ? 'text-gray-300' : 'text-secondary'}>Page {q.page}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
