import { create } from "zustand"
import type { User } from "@/features/auth/types"
import type { Organization } from "@/features/organization/types"

interface AppStore {
  user: User | null
  organization: Organization | null
  setUser: (user: User | null) => void
  setOrganization: (org: Organization | null) => void
  clearStore: () => void
}

export const useAppStore = create<AppStore>((set) => ({
  user: null,
  organization: null,
  setUser: (user) => set({ user }),
  setOrganization: (organization) => set({ organization }),
  clearStore: () => set({ user: null, organization: null }),
}))
