import { create } from 'zustand';
import { ScanSession, ScanStatus, ScanError, Recipe } from '@/types';

interface ScanSessionState {
  currentSession: ScanSession | null;
  isScanning: boolean;
  
  // Actions
  startSession: (imageUri: string) => void;
  updateStatus: (status: ScanStatus) => void;
  setImageBase64: (base64: string) => void;
  setDetectedIngredients: (ingredients: string[]) => void;
  setGeneratedRecipe: (recipe: Recipe) => void;
  setError: (error: ScanError) => void;
  completeSession: () => void;
  resetSession: () => void;
}

export const useScanSessionStore = create<ScanSessionState>((set) => ({
  currentSession: null,
  isScanning: false,

  startSession: (imageUri: string) => {
    const session: ScanSession = {
      id: `scan_${Date.now()}`,
      status: 'capturing',
      imageUri,
      detectedIngredients: [],
      generatedRecipe: null,
      error: null,
      startedAt: new Date(),
    };
    
    set({ currentSession: session, isScanning: true });
  },

  updateStatus: (status: ScanStatus) => {
    set((state) => {
      if (!state.currentSession) return state;
      
      return {
        currentSession: {
          ...state.currentSession,
          status,
        },
      };
    });
  },

  setImageBase64: (base64: string) => {
    set((state) => {
      if (!state.currentSession) return state;
      
      return {
        currentSession: {
          ...state.currentSession,
          imageBase64: base64,
        },
      };
    });
  },

  setDetectedIngredients: (ingredients: string[]) => {
    set((state) => {
      if (!state.currentSession) return state;
      
      return {
        currentSession: {
          ...state.currentSession,
          detectedIngredients: ingredients,
        },
      };
    });
  },

  setGeneratedRecipe: (recipe: Recipe) => {
    set((state) => {
      if (!state.currentSession) return state;
      
      return {
        currentSession: {
          ...state.currentSession,
          generatedRecipe: recipe,
          status: 'success',
        },
      };
    });
  },

  setError: (error: ScanError) => {
    set((state) => {
      if (!state.currentSession) return state;
      
      return {
        currentSession: {
          ...state.currentSession,
          error,
          status: 'error',
        },
      };
    });
  },

  completeSession: () => {
    set((state) => {
      if (!state.currentSession) return state;
      
      return {
        currentSession: {
          ...state.currentSession,
          completedAt: new Date(),
        },
        isScanning: false,
      };
    });
  },

  resetSession: () => {
    set({ currentSession: null, isScanning: false });
  },
}));
