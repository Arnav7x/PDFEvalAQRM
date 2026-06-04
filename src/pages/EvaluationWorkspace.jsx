import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { PdfViewer } from '../components/PdfViewer';
import QuestionSidebar from '../components/QuestionSidebar';
import MarksPanel from '../components/MarksPanel';

export default function EvaluationWorkspace() {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const { isLoading, selectedPaper, selectPaperForRoute } = useWorkspace();

  useEffect(() => {
    if (!isLoading) {
      selectPaperForRoute(paperId, 'grading');
    }
  }, [isLoading, paperId]);

  if (isLoading) {
    return <div className="app-shell flex items-center justify-center text-sm text-secondary">Loading evaluation...</div>;
  }

  if (!selectedPaper || String(selectedPaper.id) !== String(paperId)) {
    return (
      <div className="app-shell flex items-center justify-center">
        <div className="rounded-sm border border-glass bg-panel p-6 text-center">
          <h1 className="mb-2 text-lg font-semibold">Evaluation not found</h1>
          <p className="mb-4 text-sm text-secondary">The selected paper could not be loaded.</p>
          <button onClick={() => navigate('/')} className="btn btn-primary text-xs">Return Dashboard</button>
        </div>
      </div>
    );
  }

  const regionCount = (selectedPaper.regions || []).length;
  const gradedCount = Object.keys(selectedPaper.grades || {}).length;

  return (
    <div className="app-shell">
      <header className="topbar flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="btn btn-secondary px-3 py-1 text-xs">
            <ArrowLeft size={14} /> Back
          </button>
          <div>
            <h1 className="text-sm font-semibold">Evaluation Workspace</h1>
            <p className="text-[11px] text-secondary">{selectedPaper.studentName} | {selectedPaper.fileName}</p>
          </div>
        </div>
        <div className="rounded-sm bg-[#f8fafc] px-3 py-1 text-[11px] text-secondary">
          Progress: {gradedCount}/{regionCount} marked
        </div>
      </header>

      <main className="workspace-frame">
        <aside className="workspace-sidebar">
          <QuestionSidebar />
        </aside>
        <section className="workspace-canvas p-4">
          <PdfViewer />
        </section>
        <aside className="workspace-sidebar">
          <MarksPanel />
        </aside>
      </main>
    </div>
  );
}
