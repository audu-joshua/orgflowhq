// server-only: Do not import this file on the client. Use server actions instead.
import { connectToDatabase } from "@/lib/mongodb";
import { JobRole } from "@/models/Business";
import { Application } from "@/models/Recruitment";
import mongoose from "mongoose";

export const dashboardService = {
  async getRoles(organizationId: string) {
    await connectToDatabase();

    const roles = await JobRole.find({
      organizationId: new mongoose.Types.ObjectId(organizationId)
    }).sort({ createdAt: -1 });

    const rolesWithCount = await Promise.all(roles.map(async (role) => {
      const count = await Application.countDocuments({ roleId: role._id });
      const obj = role.toObject();
      return {
        ...obj,
        id: obj._id.toString(),
        organization_id: obj.organizationId.toString(),
        application_count: count
      };
    }));

    return rolesWithCount;
  },

  async getApplicationStats(organizationId: string) {
    await connectToDatabase();

    const applications = await Application.find({
      organizationId: new mongoose.Types.ObjectId(organizationId)
    });

    const stats = {
      total: applications.length,
      new: applications.filter((a: any) => a.status === "new").length,
      shortlisted: applications.filter((a: any) => a.status === "shortlisted").length,
      interviewed: applications.filter((a: any) => a.status === "interviewed").length,
      hired: applications.filter((a: any) => a.status === "hired").length,
    };

    return stats;
  },

  async getApplicationsOverTime(organizationId: string) {
    await connectToDatabase();

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const applications = await Application.find({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      createdAt: { $gte: sixMonthsAgo }
    }).sort({ createdAt: 1 });

    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      last6Months.push(d.toLocaleString('default', { month: 'short' }));
    }

    const groupedData = last6Months.reduce((acc: any, month) => {
      acc[month] = { applications: 0, hired: 0 };
      return acc;
    }, {});

    applications.forEach((app: any) => {
      const month = new Date(app.createdAt).toLocaleString('default', { month: 'short' });
      if (groupedData[month]) {
        groupedData[month].applications += 1;
        if (app.status === 'hired') {
          groupedData[month].hired += 1;
        }
      }
    });

    return last6Months.map(month => ({
      name: month,
      applications: groupedData[month].applications,
      hired: groupedData[month].hired
    }));
  },

  async getEmployeeStats(organizationId: string) {
    const { Employee } = await import("@/models/Business");
    await connectToDatabase();

    const employees = await Employee.find({
      organizationId: new mongoose.Types.ObjectId(organizationId)
    });

    return {
      total: employees.length,
      active: employees.filter((e: any) => e.status === "active").length,
      invited: employees.filter((e: any) => e.status === "invited").length,
      inactive: employees.filter((e: any) => e.status === "inactive").length,
    };
  },

  async getTimesheetStats(organizationId: string) {
    const { Timesheet } = await import("@/models/Business");
    await connectToDatabase();

    const timesheets = await Timesheet.find({
      organizationId: new mongoose.Types.ObjectId(organizationId)
    });

    return {
      total: timesheets.length,
      pending: timesheets.filter((t: any) => t.status === "pending").length,
      approved: timesheets.filter((t: any) => t.status === "approved").length,
      rejected: timesheets.filter((t: any) => t.status === "rejected").length,
    };
  }
}
