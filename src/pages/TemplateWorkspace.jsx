import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { PdfViewer } from '../components/PdfViewer';
import QuestionSidebar from '../components/QuestionSidebar';
import PropertiesPanel from '../components/PropertiesPanel';

export default function TemplateWorkspace() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const {
    isLoading,
    selectedTemplate,
    highlightedRegionId,
    selectedArea,
    selectTemplateForRoute,
  } = useWorkspace();

  useEffect(() => {
    if (!isLoading) {
      selectTemplateForRoute(templateId);
    }
  }, [isLoading, templateId]);

  const activeRegions = selectedTemplate?.regions || [];
  const activeRegion = useMemo(
    () => activeRegions.find((region) => region.id === highlightedRegionId),
    [activeRegions, highlightedRegionId]
  );

  if (isLoading) {
    return <div className="app-shell flex items-center justify-center text-sm text-secondary">Loading template preview...</div>;
  }

  if (!selectedTemplate || String(selectedTemplate.id) !== String(templateId)) {
    return (
      <div className="app-shell flex items-center justify-center">
        <div className="rounded-sm border border-glass bg-panel p-6 text-center">
          <h1 className="mb-2 text-lg font-semibold">Template not found</h1>
          <p className="mb-4 text-sm text-secondary">The selected template could not be loaded.</p>
          <button onClick={() => navigate('/templates')} className="btn btn-primary text-xs">Return Template Library</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/templates')} className="btn btn-secondary px-3 py-1 text-xs">
            <ArrowLeft size={14} /> Back
          </button>
          <div>
            <h1 className="text-sm font-semibold">Template Preview</h1>
            <p className="text-[11px] text-secondary">
              {selectedTemplate.name} | {selectedTemplate.pageCount} pages | {(selectedTemplate.regions || []).length} questions
            </p>
          </div>
        </div>
        <div className="rounded-sm bg-[#f8fafc] px-3 py-1 text-[11px] text-secondary">
          {activeRegion
            ? `Selected ${activeRegion.questionNumber}: ${activeRegion.x.toFixed(1)}, ${activeRegion.y.toFixed(1)}`
            : selectedArea
              ? `New area: ${selectedArea.width.toFixed(1)} x ${selectedArea.height.toFixed(1)}`
              : 'Previewing template regions'}
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
    </div>
  );
}
