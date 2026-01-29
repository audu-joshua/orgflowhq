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
    };
    createdBy?: string;
    createdVia?: 'employee' | 'admin_override';
    overrideReason?: string;
    history?: any[];

    // Legacy compatibility if needed
    employee_id?: string;
    organization_id?: string;
    clock_in?: string;
    clock_out?: string | null;
    created_at?: string;
}
