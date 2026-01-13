import { RegisterForm } from "@/features/auth/components/RegisterForm"
import { AuthPageLayout } from "@/features/auth/components/AuthPageLayout"

export default function RegisterPage() {
  return (
    <AuthPageLayout
      title="Register"
      subtitle="Create your account to get started"
      showSocialAuth={false}
    >
      <RegisterForm />
    </AuthPageLayout>
  )
}
