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
