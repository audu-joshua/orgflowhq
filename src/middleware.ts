import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // 1. Initialize Supabase Client
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({ name, value, ...options })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({ name, value, ...options })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({ name, value: "", ...options })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({ name, value: "", ...options })
                },
            },
        }
    )

    // 2. Refresh Session
    const { data: { user } } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname

    // 3. Define Public and Protected Routes
    const isAuthRoute = path.startsWith('/login') || path.startsWith('/register') || path.startsWith('/auth') || path.startsWith('/forgot-password') || path.startsWith('/reset-password')
    const isOnboardingRoute = path.startsWith('/onboarding')
    const isDashboardRoute = path.startsWith('/dashboard') || path.startsWith('/org')
    const isApiRoute = path.startsWith('/api')

    // 4. Handle Unauthenticated Users
    if (!user) {
        console.log(`[Middleware] No user found for ${path}`)
        // If trying to access protected routes, redirect to login
        if (isDashboardRoute || isOnboardingRoute) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }
        // Allow public routes
        return response
    }

    // 5. Handle Authenticated Users
    if (user) {
        const orgId = user.user_metadata?.organization_id
        console.log(`[Middleware] User authenticated. OrgID: ${orgId}, Path: ${path}`)

        // Scenario A: Missing Organization (Orphaned)
        // If user has no org and is NOT on onboarding (and NOT hitting API), redirect to onboarding
        if (!orgId && !isOnboardingRoute && !isApiRoute) {
            // Allow them to stay on auth/public pages if they want, but block dashboard
            if (isDashboardRoute || path === '/') {
                console.log(`[Middleware] Orphaned user on dashboard/root -> Redirecting to onboarding`)
                const url = request.nextUrl.clone()
                url.pathname = '/onboarding/complete-profile'
                return NextResponse.redirect(url)
            }
        }

        // Scenario B: Has Organization
        // If user has org and tries to access onboarding, redirect to dashboard
        if (orgId && isOnboardingRoute) {
            console.log(`[Middleware] User with Org on onboarding -> Redirecting to dashboard`)
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
        }

        // Redirect logged-in users away from auth pages
        if (path === '/login' || path === '/register') {
            console.log(`[Middleware] User on auth page -> Redirecting to dashboard`)
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
