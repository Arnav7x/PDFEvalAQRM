import React, { useEffect, useRef, useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { renderMockPage } from '../utils/mockExamRenderer';
import { MappingOverlay } from './MappingOverlay';
import { ZoomIn, ZoomOut, RotateCcw, AlertCircle } from 'lucide-react';

// Setup PDF.js worker
import * as pdfjs from 'pdfjs-dist';
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export const PdfViewer = () => {
  const {
    selectedTemplate,
    selectedPaper,
    updatePaper,
    currentPage,
    setCurrentPage,
    zoom,
    setZoom,
    highlightedRegionId
  } = useWorkspace();

  const containerRef = useRef(null);
  const [numPages, setNumPages] = useState(3);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pdfLoadingError, setPdfLoadingError] = useState(null);

  // Set number of pages depending on active template or paper
  useEffect(() => {
    if (selectedTemplate) {
      setNumPages(selectedTemplate.pageCount);
      setPdfDoc(null);
      setPdfLoadingError(null);
    } else if (selectedPaper) {
      if (selectedPaper.pdfUrl === 'mock') {
        setNumPages(3);
        setPdfDoc(null);
        setPdfLoadingError(null);
        if (selectedPaper.aspectRatio !== 0.7619) {
          const updatedPaper = {
            ...selectedPaper,
            aspectRatio: 0.7619
          };
          updatePaper(updatedPaper);
        }
      } else {
        // Load real PDF
        setPdfLoadingError(null);
        const loadingTask = pdfjs.getDocument({ url: selectedPaper.pdfUrl });
        loadingTask.promise.then(
          (pdf) => {
            setPdfDoc(pdf);
            setNumPages(pdf.numPages);
            
            // Calculate first page's aspect ratio
            pdf.getPage(1).then((page) => {
              const viewport = page.getViewport({ scale: 1.0 });
              const paperAspectRatio = viewport.width / viewport.height;
              
              if (selectedPaper.aspectRatio !== paperAspectRatio) {
                const updatedPaper = {
                  ...selectedPaper,
                  aspectRatio: paperAspectRatio
                };
                updatePaper(updatedPaper);
              }
            });
          },
          (err) => {
            console.error('Error loading PDF:', err);
            setPdfLoadingError('Failed to load PDF. Rendering default exam layout instead.');
            setPdfDoc(null);
            setNumPages(3);
          }
        );
      }
    } else {
      setNumPages(3);
    }
  }, [selectedTemplate, selectedPaper]);

  // Handle jump navigation scrolling
  useEffect(() => {
    if (!highlightedRegionId) return;

    // Find the region
    const activeRegions = selectedTemplate
      ? selectedTemplate.regions
      : selectedPaper
      ? selectedPaper.regions
      : [];

    const region = activeRegions.find(r => r.id === highlightedRegionId);
    if (!region) return;

    // Scroll to the page container
    const pageEl = document.getElementById(`page-container-${region.page}`);
    if (pageEl && containerRef.current) {
      // Calculate centering offset
      const containerHeight = containerRef.current.clientHeight;
      const elementTop = pageEl.offsetTop;
      const elementHeight = pageEl.clientHeight;
      
      // Calculate region relative Y scroll destination
      const regionYPixel = (region.y / 100) * elementHeight;
      const targetScroll = elementTop + regionYPixel - (containerHeight / 2) + ((region.height / 100) * elementHeight / 2);

      containerRef.current.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
      
      setCurrentPage(region.page);
    }
  }, [highlightedRegionId]);

  // Monitor scrolling to update current page indicator
  const handleScroll = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const children = container.querySelectorAll('.page-wrapper');
    
    let activePage = 1;
    let minDiff = Infinity;
    
    children.forEach((child) => {
      const rect = child.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const diff = Math.abs((rect.top + rect.height / 2) - (containerRect.top + containerRect.height / 2));
      
      if (diff < minDiff) {
        minDiff = diff;
        const pageNum = parseInt(child.getAttribute('data-page') || '1', 10);
        activePage = pageNum;
      }
    });
    
    if (activePage !== currentPage) {
      setCurrentPage(activePage);
    }
  };

  // Render function for individual page canvases
  const PageCanvas = ({ pageNum }) => {
    const canvasRef = useRef(null);
    const renderTaskRef = useRef(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const baseWidth = 800;
      const baseHeight = 1050; // Standard letter/A4 aspect ratio
      
      canvas.width = baseWidth * zoom;
      canvas.height = baseHeight * zoom;

      // Check if we render using pdfDoc or mockup renderer
      if (pdfDoc && !pdfLoadingError) {
        pdfDoc.getPage(pageNum).then((page) => {
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          // Clear viewport first
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Get viewport scale based on baseWidth and current zoom
          const unscaledViewport = page.getViewport({ scale: 1.0 });
          const scale = (canvas.width / unscaledViewport.width);
          const viewport = page.getViewport({ scale });

          // Cancel any ongoing render
          if (renderTaskRef.current) {
            renderTaskRef.current.cancel();
          }

          // Apply page offsets if applicable (for papers with template shift adjustments)
          ctx.save();
          if (selectedPaper) {
            const offset = selectedPaper.offsets[pageNum] || { x: 0, y: 0, scale: 1.0 };
            const tx = (offset.x / 100) * canvas.width;
            const ty = (offset.y / 100) * canvas.height;
            ctx.translate(tx, ty);

            if (offset.scale !== 1.0) {
              ctx.translate(canvas.width / 2, canvas.height / 2);
              ctx.scale(offset.scale, offset.scale);
              ctx.translate(-canvas.width / 2, -canvas.height / 2);
            }

            // Draw alignment dashed border if shifted
            if (offset.x !== 0 || offset.y !== 0 || offset.scale !== 1.0) {
              ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
              ctx.lineWidth = 2;
              ctx.setLineDash([5, 5]);
              ctx.strokeRect(0, 0, canvas.width, canvas.height);
              ctx.setLineDash([]);
            }
          }

          const renderContext = {
            canvasContext: ctx,
            viewport: viewport,
          };

          renderTaskRef.current = page.render(renderContext);
          renderTaskRef.current.promise.then(
            () => {
              ctx.restore();
              renderTaskRef.current = null;
            },
            (err) => {
              ctx.restore();
              if (err.name !== 'RenderingCancelledException') {
                console.error('Error rendering page:', err);
              }
            }
          );
        });
      } else {
        // Draw Mock Sheet
        const offset = selectedPaper?.offsets[pageNum] || { x: 0, y: 0, scale: 1.0 };
        renderMockPage(canvas, pageNum, offset);
      }
    }, [pdfDoc, pageNum, zoom, selectedPaper?.offsets[pageNum], pdfLoadingError]);

    return (
      <div
        id={`page-container-${pageNum}`}
        className="page-wrapper"
        data-page={pageNum}
        style={{
          position: 'relative',
          width: `${800 * zoom}px`,
          height: `${1050 * zoom}px`,
          margin: '0 auto 24px auto',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          borderRadius: '4px',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          transition: 'width 0.2s ease, height 0.2s ease',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
          }}
        />
        <MappingOverlay pageNumber={pageNum} />
      </div>
    );
  };

  const pagesArray = Array.from({ length: numPages }, (_, i) => i + 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {/* Viewport Top controls */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 24px',
          borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
          borderBottom: '1px solid var(--border-glass)',
          background: 'rgba(15, 23, 42, 0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px', fontWeight: '500' }}>
            {selectedPaper ? `Grading Paper: ${selectedPaper.studentName}` : selectedTemplate ? `Editing Template: ${selectedTemplate.name}` : 'Document Workspace'}
          </span>
          <span
            style={{
              fontSize: '12px',
              backgroundColor: 'var(--bg-surface)',
              padding: '2px 8px',
              borderRadius: '99px',
              color: 'var(--text-secondary)',
            }}
          >
            Page {currentPage} of {numPages}
          </span>
        </div>

        {/* PDF Fallback Alert if loading failed */}
        {pdfLoadingError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--amber)', fontSize: '12px' }}>
            <AlertCircle size={14} />
            <span>{pdfLoadingError}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setZoom(Math.max(0.6, zoom - 0.1))}
            className="btn-secondary"
            style={{ padding: '6px 10px' }}
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <span style={{ fontSize: '13px', width: '45px', textAlign: 'center', fontWeight: '600' }}>
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(Math.min(2.0, zoom + 0.1))}
            className="btn-secondary"
            style={{ padding: '6px 10px' }}
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={() => setZoom(1.0)}
            className="btn-secondary"
            style={{ padding: '6px 10px' }}
            title="Reset Zoom"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Pages Container scroll area */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 16px',
          background: 'rgba(5, 7, 12, 0.9)',
          borderRadius: '0 0 var(--radius-md) var(--radius-md)',
          border: '1px solid var(--border-glass)',
          borderTop: 'none',
        }}
      >
        {pagesArray.map((pageNum) => (
          <PageCanvas key={pageNum} pageNum={pageNum} />
        ))}
      </div>
    </div>
  );
};
