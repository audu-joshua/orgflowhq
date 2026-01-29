// server-only: Do not import this file on the client. Use server actions instead.
import { connectToDatabase } from "@/lib/mongodb";
import { User, Organization } from "@/models/User";
import { Employee } from "@/models/Business";
import bcrypt from "bcryptjs";
import { mailService } from "@/lib/mail/mailService";

export const authService = {
  async validateAccessStatus(email: string) {
    try {
      await connectToDatabase();
      const normalizedEmail = email.toLowerCase();
      const user = await User.findOne({ email: normalizedEmail });
      if (!user) return { allowed: true }; // Allow signup if user not found

      // Custom business logic for status check can go here
      // For now, we assume all MongoDB users are active unless flagged
      return { allowed: true };
    } catch (err) {
      console.warn("[AuthService] Validation error:", err);
      return { allowed: true };
    }
  },

  async signUp(email: string, password: string, organizationName: string, fullName?: string) {
    await connectToDatabase();
    const normalizedEmail = email.toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) throw new Error("User already exists");

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      email: normalizedEmail,
      password: hashedPassword,
      fullName,
      name: fullName,
      role: "user",
      memberships: [],
    });

    return { user: { id: newUser._id.toString(), email: newUser.email } };
  },

  async getUserProfile(userId: string, scopedOrgId?: string) {
    await connectToDatabase();
    console.log(`[getUserProfile] MongoDB lookup for: ${userId}, scopedOrgId: ${scopedOrgId} `);

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

    return {
      id: dbUser._id.toString(),
      email: dbUser.email,
      fullName: dbUser.fullName || dbUser.name,
      profileImageUrl: dbUser.profileImageUrl || dbUser.image,
      role: activeMembership?.role || dbUser.role,
      systemRole: dbUser.role, // "super_admin" or "user"
      organization_id: activeMembership?.organizationId?._id?.toString() || "",
      organizations: activeMembership?.organizationId || null,
      status: employeeData?.status || 'active',
      is_employee_only: dbUser.role !== 'super_admin' && activeMembership?.role === 'member',
      created_at: (dbUser as any).createdAt?.toISOString() || new Date().toISOString()
    };
  },

  // Authentication methods
  async signOut() {
    // NextAuth handles signout via its own utility
  },

  async getCurrentUser() {
    // NextAuth handles this via useSession or getServerSession
    return null;
  },

  async changePassword(userId: string, newPassword: string) {
    await connectToDatabase();
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const user = await User.findByIdAndUpdate(userId, { password: hashedPassword });
    if (!user) throw new Error("User not found");
    return { success: true };
  },

  async forgotPassword(email: string) {
    // This would typically generate a reset token and send an email
    // For now, mirroring the intent
    await connectToDatabase();
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");

    // Generate Reset Token
    const resetToken = crypto.randomUUID();
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    // Send Email
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const resetLink = `${siteUrl}/reset-password?token=${resetToken}`;

    await mailService.sendPasswordResetEmail(email, resetLink);

    return { success: true };
  }
};
