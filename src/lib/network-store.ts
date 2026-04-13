import { create } from "zustand";

interface NetworkStore {
  selectedEntityPreview: string | null;
  checkedEntities: Set<string>;
  isSubBatchSheetOpen: boolean;
  setSelectedPreview: (id: string | null) => void;
  toggleCheck: (id: string) => void;
  clearChecked: () => void;
  setSubBatchOpen: (isOpen: boolean) => void;
}

export const useNetworkStore = create<NetworkStore>((set) => ({
  selectedEntityPreview: null,
  checkedEntities: new Set(),
  isSubBatchSheetOpen: false,
  setSelectedPreview: (id) =>
    set((state) => ({
      selectedEntityPreview: state.selectedEntityPreview === id ? null : id,
    })),
  toggleCheck: (id) =>
    set((state) => {
      const next = new Set(state.checkedEntities);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { checkedEntities: next };
    }),
  clearChecked: () => set({ checkedEntities: new Set() }),
  setSubBatchOpen: (isOpen) => set({ isSubBatchSheetOpen: isOpen }),
}));
