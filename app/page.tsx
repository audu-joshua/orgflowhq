import Link from "next/link"
import { Navbar } from "@/components/layout/Navbar"
import { Pricing } from "@/components/sections/Pricing"
import { Footer } from "@/components/layout/Footer"
import ContactSection from "@/components/sections/ContactSection"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-card via-background to-card pt-32 pb-16 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Connected Branching Network SVG */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
            <defs>
              {/* Define the connected path network */}
              <path
                id="networkPath"
                d="
                  M 80,150
                  L 200,150
                  L 200,280
                  M 200,150
                  L 350,120
                  L 350,250
                  M 350,250
                  L 480,280
                  L 480,420
                  M 480,280
                  L 600,250
                  M 200,280
                  L 350,350
                  M 350,350
                  L 480,420
                  M 350,350
                  L 200,450
                  L 200,600
                  M 200,600
                  L 350,650
                  L 480,620
                  M 480,620
                  L 480,780
                  M 350,650
                  L 200,750
                  L 80,800
                  M 600,250
                  L 960,200
                  L 1350,250
                  M 480,620
                  L 720,650
                  L 960,680
                  L 1200,650
                  L 1480,620
                  M 1920,150
                  L 1750,150
                  L 1750,280
                  M 1750,150
                  L 1600,120
                  L 1600,250
                  M 1600,250
                  L 1480,280
                  L 1480,420
                  M 1480,280
                  L 1350,250
                  M 1750,280
                  L 1600,350
                  M 1600,350
                  L 1480,420
                  M 1600,350
                  L 1750,450
                  L 1750,600
                  M 1750,600
                  L 1600,650
                  L 1480,620
                  M 1480,620
                  L 1480,780
                  M 1600,650
                  L 1750,750
                  L 1850,800
                "
                fill="none"
              />

              {/* Glowing particle filter */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Draw the network path with dashed lines */}
            <use
              href="#networkPath"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="4,8"
              className="text-border/90 dark:text-white/15"
            />

            {/* Animated glowing particle */}
            <circle r="4" fill="currentColor" className="text-primary" filter="url(#glow)">
              <animateMotion
                dur="45s"
                repeatCount="indefinite"
              >
                <mpath href="#networkPath" />
              </animateMotion>
              <animate
                attributeName="opacity"
                values="0.6;1;0.6"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Additional subtle accent lines */}
            <g className="text-border dark:text-white/12" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4,8">
              <line x1="100" y1="500" x2="250" y2="500" />
              <line x1="1670" y1="500" x2="1820" y2="500" />
              <line x1="150" y1="100" x2="150" y2="250" />
              <line x1="1770" y1="100" x2="1770" y2="250" />
            </g>

            {/* Small decorative accent lines */}
            <g className="text-border/90 dark:text-white/10" stroke="currentColor" strokeWidth="1" strokeDasharray="3,6">
              <line x1="50" y1="350" x2="200" y2="350" />
              <line x1="1720" y1="350" x2="1870" y2="350" />
              <line x1="300" y1="550" x2="300" y2="700" />
              <line x1="1620" y1="550" x2="1620" y2="700" />
            </g>
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
                </div>
              </div>
            </div>

            {/* Center - Main Headline */}
            <div className="text-center">
              <div className="inline-block mb-4 px-4 py-2 bg-primary/10 rounded-full">
                <span className="text-primary text-sm font-semibold">Modern HR & Recruitment Software</span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
                HR & <span className="text-primary">Recruitment</span> Software
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                Manage hiring, payroll, timesheets, and your team, all in one platform.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Link
                  href="/register"
                  className="group px-8 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 flex items-center gap-2"
                >
                  Get Started
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
                <div className="relative">
                  {/* Map-like background */}
                  <div className="w-full h-32 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl mb-3 relative overflow-hidden">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
                      backgroundSize: '16px 16px',
                      opacity: 0.5
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

      <Pricing />

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

      <ContactSection />

      {/* CTA Section */}
      <section className="py-32 bg-primary">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-primary-foreground mb-4">Ready to Transform Your Hiring?</h2>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Join thousands of companies using OrgFlow to hire better, faster
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

      <Footer />
    </div>
  )
}
