import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const WorkspaceContext = createContext(null);

export const WorkspaceProvider = ({ children }) => {
  const [mode, setMode] = useState('mapping');
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  const [papers, setPapers] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1.0);
  const [highlightedRegionId, setHighlightedRegionId] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [overlayTool, setOverlayTool] = useState('select');

  // Toast notification state
  const [toast, setToast] = useState(null);

  const triggerToast = (message, type = 'warning') => {
    setToast({ message, type, id: Date.now() });
  };

  const clearToast = () => {
    setToast(null);
  };

// Load from Storage on mount
useEffect(() => {
  loadTemplates();
  loadPapers();
}, []);

// Helper functions to load data from API
const loadTemplates = async () => {
  try {
    const templatesData = await api.getTemplates();
    setTemplates(templatesData);
  } catch (error) {
    console.error('Failed to load templates:', error);
  }
};

const loadPapers = async () => {
  try {
    const papersData = await api.getPapers();
    setPapers(papersData);
  } catch (error) {
    console.error('Failed to load papers:', error);
  }
};

// Sync state back to storage helper
const handleUpdateTemplate = async (updated) => {
  await api.updateTemplate(updated.id, updated);
  await loadTemplates();
  if (selectedTemplate?.id === updated.id) {
    setSelectedTemplate(updated);
  }
};

const handleDeleteTemplate = async (id) => {
  await api.deleteTemplate(id);
  await loadTemplates();
  if (selectedTemplate?.id === id) {
    setSelectedTemplate(null);
  }
};

const handleUpdatePaper = async (updated) => {
  await api.updatePaper(updated.id, updated);
  await loadPapers();
  if (selectedPaper?.id === updated.id) {
    setSelectedPaper(updated);
  }
};

const handleDeletePaper = async (id) => {
  await api.deletePaper(id);
  await loadPapers();
  if (selectedPaper?.id === id) {
    setSelectedPaper(null);
  }
};

const createTemplate = async (name, pageCount) => {
  const newTpl = {
    name,
    pageCount,
    aspectRatio: 0.7619, // Default to mock paper aspect ratio (800x1050)
    regions: [],
  };
  const savedTemplate = await api.createTemplate(newTpl);
  await loadTemplates();
  setSelectedTemplate(savedTemplate);
  setSelectedPaper(null); // Clear selected paper when mapping a template
  setMode('mapping');
  setCurrentPage(1);
  setHighlightedRegionId(null);
  setSelectedArea(null);
  setOverlayTool('select');
  return savedTemplate;
};

const createPaper = async (studentName, fileName, fileSize, pdfUrl) => {
  const newPaper = {
    studentName,
    fileName,
    fileSize,
    pdfUrl,
    aspectRatio: 0.7619, // Default, will be recalculated once PDF loads
    regions: [],
    offsets: {},
    grades: {},
  };
  const savedPaper = await api.createPaper(newPaper);
  await loadPapers();
  setSelectedPaper(savedPaper);
  setSelectedTemplate(null); // Clear active template
  setMode('mapping'); // Start in mapping mode to allow creating regions freely
  setCurrentPage(1);
  setHighlightedRegionId(null);
  setSelectedArea(null);
  setOverlayTool('select');
  return savedPaper;
};

const addRegion = async (regionData) => {
  // For now, we'll handle region addition locally and sync later
  // In a more complex implementation, we'd have a dedicated region API endpoint
  const newRegion = {
    ...regionData,
    id: `region-${Date.now()}`
  };

  if (selectedTemplate) {
    const updated = {
      ...selectedTemplate,
      regions: [...selectedTemplate.regions, newRegion]
    };
    await handleUpdateTemplate(updated);
    setHighlightedRegionId(newRegion.id);
    setSelectedArea(null);
    setOverlayTool('select');
  } else if (selectedPaper) {
    const updated = {
      ...selectedPaper,
      regions: [...selectedPaper.regions, newRegion]
    };
    await handleUpdatePaper(updated);
    setHighlightedRegionId(newRegion.id);
    setSelectedArea(null);
    setOverlayTool('select');
  }

  return newRegion;
};

  const removeRegion = (id) => {
    if (selectedTemplate) {
      const updated = {
        ...selectedTemplate,
        regions: selectedTemplate.regions.filter(r => r.id !== id)
      };
      handleUpdateTemplate(updated);
    } else if (selectedPaper) {
      const updated = {
        ...selectedPaper,
        regions: selectedPaper.regions.filter(r => r.id !== id)
      };
      handleUpdatePaper(updated);
    }
  };

  const applyTemplate = (templateId) => {
    if (!selectedPaper) return;
    const tpl = templates.find(t => t.id === templateId);
    if (!tpl) return;

    // Deep copy templates regions to paper, generating new region IDs
    const copiedRegions = tpl.regions.map(r => ({
      ...r,
      id: `region-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));

    // Initialize page offsets for the applied template
    const offsets = {};
    for (let p = 1; p <= tpl.pageCount; p++) {
      offsets[p] = { x: 0, y: 0, scale: 1.0 };
    }

    const updated = {
      ...selectedPaper,
      templateId,
      regions: copiedRegions,
      offsets
    };

    // Calculate aspect ratio difference and show smart warning toast
    if (tpl.aspectRatio && selectedPaper.aspectRatio) {
      const diff = Math.abs(selectedPaper.aspectRatio - tpl.aspectRatio) / tpl.aspectRatio;
      if (diff > 0.02) {
        triggerToast(`Warning: The student paper's aspect ratio differs from the template by ${(diff * 100).toFixed(1)}%. Please double-check and adjust regions!`);
      }
    }

    handleUpdatePaper(updated);
    setHighlightedRegionId(copiedRegions[0]?.id || null);
    setSelectedArea(null);
    setOverlayTool('select');
  };

  const updateOffset = (page, offsetUpdate) => {
    if (!selectedPaper) return;
    const currentOffset = selectedPaper.offsets?.[page] || { x: 0, y: 0, scale: 1.0 };
    const updatedOffsets = {
      ...(selectedPaper.offsets || {}),
      [page]: { ...currentOffset, ...offsetUpdate }
    };
    
    const updated = {
      ...selectedPaper,
      offsets: updatedOffsets
    };
    handleUpdatePaper(updated);
  };

  const saveGrade = (questionNumber, score, feedback) => {
    if (!selectedPaper) return;
    const updatedGrades = {
      ...selectedPaper.grades,
      [questionNumber]: { score, feedback }
    };
    const updated = {
      ...selectedPaper,
      grades: updatedGrades
    };
    handleUpdatePaper(updated);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        mode,
        setMode,
        templates,
        selectedTemplate,
        setSelectedTemplate,
        createTemplate,
        updateTemplate: handleUpdateTemplate,
        deleteTemplate: handleDeleteTemplate,
        papers,
        selectedPaper,
        setSelectedPaper,
        createPaper,
        updatePaper: handleUpdatePaper,
        deletePaper: handleDeletePaper,
        currentPage,
        setCurrentPage,
        zoom,
        setZoom,
        highlightedRegionId,
        setHighlightedRegionId,
        selectedArea,
        setSelectedArea,
        overlayTool,
        setOverlayTool,
        addRegion,
        removeRegion,
        applyTemplate,
        updateOffset,
        saveGrade,
        toast,
        triggerToast,
        clearToast
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used within a WorkspaceProvider');
  return context;
};
