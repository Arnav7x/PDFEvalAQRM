import { WorkspaceProvider } from './context/WorkspaceContext';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { PdfViewer } from './components/PdfViewer';

function MainAppContent() {
  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        padding: '16px',
        gap: '16px',
        overflow: 'hidden',
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
