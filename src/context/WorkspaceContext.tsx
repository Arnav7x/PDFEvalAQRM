import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Region, Template, StudentPaper, PageOffset } from '../types/mapping';
import { getTemplates, saveTemplate as dbSaveTemplate, deleteTemplate as dbDeleteTemplate, getPapers, savePaper as dbSavePaper, deletePaper as dbDeletePaper } from '../utils/storage';

interface WorkspaceContextType {
  mode: 'mapping' | 'grading';
  setMode: (mode: 'mapping' | 'grading') => void;
  
  templates: Template[];
  selectedTemplate: Template | null;
  setSelectedTemplate: (template: Template | null) => void;
  createTemplate: (name: string, pageCount: number) => Template;
  updateTemplate: (template: Template) => void;
  deleteTemplate: (id: string) => void;
  
  papers: StudentPaper[];
  selectedPaper: StudentPaper | null;
  setSelectedPaper: (paper: StudentPaper | null) => void;
  createPaper: (studentName: string, fileName: string, fileSize: string, pdfUrl: string) => StudentPaper;
  updatePaper: (paper: StudentPaper) => void;
  deletePaper: (id: string) => void;
  
  currentPage: number;
  setCurrentPage: (page: number) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  
  highlightedRegionId: string | null;
  setHighlightedRegionId: (id: string | null) => void;
  
  // High-level workspace actions
  addRegion: (region: Omit<Region, 'id'>) => void;
  removeRegion: (id: string) => void;
  applyTemplate: (templateId: string) => void;
  updateOffset: (page: number, offset: Partial<PageOffset>) => void;
  saveGrade: (questionNumber: string, score: number, feedback: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<'mapping' | 'grading'>('mapping');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  
  const [papers, setPapers] = useState<StudentPaper[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<StudentPaper | null>(null);
  
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoom, setZoom] = useState<number>(1.0);
  const [highlightedRegionId, setHighlightedRegionId] = useState<string | null>(null);

  // Load from Storage on mount
  useEffect(() => {
    setTemplates(getTemplates());
    setPapers(getPapers());
  }, []);

  // Sync state back to storage helper
  const handleUpdateTemplate = (updated: Template) => {
    dbSaveTemplate(updated);
    setTemplates(getTemplates());
    if (selectedTemplate?.id === updated.id) {
      setSelectedTemplate(updated);
    }
  };

  const handleDeleteTemplate = (id: string) => {
    dbDeleteTemplate(id);
    setTemplates(getTemplates());
    if (selectedTemplate?.id === id) {
      setSelectedTemplate(null);
    }
  };

  const handleUpdatePaper = (updated: StudentPaper) => {
    dbSavePaper(updated);
    setPapers(getPapers());
    if (selectedPaper?.id === updated.id) {
      setSelectedPaper(updated);
    }
  };

  const handleDeletePaper = (id: string) => {
    dbDeletePaper(id);
    setPapers(getPapers());
    if (selectedPaper?.id === id) {
      setSelectedPaper(null);
    }
  };

  const createTemplate = (name: string, pageCount: number): Template => {
    const newTpl: Template = {
      id: `tpl-${Date.now()}`,
      name,
      pageCount,
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

  const createPaper = (studentName: string, fileName: string, fileSize: string, pdfUrl: string): StudentPaper => {
    const newPaper: StudentPaper = {
      id: `paper-${Date.now()}`,
      studentName,
      fileName,
      fileSize,
      pdfUrl,
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

  const addRegion = (regionData: Omit<Region, 'id'>) => {
    const newRegion: Region = {
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

  const removeRegion = (id: string) => {
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

  const applyTemplate = (templateId: string) => {
    if (!selectedPaper) return;
    const tpl = templates.find(t => t.id === templateId);
    if (!tpl) return;

    // Deep copy templates regions to paper, generating new region IDs
    const copiedRegions = tpl.regions.map(r => ({
      ...r,
      id: `region-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));

    // Initialize page offsets for the applied template
    const offsets: { [page: number]: PageOffset } = {};
    for (let p = 1; p <= tpl.pageCount; p++) {
      offsets[p] = { x: 0, y: 0, scale: 1.0 };
    }

    const updated: StudentPaper = {
      ...selectedPaper,
      templateId,
      regions: copiedRegions,
      offsets
    };
    handleUpdatePaper(updated);
  };

  const updateOffset = (page: number, offsetUpdate: Partial<PageOffset>) => {
    if (!selectedPaper) return;
    const currentOffset = selectedPaper.offsets[page] || { x: 0, y: 0, scale: 1.0 };
    const updatedOffsets = {
      ...selectedPaper.offsets,
      [page]: { ...currentOffset, ...offsetUpdate }
    };
    
    // In actual implementation, we might want to let the user shift the coordinates or shift the render offset
    const updated: StudentPaper = {
      ...selectedPaper,
      offsets: updatedOffsets
    };
    handleUpdatePaper(updated);
  };

  const saveGrade = (questionNumber: string, score: number, feedback: string) => {
    if (!selectedPaper) return;
    const updatedGrades = {
      ...selectedPaper.grades,
      [questionNumber]: { score, feedback }
    };
    const updated: StudentPaper = {
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
        saveGrade
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
