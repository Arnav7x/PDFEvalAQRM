import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTemplates, saveTemplate as dbSaveTemplate, deleteTemplate as dbDeleteTemplate, getPapers, savePaper as dbSavePaper, deletePaper as dbDeletePaper } from '../utils/storage';

const WorkspaceContext = createContext(undefined);

export const WorkspaceProvider = ({ children }) => {
  const [mode, setMode] = useState('mapping');
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  const [papers, setPapers] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1.0);
  const [highlightedRegionId, setHighlightedRegionId] = useState(null);

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
    setTemplates(getTemplates());
    setPapers(getPapers());
  }, []);

  // Sync state back to storage helper
  const handleUpdateTemplate = (updated) => {
    dbSaveTemplate(updated);
    setTemplates(getTemplates());
    if (selectedTemplate?.id === updated.id) {
      setSelectedTemplate(updated);
    }
  };

  const handleDeleteTemplate = (id) => {
    dbDeleteTemplate(id);
    setTemplates(getTemplates());
    if (selectedTemplate?.id === id) {
      setSelectedTemplate(null);
    }
  };

  const handleUpdatePaper = (updated) => {
    dbSavePaper(updated);
    setPapers(getPapers());
    if (selectedPaper?.id === updated.id) {
      setSelectedPaper(updated);
    }
  };

  const handleDeletePaper = (id) => {
    dbDeletePaper(id);
    setPapers(getPapers());
    if (selectedPaper?.id === id) {
      setSelectedPaper(null);
    }
  };

  const createTemplate = (name, pageCount) => {
    const newTpl = {
      id: `tpl-${Date.now()}`,
      name,
      pageCount,
      aspectRatio: 0.7619, // Default to mock paper aspect ratio (800x1050)
      regions: [],
      createdAt: new Date().toISOString()
    };
    dbSaveTemplate(newTpl);
    setTemplates(getTemplates());
    setSelectedTemplate(newTpl);
    setSelectedPaper(null); // Clear selected paper when mapping a template
    setMode('mapping');
    setCurrentPage(1);
    return newTpl;
  };

  const createPaper = (studentName, fileName, fileSize, pdfUrl) => {
    const newPaper = {
      id: `paper-${Date.now()}`,
      studentName,
      fileName,
      fileSize,
      pdfUrl,
      aspectRatio: 0.7619, // Default, will be recalculated once PDF loads
      regions: [],
      offsets: {},
      grades: {},
      createdAt: new Date().toISOString()
    };
    dbSavePaper(newPaper);
    setPapers(getPapers());
    setSelectedPaper(newPaper);
    setSelectedTemplate(null); // Clear active template
    setMode('grading');
    setCurrentPage(1);
    return newPaper;
  };

  const addRegion = (regionData) => {
    const newRegion = {
      ...regionData,
      id: `region-${Date.now()}`
    };

    if (selectedTemplate) {
      const updated = {
        ...selectedTemplate,
        regions: [...selectedTemplate.regions, newRegion]
      };
      handleUpdateTemplate(updated);
    } else if (selectedPaper) {
      const updated = {
        ...selectedPaper,
        regions: [...selectedPaper.regions, newRegion]
      };
      handleUpdatePaper(updated);
    }
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
  };

  const updateOffset = (page, offsetUpdate) => {
    if (!selectedPaper) return;
    const currentOffset = selectedPaper.offsets[page] || { x: 0, y: 0, scale: 1.0 };
    const updatedOffsets = {
      ...selectedPaper.offsets,
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
