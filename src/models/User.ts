import mongoose, { Schema, Document, model, models } from "mongoose";
import { IOrganization as IOrganizationBase, IUser as IUserBase } from "./types";

export interface IOrganization extends IOrganizationBase, Document {
    _id: any;
}

const OrganizationSchema = new Schema<IOrganization>(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        logoUrl: String,
        website: String,
        description: String,
        contactEmail: String,
        address: String,
        welcomeDocUrl: String,
        deleteConfirmationCode: String,
        deleteConfirmationExpiresAt: Date,
    },
    { timestamps: true }
);

export const Organization = models.Organization || model<IOrganization>("Organization", OrganizationSchema);

// --- User Model ---
export interface IUser extends IUserBase, Document {
    _id: any;
}

const UserSchema = new Schema<IUser>(
    {
        name: String,
        email: { type: String, required: true, unique: true },
        image: String,
        emailVerified: Date,
        password: { type: String, select: false }, // Hide password by default
        fullName: String,
        profileImageUrl: String,
        role: { type: String, enum: ["super_admin", "user"], default: "user" },
        resetPasswordToken: String,
        resetPasswordExpires: Date,
        memberships: [
            {
                organizationId: { type: Schema.Types.ObjectId, ref: "Organization" },
                role: {
                    type: String,
                    enum: ["owner", "admin", "hr", "manager", "finance", "member"],
                    default: "member",
                },
            },
        ],
    },
    { timestamps: true }
);

export const User = models.User || model<IUser>("User", UserSchema);

// --- User Integration Model ---
export interface IUserIntegration extends Document {
    userId: mongoose.Types.ObjectId;
    provider: string; // "google"
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const UserIntegrationSchema = new Schema<IUserIntegration>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        provider: { type: String, required: true },
        accessToken: { type: String, required: true },
        refreshToken: String,
        expiresAt: Date,
    },
    { timestamps: true }
);

UserIntegrationSchema.index({ userId: 1, provider: 1 }, { unique: true });

export const UserIntegration = models.UserIntegration || model<IUserIntegration>("UserIntegration", UserIntegrationSchema);
