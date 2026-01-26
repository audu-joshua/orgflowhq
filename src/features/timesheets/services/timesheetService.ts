// server-only: Do not import this file on the client. Use server actions instead.
import { connectToDatabase } from "@/lib/mongodb";
import { Timesheet as TimesheetModel } from "@/models/Business";
import mongoose from "mongoose";

export interface Timesheet {
    id: string;
    employee_id: string;
    organization_id: string;
    clock_in: string;
    clock_out: string | null;
    status: 'pending' | 'approved' | 'rejected';
    notes?: string;
    created_at?: string;
    employees?: {
        full_name: string;
        position: string;
    };
    created_by?: string;
    created_via?: 'employee' | 'admin_override';
    override_reason?: string;
    history?: any[];
}

const mapModelToType = (doc: any): Timesheet => {
    const obj = doc.toObject ? doc.toObject() : doc;
    return {
        id: obj._id.toString(),
        employee_id: obj.employeeId?.toString(),
        organization_id: obj.organizationId?.toString(),
        clock_in: obj.clockIn?.toISOString(),
        clock_out: obj.clockOut?.toISOString() || null,
        status: obj.status,
        notes: obj.notes,
        created_at: obj.createdAt?.toISOString(),
        employees: obj.employeeId?.fullName ? {
            full_name: obj.employeeId.fullName,
            position: obj.employeeId.position
        } : undefined,
        created_by: obj.createdBy?.toString(),
        created_via: obj.createdVia,
        override_reason: obj.override_reason,
        history: obj.history
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
                select: 'fullName position'
            })
            .sort({ clockIn: -1 });

        return records.map((doc: any) => {
            const obj = doc.toObject();
            return {
                ...mapModelToType(doc),
                employees: obj.employeeId ? {
                    full_name: obj.employeeId.fullName,
                    position: obj.employeeId.position
                } : undefined
            };
        });
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
        employee_id: string;
        organization_id: string;
        clock_in: string;
        clock_out?: string | null;
        notes?: string;
        user_id?: string;
    }) {
        await connectToDatabase();

        const record = await TimesheetModel.create({
            employeeId: new mongoose.Types.ObjectId(timesheet.employee_id),
            organizationId: new mongoose.Types.ObjectId(timesheet.organization_id),
            clockIn: new Date(timesheet.clock_in),
            clockOut: timesheet.clock_out ? new Date(timesheet.clock_out) : undefined,
            notes: timesheet.notes,
            status: 'approved', // Admin-created timesheets are auto-approved
            createdVia: 'admin_override',
            createdBy: timesheet.user_id ? new mongoose.Types.ObjectId(timesheet.user_id) : undefined,
            overrideReason: timesheet.notes
        });

        return mapModelToType(record);
    },

    async adminUpdateTimesheet(timesheetId: string, updates: { clock_out?: string, notes?: string }) {
        await connectToDatabase();

        const mongoUpdates: any = {};
        if (updates.clock_out) mongoUpdates.clockOut = new Date(updates.clock_out);
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
