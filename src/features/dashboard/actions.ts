"use server"

import { dashboardService } from "./services/dashboardService";

export async function getDashboardRolesAction(organizationId: string) {
    try {
        return await dashboardService.getRoles(organizationId);
    } catch (error) {
        console.error("Failed to fetch dashboard roles:", error);
        return [];
    }
}

export async function getApplicationStatsAction(organizationId: string) {
    try {
        return await dashboardService.getApplicationStats(organizationId);
    } catch (error) {
        console.error("Failed to fetch application stats:", error);
        return { total: 0, new: 0, shortlisted: 0, interviewed: 0, hired: 0 };
    }
}

export async function getApplicationsOverTimeAction(organizationId: string) {
    try {
        return await dashboardService.getApplicationsOverTime(organizationId);
    } catch (error) {
        console.error("Failed to fetch applications over time:", error);
        return [];
    }
}

export async function getEmployeeStatsAction(organizationId: string) {
    try {
        return await dashboardService.getEmployeeStats(organizationId);
    } catch (error) {
        console.error("Failed to fetch employee stats:", error);
        return { total: 0, active: 0, invited: 0, inactive: 0 };
    }
}

export async function getTimesheetStatsAction(organizationId: string) {
    try {
        return await dashboardService.getTimesheetStats(organizationId);
    } catch (error) {
        console.error("Failed to fetch timesheet stats:", error);
        return { total: 0, pending: 0, approved: 0, rejected: 0 };
    }
}
