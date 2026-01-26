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
        // Since we don't have a separate collection for external tokens (or do we?),
        // let's assume they are stored in the User model or a metadata field if relevant.
        // If we haven't defined a 'user_integrations' model yet, we'll need it.

        // For now, let's assume external tokens are in a separate collection or embedded.
        // I will use a simple update if it's stored on the User.

        await User.findByIdAndUpdate((session.user as any).id, {
            $set: { googleIntegration: null } // Mirroring the intent to disconnect
        });

        revalidatePath("/dashboard/settings");
        revalidatePath("/dashboard/interviews");

        return { success: true };
    } catch (error: any) {
        console.error("Failed to disconnect Google:", error);
        return { success: false, error: "Failed to disconnect." };
    }
}
