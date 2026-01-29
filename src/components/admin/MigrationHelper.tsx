"use client"

import { useState } from "react"
import { useAppStore } from "@/store/useAppStore"
import { Button } from "@/components/ui/button"
import { toast } from "@/lib/toast"
import { Loader2, ShieldCheck, Users } from "lucide-react"
import { useSession } from "next-auth/react"

export function MigrationHelper() {
    const { organization } = useAppStore()
    const { data: session } = useSession()
    const [migrating, setMigrating] = useState(false)
    const [results, setResults] = useState<any[] | null>(null)

    const runMigration = async () => {
        if (!organization) return
        setMigrating(true)
        setResults(null)

        try {
            if (!session) {
                toast.error("You must be logged in")
                return
            }

            const res = await fetch("/api/admin/employees/migrate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ organizationId: organization.id })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Migration failed")
            }

            setResults(data.results)
            toast.success("Migration completed!")
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setMigrating(false)
        }
    }

    return (
        <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-4 my-8">
            <div className="flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-amber-600 mt-1" />
                <div>
                    <h3 className="font-bold text-amber-900">Security Migration Required</h3>
                    <p className="text-sm text-amber-800/80">
                        Some employees were created before the new secure auth system.
                        Run this tool to automatically provision login accounts for them.
                    </p>
                </div>
            </div>

            <div className="pl-9">
                <Button
                    onClick={runMigration}
                    disabled={migrating}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                    {migrating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Users className="w-4 h-4 mr-2" />}
                    {migrating ? "Provisioning Accounts..." : "Fix Existing Employees Now"}
                </Button>
            </div>

            {results && (
                <div className="mt-4 p-4 bg-white rounded-lg border text-xs font-mono max-h-60 overflow-y-auto">
                    <p className="font-bold mb-2">Migration Results ({results.length} processed):</p>
                    {results.map((r: any, i: number) => (
                        <div key={i} className={r.status === "error" || r.status === "failed" ? "text-red-600" : "text-green-600"}>
                            [{r.status.toUpperCase()}] {r.email} {r.error ? `- ${r.error}` : ""}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
