import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { UserIntegration } from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const provider = searchParams.get("provider");

        if (!provider) {
            return NextResponse.json({ error: "Provider is required" }, { status: 400 });
        }

        const session = await getServerSession(authOptions) as any;
        if (!session) {
            return NextResponse.json({ isConnected: false });
        }

        await connectToDatabase();
        const integration = await UserIntegration.findOne({
            userId: session.user.id,
            provider
        });

        return NextResponse.json({ isConnected: !!integration });

    } catch (error: any) {
        console.error("[Integrations Status] error:", error);
        return NextResponse.json({ isConnected: false });
    }
}
