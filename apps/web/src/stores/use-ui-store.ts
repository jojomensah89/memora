import { create } from "zustand";

type UIState = {
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  activeChatId: string | null;
  selectedContext: string[];
  sidebarWidths: { left: number; right: number };
  isMobile: boolean;
};

type UIActions = {
  setLeftSidebarOpen: (open: boolean) => void;
  setRightSidebarOpen: (open: boolean) => void;
  setActiveChatId: (chatId: string | null) => void;
  setSelectedContext: (context: string[]) => void;
  setSidebarWidths: (widths: { left: number; right: number }) => void;
  setIsMobile: (isMobile: boolean) => void;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
};

export const useUIStore = create<UIState & UIActions>((set) => ({
  // Initial state
  leftSidebarOpen: true,
  rightSidebarOpen: true,
  activeChatId: null,
  selectedContext: [],
  sidebarWidths: { left: 160, right: 280 },
  isMobile: false,

  // Actions
  setLeftSidebarOpen: (open) => set({ leftSidebarOpen: open }),
  setRightSidebarOpen: (open) => set({ rightSidebarOpen: open }),
  setActiveChatId: (chatId) => set({ activeChatId: chatId }),
  setSelectedContext: (context) => set({ selectedContext: context }),
  setSidebarWidths: (widths) => set({ sidebarWidths: widths }),
  setIsMobile: (isMobile) => set({ isMobile }),

  toggleLeftSidebar: () =>
    set((state) => ({ leftSidebarOpen: !state.leftSidebarOpen })),
  toggleRightSidebar: () =>
    set((state) => ({ rightSidebarOpen: !state.rightSidebarOpen })),
}));
