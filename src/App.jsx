import React, { useState } from 'react';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { PdfViewer } from './components/PdfViewer';
import { ShieldAlert, Upload, FileText, ArrowRight, CheckSquare } from 'lucide-react';

function LandingPage({ onUpload, onLoadDemo, papers, setSelectedPaper, setSelectedTemplate, setMode, setOverlayTool, setHighlightedRegionId, setCurrentPage }) {
  const [dragActive, setDragActive] = useState(false);
  const [studentName, setStudentName] = useState('');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      triggerUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      triggerUpload(e.target.files[0]);
    }
  };

  const triggerUpload = (file) => {
    if (file.type !== 'application/pdf') {
      alert('Only PDF documents are supported.');
      return;
    }
    const name = studentName.trim() || file.name.split('.')[0] + ' (Student)';
    const sizeStr = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
    const url = URL.createObjectURL(file);
    onUpload(name, file.name, sizeStr, url);
    setStudentName('');
  };

  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        background: '#020202',
        color: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
        overflow: 'auto',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* Brand logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '48px' }}>
        <CheckSquare size={26} style={{ color: '#ffffff' }} />
        <span style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>PDFEVal</span>
      </div>

      {/* Main card */}
      <div 
        style={{
          width: '100%',
          maxWidth: '540px',
          border: '1px solid #1a1a1a',
          padding: '40px',
          background: '#080808',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
        }}
      >
        <h1 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '8px', textAlign: 'center' }}>
          Evaluate PDF Papers
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '32px', lineHeight: '1.5' }}>
          Map question zones, auto-align photographed sheets, and grade student submissions directly in a clean workspace interface.
        </p>

        {/* Drag and drop zone */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload-input').click()}
          style={{
            border: dragActive ? '1px solid #ffffff' : '1px dashed #262626',
            background: dragActive ? '#0f0f0f' : 'transparent',
            padding: '40px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            borderRadius: 'var(--radius-sm)'
          }}
        >
          <Upload size={28} style={{ color: dragActive ? '#ffffff' : '#52525b' }} />
          <div>
            <span style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '2px' }}>
              Drag & drop student paper PDF
            </span>
            <span style={{ fontSize: '11px', color: '#52525b' }}>
              or click to browse local files
            </span>
          </div>

          <input 
            type="file" 
            accept=".pdf" 
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="file-upload-input"
          />
          
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px', maxWidth: '280px' }}>
            <input 
              type="text" 
              placeholder="Enter student name (optional)" 
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              style={{
                fontSize: '11px',
                padding: '6px 10px',
                textAlign: 'center',
                background: '#0d0d0d',
                border: '1px solid #1f1f1f',
                width: '100%',
                borderRadius: 'var(--radius-sm)'
              }}
            />
            
            <label 
              htmlFor="file-upload-input" 
              className="btn btn-primary" 
              style={{ 
                justifyContent: 'center', 
                fontSize: '11px', 
                padding: '6px 16px', 
                cursor: 'pointer',
                borderRadius: 'var(--radius-sm)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              Choose PDF File
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '24px 0', fontSize: '11px', color: '#262626' }}>
          <div style={{ flex: 1, height: '1px', background: '#141414' }}></div>
          <span style={{ padding: '0 10px' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: '#141414' }}></div>
        </div>

        {/* Demo button */}
        <button 
          onClick={onLoadDemo} 
          className="btn-secondary" 
          style={{ width: '100%', justifyContent: 'center', fontSize: '12px', padding: '8px 16px', border: '1px solid #1f1f1f', borderRadius: 'var(--radius-sm)' }}
        >
          Explore Workspace with Demo Math Midterm
        </button>

        {/* Return to existing papers if there are any */}
        {papers.length > 0 && (
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #141414' }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Active Evaluations ({papers.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {papers.slice(0, 3).map(paper => (
                <div 
                  key={paper.id} 
                  onClick={() => {
                    setSelectedPaper(paper);
                    setSelectedTemplate(null);
                    setMode('grading');
                    setOverlayTool('select');
                    setHighlightedRegionId(null);
                    setCurrentPage(1);
                  }}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: '#0d0d0d',
                    border: '1px solid #1a1a1a',
                    cursor: 'pointer',
                    fontSize: '12px',
                    borderRadius: 'var(--radius-sm)'
                  }}
                  className="glass-panel-hover"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={14} style={{ color: 'var(--text-secondary)' }} />
                    <span>{paper.studentName}</span>
                  </div>
                  <ArrowRight size={12} style={{ color: '#52525b' }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '48px', fontSize: '11px', color: '#3f3f46' }}>
        PDFEVal • Assisted grading workspace portal
      </div>
    </div>
  );
}

function MainAppContent() {
  const { 
    toast, 
    clearToast, 
    selectedPaper, 
    selectedTemplate, 
    createPaper, 
    papers, 
    setSelectedPaper, 
    setSelectedTemplate, 
    setMode,
    setOverlayTool,
    setHighlightedRegionId,
    setCurrentPage
  } = useWorkspace();

  const handleUpload = (studentName, fileName, fileSize, pdfUrl) => {
    createPaper(studentName, fileName, fileSize, pdfUrl);
  };

  const handleLoadDemo = () => {
    const mockExists = papers.some(p => p.pdfUrl === 'mock');
    if (mockExists) {
      const existing = papers.find(p => p.pdfUrl === 'mock');
      if (existing) {
        setSelectedPaper(existing);
        setSelectedTemplate(null);
        setMode('grading');
        setOverlayTool('select');
      }
      return;
    }

    createPaper(
      'Alex Mercer (Sample Grade 10 Math)',
      'alex_mercer_midterm.pdf',
      '0.45 MB',
      'mock'
    );
  };

  // Show Landing Page if neither a paper nor a template is actively loaded/selected in the editor
  if (!selectedPaper && !selectedTemplate) {
    return (
      <LandingPage 
        onUpload={handleUpload}
        onLoadDemo={handleLoadDemo}
        papers={papers}
        setSelectedPaper={setSelectedPaper}
        setSelectedTemplate={setSelectedTemplate}
        setMode={setMode}
        setOverlayTool={setOverlayTool}
        setHighlightedRegionId={setHighlightedRegionId}
        setCurrentPage={setCurrentPage}
      />
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        padding: '16px',
        gap: '16px',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Left panel: templates, docs */}
      <LeftSidebar />

      {/* Middle workspace: PDF viewer & canvas */}
      <div style={{ flex: 1, height: '100%', overflow: 'hidden' }}>
        <PdfViewer />
      </div>

      {/* Right panel: grading & adjustments */}
      <RightSidebar />

      {/* Premium aspect ratio alert toast */}
      {toast && (
        <div 
          className="glass-panel" 
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            padding: '16px 20px',
            background: 'rgba(10, 10, 11, 0.95)',
            border: '1px solid var(--rose)',
            borderRadius: 'var(--radius-sm)',
            maxWidth: '380px',
            boxShadow: '0 8px 32px rgba(239, 68, 68, 0.15)',
            display: 'flex',
            gap: '14px',
            alignItems: 'flex-start',
            animation: 'slide-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <div style={{ marginTop: '2px', color: 'var(--rose)', flexShrink: 0 }}>
            <ShieldAlert size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: '700', color: 'var(--rose)', display: 'block', fontSize: '13px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Aspect Ratio Mismatch
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: '1.4', display: 'block' }}>
              {toast.message}
            </span>
          </div>
          <button 
            onClick={clearToast} 
            className="btn-secondary" 
            style={{ padding: '4px 8px', fontSize: '11px', flexShrink: 0, marginTop: '2px', borderRadius: 'var(--radius-sm)' }}
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <WorkspaceProvider>
      <MainAppContent />
    </WorkspaceProvider>
  );
}

export default App;
