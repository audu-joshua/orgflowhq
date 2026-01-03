import { LayoutDashboard, Briefcase, FileText, Building, Users, Clock, Settings, Banknote } from "lucide-react"

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
        allowedRoles: ["owner", "admin", "hr", "manager", "finance"]
    },
    {
        href: "/dashboard/roles",
        label: "Roles",
        icon: Briefcase,
        allowedRoles: ["owner", "admin", "hr", "manager"]
    },
    {
        href: "/dashboard/departments",
        label: "Departments",
        icon: Building,
        allowedRoles: ["owner", "admin", "hr", "manager"]
    },
    {
        href: "/dashboard/employees",
        label: "Employees",
        icon: Users,
        allowedRoles: ["owner", "admin", "hr", "manager"]
    },
    {
        href: "/dashboard/applications",
        label: "Applications",
        icon: FileText,
        allowedRoles: ["owner", "admin", "hr", "manager"]
    },
    {
        href: "/dashboard/timesheets",
        label: "Timesheets",
        icon: Clock,
        allowedRoles: ["owner", "admin", "hr", "manager", "finance"]
    },
    {
        href: "/dashboard/settings",
        label: "Settings",
        icon: Settings,
        allowedRoles: ["owner"]
    },
    {
        href: "/dashboard/payroll",
        label: "Payroll",
        icon: Banknote
    },
]
