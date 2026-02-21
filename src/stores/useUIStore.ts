/**
 * Zustand UI Store — Layout & Preference State
 *
 * Global UI state that persists across sessions.
 * Covers sidebar, dock, theme, and panel preferences.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ─── Types ──────────────────────────────────────────────────────────────────

export type ThemeMode = 'light' | 'dark' | 'system';
export type DockPosition = 'bottom' | 'left' | 'right';
export type SidebarState = 'expanded' | 'collapsed' | 'hidden';

interface UIState {
  // Theme
  themeMode: ThemeMode;

  // Sidebar
  sidebarState: SidebarState;

  // Guide dock
  dockPosition: DockPosition;
  dockVisible: boolean;
  activeCharacterId: string | null;

  // Panels
  panelStates: Record<string, boolean>;

  // Last visited routes per product
  lastVisitedTabs: Record<string, string>;
}

interface UIActions {
  setThemeMode: (mode: ThemeMode) => void;
  setSidebarState: (state: SidebarState) => void;
  toggleSidebar: () => void;

  setDockPosition: (position: DockPosition) => void;
  setDockVisible: (visible: boolean) => void;
  setActiveCharacter: (id: string | null) => void;

  setPanelOpen: (panelId: string, open: boolean) => void;
  togglePanel: (panelId: string) => void;

  setLastVisitedTab: (product: string, tab: string) => void;
  getLastVisitedTab: (product: string) => string | undefined;
}

type UIStore = UIState & UIActions;

// ─── Store ──────────────────────────────────────────────────────────────────

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      // ── State ──
      themeMode: 'system',
      sidebarState: 'expanded',
      dockPosition: 'bottom',
      dockVisible: true,
      activeCharacterId: null,
      panelStates: {},
      lastVisitedTabs: {},

      // ── Theme ──
      setThemeMode: (mode) => set({ themeMode: mode }),

      // ── Sidebar ──
      setSidebarState: (state) => set({ sidebarState: state }),
      toggleSidebar: () =>
        set((s) => ({
          sidebarState: s.sidebarState === 'expanded' ? 'collapsed' : 'expanded',
        })),

      // ── Dock ──
      setDockPosition: (position) => set({ dockPosition: position }),
      setDockVisible: (visible) => set({ dockVisible: visible }),
      setActiveCharacter: (id) => set({ activeCharacterId: id }),

      // ── Panels ──
      setPanelOpen: (panelId, open) =>
        set((s) => ({
          panelStates: { ...s.panelStates, [panelId]: open },
        })),
      togglePanel: (panelId) =>
        set((s) => ({
          panelStates: {
            ...s.panelStates,
            [panelId]: !s.panelStates[panelId],
          },
        })),

      // ── Tab Memory ──
      setLastVisitedTab: (product, tab) =>
        set((s) => ({
          lastVisitedTabs: { ...s.lastVisitedTabs, [product]: tab },
        })),
      getLastVisitedTab: (product) => get().lastVisitedTabs[product],
    }),
    {
      name: 'genie-ui-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ─── Selector Hooks ─────────────────────────────────────────────────────────

export const useThemeMode = () => useUIStore((s) => s.themeMode);
export const useSidebarState = () => useUIStore((s) => s.sidebarState);
export const useDockState = () =>
  useUIStore((s) => ({
    position: s.dockPosition,
    visible: s.dockVisible,
    activeCharacterId: s.activeCharacterId,
  }));
