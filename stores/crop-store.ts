import { create } from "zustand";
interface CropStore {
  croppedImage: string | null;
  setCroppedImage: (img: string | null) => void;
  clearCroppedImage: () => void;
}

export const useCropStore = create<CropStore>((set) => ({
  croppedImage: null,
  setCroppedImage: (img) => set({ croppedImage: img }),
  clearCroppedImage: () => set({ croppedImage: null }),
}));
