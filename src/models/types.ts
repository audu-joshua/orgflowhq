import { Types } from "mongoose";

// Helper for ID types that can be either ObjectId (server) or string (client)
export type MongoId = any; // Using any for compatibility or string | Types.ObjectId

export interface IRoleImage {
    imageUrl: string;
    displayOrder: number;
    createdAt: Date;
}

export interface IOrganization {
    _id: MongoId;
    name: string;
    slug: string;
    logoUrl?: string;
    website?: string;
    description?: string;
    contactEmail?: string;
    address?: string;
    welcomeDocUrl?: string;
    deleteConfirmationCode?: string;
    deleteConfirmationExpiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUser {
    _id: MongoId;
    name?: string;
    email: string;
    image?: string;
    emailVerified?: Date;
    password?: string;
    fullName?: string;
    profileImageUrl?: string;
    role: "super_admin" | "user";
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    memberships: {
        organizationId: MongoId;
        role: "owner" | "admin" | "hr" | "manager" | "finance" | "member";
    }[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IEmployee {
    _id: MongoId;
    organizationId: MongoId;
    userId?: MongoId;
    departmentId?: MongoId;
    fullName: string;
    email: string;
    employeeId?: string;
    position?: string;
    phone?: string;
    hireDate?: Date;
    status: "active" | "inactive" | "invited";
    profileImageUrl?: string;
    activatedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface IJobRole {
    _id: MongoId;
    organizationId: MongoId;
    title: string;
    description?: string;
    department?: string;
    location?: string;
    employmentType?: string;
    slug: string;
    status: "active" | "closed" | "draft";
    stages: string[];
    hiringManager?: string;
    images: IRoleImage[];
    createdBy?: MongoId;
    createdAt: Date;
    updatedAt: Date;
}

export interface IDepartment {
    _id: MongoId;
    organizationId: MongoId;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ITimesheet {
    _id: MongoId;
    organizationId: MongoId;
    employeeId: MongoId;
    clockIn: Date;
    clockOut?: Date;
    status: "pending" | "approved" | "rejected";
    notes?: string;
    createdBy?: MongoId;
    createdVia: "employee" | "admin_override";
    overrideReason?: string;
    history: any[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IActivityLog {
    _id: MongoId;
    organizationId: MongoId;
    entityType: "application" | "interview" | "role" | "employee" | string;
    entityId: string;
    action: string;
    description?: string;
    performedBy?: MongoId;
    createdAt: Date;
}

export interface IEOTMCompetition {
    _id: MongoId;
    organizationId: MongoId;
    month: number;
    year: number;
    status: "VOTING_OPEN" | "VOTING_CLOSED" | "REVEALED";
    createdAt: Date;
    updatedAt: Date;
}

export interface IEOTMVote {
    _id: MongoId;
    competitionId: MongoId;
    voterId: MongoId;
    nomineeId: MongoId;
    points: number;
    createdAt: Date;
}

export interface IEOTMWinner {
    _id: MongoId;
    competitionId: MongoId;
    employeeId: MongoId;
    totalPoints: number;
    revealAt: Date;
    createdAt: Date;
}

export interface IPlan {
    _id: MongoId;
    name: string;
    slug: string;
    price: number;
    currency: string;
    interval: "month" | "year";
    features: string[];
    limits: {
        roles: number;
        employees: number;
    };
    paystackPlanCode?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ISubscription {
    _id: MongoId;
    organizationId: MongoId;
    planId: MongoId;
    status: "active" | "cancelled" | "past_due" | "unpaid";
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    paystackSubscriptionCode?: string;
    paystackEmailToken?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IPayment {
    _id: MongoId;
    organizationId: MongoId;
    amount: number;
    currency: string;
    status: string;
    reference: string;
    paystackTransactionId: string;
    metadata?: any;
    createdAt: Date;
}

export interface IApplication {
    _id: MongoId;
    roleId: MongoId;
    organizationId: MongoId;
    applicantName: string;
    applicantEmail: string;
    applicantPhone?: string;
    status: "new" | "shortlisted" | "interviewed" | "hired" | "rejected" | string;
    currentStage: string;
    resumeUrl?: string;
    coverLetter?: string;
    applicantPassport?: string;
    additionalInfo?: any;
    metadata?: any;
    source?: string;
    tags: string[];
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IInterview {
    _id: MongoId;
    organizationId: MongoId;
    applicationId: MongoId;
    roleId: MongoId;
    type: "virtual" | "in_person";
    status: "scheduled" | "completed" | "missed";
    scheduledAt: Date;
    duration: number; // minutes
    meetingLink?: string;
    location?: string;
    organizerId?: MongoId;
    googleEventId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IRoleWithImages extends IJobRole {
    role_images?: Array<{
        id?: string;
        role_id?: string;
        image_url: string;
        display_order: number;
        created_at?: string;
    }>;
    application_count?: number;
}
