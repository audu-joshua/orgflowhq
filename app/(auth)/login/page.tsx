import { LoginForm } from "@/features/auth/components/LoginForm"
import { AuthPageLayout } from "@/features/auth/components/AuthPageLayout"

export default function LoginPage() {
  return (
    <AuthPageLayout
      title="Login"
      imagePath="/login_image.webp"
      subtitle="Login to you Account"
      showSocialAuth={false}
    >
      <LoginForm />
    </AuthPageLayout>
  )
}
