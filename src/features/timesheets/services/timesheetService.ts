import { getSupabaseClient } from "@/lib/supabaseClient"

export interface Timesheet {
    id: string
    employee_id: string
    organization_id: string
    clock_in: string
    clock_out: string | null
    status: 'pending' | 'approved' | 'rejected'
    notes?: string
    created_at?: string
    employees?: {
        full_name: string
        position: string
    }
    // Audit Fields
    created_by?: string
    created_via?: 'employee' | 'admin_override'
    override_reason?: string
    history?: any[]
}

export const timesheetService = {
    async clockIn(employeeId: string, organizationId: string) {
        const supabase = getSupabaseClient()
        // Get current user ID for audit
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
            .from("timesheets")
            .insert([{
                employee_id: employeeId,
                organization_id: organizationId,
                clock_in: new Date().toISOString(),
                status: 'pending',
                created_via: 'employee',
                created_by: user?.id
            }])
            .select()
            .single()

        if (error) throw error
        return data as Timesheet
    },

    async clockOut(timesheetId: string) {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase
            .from("timesheets")
            .update({
                clock_out: new Date().toISOString()
            })
            .eq("id", timesheetId)
            .select()
            .single()

        if (error) throw error
        return data as Timesheet
    },

    async getEmployeeTimesheets(employeeId: string) {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase
            .from("timesheets")
            .select("*")
            .eq("employee_id", employeeId)
            .order("clock_in", { ascending: false })

        if (error) throw error
        return data as Timesheet[]
    },

    async getAllTimesheets(organizationId: string) {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase
            .from("timesheets")
            .select("*, employees(full_name, position)")
            .eq("organization_id", organizationId)
            .order("clock_in", { ascending: false })

        if (error) throw error
        return data
    },

    async updateTimesheetStatus(timesheetId: string, status: 'approved' | 'rejected') {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase
            .from("timesheets")
            .update({ status })
            .eq("id", timesheetId)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async updateTimesheetsStatus(timesheetIds: string[], status: 'approved' | 'rejected') {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase
            .from("timesheets")
            .update({ status })
            .in("id", timesheetIds)
            .select()

        if (error) throw error
        return data
    },

    async createTimesheet(timesheet: {
        employee_id: string
        organization_id: string
        clock_in: string
        clock_out?: string | null
        notes?: string
    }) {
        const supabase = getSupabaseClient()
        // Get current user ID for audit
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
            .from("timesheets")
            .insert([{
                ...timesheet,
                status: 'approved', // Admin-created timesheets are auto-approved
                created_via: 'admin_override',
                created_by: user?.id,
                override_reason: timesheet.notes // Map notes to override_reason for admin creation
            }])
            .select()
            .single()

        if (error) throw error
        return data as Timesheet
    },

    async adminUpdateTimesheet(timesheetId: string, updates: { clock_out?: string, notes?: string }) {
        // Enforce restriction: No clock_in updates allowed here
        const supabase = getSupabaseClient()
        const { data, error } = await supabase
            .from("timesheets")
            .update(updates)
            .eq("id", timesheetId)
            .select()
            .single()

        if (error) throw error
        return data as Timesheet
    }
}
