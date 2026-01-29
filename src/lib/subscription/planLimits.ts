
import { organizationService } from "@/features/organization/services/organizationService"

export const PLAN_LIMITS = {
    free: {
        roles: 5,
        employees: 0, // "No Employee Profiles"
    },
    'mid-monthly': {
        roles: Infinity,
        employees: 20,
    },
    'mid-yearly': {
        roles: Infinity,
        employees: 20,
    },
    'premium-monthly': {
        roles: Infinity,
        employees: Infinity,
    },
    'premium-yearly': {
        roles: Infinity,
        employees: Infinity,
    }
}

export const planLimitsService = {
    async checkRoleLimit(organizationId: string) {
        const subscription = await organizationService.getOrganizationSubscription(organizationId)
        // Default to free if no subscription
        const planSlug = subscription?.plan?.slug || 'free'

        // Safety check: if plan slug is unknown, default to free
        const limit = (PLAN_LIMITS as any)[planSlug]?.roles ?? PLAN_LIMITS.free.roles

        if (limit === Infinity) return { allowed: true }

        // Count existing roles
        const roles = await import("@/features/roles/services/roleService")
            .then(m => m.roleService.getRolesByOrganization(organizationId))

        if (roles.length >= limit) {
            return {
                allowed: false,
                message: `Plan limit reached. Your current plan allows ${limit} roles. Please upgrade to add more.`
            }
        }

        return { allowed: true }
    },

    async checkEmployeeLimit(organizationId: string) {
        const subscription = await organizationService.getOrganizationSubscription(organizationId)
        const planSlug = subscription?.plan?.slug || 'free'
        const limit = (PLAN_LIMITS as any)[planSlug]?.employees ?? PLAN_LIMITS.free.employees

        if (limit === Infinity) return { allowed: true }

        // Count existing employees
        const employees = await import("@/features/departments/services/departmentService")
            .then(m => m.departmentService.getEmployeesByOrganization(organizationId))

        if (employees.length >= limit) {
            return {
                allowed: false,
                message: `Plan limit reached. Your current plan allows ${limit} employees. Please upgrade to add more.`
            }
        }

        return { allowed: true }
    }
}
