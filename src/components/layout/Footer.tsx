import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function Footer() {
    return (
        <footer className="bg-[#020617] text-slate-400 pt-24 pb-12 relative overflow-hidden border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 mb-12">
                    {/* Left Side: Brand and Newsletter */}
                    <div className="space-y-10 flex flex-col items-center">
                        <div className="flex items-center gap-0 justify-center">
                            <img src="/logo.png" alt="O" className="h-[7.5rem] md:h-[9rem] w-auto -mr-2 md:-mr-4" />
                            <h2 className="text-7xl md:text-8xl font-bold text-white tracking-tighter opacity-90">
                                rgFlow
                            </h2>
                        </div>

                        <div className="max-w-[320px] w-full text-center">
                            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em] mb-4">Newsletter</p>
                            <div className="relative group">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-full py-3 px-5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#0fadaa]/50 transition-all group-hover:border-white/20 text-center"
                                />
                                <button className="absolute right-1.5 top-1.5 w-8 h-8 bg-[#0fadaa] rounded-full flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#0fadaa]/20">
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Links and Semi-circle Graphic */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 relative">
                        <div>
                            <h4 className="text-white font-semibold mb-6">Find your Way</h4>
                            <ul className="space-y-4 text-sm">
                                <li><Link href="/" className="hover:text-[#0fadaa] transition-colors">Home</Link></li>
                                <li><Link href="/#features" className="hover:text-[#0fadaa] transition-colors">About Us</Link></li>
                                <li><Link href="/roles" className="hover:text-[#0fadaa] transition-colors">Roles</Link></li>
                                <li><Link href="/#contact" className="hover:text-[#0fadaa] transition-colors">Contact Us</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-6">Solutions</h4>
                            <ul className="space-y-4 text-sm">
                                <li><Link href="/hr-software" className="hover:text-[#0fadaa] transition-colors">Human Resources</Link></li>
                                <li><Link href="/recruitment-software" className="hover:text-[#0fadaa] transition-colors">Recruitment</Link></li>
                                <li><Link href="/applicant-tracking-system" className="hover:text-[#0fadaa] transition-colors">Applicant Tracking</Link></li>
                                <li><Link href="/time-tracking" className="hover:text-[#0fadaa] transition-colors">Time Tracking</Link></li>
                            </ul>
                        </div>
                        <div className="col-span-2 sm:col-span-1 border-t border-white/5 pt-8 sm:pt-0 sm:border-0 text-center sm:text-left">
                            <h4 className="hidden sm:block text-white font-semibold mb-6">Contact Us</h4>
                            <p className="text-sm leading-relaxed text-[#0fadaa] font-medium mb-1">
                                support@orgflowhq.com
                            </p>
                            <p className="hidden sm:block text-sm leading-relaxed opacity-60">
                                Global Workforce Management<br />
                                Available 24/7
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="pt-4 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[11px] text-slate-600">
                        © {new Date().getFullYear()} OrgFlow Co. All rights reserved.
                    </p>
                    <div className="flex gap-8 text-[11px]">
                        <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link href="#" className="hover:text-white transition-colors">Cookies</Link>
                    </div>
                </div>
            </div>

            {/* Subtle Gradient Orbs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0fadaa]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        </footer>
    )
}

