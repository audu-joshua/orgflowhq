"use server"

import { departmentService } from "./services/departmentService";
import { eotmService } from "./services/eotmService";
import { revalidatePath } from "next/cache";

export async function getDepartmentsByOrganizationAction(organizationId: string) {
    try {
        return await departmentService.getDepartmentsByOrganization(organizationId);
    } catch (error) {
        console.error("Failed to fetch departments:", error);
        return [];
    }
}

export async function getDepartmentByIdAction(departmentId: string) {
    try {
        return await departmentService.getDepartmentById(departmentId);
    } catch (error) {
        console.error("Failed to fetch department:", error);
        return null;
    }
}

export async function createDepartmentAction(organizationId: string, departmentData: any) {
    try {
        const department = await departmentService.createDepartment(organizationId, departmentData);
        revalidatePath("/dashboard/departments");
        return { success: true, department };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateDepartmentAction(departmentId: string, departmentData: any) {
    try {
        const department = await departmentService.updateDepartment(departmentId, departmentData);
        revalidatePath("/dashboard/departments");
        revalidatePath(`/dashboard/departments/${departmentId}`);
        return { success: true, department };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteDepartmentAction(departmentId: string) {
    try {
        await departmentService.deleteDepartment(departmentId);
        revalidatePath("/dashboard/departments");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getEmployeesByOrganizationAction(organizationId: string) {
    try {
        return await departmentService.getEmployeesByOrganization(organizationId);
    } catch (error) {
        console.error("Failed to fetch employees:", error);
        return [];
    }
}

export async function getEmployeesByDepartmentAction(departmentId: string) {
    try {
        return await departmentService.getEmployeesByDepartment(departmentId);
    } catch (error) {
        console.error("Failed to fetch employees for department:", error);
        return [];
    }
}

export async function createEmployeeAction(organizationId: string, employeeData: any) {
    try {
        const employee = await departmentService.createEmployee(organizationId, employeeData);
        revalidatePath("/dashboard/employees");
        return { success: true, employee };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateEmployeeAction(employeeId: string, employeeData: any) {
    try {
        const employee = await departmentService.updateEmployee(employeeId, employeeData);
        revalidatePath("/dashboard/employees");
        return { success: true, employee };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteEmployeeAction(employeeId: string) {
    try {
        await departmentService.deleteEmployee(employeeId);
        revalidatePath("/dashboard/employees");
        revalidatePath("/dashboard/departments");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function generateNextEmployeeIdAction(organizationId: string, organizationName: string) {
    try {
        return await departmentService.generateNextEmployeeId(organizationId, organizationName);
    } catch (error) {
        console.error("Failed to generate ID:", error);
        return "PENDING";
    }
}

export async function updateSystemRoleAction(employeeId: string, organizationId: string, newRole: string | null) {
    try {
        await departmentService.updateSystemRole(employeeId, organizationId, newRole);
        revalidatePath("/dashboard/employees");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getEmployeeByUserIdAction(userId: string) {
    try {
        return await departmentService.getEmployeeByUserId(userId);
    } catch (error) {
        console.error("Failed to fetch employee by user ID:", error);
        return null;
    }
}

export async function uploadEmployeeProfileImageAction(employeeId: string, formData: FormData) {
    try {
        const file = formData.get("file") as File;
        if (!file) throw new Error("No file content");

        // This fails if passed boundary due to File object serialization? No, FormData is fine.
        // Wait, departmentService.uploadEmployeeProfileImage expects File.
        return await departmentService.uploadEmployeeProfileImage(employeeId, file);
    } catch (error: any) {
        console.error("Profile upload failed:", error);
        throw new Error(error.message);
    }
}

// EOTM Actions
export async function ensureEOTMCompetitionInitializedAction(organizationId: string) {
    try {
        return await eotmService.ensureCompetitionInitialized(organizationId);
    } catch (error) {
        console.error("Failed to init EOTM:", error);
        return null; // Handle error gracefully
    }
}

export async function getEOTMWinnerAction(competitionId: string) {
    try {
        return await eotmService.getWinner(competitionId);
    } catch (error) {
        console.error("Failed to get winner:", error);
        return null;
    }
}
