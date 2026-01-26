// server-only: Do not import this file on the client. Use server actions instead.
import { connectToDatabase } from "@/lib/mongodb";
import { Department, Employee } from "@/models/Business";
import { User, Organization } from "@/models/User";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { mailService } from "@/lib/mail/mailService";

export const departmentService = {
  async createDepartment(organizationId: string, departmentData: any) {
    await connectToDatabase();
    const data = await Department.create({
      ...departmentData,
      organizationId: new mongoose.Types.ObjectId(organizationId)
    });
    const obj = data.toObject();
    return {
      ...obj,
      id: obj._id.toString(),
      _id: obj._id.toString()
    };
  },

  async updateDepartment(departmentId: string, departmentData: any) {
    await connectToDatabase();
    const data = await Department.findByIdAndUpdate(
      departmentId,
      { $set: departmentData },
      { new: true }
    );
    if (!data) throw new Error("Department not found");
    const obj = data.toObject();
    return {
      ...obj,
      id: obj._id.toString(),
      _id: obj._id.toString()
    };
  },

  async deleteDepartment(departmentId: string) {
    await connectToDatabase();
    await Department.findByIdAndDelete(departmentId);
  },

  async getDepartmentById(departmentId: string) {
    await connectToDatabase();
    const dept = await Department.findById(departmentId);
    if (!dept) throw new Error("Department not found");

    const employeeCount = await Employee.countDocuments({ departmentId: dept._id });
    const obj = dept.toObject();

    return {
      ...obj,
      id: obj._id.toString(),
      _id: obj._id.toString(),
      employees: [{ count: employeeCount }] // Mirroring Supabase structure for UI compat
    };
  },

  async getDepartmentsByOrganization(organizationId: string) {
    await connectToDatabase();
    const depts = await Department.find({
      organizationId: new mongoose.Types.ObjectId(organizationId)
    }).sort({ createdAt: -1 });

    const departmentsWithCount = await Promise.all(depts.map(async (dept) => {
      const count = await Employee.countDocuments({ departmentId: dept._id });
      const obj = dept.toObject();
      return {
        ...obj,
        id: obj._id.toString(),
        _id: obj._id.toString(),
        employees: [{ count }]
      };
    }));

    return departmentsWithCount;
  },

  async createEmployee(organizationId: string, employeeData: any) {
    await connectToDatabase();

    const { email, employeeId, fullName } = employeeData;
    // Handle both naming conventions for safety
    const finalEmail = email;
    const finalEmployeeId = employeeId || employeeData.employee_id;
    const finalFullName = fullName || employeeData.full_name;

    if (!finalEmail || !finalEmployeeId || !finalFullName) {
      throw new Error("Missing required fields for employee creation");
    }

    // 1. Provision Auth via API
    const { userId, error } = await this.provisionAuthAccount({
      email: finalEmail,
      employeeId: finalEmployeeId,
      fullName: finalFullName,
      organizationId
    });

    if (error) throw new Error(`Failed to create employee account: ${error}`);
    if (!userId) throw new Error("Failed to retrieve user ID after provisioning");

    // 2. Create local employee record
    const data = await Employee.create({
      fullName: finalFullName,
      email: finalEmail,
      employeeId: finalEmployeeId,
      position: employeeData.position,
      phone: employeeData.phone,
      profileImageUrl: employeeData.profileImageUrl || employeeData.profile_image_url,
      hireDate: (employeeData.hireDate || employeeData.hire_date) ? new Date(employeeData.hireDate || employeeData.hire_date) : undefined,
      status: employeeData.status || "invited",
      organizationId: new mongoose.Types.ObjectId(organizationId),
      departmentId: (employeeData.departmentId || employeeData.department_id) ? new mongoose.Types.ObjectId(employeeData.departmentId || employeeData.department_id) : undefined,
      userId: new mongoose.Types.ObjectId(userId)
    });

    const obj = data.toObject();
    return {
      ...obj,
      id: obj._id.toString(),
      _id: obj._id.toString(),
      fullName: obj.fullName,
      profileImageUrl: obj.profileImageUrl,
      hireDate: obj.hireDate?.toISOString()
    };
  },

  async updateEmployee(employeeId: string, employeeData: any) {
    await connectToDatabase();

    // Map frontend camelCase/snake_case to mongoose camelCase
    const updates: any = {};
    if (employeeData.fullName || employeeData.full_name) updates.fullName = employeeData.fullName || employeeData.full_name;
    if (employeeData.position) updates.position = employeeData.position;
    if (employeeData.phone) updates.phone = employeeData.phone;
    if (employeeData.status) updates.status = employeeData.status;
    if (employeeData.profileImageUrl || employeeData.profile_image_url) updates.profileImageUrl = employeeData.profileImageUrl || employeeData.profile_image_url;
    if (employeeData.departmentId || employeeData.department_id) updates.departmentId = new mongoose.Types.ObjectId(employeeData.departmentId || employeeData.department_id);
    if (employeeData.hireDate || employeeData.hire_date) updates.hireDate = new Date(employeeData.hireDate || employeeData.hire_date);

    const data = await Employee.findByIdAndUpdate(
      employeeId,
      { $set: updates },
      { new: true }
    );
    if (!data) throw new Error("Employee not found");
    const obj = data.toObject();
    return {
      ...obj,
      id: obj._id.toString(),
      _id: obj._id.toString(),
      fullName: obj.fullName,
      profileImageUrl: obj.profileImageUrl,
      hireDate: obj.hireDate?.toISOString()
    };
  },

  async provisionAuthAccount(data: { email: string, employeeId: string, fullName: string, organizationId: string }) {
    try {
      await connectToDatabase();
      const { email: rawEmail, employeeId: rawEmployeeId, fullName, organizationId } = data;
      const email = rawEmail.trim().toLowerCase();
      const employeeId = rawEmployeeId.trim();

      // 1. Logic mirrored from API route
      const org = await Organization.findById(organizationId);
      if (!org) throw new Error("Organization not found");

      const orgName = org.name;
      const orgSlug = org.slug;
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const clockLink = `${siteUrl}/org/${orgSlug}/clock`;

      let user = await User.findOne({ email });
      let userId: string;
      let isNewUser = false;

      const hashedPassword = await bcrypt.hash(employeeId, 12);

      if (user) {
        user.password = hashedPassword;
        const hasMembership = user.memberships.some(
          (m: any) => m.organizationId?.toString() === organizationId
        );
        if (!hasMembership) {
          user.memberships.push({ organizationId: new mongoose.Types.ObjectId(organizationId), role: "member" });
        }
        await user.save();
        userId = user._id.toString();
      } else {
        const newUser = await User.create({
          email,
          password: hashedPassword,
          fullName,
          name: fullName,
          role: "user",
          memberships: [{ organizationId: new mongoose.Types.ObjectId(organizationId), role: "member" }]
        });
        userId = newUser._id.toString();
        isNewUser = true;
      }

      // 2. Send Invitation Email
      try {
        await mailService.sendEmployeeInviteEmail(
          email,
          orgName,
          fullName,
          clockLink,
          isNewUser,
          employeeId,
          org.welcomeDocUrl
        );
      } catch (mailErr) {
        console.error("[Provision] mailService error:", mailErr);
      }

      return { userId, error: null };
    } catch (err: any) {
      return { userId: null, error: err.message };
    }
  },

  async getEmployeesByDepartment(departmentId: string) {
    await connectToDatabase();
    const employees = await Employee.find({
      departmentId: new mongoose.Types.ObjectId(departmentId)
    }).sort({ createdAt: -1 });
    return employees.map(emp => {
      const obj = emp.toObject();
      return {
        ...obj,
        id: obj._id.toString(),
        _id: obj._id.toString(),
        fullName: obj.fullName,
        profileImageUrl: obj.profileImageUrl,
        hireDate: obj.hireDate?.toISOString()
      };
    });
  },

  async getEmployeesByOrganization(organizationId: string) {
    await connectToDatabase();

    // 1. Get employees
    const employees = await Employee.find({
      organizationId: new mongoose.Types.ObjectId(organizationId)
    }).sort({ createdAt: -1 });

    // 2. Map system roles from User memberships
    const employeesWithRoles = await Promise.all(employees.map(async (emp) => {
      let systemRole = null;
      if (emp.userId) {
        const user = await User.findById(emp.userId);
        const membership = user?.memberships.find(
          (m: any) => m.organizationId?.toString() === organizationId
        );
        systemRole = membership?.role || null;
      }
      const obj = emp.toObject();
      return {
        ...obj,
        id: obj._id.toString(),
        _id: obj._id.toString(),
        fullName: obj.fullName,
        profileImageUrl: obj.profileImageUrl,
        hireDate: obj.hireDate?.toISOString(),
        system_role: systemRole,
        systemRole: systemRole
      };
    }));

    return employeesWithRoles;
  },

  async getEmployeeByUserId(userId: string) {
    await connectToDatabase();
    const data = await Employee.findOne({ userId: new mongoose.Types.ObjectId(userId) })
      .populate("organizationId")
      .populate("departmentId");

    if (!data) return null;

    // Map to expected structure (mirroring Supabase)
    const obj = data.toObject();
    return {
      ...obj,
      id: obj._id.toString(),
      _id: obj._id.toString(),
      fullName: obj.fullName,
      profileImageUrl: obj.profileImageUrl,
      hireDate: obj.hireDate?.toISOString(),
      organizations: obj.organizationId,
      departments: obj.departmentId ? { name: obj.departmentId.name } : null
    };
  },

  async provisionEmployeeRecord(userId: string, organizationId: string, email: string) {
    await connectToDatabase();

    // 1. Check/Create Management department
    let dept = await Department.findOne({ organizationId, name: "Management" });
    if (!dept) {
      dept = await Department.create({
        organizationId: new mongoose.Types.ObjectId(organizationId),
        name: "Management",
        description: "Default management department"
      });
    }

    // 2. Generate ID
    const org = await Organization.findById(organizationId);
    const employeeId = await this.generateNextEmployeeId(organizationId, org?.name || "SYS", "Management");

    // 3. Create Employee
    const employee = await Employee.create({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      userId: new mongoose.Types.ObjectId(userId),
      departmentId: dept._id,
      fullName: email.split('@')[0],
      email: email,
      employeeId: employeeId,
      position: "Administrator",
      status: "active",
      hireDate: new Date()
    });

    const obj = employee.toObject();
    return {
      ...obj,
      id: obj._id.toString(),
      _id: obj._id.toString(),
      fullName: obj.fullName,
      profileImageUrl: obj.profileImageUrl,
      hireDate: obj.hireDate?.toISOString()
    };
  },

  async generateNextEmployeeId(organizationId: string, organizationName: string, departmentName?: string) {
    await connectToDatabase();
    const count = await Employee.countDocuments({ organizationId: new mongoose.Types.ObjectId(organizationId) });

    const orgPrefix = organizationName
      .split(/[\s-]+/)
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 3);

    let deptPrefix = "";
    if (departmentName && departmentName !== "Select Department") {
      deptPrefix = departmentName
        .split(/[\s-]+/)
        .map(word => word[0])
        .join("")
        .toUpperCase()
        .substring(0, 3);
    }

    const nextNumber = count + 1;
    const paddedNumber = nextNumber.toString().padStart(3, '0');

    if (deptPrefix) {
      return `${orgPrefix}-${deptPrefix}-${paddedNumber}`;
    }
    return `${orgPrefix}-${paddedNumber}`;
  },

  async uploadEmployeeProfileImage(employeeId: string, file: File) {
    // This needs a multi-part form upload to some storage provider (e.g. Cloudinary)
    // For now, mirroring an error if not implemented
    throw new Error("File storage migration required (Cloudinary/S3). Supabase storage no longer supported.");
  },

  async deleteEmployee(employeeId: string) {
    await connectToDatabase();
    // 1. Get employee data to find userId
    const employee = await Employee.findById(employeeId);
    if (!employee) throw new Error("Employee not found");

    // 2. Remove user membership if tied to user
    if (employee.userId) {
      const user = await User.findById(employee.userId);
      if (user) {
        user.memberships = user.memberships.filter(
          (m: any) => m.organizationId?.toString() !== employee.organizationId?.toString()
        );
        await user.save();
      }
    }

    // 3. Delete employee record
    await Employee.findByIdAndDelete(employeeId);
    return { success: true };
  },

  async updateSystemRole(employeeId: string, organizationId: string, newRole: string | null) {
    await connectToDatabase();
    const employee = await Employee.findById(employeeId);
    if (!employee || !employee.userId) return; // Cannot update system role if not linked to user

    const user = await User.findById(employee.userId);
    if (!user) return;

    // Update or Add membership
    const membershipIndex = user.memberships.findIndex(
      (m: any) => m.organizationId?.toString() === organizationId
    );

    if (newRole) {
      if (membershipIndex >= 0) {
        user.memberships[membershipIndex].role = newRole;
      } else {
        user.memberships.push({
          organizationId: new mongoose.Types.ObjectId(organizationId),
          role: newRole
        });
      }
    } else if (membershipIndex >= 0) {
      // If role is null, maybe remove membership or set to member? 
      // Typically we'd keep membership but maybe downgrade. 
      // For now, let's assume filtering out if explicitly removing, but usually we just change role.
      user.memberships[membershipIndex].role = 'member';
    }

    await user.save();
    return { success: true };
  }
};
