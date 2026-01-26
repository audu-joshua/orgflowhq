"use server"

import { roleService } from "./services/roleService";
import { revalidatePath } from "next/cache";

export async function getRolesByOrganizationAction(organizationId: string) {
    try {
        return await roleService.getRolesByOrganization(organizationId);
    } catch (error) {
        console.error("Failed to fetch roles:", error);
        return [];
    }
}

export async function getRoleByIdAction(roleId: string) {
    try {
        return await roleService.getRoleById(roleId);
    } catch (error) {
        console.error("Failed to fetch role:", error);
        return null;
    }
}

export async function getRoleBySlugAction(slug: string) {
    try {
        return await roleService.getRoleBySlug(slug);
    } catch (error) {
        console.error("Failed to fetch role by slug:", error);
        return null;
    }
}

export async function getAllOpenRolesAction() {
    try {
        return await roleService.getAllOpenRoles();
    } catch (error) {
        console.error("Failed to fetch open roles:", error);
        return [];
    }
}

export async function createRoleAction(organizationId: string, roleData: any) {
    try {
        const role = await roleService.createRole(organizationId, roleData);
        revalidatePath("/dashboard/roles");
        return { success: true, role };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateRoleAction(roleId: string, roleData: any) {
    try {
        const role = await roleService.updateRole(roleId, roleData);
        revalidatePath("/dashboard/roles");
        revalidatePath(`/dashboard/roles/${roleId}`);
        return { success: true, role };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteRoleAction(roleId: string) {
    try {
        await roleService.deleteRole(roleId);
        revalidatePath("/dashboard/roles");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
export async function updateRoleStatusAction(roleId: string, status: 'active' | 'closed') {
    try {
        const role = await roleService.updateRoleStatus(roleId, status);
        revalidatePath("/dashboard");
        revalidatePath("/dashboard/roles");
        return role;
    } catch (error: any) {
        throw new Error(error.message);
    }
}
