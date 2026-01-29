"use server"

import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function disconnectGoogleAction() {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session || !session.user) throw new Error("Unauthorized");

        await connectToDatabase();

        // Handle User Integrations in MongoDB
        const { UserIntegration } = await import("@/models/User");
        await UserIntegration.deleteOne({
            userId: session.user.id,
            provider: "google"
        });

        revalidatePath("/dashboard/settings");
        revalidatePath("/dashboard/interviews");

        return { success: true };
    } catch (error: any) {
        console.error("Failed to disconnect Google:", error);
        return { success: false, error: "Failed to disconnect." };
    }
}
