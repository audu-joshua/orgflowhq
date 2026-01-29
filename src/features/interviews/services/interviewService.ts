// server-only: Do not import this file on the client. Use server actions instead.
import { connectToDatabase } from "@/lib/mongodb";
import { Interview } from "@/models/Recruitment";
import { Application } from "@/models/Recruitment";
import { JobRole } from "@/models/Business";
import { applicationService } from "@/features/applications/services/applicationService";
import { activityLogger } from "@/lib/activityLogger";
import mongoose from "mongoose";

interface ScheduleInterviewParams {
    organizationId: string;
    applicantId: string;
    roleId: string;
    type: 'virtual' | 'in_person';
    scheduledAt: Date;
    duration: number;
    meetingLink?: string;
    location?: string;
    candidateName: string;
    roleTitle: string;
    candidateEmail: string;
    performedBy: string;
}

export const interviewService = {
    async scheduleInterview(params: ScheduleInterviewParams) {
        await connectToDatabase();
        const {
            organizationId, applicantId, roleId, type, scheduledAt,
            duration, meetingLink, location, candidateName,
            roleTitle, candidateEmail, performedBy
        } = params;

        // 1. Create Interview Record
        const interview = await Interview.create({
            organizationId: new mongoose.Types.ObjectId(organizationId),
            applicationId: new mongoose.Types.ObjectId(applicantId),
            roleId: new mongoose.Types.ObjectId(roleId),
            type,
            scheduledAt,
            duration,
            meetingLink,
            location,
            status: 'scheduled',
            organizerId: new mongoose.Types.ObjectId(performedBy)
        });

        // 2. Update Application Stage
        await applicationService.updateApplicationStage(applicantId, "Interview Scheduled");

        const dateStr = scheduledAt.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const timeStr = scheduledAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        // 3. Log Activity
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

        return this.mapModelToType(interview);
    },

    async getInterviewsByRole(roleId: string) {
        await connectToDatabase();
        const records = await Interview.find({
            roleId: new mongoose.Types.ObjectId(roleId)
        }).populate("applicationId").sort({ scheduledAt: 1 });

        return records.map(this.mapModelToType);
    },

    async getInterviewsByOrganization(organizationId: string) {
        await connectToDatabase();
        const records = await Interview.find({
            organizationId: new mongoose.Types.ObjectId(organizationId)
        })
            .populate("roleId")
            .populate("applicationId")
            .sort({ scheduledAt: 1 });

        return records.map(doc => {
            const obj = doc.toObject();
            return {
                ...this.mapModelToType(doc),
                roles: obj.roleId ? { title: obj.roleId.title } : undefined,
                applications: obj.applicationId ? {
                    applicant_name: obj.applicationId.applicantName,
                    applicant_email: obj.applicationId.applicantEmail
                } : undefined
            };
        });
    },

    mapModelToType(doc: any) {
        const obj = doc.toObject ? doc.toObject() : doc;
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
            // UI Compat
            applications: obj.applicationId ? {
                applicant_name: obj.applicationId.applicantName,
                applicant_email: obj.applicationId.applicantEmail
            } : undefined
        };
    }
}
