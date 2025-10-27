import Link from "next/link"
import { Navbar } from "@/components/layout/Navbar"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-card via-background to-card py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-block mb-4 px-4 py-2 bg-primary/10 rounded-full">
              <span className="text-primary text-sm font-semibold">Streamline Your Hiring</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Hire the Right Talent, <span className="text-primary">Faster</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Manage job applications, track candidates, and collaborate with your team all in one powerful platform
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/register"
                className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
              >
                Get Started Free
              </Link>
              <Link
                href="/login"
                className="px-8 py-3 bg-card text-primary border-2 border-primary rounded-lg hover:bg-muted transition-colors font-medium"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">10K+</div>
              <p className="text-muted-foreground">Active Users</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">500K+</div>
              <p className="text-muted-foreground">Applications Processed</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">98%</div>
              <p className="text-muted-foreground">Satisfaction Rate</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <p className="text-muted-foreground">Support Available</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground">Everything you need to manage your hiring process</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-card rounded-lg p-8 shadow hover:shadow-lg transition-shadow border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Manage Roles</h3>
              <p className="text-muted-foreground">
                Create and manage job openings with detailed descriptions, images, and requirements
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

      {/* How It Works Section */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">Get started in three simple steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Create Your Organization</h3>
              <p className="text-muted-foreground">Sign up and set up your organization in minutes</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Post Job Roles</h3>
              <p className="text-muted-foreground">Create job openings and share them with candidates</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Hire Top Talent</h3>
              <p className="text-muted-foreground">Review applications and make hiring decisions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Loved by Teams</h2>
            <p className="text-xl text-muted-foreground">See what our users have to say</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
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

      {/* CTA Section */}
      <section className="py-20 bg-primary">
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
      <footer className="bg-card text-muted-foreground py-16 border-t border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">H</span>
                </div>
                <span className="font-bold text-foreground">HR</span>
              </div>
              <p className="text-sm text-muted-foreground">The modern platform for managing your hiring process</p>
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
            <p className="text-sm text-muted-foreground">© 2025 HR. All rights reserved.</p>
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
