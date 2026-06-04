import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Layers, Search, UserCircle, Trash2 } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { templates, papers, isLoading, selectPaperForRoute, deletePaper } = useWorkspace();

  const openPaper = (paper) => {
    selectPaperForRoute(paper.id, (paper.regions || []).length > 0 ? 'grading' : 'mapping');
    navigate((paper.regions || []).length > 0 ? `/evaluate/${paper.id}` : `/workspace/${paper.id}`);
  };

  return (
    <div className="app-shell p-5">
      <header className="mb-5 flex items-center justify-between rounded-sm border border-glass bg-panel px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <FileText size={16} />
          <span>PDF Evaluation System</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-sm border border-glass bg-white px-3 py-2 text-xs text-secondary">
            <Search size={14} />
            <input className="border-0 p-0 text-xs focus:shadow-none" placeholder="Search templates, evaluations..." />
          </div>
          <UserCircle size={24} className="text-secondary" />
        </div>
      </header>

      <main className="rounded-sm border border-glass bg-panel p-5">
        <section className="mb-7">
          <h1 className="mb-2 text-2xl font-bold">Auto Question Region Mapping</h1>
          <p className="mb-4 text-sm text-secondary">Create reusable templates and accelerate evaluation</p>
          <Link to="/upload" className="btn btn-primary text-xs">
            Upload New Paper
          </Link>
        </section>

        <section className="mb-7">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent Templates</h2>
            <Link to="/templates" className="btn btn-secondary px-3 py-1 text-xs">View All</Link>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {(isLoading ? [] : templates.slice(0, 3)).map((template) => (
              <article key={template.id} className="rounded-sm border border-glass bg-[#f8fafc] p-3">
                <div className="mb-3 flex h-20 items-center justify-center bg-[#eef1f5] text-secondary">
                  <Layers size={24} />
                </div>
                <h3 className="text-sm font-semibold">{template.name}</h3>
                <p className="mb-3 text-xs text-secondary">
                  {template.pageCount} pages | {(template.regions || []).length} questions
                </p>
                <button onClick={() => navigate('/templates')} className="btn btn-secondary w-full justify-center py-1 text-xs">
                  Preview Template
                </button>
              </article>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent Evaluations</h2>
            <span className="text-xs text-secondary">{papers.length} total</span>
          </div>
          <div className="overflow-hidden rounded-sm border border-glass">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8fafc] text-secondary">
                <tr>
                  <th className="px-3 py-2 font-medium">Student Name</th>
                  <th className="px-3 py-2 font-medium">Paper</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass bg-white">
                {papers.length === 0 && (
                  <tr><td className="px-3 py-5 text-center text-secondary" colSpan={4}>No evaluations yet.</td></tr>
                )}
                {papers.slice(0, 6).map((paper) => {
                  const regionCount = (paper.regions || []).length;
                  const gradedCount = Object.keys(paper.grades || {}).length;
                  return (
                    <tr key={paper.id}>
                      <td className="px-3 py-2">{paper.studentName}</td>
                      <td className="px-3 py-2 text-secondary">{paper.fileName}</td>
                      <td className="px-3 py-2">
                        {regionCount > 0 ? `${gradedCount}/${regionCount} graded` : 'Not started'}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openPaper(paper)} className="btn btn-secondary px-5 py-1 text-xs">Open</button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); deletePaper(paper.id); }} 
                            className="btn btn-ghost px-2 py-1 text-xs hover:bg-red-50 text-red-500" 
                            title="Delete Evaluation"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
