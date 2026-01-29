import Link from "next/link"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow pt-28 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
          <div className="prose dark:prose-invert max-w-none">
            <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
            <p>
              OrgFlowHQ ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you access our recruiting and HR management platform.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Google User Data</h2>
            <p>
              Our application integrates with Google APIs to enhance your scheduling experience. If you choose to connect your Google Calendar, we access the following:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Calendar Events:</strong> We access your calendar to schedule interviews and check for conflicts. We only add events related to your recruiting activities using the application.</li>
              <li><strong>Google Meet:</strong> We generate Google Meet links for virtual interviews.</li>
            </ul>
            <p>
              We do <strong>not</strong> sell your Google user data. We store authentication tokens securely and only use them to perform the actions you explicitly request (scheduling interviews).
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Information We Collect</h2>
            <p>
              We collect information you provide directly to us, such as when you create an account, post a job, or apply for a job. This may include your name, email address, and professional details.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">4. How We Use Your Information</h2>
            <p>
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide, maintain, and improve our services.</li>
              <li>Facilitate the recruiting process (e.g., scheduling interviews, tracking applicants).</li>
              <li>Send you technical notices and support messages.</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at support@orgflowhq.com.
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
