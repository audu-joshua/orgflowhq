import Link from "next/link"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow pt-28 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
          <div className="prose dark:prose-invert max-w-none">
            <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using OrgFlowHQ, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Description of Service</h2>
            <p>
              OrgFlowHQ provides a platform for HR management and applicant tracking. We reserve the right to modify or discontinue the service at any time.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Acceptable Use</h2>
            <p>
              You agree not to use the service for any illegal purpose or in any way that interrupts, damages, or impairs the service. You are solely responsible for the content you post (e.g., job descriptions, candidate data).
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Google Integration</h2>
            <p>
              By connecting your Google account, you grant OrgFlowHQ permission to access your Google Calendar to schedule interviews on your behalf. You may revoke this access at any time via your Google Account security settings.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, OrgFlowHQ shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the service.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Contact</h2>
            <p>
              For any questions regarding these terms, please contact us at support@orgflowhq.com.
            </p>

            <div className="mt-8 pt-8 border-t">
              <Link href="/" className="text-primary hover:underline">Return to Home</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
