import { create } from 'zustand'

export const useAppStore = create((set) => ({
  status: 'idle', // 'idle' | 'running' | 'planning'
  setStatus: (status) => set({ status }),
}))
