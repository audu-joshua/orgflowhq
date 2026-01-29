import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import mongoose from "mongoose";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
    console.log("Starting migration from Supabase to MongoDB...");

    // Dynamically import models and connection to ensure dotenv has run
    const { connectToDatabase } = await import("../src/lib/mongodb");
    const { Organization, User } = await import("../src/models/User");
    const { Employee, JobRole, Timesheet, Subscription } = await import("../src/models/Business");
    const { Application, Interview } = await import("../src/models/Recruitment");

    await connectToDatabase();

    // 1. Migrate Organizations
    console.log("Migrating Organizations...");
    const { data: organizations } = await supabase.from("organizations").select("*");
    if (organizations) {
        for (const org of organizations) {
            await Organization.findOneAndUpdate(
                { slug: org.slug },
                {
                    name: org.name,
                    slug: org.slug,
                    logoUrl: org.logo_url,
                    website: org.website,
                    description: org.description,
                    contactEmail: org.contact_email,
                    address: org.address,
                    welcomeDocUrl: org.welcome_doc_url,
                    createdAt: org.created_at,
                    updatedAt: org.updated_at
                },
                { upsert: true }
            );
        }
    }

    // 2. Migrate Users & Memberships
    console.log("Migrating Users...");
    const { data: users } = await supabase.from("profiles").select("*"); // Assuming profiles table
    const { data: userOrgs } = await supabase.from("users_organizations").select("*");

    if (users) {
        for (const user of users) {
            const memberships = userOrgs
                ?.filter(uo => uo.user_id === user.id)
                .map(uo => ({
                    organizationId: uo.organization_id, // Note: Need to handle UUID to ObjectId mapping if necessary
                    role: uo.role
                })) || [];

            await User.findOneAndUpdate(
                { email: user.email },
                {
                    fullName: user.full_name,
                    email: user.email,
                    profileImageUrl: user.profile_image_url,
                    role: user.role, // "super_admin" or "user"
                    memberships: memberships,
                    createdAt: user.created_at
                },
                { upsert: true }
            );
        }
    }

    // 3. Migrate Employees
    console.log("Migrating Employees...");
    const { data: employees } = await supabase.from("employees").select("*");
    if (employees) {
        for (const emp of employees) {
            await Employee.findOneAndUpdate(
                { email: emp.email, organizationId: emp.organization_id },
                {
                    fullName: emp.full_name,
                    email: emp.email,
                    position: emp.position,
                    status: emp.status,
                    userId: emp.user_id,
                    departmentId: emp.department_id,
                    createdAt: emp.created_at
                },
                { upsert: true }
            );
        }
    }

    // Add other entities similarly (JobRoles, Applications, Timesheets, etc.)

    console.log("Migration complete!");
    process.exit(0);
}

runMigration().catch(err => {
    console.error("Migration failed:", err);
    process.exit(1);
});
