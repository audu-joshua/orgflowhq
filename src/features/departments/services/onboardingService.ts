import { connectToDatabase } from "@/lib/mongodb";
import { Employee, Department } from "@/models/Business";
import { Organization, User } from "@/models/User";
import { departmentService } from "./departmentService";
import { mailService } from "@/lib/mail/mailService";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export const onboardingService = {
    async onboardHiredCandidate(data: {
        applicantName: string;
        applicantEmail: string;
        roleTitle: string;
        organizationId: string;
        departmentName?: string;
        applicantPassport?: string | null;
    }) {
        const { applicantName, applicantEmail, roleTitle, organizationId, departmentName, applicantPassport } = data;
        await connectToDatabase();

        // 0. Check if already an employee in this organization
        const existingEmp = await Employee.findOne({
            organizationId: new mongoose.Types.ObjectId(organizationId),
            email: applicantEmail
        });

        if (existingEmp) {
            throw new Error("Employee already exists in this organization");
        }

        // 1. Resolve or Create Target department
        const targetDeptName = departmentName || "Management";
        let dept = await Department.findOne({
            organizationId: new mongoose.Types.ObjectId(organizationId),
            name: targetDeptName
        });

        if (!dept) {
            dept = await Department.create({
                organizationId: new mongoose.Types.ObjectId(organizationId),
                name: targetDeptName,
                description: targetDeptName === "Management"
                    ? "Default department for system users"
                    : `Department for ${targetDeptName} roles`
            });
        }

        // 2. Fetch Org Details for ID Generation
        const org = await Organization.findById(organizationId);
        if (!org) throw new Error("Organization not found");

        const orgName = org.name;
        const orgSlug = org.slug;

        // 3. Generate Employee ID
        const employeeId = await departmentService.generateNextEmployeeId(organizationId, orgName);

        // 4. Provision User Account
        let user = await User.findOne({ email: applicantEmail });
        let userId: string;
        let isNewUser = false;

        const hashedPassword = await bcrypt.hash(employeeId, 12);

        if (user) {
            console.log(`[onboardHiredCandidate] User exists (${user._id}), updating for organization`);
            // Ensure organization membership is added
            const hasMembership = user.memberships.some(
                (m: any) => m.organizationId?.toString() === organizationId
            );
            if (!hasMembership) {
                user.memberships.push({ organizationId, role: "member" });
            }
            await user.save();
            userId = user._id.toString();
        } else {
            console.log(`[onboardHiredCandidate] Creating new user for candidate: ${applicantEmail}`);
            const newUser = await User.create({
                email: applicantEmail,
                password: hashedPassword,
                fullName: applicantName,
                name: applicantName,
                role: "user",
                memberships: [{ organizationId, role: "member" }]
            });
            userId = newUser._id.toString();
            isNewUser = true;
        }

        // 5. Create Employee Record
        const employee = await Employee.create({
            organizationId: new mongoose.Types.ObjectId(organizationId),
            userId: new mongoose.Types.ObjectId(userId),
            departmentId: dept._id,
            fullName: applicantName,
            email: applicantEmail,
            employeeId: employeeId,
            position: roleTitle,
            profileImageUrl: applicantPassport || null,
            status: "invited",
            hireDate: new Date()
        });

        // 6. Send Invitation Email
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const clockLink = `${siteUrl}/org/${orgSlug}/clock`;

        try {
            await mailService.sendEmployeeInviteEmail(
                applicantEmail,
                orgName,
                applicantName,
                clockLink,
                isNewUser,
                employeeId
            );
        } catch (mailErr) {
            console.error("[onboardHiredCandidate] Invitation email failed:", mailErr);
        }

        return employee.toObject();
    }
};
