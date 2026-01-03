"use client"

import { Banknote, Rocket, ShieldCheck, Timer } from "lucide-react"

export default function PayrollComingSoon() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-card border border-border rounded-2xl animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Banknote className="text-primary" size={40} />
            </div>

            <h1 className="text-3xl font-bold text-foreground mb-4">Payroll is Coming Soon!</h1>
            <p className="text-muted-foreground max-w-md mx-auto mb-10 text-lg">
                We're building a powerful, automated payroll system to help you manage salaries, taxes, and benefits with one click.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
                <div className="p-4 bg-muted/30 rounded-xl border border-border/50 flex flex-col items-center gap-3">
                    <Timer className="text-primary" size={24} />
                    <span className="font-semibold text-sm">Automated Payouts</span>
                </div>
                <div className="p-4 bg-muted/30 rounded-xl border border-border/50 flex flex-col items-center gap-3">
                    <ShieldCheck className="text-primary" size={24} />
                    <span className="font-semibold text-sm">Tax Compliance</span>
                </div>
                <div className="p-4 bg-muted/30 rounded-xl border border-border/50 flex flex-col items-center gap-3">
                    <Rocket className="text-primary" size={24} />
                    <span className="font-semibold text-sm">Direct Deposit</span>
                </div>
            </div>

            <div className="mt-12 inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Under Development
            </div>
        </div>
    )
}
