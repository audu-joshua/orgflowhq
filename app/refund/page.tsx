import Link from "next/link"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"

export default function RefundPolicy() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-grow pt-28 pb-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h1 className="text-3xl font-bold mb-6">Refund Policy</h1>
                    <div className="prose dark:prose-invert max-w-none">
                        <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>

                        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Self-Service SaaS Platform</h2>
                        <p>
                            OrgFlowHQ is a self-service Software-as-a-Service (SaaS) platform. Users are encouraged to utilize our free tier or trial options (where available) to evaluate the service before committing to a paid plan.
                        </p>

                        <h2 className="text-2xl font-semibold mt-8 mb-4">2. No Refund Policy</h2>
                        <p>
                            Due to the nature of digital services and the immediate access to platform features upon payment, <strong>OrgFlowHQ does not offer refunds</strong> for any payments made, including monthly or annual subscriptions. All sales are final.
                        </p>
                        <p>
                            We do not provide pro-rated refunds for unused time if you decide to cancel your subscription before the end of the current billing cycle.
                        </p>

                        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Cancellation</h2>
                        <p>
                            You may cancel your subscription at any time through your account settings. Upon cancellation, you will continue to have access to the paid features until the end of your current billing period. No further charges will be applied after the current period ends.
                        </p>

                        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Exceptions</h2>
                        <p>
                            In rare cases of technical failure on our part that prevents access to the service for an extended period, we may, at our sole discretion, offer a credit or refund. Such exceptions are handled on a case-by-case basis.
                        </p>

                        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Contact Us</h2>
                        <p>
                            If you have any questions about our Refund Policy, please contact us at support@orgflowhq.com.
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
