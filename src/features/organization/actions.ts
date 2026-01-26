"use server"

import { organizationService } from "./services/organizationService";
import { revalidatePath } from "next/cache";

export async function getOrganizationSubscriptionAction(organizationId: string) {
    try {
        return await organizationService.getOrganizationSubscription(organizationId);
    } catch (error) {
        console.error("Failed to fetch organization subscription:", error);
        return null;
    }
}

export async function getOrganizationStaffAction(organizationId: string) {
    try {
        return await organizationService.getOrganizationStaff(organizationId);
    } catch (error) {
        console.error("Failed to fetch organization staff:", error);
        return [];
    }
}

export async function verifyOrganizationPaymentAction(reference: string, organizationId: string) {
    // This is handled by a POST API route originally, but can be an action too
    return { success: false, error: "Use API route for payment verification" };
}

export async function getOrganizationBySlugAction(slug: string) {
    try {
        return await organizationService.getOrganizationBySlug(slug);
    } catch (error) {
        console.error("Failed to fetch organization by slug:", error);
        return null;
    }
}
