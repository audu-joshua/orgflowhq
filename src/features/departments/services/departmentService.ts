// server-only: Do not import this file on the client. Use server actions instead.
import { connectToDatabase } from "@/lib/mongodb";
import { Department, Employee } from "@/models/Business";
import { User, Organization } from "@/models/User";
import mongoose from "mongoose";

export const departmentService = {
  async createDepartment(organizationId: string, departmentData: any) {
    await connectToDatabase();
    const data = await Department.create({
      ...departmentData,
      organizationId: new mongoose.Types.ObjectId(organizationId)
    });
    return data.toObject();
  },

  async updateDepartment(departmentId: string, departmentData: any) {
    await connectToDatabase();
    const data = await Department.findByIdAndUpdate(
      departmentId,
      { $set: departmentData },
      { new: true }
    );
    if (!data) throw new Error("Department not found");
    return data.toObject();
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

    return {
      ...dept.toObject(),
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
      return {
        ...dept.toObject(),
        employees: [{ count }]
      };
    }));

    return departmentsWithCount;
  },

  async createEmployee(organizationId: string, employeeData: any) {
    await connectToDatabase();

    const { email, employee_id, full_name } = employeeData;
    if (!email || !employee_id || !full_name) {
      throw new Error("Missing required fields for employee creation");
    }

    // 1. Provision Auth via API
    const { userId, error } = await this.provisionAuthAccount({
      email,
      employeeId: employee_id,
      fullName: full_name,
      organizationId
    });

    if (error) throw new Error(`Failed to create employee account: ${error}`);

    // 2. Create local employee record
    const data = await Employee.create({
      fullName: full_name,
      email,
      employeeId: employee_id,
      position: employeeData.position,
      phone: employeeData.phone,
      hireDate: employeeData.hire_date ? new Date(employeeData.hire_date) : undefined,
      status: employeeData.status || "invited",
      organizationId: new mongoose.Types.ObjectId(organizationId),
      departmentId: employeeData.department_id ? new mongoose.Types.ObjectId(employeeData.department_id) : undefined,
      userId: new mongoose.Types.ObjectId(userId)
    });

    return data.toObject();
  },

  async updateEmployee(employeeId: string, employeeData: any) {
    await connectToDatabase();

    // Map frontend snake_case to mongoose camelCase if necessary
    const updates: any = {};
    if (employeeData.full_name) updates.fullName = employeeData.full_name;
    if (employeeData.position) updates.position = employeeData.position;
    if (employeeData.phone) updates.phone = employeeData.phone;
    if (employeeData.status) updates.status = employeeData.status;
    if (employeeData.department_id) updates.departmentId = new mongoose.Types.ObjectId(employeeData.department_id);
    if (employeeData.hire_date) updates.hireDate = new Date(employeeData.hire_date);

    const data = await Employee.findByIdAndUpdate(
      employeeId,
      { $set: updates },
      { new: true }
    );
    if (!data) throw new Error("Employee not found");
    return data.toObject();
  },

  async provisionAuthAccount(data: { email: string, employeeId: string, fullName: string, organizationId: string }) {
    try {
      // In a real server context, this would be an internal call or a fetch to self
      const response = await fetch("/api/admin/employees/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (!response.ok) return { userId: null, error: result.error || "Provisioning failed" };
      return { userId: result.userId, error: null };
    } catch (err: any) {
      return { userId: null, error: err.message };
    }
  },

  async getEmployeesByDepartment(departmentId: string) {
    await connectToDatabase();
    const employees = await Employee.find({
      departmentId: new mongoose.Types.ObjectId(departmentId)
    }).sort({ createdAt: -1 });
    return employees.map(e => e.toObject());
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
      return {
        ...emp.toObject(),
        system_role: systemRole
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
    const employeeId = await this.generateNextEmployeeId(organizationId, org?.name || "SYS");

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

    return employee.toObject();
  },

  async generateNextEmployeeId(organizationId: string, organizationName: string) {
    await connectToDatabase();
    const count = await Employee.countDocuments({ organizationId: new mongoose.Types.ObjectId(organizationId) });

    const prefix = organizationName
      .split(/[\s-]+/)
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 3);

    const nextNumber = count + 1;
    const paddedNumber = nextNumber.toString().padStart(3, '0');
    return `${prefix}-${paddedNumber}`;
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
