"use server"

import { applicationService } from "./services/applicationService";
import { mailService } from "@/lib/mail/mailService";
import { connectToDatabase } from "@/lib/mongodb";
import { Organization } from "@/models/User";
import { JobRole, Timesheet } from "@/models/Business";
import { Application as ApplicationModel } from "@/models/Recruitment";
import { onboardingService } from "@/features/departments/services/onboardingService";
import mongoose from "mongoose";

export async function updateApplicationStatusAction(
    applicationId: string,
    newStage: string,
    organizationId: string
) {
    try {
        await connectToDatabase();

        // 1. Update DB Status - applicationService already refactored
        const application = await applicationService.updateApplicationStage(applicationId, newStage);

        // 2. Fetch Organization and Role details for Email
        const orgData = await Organization.findById(organizationId);
        if (!orgData) throw new Error("Organization not found");

        const appData = await ApplicationModel.findById(applicationId).populate("roleId");
        if (!appData) throw new Error("Application not found");

        const orgName = orgData.name || "OrgFlow";
        const roleData = appData.roleId as any;
        const roleTitle = roleData?.title || "Position";

        // 3. Trigger Email Notifications & Automation
        if (newStage === "Hired") {
            await mailService.sendCongratulatoryEmail(
                appData.applicantEmail,
                appData.applicantName,
                roleTitle,
                orgName,
                orgData.welcome_doc_url // Note: check if field exists in Mongoose model
            );

            await new Promise(resolve => setTimeout(resolve, 3000));

            try {
                await onboardingService.onboardHiredCandidate({
                    applicantName: appData.applicantName,
                    applicantEmail: appData.applicantEmail,
                    roleTitle: roleTitle,
                    organizationId: organizationId,
                    departmentName: roleData?.department,
                    applicantPassport: appData.applicantPassport
                });
            } catch (e: any) {
                console.error("Failed to automate onboarding:", e);
                return {
                    success: true,
                    application,
                    onboardingError: e.message || "Failed to automate onboarding"
                };
            }
        } else if (newStage === "Rejected") {
            await mailService.sendRejectionEmail(
                appData.applicantEmail,
                appData.applicantName,
                roleTitle,
                orgName
            );
        }

        return { success: true, application };
    } catch (error: any) {
        console.error("Failed to update status:", error);
        return { success: false, error: error.message };
    }
}

export async function bulkRejectRemainingAction(roleId: string, organizationId: string) {
    try {
        await connectToDatabase();

        // 1. Fetch all pending applications for this role
        const pendingApps = await ApplicationModel.find({
            roleId: new mongoose.Types.ObjectId(roleId),
            currentStage: { $nin: ["Hired", "Rejected"] }
        });

        if (!pendingApps || pendingApps.length === 0) {
            return { success: true, count: 0 };
        }

        // 2. Get data for email
        const orgData = await Organization.findById(organizationId);
        const roleData = await JobRole.findById(roleId);

        const orgName = orgData?.name || "OrgFlow";
        const roleTitle = roleData?.title || "Position";

        // 3. Bulk Update in DB
        await ApplicationModel.updateMany(
            {
                roleId: new mongoose.Types.ObjectId(roleId),
                currentStage: { $nin: ["Hired", "Rejected"] }
            },
            {
                $set: {
                    currentStage: "Rejected",
                    status: "rejected"
                }
            }
        );

        // 4. Send Emails (Non-blocking)
        pendingApps.forEach((app) => {
            mailService.sendRejectionEmail(
                app.applicantEmail,
                app.applicantName,
                roleTitle,
                orgName
            );
        });

        return { success: true, count: pendingApps.length };
    } catch (error: any) {
        console.error("Bulk rejection failed:", error);
        return { success: false, error: error.message };
    }
}

export async function submitApplicationAction(
    organizationId: string,
    applicationData: any
) {
    try {
        await connectToDatabase();

        // 1. Create Application
        await ApplicationModel.create({
            ...applicationData,
            roleId: new mongoose.Types.ObjectId(applicationData.role_id),
            organizationId: new mongoose.Types.ObjectId(organizationId),
            applicantName: applicationData.applicant_name,
            applicantEmail: applicationData.applicant_email,
            applicantPhone: applicationData.applicant_phone,
            resumeUrl: applicationData.resume_url,
            coverLetter: applicationData.cover_letter,
            applicantPassport: applicationData.applicant_passport,
            status: "new",
            currentStage: "New"
        });

        // 2. Fetch Org and Role details
        const org = await Organization.findById(organizationId);
        const role = await JobRole.findById(applicationData.role_id);

        const orgName = org?.name || "OrgFlow";
        const roleTitle = role?.title || "Position";

        // 3. Send Acknowledgement
        mailService.sendAcknowledgementEmail(
            applicationData.applicant_email,
            applicationData.applicant_name,
            roleTitle,
            orgName
        ).catch(e => console.error("Failed to send ack email:", e));

        return { success: true };
    } catch (error: any) {
        console.error("Application submission failed:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteApplicationAction(applicationId: string) {
    try {
        await connectToDatabase();
        await ApplicationModel.findByIdAndDelete(applicationId);
        return { success: true };
    } catch (error: any) {
        console.error("Delete application failed:", error);
        return { success: false, error: error.message };
    }
}
export async function getApplicationsByOrganizationAction(organizationId: string) {
    try {
        await connectToDatabase();
        const records = await ApplicationModel.find({
            organizationId: new mongoose.Types.ObjectId(organizationId)
        }).populate("roleId").sort({ createdAt: -1 });

        return records.map(doc => {
            const obj = doc.toObject();
            return {
                id: obj._id.toString(),
                role_id: obj.roleId?._id?.toString() || obj.roleId?.toString(),
                organization_id: obj.organizationId?.toString(),
                applicant_name: obj.applicantName,
                applicant_email: obj.applicantEmail,
                applicant_phone: obj.applicantPhone,
                status: obj.status,
                current_stage: obj.currentStage,
                resume_url: obj.resumeUrl,
                cover_letter: obj.coverLetter,
                applicant_passport: obj.applicantPassport,
                additional_info: obj.additionalInfo,
                metadata: obj.metadata,
                source: obj.source,
                tags: obj.tags,
                notes: obj.notes,
                created_at: obj.createdAt?.toISOString(),
                updated_at: obj.updatedAt?.toISOString(),
                roles: obj.roleId ? { title: obj.roleId.title } : undefined
            };
        });
    } catch (error) {
        console.error("Failed to fetch applications:", error);
        return [];
    }
}

export async function getApplicationByIdAction(applicationId: string) {
    try {
        await connectToDatabase();
        const data = await ApplicationModel.findById(applicationId).populate("roleId");
        if (!data) return null;

        const obj = data.toObject();
        return {
            id: obj._id.toString(),
            role_id: obj.roleId?._id?.toString() || obj.roleId?.toString(),
            organization_id: obj.organizationId?.toString(),
            applicant_name: obj.applicantName,
            applicant_email: obj.applicantEmail,
            applicant_phone: obj.applicantPhone,
            status: obj.status,
            current_stage: obj.currentStage,
            resume_url: obj.resumeUrl,
            cover_letter: obj.coverLetter,
            applicant_passport: obj.applicantPassport,
            additional_info: obj.additionalInfo,
            metadata: obj.metadata,
            source: obj.source,
            tags: obj.tags,
            notes: obj.notes,
            created_at: obj.createdAt?.toISOString(),
            updated_at: obj.updatedAt?.toISOString(),
            roles: obj.roleId ? { title: obj.roleId.title } : undefined
        };
    } catch (error) {
        console.error("Failed to fetch application:", error);
        return null;
    }
}

export async function getApplicationsByRoleAction(roleId: string) {
    try {
        await connectToDatabase();
        const records = await ApplicationModel.find({
            roleId: new mongoose.Types.ObjectId(roleId)
        }).sort({ createdAt: -1 });

        return records.map(doc => {
            const obj = doc.toObject();
            return {
                id: obj._id.toString(),
                role_id: obj.roleId?.toString(),
                organization_id: obj.organizationId?.toString(),
                applicant_name: obj.applicantName,
                applicant_email: obj.applicantEmail,
                applicant_phone: obj.applicantPhone,
                status: obj.status,
                current_stage: obj.currentStage,
                resume_url: obj.resumeUrl,
                cover_letter: obj.coverLetter,
                applicant_passport: obj.applicantPassport,
                additional_info: obj.additionalInfo,
                metadata: obj.metadata,
                source: obj.source,
                tags: obj.tags,
                notes: obj.notes,
                created_at: obj.createdAt?.toISOString(),
                updated_at: obj.updatedAt?.toISOString()
            };
        });
    } catch (error) {
        console.error("Failed to fetch applications for role:", error);
        return [];
    }
}
