import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type FilterType = "original" | "warm" | "cool" | "pastel" | "mono" | "sepia";

interface CropStore {
  croppedImage: string | null;
  brightness: number;
  selectedFilter: FilterType;
  setCroppedImage: (img: string | null) => void;
  setBrightness: (value: number) => void;
  setSelectedFilter: (filter: FilterType) => void;
  clearCroppedImage: () => void;
  resetFilters: () => void;
  resetAll: () => void;
}

export const useCropStore = create<CropStore>()(
  persist(
    (set) => ({
      croppedImage: null,
      brightness: 100,
      selectedFilter: "original",
      setCroppedImage: (img) => set({ croppedImage: img }),
      setBrightness: (value) => set({ brightness: value }),
      setSelectedFilter: (filter) => set({ selectedFilter: filter }),
      clearCroppedImage: () => set({ croppedImage: null }),
      resetFilters: () => set({ brightness: 100, selectedFilter: "original" }),
      resetAll: () =>
        set({
          croppedImage: null,
          brightness: 100,
          selectedFilter: "original",
        }),
    }),
    {
      name: "crop-storage", // unique name for sessionStorage key
      storage: createJSONStorage(() => sessionStorage), // using sessionStorage
    }
  )
);
