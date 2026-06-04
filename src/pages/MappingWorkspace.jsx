import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { PdfViewer } from '../components/PdfViewer';
import QuestionSidebar from '../components/QuestionSidebar';
import PropertiesPanel from '../components/PropertiesPanel';
import SaveTemplateModal from '../components/SaveTemplateModal';

export default function MappingWorkspace() {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const {
    isLoading,
    selectedPaper,
    selectedTemplate,
    highlightedRegionId,
    selectedArea,
    selectPaperForRoute,
  } = useWorkspace();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      selectPaperForRoute(paperId, 'mapping');
    }
  }, [isLoading, paperId]);

  const activeRegions = selectedTemplate?.regions || selectedPaper?.regions || [];
  const activeRegion = useMemo(
    () => activeRegions.find((region) => region.id === highlightedRegionId),
    [activeRegions, highlightedRegionId]
  );

  if (isLoading) {
    return <div className="app-shell flex items-center justify-center text-sm text-secondary">Loading workspace...</div>;
  }

  if (!selectedPaper || String(selectedPaper.id) !== String(paperId)) {
    return (
      <div className="app-shell flex items-center justify-center">
        <div className="rounded-sm border border-glass bg-panel p-6 text-center">
          <h1 className="mb-2 text-lg font-semibold">Paper not found</h1>
          <p className="mb-4 text-sm text-secondary">The selected paper could not be loaded.</p>
          <button onClick={() => navigate('/')} className="btn btn-primary text-xs">Return Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="btn btn-secondary px-3 py-1 text-xs">
            <ArrowLeft size={14} /> Back
          </button>
          <div>
            <h1 className="text-sm font-semibold">Mapping Workspace</h1>
            <p className="text-[11px] text-secondary">{selectedPaper.studentName} | {selectedPaper.fileName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-sm bg-[#f8fafc] px-3 py-1 text-[11px] text-secondary">
            {activeRegion
              ? `Selected ${activeRegion.questionNumber}: ${activeRegion.x.toFixed(1)}, ${activeRegion.y.toFixed(1)}`
              : selectedArea
                ? `New area: ${selectedArea.width.toFixed(1)} x ${selectedArea.height.toFixed(1)}`
                : 'No region selected'}
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary px-3 py-1 text-xs">
            <Save size={14} /> Save Template
          </button>
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
          <PropertiesPanel />
        </aside>
      </main>

      <SaveTemplateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
