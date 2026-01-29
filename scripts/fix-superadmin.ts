import mongoose from "mongoose";
import { User, Organization } from "../src/models/User";
import { Employee, Department } from "../src/models/Business";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI is not defined in .env.local");
    process.exit(1);
}

const EMAIL = "empire4josh@gmail.com";
const ORG_SLUG = "empire-co-operations";
const FULL_NAME = "Joshua Audu"; // Default name
const INITIAL_PASSWORD = "Password123!"; // User should change this later

async function repair() {
    try {
        console.log("🔄 Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI!);
        console.log("✅ Connected.");

        // 1. Find Organization
        const org = await Organization.findOne({ slug: ORG_SLUG });
        if (!org) {
            console.error(`❌ Organization with slug "${ORG_SLUG}" not found.`);
            process.exit(1);
        }
        console.log(`✅ Found Organization: ${org.name} (${org._id})`);

        // 2. Find or Create User
        let user = await User.findOne({ email: EMAIL }).select("+password");
        if (!user) {
            console.log(`🟡 User ${EMAIL} not found. Creating...`);
            const hashedPassword = await bcrypt.hash(INITIAL_PASSWORD, 12);
            user = await User.create({
                email: EMAIL,
                password: hashedPassword,
                fullName: FULL_NAME,
                name: FULL_NAME,
                role: "super_admin",
                memberships: []
            });
            console.log(`✅ Created User: ${user._id}`);
        } else {
            console.log(`✅ Found existing User: ${user._id}`);
            if (user.role !== "super_admin") {
                console.log("🟡 Updating existing user to super_admin role...");
                user.role = "super_admin";
                await user.save();
                console.log("✅ User promoted to super_admin.");
            }
        }

        // 3. Update Membership
        const hasMembership = user.memberships.some((m: any) => m.organizationId.toString() === org._id.toString());
        if (!hasMembership) {
            console.log(`🟡 Adding membership for ${ORG_SLUG} to user...`);
            user.memberships.push({
                organizationId: org._id,
                role: "owner"
            });
            await user.save();
            console.log("✅ Membership updated.");
        } else {
            console.log("✅ User already has membership.");
        }

        // 4. Ensure Department exists
        let dept = await Department.findOne({ organizationId: org._id, name: "Management" });
        if (!dept) {
            console.log("🟡 Management department not found. Creating...");
            dept = await Department.create({
                organizationId: org._id,
                name: "Management",
                description: "Executive and Administrative management team"
            });
            console.log(`✅ Created Department: ${dept._id}`);
        } else {
            console.log(`✅ Found Department: ${dept._id}`);
        }

        // 5. Ensure Employee record exists
        let employee = await Employee.findOne({ organizationId: org._id, email: EMAIL });
        if (!employee) {
            console.log("🟡 Employee record not found. Creating...");
            employee = await Employee.create({
                organizationId: org._id,
                userId: user._id,
                departmentId: dept._id,
                fullName: user.fullName || FULL_NAME,
                email: EMAIL,
                employeeId: "OWN-001",
                position: "Owner",
                status: "active",
                hireDate: new Date()
            });
            console.log(`✅ Created Employee: ${employee._id}`);
        } else {
            console.log(`✅ Found Employee record: ${employee._id}`);
            if (!employee.userId) {
                console.log("🟡 Updating employee record with userId...");
                employee.userId = user._id;
                await employee.save();
                console.log("✅ Employee record updated.");
            }
        }

        console.log("\n✨ REPAIR COMPLETE ✨");
        console.log(`📧 Email: ${EMAIL}`);
        console.log(`🔑 Temporary Password: ${INITIAL_PASSWORD}`);
        console.log("Please log in and CHANGE YOUR PASSWORD immediately.");

    } catch (error) {
        console.error("❌ Repair failed:", error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

repair();
