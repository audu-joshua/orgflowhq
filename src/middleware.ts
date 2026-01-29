import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // 0. Redirect non-www to www for SEO consistency
        const hostname = req.headers.get('host') || '';
        if (process.env.NODE_ENV === 'production' && hostname === 'orgflowhq.com') {
            const url = req.nextUrl.clone();
            url.hostname = 'www.orgflowhq.com';
            return NextResponse.redirect(url);
        }

        // 1. Guard for Super Admin routes
        if (path.startsWith("/admin") && token?.role !== "super_admin") {
            return NextResponse.redirect(new URL("/select-portal", req.url));
        }

        // 2. Guard for select-portal (Only super_admin)
        if (path.startsWith("/select-portal") && token?.role !== "super_admin") {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }

        // 3. Organization check (Optional but good for ensuring they have memberships)
        // If they are on /dashboard or /org and have no memberships, we might allow it 
        // or redirect to a "no org" state. Existing middleware allowed it ("Orphaned user").

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: [
        /*
         * Match protected routes
         */
        "/dashboard/:path*",
        "/admin/:path*",
        "/select-portal",
        "/org/:path*",
        "/onboarding/:path*",
    ],
};
