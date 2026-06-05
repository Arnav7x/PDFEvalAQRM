import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Plus, Search, Trash2 } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

export default function TemplateLibrary() {
  const navigate = useNavigate();
  const { templates, papers, selectedPaper, applyTemplateToPaper, setSelectedTemplate, setSelectedPaper, setMode, resetWorkspaceSelection, deleteTemplate } = useWorkspace();

  const previewTemplate = (template) => {
    setSelectedTemplate(template);
    setSelectedPaper(null);
    setMode('mapping');
    resetWorkspaceSelection();
    navigate(`/templates/${template.id}`);
  };

  const applyToLatestPaper = (template) => {
    const paper = selectedPaper || papers[0];
    if (!paper) {
      alert('Upload or open a paper before applying a template.');
      return;
    }
    applyTemplateToPaper(paper, template.id);
    navigate(`/evaluate/${paper.id}`);
  };

  return (
    <div className="app-shell p-5">
      <header className="mb-5 flex items-center justify-between rounded-sm border border-glass bg-panel px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="btn btn-secondary px-3 py-1 text-xs">
            <ArrowLeft size={14} /> Dashboard
          </button>
          <div>
            <h1 className="text-lg font-semibold">Template Library</h1>
            <p className="text-xs text-secondary">Manage and reuse question mapping templates</p>
          </div>
        </div>
        <button className="btn btn-primary text-xs"><Plus size={14} /> Create Template</button>
      </header>

      <div className="mb-4 flex items-center gap-2">
        <div className="flex w-72 items-center gap-2 rounded-sm border border-glass bg-white px-3 py-2 text-xs text-secondary">
          <Search size={14} />
          <input className="border-0 p-0 text-xs focus:shadow-none" placeholder="Search templates..." />
        </div>
        <select className="input text-xs">
          <option>Exam Type</option>
        </select>
        <select className="input text-xs">
          <option>Sort: Date</option>
        </select>
      </div>

      <main className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {templates.map((template) => (
          <article key={template.id} className="rounded-sm border border-glass bg-panel p-4">
            <div className="mb-3 flex h-24 items-center justify-center bg-[#eef1f5] text-secondary">
              <FileText size={28} />
            </div>
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">{template.name}</h2>
                <p className="text-xs text-secondary">
                  {template.pageCount} pages | {(template.regions || []).length} questions
                </p>
              </div>
              <span className="text-[10px] text-secondary">Medium</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => applyToLatestPaper(template)} className="btn btn-primary flex-1 justify-center py-1 text-xs">Apply</button>
              <button onClick={() => previewTemplate(template)} className="btn btn-secondary px-4 py-1 text-xs">Preview</button>
              {template.id !== 'tpl-math-101' && template.id !== 'tpl-physics-12' && (
                <button
                  onClick={() => deleteTemplate(template.id)}
                  className="btn btn-ghost px-3 py-1 text-xs text-red-500 hover:bg-red-50"
                  title="Delete Template"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </article>
        ))}
      </main>
    </div>
  );
}
