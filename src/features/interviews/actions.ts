"use server"

import { interviewService } from "./services/interviewService";
import { revalidatePath } from "next/cache";
import { mailService } from "@/lib/mail/mailService";
import { connectToDatabase } from "@/lib/mongodb";
import { Interview as InterviewModel, Application as ApplicationModel } from "@/models/Recruitment";
import { Organization, User } from "@/models/User";
import { JobRole } from "@/models/Business";
import { activityLogger } from "@/lib/activityLogger";
import mongoose from "mongoose";

export async function scheduleInterviewAction(formData: FormData) {
    const organizationId = formData.get("organizationId") as string;
    const applicantId = formData.get("applicantId") as string;
    const roleId = formData.get("roleId") as string;
    const type = formData.get("type") as 'virtual' | 'in_person';
    const dateStr = formData.get("date") as string;
    const timeStr = formData.get("time") as string;
    const duration = Number(formData.get("duration"));
    const link = formData.get("link") as string;
    const location = formData.get("location") as string;

    // For email context
    const candidateName = formData.get("candidateName") as string;
    const roleTitle = formData.get("roleTitle") as string;
    const candidateEmail = formData.get("candidateEmail") as string;
    const performedBy = formData.get("performedBy") as string;

    const scheduledAt = new Date(`${dateStr}T${timeStr}`);

    try {
        await connectToDatabase();

        // 1. Google Calendar Logic (Mocked or using existing integration models)
        // For now, focusing on DB updates. Integration tokens moved to MongoDB in Plan.
        let meetingLinkToSave = link;
        let googleEventId = null;

        // 2. Create Interview Record
        const interview = await InterviewModel.create({
            organizationId: new mongoose.Types.ObjectId(organizationId),
            applicationId: new mongoose.Types.ObjectId(applicantId),
            roleId: new mongoose.Types.ObjectId(roleId),
            type,
            scheduledAt,
            duration,
            meetingLink: meetingLinkToSave,
            location,
            status: 'scheduled',
            organizerId: performedBy ? new mongoose.Types.ObjectId(performedBy) : undefined,
            googleEventId
        });

        // 3. Update Applicant Stage
        await ApplicationModel.findByIdAndUpdate(applicantId, {
            $set: {
                status: "interviewed",
                currentStage: "Interview Scheduled"
            }
        });

        // 4. Log Activity
        await activityLogger.logActivity(
            organizationId,
            'interview',
            interview._id.toString(),
            'scheduled',
            `Interview scheduled for ${dateStr} at ${timeStr}`,
            performedBy
        );

        await activityLogger.logActivity(
            organizationId,
            'application',
            applicantId,
            'interview_scheduled',
            `Interview scheduled for ${roleTitle}`,
            performedBy
        );

        // 5. Fetch Additional info for Email
        const orgData = await Organization.findById(organizationId);

        // Find Owner for reply-to
        const ownerRelation = await User.findOne({
            "memberships": {
                $elemMatch: { organizationId: new mongoose.Types.ObjectId(organizationId), role: "owner" }
            }
        });

        const orgName = orgData?.name || "OrgFlow";
        const orgAddress = orgData?.address || location || "TBD";
        const orgEmail = ownerRelation?.email || "help@orgflowhq.com";

        // 6. Send Email Invitation
        const dateFormatted = scheduledAt.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const timeFormatted = scheduledAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        try {
            await mailService.sendInterviewInvitation(
                candidateEmail,
                candidateName,
                roleTitle,
                dateFormatted,
                timeFormatted,
                type,
                (type === 'virtual' ? meetingLinkToSave : orgAddress) || 'TBD',
                orgName,
                orgEmail
            );

            const additionalAttendees = formData.getAll("attendeeEmails") as string[];
            for (const attendeeEmail of additionalAttendees) {
                await mailService.sendInterviewInvitation(
                    attendeeEmail,
                    "Team Member",
                    roleTitle,
                    dateFormatted,
                    timeFormatted,
                    type,
                    (type === 'virtual' ? meetingLinkToSave : orgAddress) || 'TBD',
                    orgName,
                    orgEmail
                );
            }
        } catch (emailError) {
            console.error("Failed to send email invite:", emailError);
        }

        revalidatePath('/dashboard/applications');
        revalidatePath(`/dashboard/roles/${roleId}`);
        revalidatePath('/dashboard/interviews');

        return { success: true };
    } catch (error: any) {
        console.error("Action Error:", error);
        return { success: false, error: error.message || "Failed to schedule interview" };
    }
}

export async function deleteInterviewAction(interviewId: string) {
    try {
        await connectToDatabase();

        const interview = await InterviewModel.findById(interviewId);
        if (!interview) throw new Error("Interview not found");

        await InterviewModel.findByIdAndDelete(interviewId);

        // Log Activity
        await activityLogger.logActivity(
            interview.organizationId.toString(),
            'interview',
            interview._id.toString(),
            'deleted',
            `Interview deleted`
        );

        revalidatePath('/dashboard/interviews');
        revalidatePath('/dashboard/applications');

        return { success: true };
    } catch (error: any) {
        console.error("Delete Error:", error);
        return { success: false, error: error.message || "Failed to delete interview" };
    }
}
export async function getInterviewsByOrganizationAction(organizationId: string) {
    try {
        await connectToDatabase();
        const records = await InterviewModel.find({
            organizationId: new mongoose.Types.ObjectId(organizationId)
        })
            .populate("roleId")
            .populate("applicationId")
            .sort({ scheduledAt: 1 });

        return records.map(doc => {
            const obj = doc.toObject();
            return {
                id: obj._id.toString(),
                organization_id: obj.organizationId.toString(),
                applicant_id: obj.applicationId?._id?.toString() || obj.applicationId?.toString(),
                role_id: obj.roleId?._id?.toString() || obj.roleId?.toString(),
                type: obj.type,
                status: obj.status,
                scheduled_at: obj.scheduledAt.toISOString(),
                duration: obj.duration,
                meeting_link: obj.meetingLink,
                location: obj.location,
                organizer_id: obj.organizerId?.toString(),
                google_event_id: obj.googleEventId,
                created_at: obj.createdAt.toISOString(),
                updated_at: obj.updatedAt.toISOString(),
                roles: obj.roleId ? { title: obj.roleId.title } : undefined,
                applications: obj.applicationId ? {
                    applicant_name: obj.applicationId.applicantName,
                    applicant_email: obj.applicationId.applicantEmail
                } : undefined
            };
        });
    } catch (error) {
        console.error("Failed to fetch interviews:", error);
        return [];
    }
}
