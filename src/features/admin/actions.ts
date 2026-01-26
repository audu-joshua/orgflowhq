"use server"

import { connectToDatabase } from "@/lib/mongodb";
import { User, Organization } from "@/models/User";
import { JobRole } from "@/models/Business";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Helper to enforce Super Admin Access
 */
async function requireSuperAdmin() {
    const session = await getServerSession(authOptions) as any;
    if (!session || !session.user) throw new Error("Unauthorized");

    await connectToDatabase();
    const user = await User.findById(session.user.id);

    if (!user || user.role !== 'super_admin') {
        throw new Error("Forbidden: Super Admin Access Required");
    }

    return user;
}

export async function getSystemStats() {
    await requireSuperAdmin();
    await connectToDatabase();

    const [tenantCount, userCount, activeCount] = await Promise.all([
        Organization.countDocuments(),
        User.countDocuments({ role: { $ne: "super_admin" } }),
        JobRole.countDocuments({ status: "active" })
    ]);

    return {
        tenants: tenantCount,
        users: userCount,
        activeTenants: activeCount,
        revenue: tenantCount * 15000
    };
}

export async function getLatestOrganizations(limit = 5) {
    await requireSuperAdmin();
    await connectToDatabase();

    const orgs = await Organization.find()
        .sort({ createdAt: -1 })
        .limit(limit);

    // We can't easily do the "count" join like Supabase in Mongoose without aggregation or multiple queries
    // For now, returning orgs and mapping them
    return orgs.map(org => org.toObject());
}

export async function getAllTenants(page = 1, pageSize = 20) {
    await requireSuperAdmin();
    await connectToDatabase();

    const skip = (page - 1) * pageSize;
    const [data, count] = await Promise.all([
        Organization.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageSize),
        Organization.countDocuments()
    ]);

    return { data: data.map(d => d.toObject()), count };
}

export async function getAllUsers(page = 1, pageSize = 20, search?: string) {
    await requireSuperAdmin();
    await connectToDatabase();

    const skip = (page - 1) * pageSize;
    let query: any = { role: { $ne: "super_admin" } };

    if (search) {
        query.$or = [
            { email: { $regex: search, $options: "i" } },
            { fullName: { $regex: search, $options: "i" } }
        ];
    }

    const [data, count] = await Promise.all([
        User.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageSize),
        User.countDocuments(query)
    ]);

    return { data: data.map(d => d.toObject()), count };
}
