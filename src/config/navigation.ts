import { LayoutDashboard, Briefcase, FileText, Building, Users, Clock, Settings, Banknote, Calendar, CreditCard } from "lucide-react"

export interface NavItem {
    href: string
    label: string
    icon: any
    allowedRoles?: string[]
}

export const navItems: NavItem[] = [
    {
        href: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        allowedRoles: ["owner", "admin", "hr", "manager", "finance", "super_admin"]
    },
    {
        href: "/dashboard/roles",
        label: "Open Roles",
        icon: Briefcase,
        allowedRoles: ["owner", "admin", "hr", "manager", "super_admin"]
    },
    {
        href: "/dashboard/departments",
        label: "Departments",
        icon: Building,
        allowedRoles: ["owner", "admin", "hr", "manager", "super_admin"]
    },
    {
        href: "/dashboard/employees",
        label: "Employees",
        icon: Users,
        allowedRoles: ["owner", "admin", "hr", "manager", "super_admin"]
    },
    {
        href: "/dashboard/applications",
        label: "Applications",
        icon: FileText,
        allowedRoles: ["owner", "admin", "hr", "manager", "super_admin"]
    },
    {
        href: "/dashboard/timesheets",
        label: "Timesheets",
        icon: Clock,
        allowedRoles: ["owner", "admin", "hr", "manager", "finance", "super_admin"]
    },
    {
        href: "/dashboard/interviews",
        label: "Interviews",
        icon: Calendar,
        allowedRoles: ["owner", "admin", "hr", "manager", "super_admin"]
    },
    {
        href: "/dashboard/settings",
        label: "Settings",
        icon: Settings,
        allowedRoles: ["owner", "super_admin"]
    },
    {
        href: "/dashboard/payroll",
        label: "Payroll",
        icon: Banknote
    },
    {
        href: "/dashboard/billing",
        label: "Billing",
        icon: CreditCard,
        allowedRoles: ["owner", "super_admin"]
    },
]
