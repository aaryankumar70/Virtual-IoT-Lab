import type { Project } from './lab-types';

const STORAGE_KEY = 'virtual-iot-lab-project-v1';

export const saveProject = (project: Project) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
};

export const loadProject = (): Project | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Project;
  } catch {
    return null;
  }
};

export const clearProject = () => localStorage.removeItem(STORAGE_KEY);