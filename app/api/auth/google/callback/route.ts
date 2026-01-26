import { googleCalendarService } from "@/lib/google/calendar";
import { connectToDatabase } from "@/lib/mongodb";
import { UserIntegration } from "@/models/User";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
        return redirect(`/dashboard/interviews?error=google_auth_failed&details=${error}`);
    }

    if (!code) {
        return redirect("/dashboard/interviews?error=no_code");
    }

    let redirectUrl = "/dashboard/interviews?success=google_connected";

    try {
        const session = await getServerSession(authOptions) as any;
        if (!session || !session.user) {
            return redirect("/login");
        }

        const tokens = await googleCalendarService.getTokens(code);

        await connectToDatabase();

        // Upsert tokens
        await UserIntegration.findOneAndUpdate(
            {
                userId: new mongoose.Types.ObjectId((session.user as any).id),
                provider: "google"
            },
            {
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined
            },
            { upsert: true, new: true }
        );

    } catch (err) {
        console.error("Callback Error:", err);
        redirectUrl = "/dashboard/interviews?error=callback_failed";
    }

    return redirect(redirectUrl);
}
