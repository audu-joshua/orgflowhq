export const COLORS = {
  primary: "#2563EB",
  accent: "#10B981",
  background: "#F9FAFB",
  text: "#111827",
  border: "#E5E7EB",
}

export const APPLICATION_STATUS = {
  NEW: "new",
  SHORTLISTED: "shortlisted",
  INTERVIEWED: "interviewed",
  HIRED: "hired",
} as const

export const STATUS_LABELS = {
  [APPLICATION_STATUS.NEW]: "New",
  [APPLICATION_STATUS.SHORTLISTED]: "Shortlisted",
  [APPLICATION_STATUS.INTERVIEWED]: "Interviewed",
  [APPLICATION_STATUS.HIRED]: "Hired",
} as const
