import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { PdfViewer } from './components/PdfViewer';
import { ShieldAlert } from 'lucide-react';

function MainAppContent() {
  const { toast, clearToast } = useWorkspace();

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
          className="glass-panel highlight-ring" 
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            padding: '16px 20px',
            background: 'rgba(23, 31, 50, 0.95)',
            border: '1px solid var(--rose)',
            borderRadius: 'var(--radius-md)',
            maxWidth: '380px',
            boxShadow: '0 10px 30px rgba(244, 63, 94, 0.25)',
            display: 'flex',
            gap: '14px',
            alignItems: 'flex-start',
            animation: 'slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
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
            style={{ padding: '4px 8px', fontSize: '11px', flexShrink: 0, marginTop: '2px' }}
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
