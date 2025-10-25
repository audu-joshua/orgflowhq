import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { User } from "@/features/auth/types"
import type { Organization } from "@/features/organization/types"

interface AppStore {
  user: User | null
  organization: Organization | null
  setUser: (user: User | null) => void
  setOrganization: (org: Organization | null) => void
  clearStore: () => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      user: null,
      organization: null,
      setUser: (user) => set({ user }),
      setOrganization: (organization) => set({ organization }),
      clearStore: () => set({ user: null, organization: null }),
    }),
    {
      name: "app-store", // name of the item in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
)