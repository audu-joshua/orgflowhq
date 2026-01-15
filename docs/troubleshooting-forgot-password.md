# Password Reset Troubleshooting Guide

## Problem Description
Users were experiencing an "Expired or Invalid link" error (`otp_expired`) when clicking the password reset link from their email. In some cases, they were also being redirected to the Home page instead of the Password Reset form.

### Root Causes
1. **Redirect Whitelist Mismatch**: Using a hardcoded production URL (or the wrong port) for `redirectTo` caused Supabase to fallback to the default Site URL (Home page) because the requested URL wasn't whitelisted in the Supabase Dashboard.
2. **Token Consumption Race Condition**: Landing on the Home page (or any page with a global Auth listener like the Navbar) would "consume" the recovery token from the URL hash.
3. **Session Initialization Delay**: The standard `getSession()` call would sometimes execute before the client had finished processing the recovery token from the URL, leading the app to believe the session was missing or expired.

## The Fix
The following stabilization measures were implemented:

### 1. Dynamic Redirects
In `app/(auth)/forgot-password/page.tsx`, we use `window.location.origin` for the `redirectTo` parameter.
- **Why**: This ensures that during local development, the link points to `localhost:3001`, and in production, it points to `orgflowhq.com`. This ensures the redirect always matches the environment's whitelisted URL.

### 2. Initialization Wait Loop
In `app/(auth)/reset-password/page.tsx`, we added a retry loop to wait for the Supabase session to initialize.
```typescript
// Wait up to 2 seconds for session to initialize from hash
let session = null
for (let i = 0; i < 4; i++) {
    const { data } = await supabase.auth.getSession()
    if (data.session) {
        session = data.session
        break
    }
    await new Promise(r => setTimeout(r, 500))
}
```
- **Why**: This prevents the "Expired Link" flash by giving the SDK time to process the token from the URL before checking if the user is authorized to be on the reset page.

## Maintenance Checklist
- **Supabase Dashboard**: Ensure `http://localhost:3001/reset-password` and `https://www.orgflowhq.com/reset-password` are both added to the **Authentication > Redirect URLs** section.
- **Port Consistency**: Always run the dev server on port `3001` (as configured in `package.json`) to match the whitelisted URLs.
