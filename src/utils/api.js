import * as storage from './storage';

const API_BASE_URL = 'http://localhost:8000';

export const api = {
  // Templates
  getTemplates: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/templates/`);
      if (!response.ok) throw new Error('Failed to fetch templates');
      return await response.json();
    } catch (e) {
      console.warn('API getTemplates failed, using localStorage fallback', e);
      return storage.getTemplates();
    }
  },
  
  createTemplate: async (templateData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/templates/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData),
      });
      if (!response.ok) throw new Error('Failed to create template');
      return await response.json();
    } catch (e) {
      console.warn('API createTemplate failed, using localStorage fallback', e);
      const newTemplate = { ...templateData, id: templateData.id || `tpl-${Date.now()}` };
      storage.saveTemplate(newTemplate);
      return newTemplate;
    }
  },
  
  updateTemplate: async (id, templateData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData),
      });
      if (!response.ok) throw new Error('Failed to update template');
      return await response.json();
    } catch (e) {
      console.warn('API updateTemplate failed, using localStorage fallback', e);
      storage.saveTemplate(templateData);
      return templateData;
    }
  },
  
  deleteTemplate: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete template');
    } catch (e) {
      console.warn('API deleteTemplate failed, using localStorage fallback', e);
      storage.deleteTemplate(id);
    }
  },
  
  // Papers
  getPapers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/papers/`);
      if (!response.ok) throw new Error('Failed to fetch papers');
      return await response.json();
    } catch (e) {
      console.warn('API getPapers failed, using localStorage fallback', e);
      return storage.getPapers();
    }
  },
  
  createPaper: async (paperData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/papers/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paperData),
      });
      if (!response.ok) throw new Error('Failed to create paper');
      return await response.json();
    } catch (e) {
      console.warn('API createPaper failed, using localStorage fallback', e);
      const newPaper = { ...paperData, id: paperData.id || `paper-${Date.now()}` };
      storage.savePaper(newPaper);
      return newPaper;
    }
  },
  
  updatePaper: async (id, paperData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/papers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paperData),
      });
      if (!response.ok) throw new Error('Failed to update paper');
      return await response.json();
    } catch (e) {
      console.warn('API updatePaper failed, using localStorage fallback', e);
      storage.savePaper(paperData);
      return paperData;
    }
  },
  
  deletePaper: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/papers/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete paper');
    } catch (e) {
      console.warn('API deletePaper failed, using localStorage fallback', e);
      storage.deletePaper(id);
    }
  },
};