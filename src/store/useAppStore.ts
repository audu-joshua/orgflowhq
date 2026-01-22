import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { User } from "@/features/auth/types"
import type { Organization } from "@/features/organization/types"

interface AppStore {
  user: User | null
  organization: Organization | null
  employee: any | null
  isSidebarCollapsed: boolean
  isInitialized: boolean
  setUser: (user: User | null) => void
  setOrganization: (org: Organization | null) => void
  setEmployee: (employee: any | null) => void
  setInitialized: (val: boolean) => void
  toggleSidebar: () => void
  clearStore: () => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      user: null,
      organization: null,
      employee: null,
      isSidebarCollapsed: false,
      isInitialized: false,
      setUser: (user) => set({ user }),
      setOrganization: (organization) => set({ organization }),
      setEmployee: (employee) => set({ employee }),
      setInitialized: (isInitialized) => set({ isInitialized }),
      toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      clearStore: () => set({ user: null, organization: null, employee: null, isSidebarCollapsed: false, isInitialized: false }),
    }),
    {
      name: "app-store", // name of the item in localStorage
      storage: createJSONStorage(() => {
        // Safe wrapper for localStorage to handle quota exceeded errors
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => { },
            removeItem: () => { },
          }
        }
        return {
          getItem: (name: string) => {
            try {
              return localStorage.getItem(name)
            } catch (e) {
              console.error("[useAppStore] Failed to get item from localStorage:", e)
              return null
            }
          },
          setItem: (name: string, value: string) => {
            try {
              localStorage.setItem(name, value)
            } catch (e) {
              console.error("[useAppStore] Failed to set item in localStorage:", e)
              // If quota execution happens, we quietly fail to persist but don't crash the app
            }
          },
          removeItem: (name: string) => {
            try {
              localStorage.removeItem(name)
            } catch (e) {
              console.error("[useAppStore] Failed to remove item from localStorage:", e)
            }
          }
        }
      }),
      partialize: (state) => ({
        user: state.user,
        organization: state.organization,
        employee: state.employee,
        isSidebarCollapsed: state.isSidebarCollapsed,
      }),
    }
  )
)
