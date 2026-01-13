import { create } from 'zustand'
import { ManagementModule } from '../types'

interface ModuleStore {
  enabledModules: ManagementModule[]
  setEnabledModules: (modules: ManagementModule[]) => void
  hasModule: (module: ManagementModule) => boolean
  clearModules: () => void
}

export const useModuleStore = create<ModuleStore>((set, get) => ({
  enabledModules: [],
  setEnabledModules: (modules) => set({ enabledModules: modules }),
  hasModule: (module) => get().enabledModules.includes(module),
  clearModules: () => set({ enabledModules: [] }),
}))

