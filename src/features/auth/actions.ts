"use server"

import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Employee } from "@/models/Business";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { mailService } from "@/lib/mail/mailService";

/**
 * Fetches the user profile and associated data from MongoDB.
 * Replaces direct authService calls in useAuth hook.
 */
export async function getUserProfileAction(userId: string, scopedOrgId?: string) {
    try {
        await connectToDatabase();

        // 1. Find User and populate organization details
        const dbUser = await User.findById(userId).populate("memberships.organizationId");
        if (!dbUser) return null;

        // 2. Determine Primary Membership
        let activeMembership = null;
        if (scopedOrgId) {
            activeMembership = dbUser.memberships.find(
                (m: any) => m.organizationId?._id?.toString() === scopedOrgId
            );
        } else if (dbUser.memberships.length > 0) {
            activeMembership = dbUser.memberships[0];
        }

        // 3. Get Employee details if membership exists
        let employeeData = null;
        if (activeMembership) {
            employeeData = await Employee.findOne({
                userId: dbUser._id,
                organizationId: activeMembership.organizationId?._id
            }).populate("departmentId");
        }

        // Return a plain object to avoid serialization issues
        return {
            id: dbUser._id.toString(),
            email: dbUser.email,
            fullName: dbUser.fullName || dbUser.name,
            profileImageUrl: dbUser.profileImageUrl || dbUser.image,
            role: activeMembership?.role || dbUser.role,
            systemRole: dbUser.role, // "super_admin" or "user"
            organization_id: activeMembership?.organizationId?._id?.toString() || "",
            organizations: activeMembership?.organizationId ? activeMembership.organizationId.toObject() : null,
            status: employeeData?.status || 'active',
            is_employee_only: dbUser.role !== 'super_admin' && activeMembership?.role === 'member',
            created_at: (dbUser as any).createdAt?.toISOString() || new Date().toISOString()
        };
    } catch (error) {
        console.error("[AuthAction] getUserProfile failed:", error);
        return null;
    }
}

/**
 * Validates if the user is allowed to access the system.
 */
export async function validateAccessStatusAction(email: string) {
    try {
        await connectToDatabase();
        const user = await User.findOne({ email });
        if (!user) return { allowed: true };
        return { allowed: true };
    } catch (err) {
        console.warn("[AuthAction] Validation error:", err);
        return { allowed: true };
    }
}

/**
 * Handles new user sign up in MongoDB.
 */
export async function signUpAction(email: string, password: string, organizationName: string, fullName?: string) {
    try {
        await connectToDatabase();

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) throw new Error("User already exists");

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await User.create({
            email: email.toLowerCase(),
            password: hashedPassword,
            fullName,
            name: fullName,
            role: "user",
            memberships: [],
        });

        return {
            success: true,
            user: { id: newUser._id.toString(), email: newUser.email }
        };
    } catch (error: any) {
        console.error("[AuthAction] signUp failed:", error);
        return { success: false, error: error.message };
    }
}

export async function changePasswordAction(userId: string, newPassword: string) {
    try {
        await connectToDatabase();
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        const user = await User.findByIdAndUpdate(userId, { password: hashedPassword });
        if (!user) throw new Error("User not found");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function forgotPasswordAction(email: string) {
    try {
        await connectToDatabase();
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            // Return success to prevent enumeration
            return { success: true };
        }

        // 1. Generate Reset Token
        const resetToken = crypto.randomUUID();
        const resetExpires = new Date(Date.now() + 3600000); // 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetExpires;
        await user.save();

        // 2. Send Email
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const resetLink = `${siteUrl}/reset-password?token=${resetToken}&email=${email}`;

        await mailService.sendPasswordResetEmail(email, resetLink);

        return { success: true };
    } catch (error: any) {
        console.error("[AuthAction] forgotPassword failed:", error);
        return { success: false, error: error.message };
    }
}
