import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { User } from "@/features/auth/types"
import type { Organization } from "@/features/organization/types"

interface AppStore {
  user: User | null
  organization: Organization | null
  isSidebarCollapsed: boolean
  isInitialized: boolean
  setUser: (user: User | null) => void
  setOrganization: (org: Organization | null) => void
  setInitialized: (val: boolean) => void
  toggleSidebar: () => void
  clearStore: () => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      user: null,
      organization: null,
      isSidebarCollapsed: false,
      isInitialized: false,
      setUser: (user) => set({ user }),
      setOrganization: (organization) => set({ organization }),
      setInitialized: (isInitialized) => set({ isInitialized }),
      toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      clearStore: () => set({ user: null, organization: null, isSidebarCollapsed: false, isInitialized: false }),
    }),
    {
      name: "app-store", // name of the item in localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        organization: state.organization,
        isSidebarCollapsed: state.isSidebarCollapsed,
      }),
    }
  )
)
