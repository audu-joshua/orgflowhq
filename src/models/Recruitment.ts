import mongoose, { Schema, Document, model, models } from "mongoose";
import { IApplication as IApplicationBase, IInterview as IInterviewBase } from "./types";

export interface IApplication extends IApplicationBase, Document {
    _id: any;
}

const ApplicationSchema = new Schema<IApplication>(
    {
        roleId: { type: Schema.Types.ObjectId, ref: "JobRole", required: true },
        organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
        applicantName: { type: String, required: true },
        applicantEmail: { type: String, required: true },
        applicantPhone: String,
        status: { type: String, default: "new" },
        currentStage: { type: String, default: "New" },
        resumeUrl: String,
        coverLetter: String,
        applicantPassport: String,
        additionalInfo: { type: Schema.Types.Mixed, default: {} },
        metadata: { type: Schema.Types.Mixed, default: {} },
        source: String,
        tags: { type: [String], default: [] },
        notes: String,
    },
    { timestamps: true }
);

ApplicationSchema.index({ roleId: 1 });
ApplicationSchema.index({ organizationId: 1 });
ApplicationSchema.index({ applicantEmail: 1 });

export const Application = models.Application || model<IApplication>("Application", ApplicationSchema);

// --- Interview Model ---
export interface IInterview extends IInterviewBase, Document {
    _id: any;
}

const InterviewSchema = new Schema<IInterview>(
    {
        organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
        applicationId: { type: Schema.Types.ObjectId, ref: "Application", required: true },
        roleId: { type: Schema.Types.ObjectId, ref: "JobRole", required: true },
        type: { type: String, enum: ["virtual", "in_person"], default: "virtual" },
        status: { type: String, enum: ["scheduled", "completed", "missed"], default: "scheduled" },
        scheduledAt: { type: Date, required: true },
        duration: { type: Number, default: 30 },
        meetingLink: String,
        location: String,
        organizerId: { type: Schema.Types.ObjectId, ref: "User" },
        googleEventId: String,
    },
    { timestamps: true }
);

export const Interview = models.Interview || model<IInterview>("Interview", InterviewSchema);
