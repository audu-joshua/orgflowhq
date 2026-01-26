// server-only: Do not import this file on the client. Use server actions instead.
import { connectToDatabase } from "@/lib/mongodb";
import { Timesheet as TimesheetModel } from "@/models/Business";
import mongoose from "mongoose";

export interface Timesheet {
    id: string;
    _id: string;
    employeeId: string;
    organizationId: string;
    clockIn: string;
    clockOut: string | null;
    status: 'pending' | 'approved' | 'rejected';
    notes?: string;
    createdAt?: string;
    employees?: {
        fullName: string;
        position: string;
        profileImageUrl?: string | null;
        id?: string;
        // Legacy
        full_name?: string;
    };
    createdBy?: string;
    createdVia?: 'employee' | 'admin_override';
    overrideReason?: string;
    history?: any[];

    // Legacy
    employee_id: string;
    organization_id: string;
    clock_in: string;
    clock_out: string | null;
    created_at?: string;
}

const mapModelToType = (doc: any): Timesheet => {
    const obj = doc.toObject ? doc.toObject() : doc;
    const empId = obj.employeeId?._id?.toString() || obj.employeeId?.toString();
    const orgId = obj.organizationId?._id?.toString() || obj.organizationId?.toString();

    return {
        id: obj._id.toString(),
        _id: obj._id.toString(),
        employeeId: empId,
        organizationId: orgId,
        clockIn: obj.clockIn?.toISOString(),
        clockOut: obj.clockOut?.toISOString() || null,
        status: obj.status,
        notes: obj.notes,
        createdAt: obj.createdAt?.toISOString(),
        employees: obj.employeeId?.fullName ? {
            fullName: obj.employeeId.fullName,
            position: obj.employeeId.position,
            profileImageUrl: obj.employeeId.profileImageUrl,
            id: empId
        } : undefined,
        createdBy: obj.createdBy?.toString(),
        createdVia: obj.createdVia,
        overrideReason: obj.overrideReason || obj.override_reason,
        history: obj.history,

        // Legacy compatibility
        employee_id: empId,
        organization_id: orgId,
        clock_in: obj.clockIn?.toISOString(),
        clock_out: obj.clockOut?.toISOString() || null,
        created_at: obj.createdAt?.toISOString(),
    };
};

export const timesheetService = {
    async clockIn(employeeId: string, organizationId: string, userId?: string) {
        await connectToDatabase();

        const record = await TimesheetModel.create({
            employeeId: new mongoose.Types.ObjectId(employeeId),
            organizationId: new mongoose.Types.ObjectId(organizationId),
            clockIn: new Date(),
            status: 'pending',
            createdVia: 'employee',
            createdBy: userId ? new mongoose.Types.ObjectId(userId) : undefined
        });

        return mapModelToType(record);
    },

    async clockOut(timesheetId: string) {
        await connectToDatabase();

        const record = await TimesheetModel.findByIdAndUpdate(
            timesheetId,
            { clockOut: new Date() },
            { new: true }
        );

        if (!record) throw new Error("Timesheet not found");
        return mapModelToType(record);
    },

    async getEmployeeTimesheets(employeeId: string) {
        await connectToDatabase();

        const records = await TimesheetModel.find({
            employeeId: new mongoose.Types.ObjectId(employeeId)
        }).sort({ clockIn: -1 });

        return records.map(mapModelToType);
    },

    async getAllTimesheets(organizationId: string) {
        await connectToDatabase();

        const records = await TimesheetModel.find({
            organizationId: new mongoose.Types.ObjectId(organizationId)
        })
            .populate({
                path: 'employeeId',
                select: 'fullName position profileImageUrl'
            })
            .sort({ clockIn: -1 });

        return records.map(mapModelToType);
    },

    async updateTimesheetStatus(timesheetId: string, status: 'approved' | 'rejected') {
        await connectToDatabase();

        const record = await TimesheetModel.findByIdAndUpdate(
            timesheetId,
            { status },
            { new: true }
        );

        if (!record) throw new Error("Timesheet not found");
        return mapModelToType(record);
    },

    async updateTimesheetsStatus(timesheetIds: string[], status: 'approved' | 'rejected') {
        await connectToDatabase();

        await TimesheetModel.updateMany(
            { _id: { $in: timesheetIds.map(id => new mongoose.Types.ObjectId(id)) } },
            { status }
        );

        const records = await TimesheetModel.find({
            _id: { $in: timesheetIds.map(id => new mongoose.Types.ObjectId(id)) }
        });

        return records.map(mapModelToType);
    },

    async createTimesheet(timesheet: {
        employeeId?: string;
        employee_id?: string;
        organizationId?: string;
        organization_id?: string;
        clockIn?: string;
        clock_in?: string;
        clockOut?: string | null;
        clock_out?: string | null;
        notes?: string;
        userId?: string;
        user_id?: string;
    }) {
        await connectToDatabase();

        const finalEmployeeId = timesheet.employeeId || timesheet.employee_id;
        const finalOrganizationId = timesheet.organizationId || timesheet.organization_id;
        const finalClockIn = timesheet.clockIn || timesheet.clock_in;
        const finalClockOut = timesheet.clockOut || timesheet.clock_out;
        const finalUserId = timesheet.userId || timesheet.user_id;

        if (!finalEmployeeId || !finalOrganizationId || !finalClockIn) {
            throw new Error("Missing required fields for timesheet creation");
        }

        const record = await TimesheetModel.create({
            employeeId: new mongoose.Types.ObjectId(finalEmployeeId),
            organizationId: new mongoose.Types.ObjectId(finalOrganizationId),
            clockIn: new Date(finalClockIn),
            clockOut: finalClockOut ? new Date(finalClockOut) : undefined,
            notes: timesheet.notes,
            status: 'approved', // Admin-created timesheets are auto-approved
            createdVia: 'admin_override',
            createdBy: finalUserId ? new mongoose.Types.ObjectId(finalUserId) : undefined,
            overrideReason: timesheet.notes
        });

        return mapModelToType(record);
    },

    async adminUpdateTimesheet(timesheetId: string, updates: { clockOut?: string, clock_out?: string, notes?: string }) {
        await connectToDatabase();

        const mongoUpdates: any = {};
        const finalClockOut = updates.clockOut || updates.clock_out;
        if (finalClockOut) mongoUpdates.clockOut = new Date(finalClockOut);
        if (updates.notes) mongoUpdates.notes = updates.notes;

        const record = await TimesheetModel.findByIdAndUpdate(
            timesheetId,
            mongoUpdates,
            { new: true }
        );

        if (!record) throw new Error("Timesheet not found");
        return mapModelToType(record);
    }
};
