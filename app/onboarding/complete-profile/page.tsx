import { OnboardingForm } from "@/features/onboarding/components/OnboardingForm"
import { AuthPageLayout } from "@/features/auth/components/AuthPageLayout"

export default function OnboardingPage() {
    return (
        <AuthPageLayout
            title="Common, let's get you started"
            subtitle="We just need a few details to set up your organization space."
        >
            <OnboardingForm />
        </AuthPageLayout>
    )
}
