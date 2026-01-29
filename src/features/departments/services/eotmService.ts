// server-only: Do not import this file on the client. Use server actions instead.
import { connectToDatabase } from "@/lib/mongodb";
import { EOTMCompetition, EOTMVote, EOTMWinner, Employee } from "@/models/Business";
import mongoose from "mongoose";

export const eotmService = {
    async getActiveCompetition(organizationId: string) {
        await connectToDatabase();
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const data = await EOTMCompetition.findOne({
            organizationId: new mongoose.Types.ObjectId(organizationId),
            month,
            year
        });

        return data ? this.mapCompetitionToType(data) : null;
    },

    async ensureCompetitionInitialized(organizationId: string) {
        await connectToDatabase();
        const now = new Date();
        const day = now.getDate();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        // check if it's the 24th or later
        if (day < 24) {
            const existing = await this.getActiveCompetition(organizationId);
            if (existing) return existing;
        }

        const data = await EOTMCompetition.findOneAndUpdate(
            { organizationId: new mongoose.Types.ObjectId(organizationId), month, year },
            { $setOnInsert: { status: 'VOTING_OPEN' } },
            { upsert: true, new: true }
        );

        return this.mapCompetitionToType(data);
    },

    async castVote(competitionId: string, voterId: string, nomineeId: string, voterRole: string) {
        await connectToDatabase();

        let points = 1;
        if (voterRole === 'hr') points = 3;
        else if (voterRole === 'owner') points = 2;

        try {
            await EOTMVote.create({
                competitionId: new mongoose.Types.ObjectId(competitionId),
                voterId: new mongoose.Types.ObjectId(voterId),
                nomineeId: new mongoose.Types.ObjectId(nomineeId),
                points
            });
        } catch (error: any) {
            if (error.code === 11000) throw new Error("You have already voted this month!");
            throw error;
        }
    },

    async getWinner(competitionId: string) {
        await connectToDatabase();
        const winner = await EOTMWinner.findOne({
            competitionId: new mongoose.Types.ObjectId(competitionId)
        }).populate({
            path: 'employeeId',
            populate: { path: 'organizationId' }
        });

        if (!winner) return null;

        const obj = winner.toObject();
        return {
            id: obj._id.toString(),
            competition_id: obj.competitionId.toString(),
            employee_id: obj.employeeId?._id?.toString() || obj.employeeId?.toString(),
            total_points: obj.totalPoints,
            reveal_at: obj.revealAt.toISOString(),
            created_at: obj.createdAt.toISOString(),
            employee: obj.employeeId ? {
                full_name: obj.employeeId.fullName,
                profile_image_url: obj.employeeId.profileImageUrl || null,
                position: obj.employeeId.position || null,
                organization_id: obj.employeeId.organizationId?._id?.toString() || obj.employeeId.organizationId?.toString()
            } : undefined,
            organization: obj.employeeId?.organizationId || null
        };
    },

    async getWinnerById(id: string) {
        await connectToDatabase();
        const winner = await EOTMWinner.findById(id).populate({
            path: 'employeeId',
            populate: { path: 'organizationId' }
        });

        if (!winner) return null;

        const obj = winner.toObject();
        return {
            id: obj._id.toString(),
            competition_id: obj.competitionId.toString(),
            employee_id: obj.employeeId?._id?.toString() || obj.employeeId?.toString(),
            total_points: obj.totalPoints,
            reveal_at: obj.revealAt.toISOString(),
            created_at: obj.createdAt.toISOString(),
            employee: obj.employeeId ? {
                full_name: obj.employeeId.fullName,
                profile_image_url: obj.employeeId.profileImageUrl || null,
                position: obj.employeeId.position || null,
                organization_id: obj.employeeId.organizationId?._id?.toString() || obj.employeeId.organizationId?.toString()
            } : undefined,
            organization: obj.employeeId?.organizationId || null
        };
    },

    async devForceStartVoting(organizationId: string) {
        await connectToDatabase();
        const now = new Date();
        const data = await EOTMCompetition.findOneAndUpdate(
            {
                organizationId: new mongoose.Types.ObjectId(organizationId),
                month: now.getMonth() + 1,
                year: now.getFullYear()
            },
            { status: 'VOTING_OPEN' },
            { upsert: true, new: true }
        );

        return this.mapCompetitionToType(data);
    },

    async devForceReveal(competitionId: string) {
        await connectToDatabase();

        // 1. Tally votes
        const votes = await EOTMVote.find({
            competitionId: new mongoose.Types.ObjectId(competitionId)
        });

        if (!votes || votes.length === 0) {
            throw new Error("No votes found! Please cast at least one vote before revealing.");
        }

        const tallies: Record<string, number> = {};
        votes.forEach((v: any) => {
            const id = v.nomineeId.toString();
            tallies[id] = (tallies[id] || 0) + v.points;
        });

        const sorted = Object.entries(tallies).sort((a, b) => b[1] - a[1]);
        const [winnerId, totalPoints] = sorted[0];

        // 2. Update competition status
        await EOTMCompetition.findByIdAndUpdate(competitionId, { status: 'REVEALED' });

        // 3. Create/Update winner
        await EOTMWinner.findOneAndUpdate(
            { competitionId: new mongoose.Types.ObjectId(competitionId) },
            {
                employeeId: new mongoose.Types.ObjectId(winnerId),
                totalPoints,
                revealAt: new Date()
            },
            { upsert: true }
        );
    },

    mapCompetitionToType(doc: any) {
        const obj = doc.toObject ? doc.toObject() : doc;
        return {
            id: obj._id.toString(),
            organization_id: obj.organizationId.toString(),
            month: obj.month,
            year: obj.year,
            status: obj.status,
            created_at: obj.createdAt.toISOString(),
            updated_at: obj.updatedAt.toISOString()
        };
    }
};
