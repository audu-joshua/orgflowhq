"use server"

import { connectToDatabase } from "@/lib/mongodb";
import { Employee } from "@/models/Business";
import { Organization } from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from "mongoose";

export async function getEmployeeProfileBySlug(slug: string) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session || !session.user) return null;

        await connectToDatabase();

        // 1. Find Organization
        const org = await Organization.findOne({ slug });
        if (!org) return null;

        // 2. Find Employee
        const employee = await Employee.findOne({
            userId: new mongoose.Types.ObjectId((session.user as any).id),
            organizationId: org._id
        }).populate("organizationId departmentId");

        if (!employee) return null;

        const obj = employee.toObject();
        return {
            ...obj,
            id: obj._id.toString(),
            _id: obj._id.toString(),
            fullName: obj.fullName,
            profileImageUrl: obj.profileImageUrl,
            organizationId: obj.organizationId?._id?.toString(),
            departmentId: obj.departmentId ? { _id: obj.departmentId._id.toString(), name: obj.departmentId.name } : null,
            // Legacy compatibility for any remaining components
            organization_id: obj.organizationId?._id?.toString(),
            full_name: obj.fullName,
            profile_image_url: obj.profileImageUrl,
        };
    } catch (error) {
        console.error("Failed to fetch employee profile:", error);
        return null;
    }
}

export async function getAllUserEmployees() {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session || !session.user) return [];

        await connectToDatabase();

        const employees = await Employee.find({
            userId: new mongoose.Types.ObjectId((session.user as any).id)
        }).populate("organizationId departmentId");

        return employees.map((emp: any) => {
            const obj = emp.toObject();
            return {
                ...obj,
                id: obj._id.toString(),
                _id: obj._id.toString(),
                fullName: obj.fullName,
                profileImageUrl: obj.profileImageUrl,
                organizationId: obj.organizationId?._id?.toString(),
                departmentId: obj.departmentId ? { _id: obj.departmentId._id.toString(), name: obj.departmentId.name } : null,
                // Legacy compatibility
                organization_id: obj.organizationId?._id?.toString(),
                full_name: obj.fullName,
                profile_image_url: obj.profileImageUrl,
            };
        });
    } catch (error) {
        console.error("Failed to fetch all user employees:", error);
        return [];
    }
}
