import mongoose, { Schema, Document, model, models } from "mongoose";
import {
    IDepartment as IDepartmentBase,
    IEmployee as IEmployeeBase,
    IJobRole as IJobRoleBase,
    IRoleImage,
    ISubscription as ISubscriptionBase,
    IPayment as IPaymentBase,
    ITimesheet as ITimesheetBase,
    IActivityLog as IActivityLogBase,
    IEOTMCompetition as IEOTMCompetitionBase,
    IEOTMVote as IEOTMVoteBase,
    IEOTMWinner as IEOTMWinnerBase,
    IPlan as IPlanBase
} from "./types";

export interface IDepartment extends IDepartmentBase, Document {
    _id: any;
}

const DepartmentSchema = new Schema<IDepartment>(
    {
        organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
        name: { type: String, required: true },
        description: String,
    },
    { timestamps: true }
);

export const Department = models.Department || model<IDepartment>("Department", DepartmentSchema);

// --- Employee Model ---
export interface IEmployee extends IEmployeeBase, Document {
    _id: any;
}

const EmployeeSchema = new Schema<IEmployee>(
    {
        organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        departmentId: { type: Schema.Types.ObjectId, ref: "Department" },
        fullName: { type: String, required: true },
        email: { type: String, required: true },
        employeeId: String,
        position: String,
        phone: String,
        hireDate: Date,
        status: { type: String, enum: ["active", "inactive", "invited"], default: "invited" },
        profileImageUrl: String,
        activatedAt: Date,
    },
    { timestamps: true }
);

// Compound index for uniqueness of employee_id within an organization
EmployeeSchema.index({ organizationId: 1, employeeId: 1 }, { unique: true, sparse: true });
EmployeeSchema.index({ email: 1 }, { unique: true });

export const Employee = models.Employee || model<IEmployee>("Employee", EmployeeSchema);

export interface IJobRole extends IJobRoleBase, Document {
    _id: any;
}

const RoleImageSchema = new Schema<IRoleImage>(
    {
        imageUrl: { type: String, required: true },
        displayOrder: { type: Number, default: 0 },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

const JobRoleSchema = new Schema<IJobRole>(
    {
        organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
        title: { type: String, required: true },
        description: String,
        department: String,
        location: String,
        employmentType: String,
        slug: { type: String, required: true },
        status: { type: String, enum: ["active", "closed", "draft"], default: "draft" },
        stages: {
            type: [String],
            default: ["New", "Shortlisted", "Interview Scheduled", "Interviewed", "Offer", "Hired", "Rejected"],
        },
        hiringManager: String,
        images: { type: [RoleImageSchema], default: [] },
        createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

JobRoleSchema.index({ organizationId: 1, slug: 1 }, { unique: true });

export const JobRole = models.JobRole || model<IJobRole>("JobRole", JobRoleSchema);

// --- Timesheet Model ---
export interface ITimesheet extends ITimesheetBase, Document {
    _id: any;
}

const TimesheetSchema = new Schema<ITimesheet>(
    {
        organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
        employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
        clockIn: { type: Date, required: true, default: Date.now },
        clockOut: Date,
        status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
        notes: String,
        createdBy: { type: Schema.Types.ObjectId, ref: "User" },
        createdVia: { type: String, enum: ["employee", "admin_override"], default: "employee" },
        overrideReason: String,
        history: { type: Schema.Types.Mixed, default: [] },
    },
    { timestamps: true }
);

export const Timesheet = models.Timesheet || model<ITimesheet>("Timesheet", TimesheetSchema);

// --- Activity Log Model ---
export interface IActivityLog extends IActivityLogBase, Document {
    _id: any;
}

const ActivityLogSchema = new Schema<IActivityLog>(
    {
        organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
        entityType: { type: String, required: true },
        entityId: { type: String, required: true },
        action: { type: String, required: true },
        description: String,
        performedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

export const ActivityLog = models.ActivityLog || model<IActivityLog>("ActivityLog", ActivityLogSchema);

// --- EOTM Models ---

export interface IEOTMCompetition extends IEOTMCompetitionBase, Document {
    _id: any;
}

const EOTMCompetitionSchema = new Schema<IEOTMCompetition>(
    {
        organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
        month: { type: Number, required: true },
        year: { type: Number, required: true },
        status: { type: String, enum: ["VOTING_OPEN", "VOTING_CLOSED", "REVEALED"], default: "VOTING_OPEN" },
    },
    { timestamps: true }
);

EOTMCompetitionSchema.index({ organizationId: 1, month: 1, year: 1 }, { unique: true });

export const EOTMCompetition = models.EOTMCompetition || model<IEOTMCompetition>("EOTMCompetition", EOTMCompetitionSchema);

export interface IEOTMVote extends IEOTMVoteBase, Document {
    _id: any;
}

const EOTMVoteSchema = new Schema<IEOTMVote>(
    {
        competitionId: { type: Schema.Types.ObjectId, ref: "EOTMCompetition", required: true },
        voterId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
        nomineeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
        points: { type: Number, default: 1 },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

EOTMVoteSchema.index({ competitionId: 1, voterId: 1 }, { unique: true });

export const EOTMVote = models.EOTMVote || model<IEOTMVote>("EOTMVote", EOTMVoteSchema);

export interface IEOTMWinner extends IEOTMWinnerBase, Document {
    _id: any;
}

const EOTMWinnerSchema = new Schema<IEOTMWinner>(
    {
        competitionId: { type: Schema.Types.ObjectId, ref: "EOTMCompetition", required: true },
        employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
        totalPoints: { type: Number, required: true },
        revealAt: { type: Date, required: true },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

EOTMWinnerSchema.index({ competitionId: 1 }, { unique: true });

export const EOTMWinner = models.EOTMWinner || model<IEOTMWinner>("EOTMWinner", EOTMWinnerSchema);

// --- Billing Models ---

export interface IPlan extends IPlanBase, Document {
    _id: any;
}

const PlanSchema = new Schema<IPlan>(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        price: { type: Number, default: 0 },
        currency: { type: String, default: "NGN" },
        interval: { type: String, enum: ["month", "year"], default: "month" },
        features: { type: [String], default: [] },
        limits: {
            roles: { type: Number, default: 5 },
            employees: { type: Number, default: 0 },
        },
        paystackPlanCode: String,
    },
    { timestamps: true }
);

export const Plan = models.Plan || model<IPlan>("Plan", PlanSchema);

export interface ISubscription extends ISubscriptionBase, Document {
    _id: any;
}

const SubscriptionSchema = new Schema<ISubscription>(
    {
        organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
        planId: { type: Schema.Types.ObjectId, ref: "Plan", required: true },
        status: { type: String, enum: ["active", "cancelled", "past_due", "unpaid"], default: "active" },
        currentPeriodStart: { type: Date, default: Date.now },
        currentPeriodEnd: { type: Date, required: true },
        paystackSubscriptionCode: String,
        paystackEmailToken: String,
    },
    { timestamps: true }
);

SubscriptionSchema.index({ organizationId: 1 });

export const Subscription = models.Subscription || model<ISubscription>("Subscription", SubscriptionSchema);

// --- Payment Model ---

export interface IPayment extends IPaymentBase, Document {
    _id: any;
}

const PaymentSchema = new Schema<IPayment>(
    {
        organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
        amount: { type: Number, required: true },
        currency: { type: String, default: "NGN" },
        status: { type: String, required: true },
        reference: { type: String, required: true, unique: true },
        paystackTransactionId: { type: String, required: true },
        metadata: { type: Schema.Types.Mixed, default: {} },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

PaymentSchema.index({ organizationId: 1 });
// Reference already unique via field definition

export const Payment = models.Payment || model<IPayment>("Payment", PaymentSchema);
