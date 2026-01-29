"use server"

import { timesheetService } from "./services/timesheetService";
import { revalidatePath } from "next/cache";

export async function clockInAction(employeeId: string, organizationId: string, userId?: string) {
    try {
        const record = await timesheetService.clockIn(employeeId, organizationId, userId);
        revalidatePath("/dashboard/timesheets");
        return { success: true, record };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function clockOutAction(timesheetId: string) {
    try {
        const record = await timesheetService.clockOut(timesheetId);
        revalidatePath("/dashboard/timesheets");
        return { success: true, record };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getEmployeeTimesheetsAction(employeeId: string) {
    try {
        return await timesheetService.getEmployeeTimesheets(employeeId);
    } catch (error) {
        console.error("Failed to fetch employee timesheets:", error);
        return [];
    }
}

export async function getAllTimesheetsAction(organizationId: string) {
    try {
        return await timesheetService.getAllTimesheets(organizationId);
    } catch (error) {
        console.error("Failed to fetch all timesheets:", error);
        return [];
    }
}

export async function updateTimesheetStatusAction(timesheetId: string, status: 'approved' | 'rejected') {
    try {
        await timesheetService.updateTimesheetStatus(timesheetId, status);
        revalidatePath("/dashboard/timesheets");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateTimesheetsStatusAction(timesheetIds: string[], status: 'approved' | 'rejected') {
    try {
        await timesheetService.updateTimesheetsStatus(timesheetIds, status);
        revalidatePath("/dashboard/timesheets");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createTimesheetAction(timesheetData: any) {
    try {
        const record = await timesheetService.createTimesheet(timesheetData);
        revalidatePath("/dashboard/timesheets");
        return { success: true, record };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function adminUpdateTimesheetAction(timesheetId: string, updates: any) {
    try {
        const record = await timesheetService.adminUpdateTimesheet(timesheetId, updates);
        revalidatePath("/dashboard/timesheets");
        return { success: true, record };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
