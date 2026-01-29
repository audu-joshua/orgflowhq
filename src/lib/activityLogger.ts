import { connectToDatabase } from "@/lib/mongodb";
import { ActivityLog } from "@/models/Business";
import mongoose from "mongoose";

export type ActivityEntityType = 'application' | 'interview' | 'role' | 'employee'

export const activityLogger = {
    async logActivity(
        organizationId: string,
        entityType: ActivityEntityType,
        entityId: string,
        action: string,
        description?: string,
        performedBy?: string // Optional, null means system
    ) {
        try {
            await connectToDatabase();
            await ActivityLog.create({
                organizationId: new mongoose.Types.ObjectId(organizationId),
                entityType,
                entityId,
                action,
                description,
                performedBy: performedBy ? new mongoose.Types.ObjectId(performedBy) : undefined
            });
        } catch (e) {
            console.error("Exception logging activity:", e)
        }
    }
}
