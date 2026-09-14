import type { LabComponent, Project } from './lab-types';

const STORAGE_KEY = 'virtual-iot-lab-project-v1';

export const saveProject = (project: Project) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
};

export const loadProject = (): Project | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Project;
    const components = (parsed.components ?? []).map((component: LabComponent) => ({
      ...component,
      z: component.z ?? 0,
      locked: component.locked ?? false,
      properties: component.properties ?? {},
    }));
    return { ...parsed, version: 1, components, wires: parsed.wires ?? [], code: parsed.code ?? '' };
  } catch {
    return null;
  }
};

export const clearProject = () => localStorage.removeItem(STORAGE_KEY);