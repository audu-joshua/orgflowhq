import Link from "next/link"
import { Navbar } from "@/components/layout/Navbar"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-card via-background to-card pt-32 pb-16 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Subtle directional lines - top left area */}
          <svg className="absolute top-24 left-12 w-40 h-40 text-border/60" viewBox="0 0 100 100">
            <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4,8" />
            <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4,8" />
          </svg>

          {/* Subtle directional lines - top right area */}
          <svg className="absolute top-40 right-20 w-48 h-24 text-border/60" viewBox="0 0 100 50">
            <line x1="0" y1="25" x2="100" y2="25" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4,8" />
          </svg>

          {/* Subtle directional lines - bottom left */}
          <svg className="absolute bottom-40 left-20 w-24 h-48 text-border/60" viewBox="0 0 50 100">
            <line x1="25" y1="0" x2="25" y2="100" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4,8" />
          </svg>

          {/* Subtle directional lines - bottom right area */}
          <svg className="absolute bottom-32 right-1/4 w-32 h-32 text-border/60" viewBox="0 0 100 100">
            <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4,8" />
            <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4,8" />
          </svg>

          {/* Additional decorative lines - middle left */}
          <svg className="absolute top-1/2 left-32 w-28 h-16 text-border/60" viewBox="0 0 100 50">
            <line x1="0" y1="25" x2="100" y2="25" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4,8" />
          </svg>

          {/* Additional decorative lines - middle right */}
          <svg className="absolute top-1/3 right-32 w-16 h-28 text-border/60" viewBox="0 0 50 100">
            <line x1="25" y1="0" x2="25" y2="100" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4,8" />
          </svg>

          {/* Extra lines - top center */}
          <svg className="absolute top-20 left-1/2 -translate-x-1/2 w-36 h-20 text-border/50" viewBox="0 0 100 50">
            <line x1="0" y1="25" x2="100" y2="25" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4,8" />
          </svg>

          {/* Extra lines - left center vertical */}
          <svg className="absolute top-1/4 left-8 w-16 h-36 text-border/50" viewBox="0 0 50 100">
            <line x1="25" y1="0" x2="25" y2="100" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4,8" />
          </svg>

          {/* Extra lines - right center */}
          <svg className="absolute bottom-1/3 right-12 w-32 h-20 text-border/50" viewBox="0 0 100 50">
            <line x1="0" y1="25" x2="100" y2="25" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4,8" />
          </svg>

          {/* Extra lines - bottom center */}
          <svg className="absolute bottom-24 left-1/3 w-20 h-32 text-border/50" viewBox="0 0 50 100">
            <line x1="25" y1="0" x2="25" y2="100" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4,8" />
          </svg>

          {/* Extra small accent lines - scattered */}
          <svg className="absolute top-1/3 left-1/4 w-20 h-12 text-border/40" viewBox="0 0 100 50">
            <line x1="0" y1="25" x2="100" y2="25" stroke="currentColor" strokeWidth="1" strokeDasharray="3,6" />
          </svg>

          <svg className="absolute bottom-1/4 right-1/3 w-12 h-20 text-border/40" viewBox="0 0 50 100">
            <line x1="25" y1="0" x2="25" y2="100" stroke="currentColor" strokeWidth="1" strokeDasharray="3,6" />
          </svg>

          <svg className="absolute top-2/3 right-1/4 w-24 h-16 text-border/40" viewBox="0 0 100 50">
            <line x1="0" y1="25" x2="100" y2="25" stroke="currentColor" strokeWidth="1" strokeDasharray="3,6" />
          </svg>

          {/* Gradient orbs */}
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 w-full relative z-10">
          {/* Trust Badges */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-card/80 backdrop-blur-sm rounded-full border border-border shadow-sm">
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-background flex items-center justify-center text-xs font-bold text-white">A</div>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-background flex items-center justify-center text-xs font-bold text-white">B</div>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-background flex items-center justify-center text-xs font-bold text-white">C</div>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-background flex items-center justify-center text-xs font-bold text-white">D</div>
              </div>
              <span className="text-xs text-muted-foreground font-medium">Trusted by HRs, Managers, Team Leads & Employees</span>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-[280px_1fr_280px] gap-8 items-center">
            {/* Left Side - Feature Toggle */}
            <div className="hidden lg:block">
              <div className="space-y-4">

                {/* Toggle Card 2 */}
                <div className="bg-card/60 backdrop-blur-sm border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-foreground">Track Time</span>
                    </div>
                    <div className="relative inline-block w-11 h-6">
                      <div className="w-11 h-6 bg-primary rounded-full shadow-inner"></div>
                      <div className="absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"></div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">90%</div>
                </div>
              </div>
            </div>

            {/* Center - Main Headline */}
            <div className="text-center">
              <div className="inline-block mb-4 px-4 py-2 bg-primary/10 rounded-full">
                <span className="text-primary text-sm font-semibold">Complete Workforce Management</span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
                Manage Your Team,{" "}
                <span className="text-primary">Anywhere</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                From time tracking to payroll, hiring to team collaboration, everything you need in one place.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link
                  href="/register"
                  className="group px-8 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 flex items-center gap-2"
                >
                  Get Started Free
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-3 bg-card text-foreground border-2 border-border rounded-xl hover:bg-muted transition-all font-semibold shadow-sm hover:shadow-md"
                >
                  Sign In
                </Link>
              </div>
            </div>

            {/* Right Side - Security Badge */}
            <div className="hidden lg:block">
              <div className="bg-card/60 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Secure Proxy Protection</div>
                <div className="relative">
                  {/* Map-like background */}
                  <div className="w-full h-32 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl mb-3 relative overflow-hidden">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
                      backgroundSize: '16px 16px',
                      opacity: 0.1
                    }}></div>
                    {/* Shield icon */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    {/* Decorative dots */}
                    <div className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <div className="absolute bottom-4 left-4 w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  </div>
                  <div className="text-xs text-center text-muted-foreground">Enterprise-grade security</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Features Section */}
      <section id="features" className="py-32 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-24">
            <h2 className="text-4xl font-bold text-foreground mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground">Everything you need to manage your hiring process</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="bg-card rounded-lg p-8 shadow hover:shadow-lg transition-shadow border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Time Tracking</h3>
              <p className="text-muted-foreground">
                Easy clock-in and clock-out for all team members with automated timesheets and location tracking.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card rounded-lg p-8 shadow hover:shadow-lg transition-shadow border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Track Applications</h3>
              <p className="text-muted-foreground">
                Monitor candidate applications through every stage with real-time status updates
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card rounded-lg p-8 shadow hover:shadow-lg transition-shadow border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 12H9m6 0a6 6 0 11-12 0 6 6 0 0112 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Team Collaboration</h3>
              <p className="text-muted-foreground">
                Work seamlessly with your team to evaluate and hire the best candidates
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-card">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground">Choose the plan that's right for you</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-background rounded-2xl p-8 border border-border shadow-sm hover:shadow-lg transition-all relative overflow-hidden">
              <h3 className="text-2xl font-bold text-foreground mb-2">Free Starter</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-primary">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-muted-foreground mb-6">Perfect for small teams just getting started.</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-foreground">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Up to 3 Job Postings
                </li>
                <li className="flex items-center gap-2 text-foreground">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Basic Candidate Tracking
                </li>
                <li className="flex items-center gap-2 text-foreground">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Email Support
                </li>
              </ul>
              <Link
                href="/register"
                className="block w-full py-3 text-center bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors font-medium"
              >
                Get Started
              </Link>
            </div>

            {/* Paid Plan */}
            <div className="bg-primary text-primary-foreground rounded-2xl p-8 shadow-xl transform scale-105 border-2 border-primary relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 px-3 py-1 text-xs font-bold rounded-bl-lg uppercase tracking-wider">
                Popular
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro Growth</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold">$10</span>
                <span className="text-primary-foreground/80">/month</span>
              </div>
              <p className="text-primary-foreground/80 mb-6">Everything you need to scale your hiring.</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Unlimited Job Postings
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Advanced Analytics
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Priority Support
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Team Collaboration Tools
                </li>
              </ul>
              <Link
                href="/register"
                className="block w-full py-3 text-center bg-background text-primary rounded-lg hover:bg-background/90 transition-colors font-bold"
              >
                Upgrade Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {/* Reviews (Testimonials) Section */}
      <section id="reviews" className="py-32 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Loved by Teams</h2>
            <p className="text-xl text-muted-foreground">See what our users have to say</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="bg-card rounded-lg p-8 shadow border border-border">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-foreground mb-4">
                "This platform has transformed how we manage our hiring process. Highly recommended!"
              </p>
              <p className="font-semibold text-foreground">Sarah Johnson</p>
              <p className="text-sm text-muted-foreground">HR Manager, Tech Corp</p>
            </div>

            <div className="bg-card rounded-lg p-8 shadow border border-border">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-foreground mb-4">
                "The best investment we made for our recruitment team. Saves us hours every week."
              </p>
              <p className="font-semibold text-foreground">Michael Chen</p>
              <p className="text-sm text-muted-foreground">Founder, StartUp Inc</p>
            </div>

            <div className="bg-card rounded-lg p-8 shadow border border-border">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-foreground mb-4">
                "Intuitive interface and excellent customer support. Couldn't ask for more!"
              </p>
              <p className="font-semibold text-foreground">Emily Rodriguez</p>
              <p className="text-sm text-muted-foreground">Recruiter, Global Solutions</p>
            </div>
          </div>
        </div>
      </section>



      {/* Contact Section */}
      <section id="contact" className="py-32 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-20">
            <h2 className="text-4xl font-bold text-foreground mb-4">Get in Touch</h2>
            <p className="text-muted-foreground">Have questions? We'd love to hear from you.</p>
          </div>
          <form className="max-w-xl mx-auto space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">First Name</label>
                <input type="text" className="w-full px-4 py-3 rounded-lg bg-card border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" placeholder="John" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Last Name</label>
                <input type="text" className="w-full px-4 py-3 rounded-lg bg-card border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" placeholder="Doe" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <input type="email" className="w-full px-4 py-3 rounded-lg bg-card border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" placeholder="john@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Message</label>
              <textarea rows={4} className="w-full px-4 py-3 rounded-lg bg-card border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" placeholder="How can we help you?"></textarea>
            </div>
            <button type="button" className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-opacity">
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-primary">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-primary-foreground mb-4">Ready to Transform Your Hiring?</h2>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Join thousands of companies using HR to hire better, faster
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/register"
              className="px-8 py-3 bg-primary-foreground text-primary rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Start Free Trial
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 bg-primary-foreground/20 text-primary-foreground rounded-lg hover:bg-primary-foreground/30 transition-colors font-medium border border-primary-foreground/50"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="bg-card text-muted-foreground py-16 border-t border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-1 mb-4">
                <img src="/logo.png" alt="OrgFlow" className="h-10 w-auto object-contain" />
                <span className="font-bold text-foreground text-xl tracking-tight -ml-1.5">rgFlow</span>
              </div>
              <p className="text-sm text-muted-foreground">The modern platform for managing your workforce and team coordination</p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Security
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} OrgFlow. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20v-7.21h-2.3V9.25h2.3V7.31c0-2.31 1.41-3.57 3.45-3.57 1.02 0 1.9.08 2.15.11v2.49h-1.52c-1.15 0-1.38.55-1.38 1.37v1.79h2.77l-.29 3.54h-2.48V20" />
                </svg>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7" />
                </svg>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
