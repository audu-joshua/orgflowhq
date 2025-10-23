import Link from "next/link"
import { RegisterForm } from "@/features/auth/components/RegisterForm"

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-border">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg shadow-lg p-8">
          <RegisterForm />

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="hover:text-accent font-medium text-foreground">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <Link href="/" className="text-center block text-muted-foreground hover:text-foreground text-sm">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
