import { lazy, type ComponentType } from 'react';
import { ColorsPage, FontsPage, LayoutPage, OverviewPage } from './foundations';

function lazyPage(load: () => Promise<ComponentType>) {
  return lazy(async () => ({ default: await load() }));
}

const InstrumentHeaderDemo = lazyPage(() => import('./demos/instrument-header').then(({ InstrumentHeaderDemo }) => InstrumentHeaderDemo));
const ComponentPaletteDemo = lazyPage(() => import('./demos/component-palette').then(({ ComponentPaletteDemo }) => ComponentPaletteDemo));
const WorkspaceEditorDemo = lazyPage(() => import('./demos/workspace-editor').then(({ WorkspaceEditorDemo }) => WorkspaceEditorDemo));
const InspectorPanelDemo = lazyPage(() => import('./demos/inspector-panel').then(({ InspectorPanelDemo }) => InspectorPanelDemo));
const SerialMonitorDemo = lazyPage(() => import('./demos/serial-monitor').then(({ SerialMonitorDemo }) => SerialMonitorDemo));

export type PreviewEntry = {
  id: string;
  name: string;
  description: string;
  Page: ComponentType;
};

export type NavGroup = { name: string; entries: PreviewEntry[] };

export const DESIGN_SYSTEM = {
  title: 'Virtual IoT Lab Design System',
  description: 'A compact engineering-tool language for circuit editing, code, and simulation state.',
} as const;

export const OVERVIEW_ENTRY: PreviewEntry = {
  id: 'overview',
  name: 'Overview',
  description: 'The visual foundations and principles extracted from Virtual IoT Lab.',
  Page: OverviewPage,
};

export const NAV_GROUPS: NavGroup[] = [
  { name: 'Brand', entries: [] },
  { name: 'Colors', entries: [{ id: 'color-roles', name: 'Color roles', description: 'Signal teal, hardware amber, instrument surfaces, and semantic states.', Page: ColorsPage }] },
  { name: 'Fonts', entries: [{ id: 'type-scale', name: 'Type scale', description: 'Outfit hierarchy and DM Mono technical metadata.', Page: FontsPage }] },
  { name: 'Layout', entries: [{ id: 'spacing-radius', name: 'Spacing and surfaces', description: 'Four-pixel rhythm, 24px workspace units, and compact surfaces.', Page: LayoutPage }] },
  {
    name: 'Engineering components',
    entries: [
      { id: 'instrument-header', name: 'Instrument header', description: 'Project identity, file actions, runtime controls, and status.', Page: InstrumentHeaderDemo },
      { id: 'component-palette', name: 'Component palette', description: 'Grouped hardware parts with technical descriptions and add affordances.', Page: ComponentPaletteDemo },
      { id: 'workspace-editor', name: 'Workspace editor', description: 'Grid, modes, circuit objects, selection, and signal wires.', Page: WorkspaceEditorDemo },
      { id: 'inspector-panel', name: 'Inspector panel', description: 'Precise transform fields, object state, and component properties.', Page: InspectorPanelDemo },
      { id: 'serial-monitor', name: 'Serial monitor', description: 'Dark output surface for runtime messages and copy/clear actions.', Page: SerialMonitorDemo },
    ],
  },
  { name: 'Content', entries: [] },
  { name: 'Charts', entries: [] },
  { name: 'Motion', entries: [] },
  { name: 'Applied examples', entries: [] },
];

export const ALL_ENTRIES: PreviewEntry[] = [OVERVIEW_ENTRY, ...NAV_GROUPS.flatMap((group) => group.entries)];
const duplicateIds = ALL_ENTRIES.map((entry) => entry.id).filter((id, index, ids) => ids.indexOf(id) !== index);
if (duplicateIds.length > 0) throw new Error(`Duplicate preview page id(s): ${[...new Set(duplicateIds)].join(', ')}`);