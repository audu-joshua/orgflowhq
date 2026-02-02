"use client"


import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Users, FileText, CheckCircle, Clock, Briefcase, TrendingUp } from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { getDashboardRolesAction, getApplicationStatsAction, getApplicationsOverTimeAction, getEmployeeStatsAction, getTimesheetStatsAction } from "../actions"
import { RoleCard } from "./RoleCard"
import { StatCard } from "./StatCard"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { EmptyState } from "@/components/shared/EmptyState"
import type { Role } from "@/features/roles/types"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

export function DashboardContent() {
  const router = useRouter()
  const { user, organization } = useAppStore()
  const { loading: authLoading } = useAuth()
  const [roles, setRoles] = useState<(Role & { application_count?: number })[]>([])
  const [stats, setStats] = useState({ total: 0, new: 0, shortlisted: 0, interviewed: 0, hired: 0 })
  const [employeeStats, setEmployeeStats] = useState({ total: 0, active: 0, invited: 0, inactive: 0 })
  const [timesheetStats, setTimesheetStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 })
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push("/login")
      return
    }

    if (!organization) {
      console.log("[DashboardContent] Organization not found in store, waiting...")
      return
    }

    if (user.role === "finance") {
      router.push("/dashboard/timesheets")
      return
    }

    const loadData = async () => {
      try {
        const [rolesData, statsData, chartHistory, empStats, tsStats] = await Promise.all([
          getDashboardRolesAction(organization.id),
          getApplicationStatsAction(organization.id),
          getApplicationsOverTimeAction(organization.id),
          getEmployeeStatsAction(organization.id),
          getTimesheetStatsAction(organization.id)
        ])
        setRoles(rolesData)
        setStats(statsData)
        setChartData(chartHistory)
        setEmployeeStats(empStats)
        setTimesheetStats(tsStats)
      } catch (error) {
        console.error("Failed to load dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user, organization, authLoading, router])

  if (authLoading || loading) {
    return <LoadingSpinner />
  }



  const funnelData = [
    { name: 'New', value: stats.new },
    { name: 'Shortlisted', value: stats.shortlisted },
    { name: 'Interview', value: stats.interviewed },
    { name: 'Hired', value: stats.hired },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/dashboard/roles/new")}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 font-medium"
          >
            <Plus size={18} />
            <span>Create New Role</span>
          </button>
        </div>
      </div>

      {/* Recruitment Metrics */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="text-primary" size={20} />
          <h2 className="text-lg font-semibold text-foreground">Recruitment Summary</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Total Applications"
            value={stats.total}
            icon={FileText}
            variant="solid"
            index={0}
            trend={{ value: 12, positive: true }}
          />
          <StatCard
            label="In Review"
            value={stats.new + stats.shortlisted}
            icon={Users}
            variant="subtle"
            index={1}
          />
          <StatCard
            label="Interviews Scheduled"
            value={stats.interviewed}
            icon={Clock}
            variant="subtle"
            index={2}
          />
          <StatCard
            label="Hired Candidates"
            value={stats.hired}
            icon={CheckCircle}
            variant="subtle"
            index={3}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Employee Summary */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="text-primary" size={20} />
            <h2 className="text-lg font-semibold text-foreground">Employee Summary</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              label="Employees"
              value={employeeStats.total}
              icon={Users}
              variant="outline"
              index={0}
            />
            <StatCard
              label="Active"
              value={employeeStats.active}
              icon={CheckCircle}
              variant="subtle"
              index={1}
            />
            <StatCard
              label="Invited"
              value={employeeStats.invited}
              icon={Clock}
              variant="subtle"
              index={2}
            />
          </div>
        </div>

        {/* Timesheet Summary */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="text-primary" size={20} />
            <h2 className="text-lg font-semibold text-foreground">Timesheet Summary</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              label="Total Logs"
              value={timesheetStats.total}
              icon={FileText}
              variant="outline"
              index={0}
            />
            <StatCard
              label="Pending"
              value={timesheetStats.pending}
              icon={Clock}
              variant="subtle"
              index={1}
              trend={timesheetStats.pending > 0 ? { value: timesheetStats.pending, positive: false } : undefined}
            />
            <StatCard
              label="Approved"
              value={timesheetStats.approved}
              icon={CheckCircle}
              variant="subtle"
              index={2}
            />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">

        {/* Main Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-foreground">Application Trends</h3>
              <p className="text-sm text-muted-foreground">Applications received over time</p>
            </div>
            <div className="p-2 bg-muted/50 rounded-lg">
              <TrendingUp size={20} className="text-muted-foreground" />
            </div>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorHired" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', border: '1px solid var(--border)' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                  cursor={{ stroke: 'var(--border)', strokeWidth: 2 }}
                />
                <Area
                  type="natural"
                  dataKey="applications"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorApps)"
                  name="Applications"
                />
                <Area
                  type="natural"
                  dataKey="hired"
                  stroke="#22c55e"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorHired)"
                  name="Hired"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funnel/Side Chart */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-foreground mb-6">Recruitment Funnel</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={80}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12, fontWeight: 500 }}
                />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', border: '1px solid var(--border)' }}
                />
                <Bar dataKey="value" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Roles Section */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Briefcase className="text-primary" size={24} />
          <h2 className="text-xl font-bold text-foreground">Active Job Roles</h2>
        </div>

        {roles.length === 0 ? (
          <EmptyState
            title="No roles yet"
            description="Create your first job role to start accepting applications"
            action={{
              label: "Create Role",
              onClick: () => router.push("/dashboard/roles/new"),
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => (
              <RoleCard key={role.id} role={role} />
            ))}

            {/* 'Add New' Card */}
            <button
              onClick={() => router.push("/dashboard/roles/new")}
              className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-primary/5 transition-all group min-h-[200px]"
            >
              <div className="p-4 bg-muted/50 rounded-full group-hover:bg-primary/10 transition-colors">
                <Plus size={32} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="font-medium text-muted-foreground group-hover:text-primary transition-colors">Create New Role</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
