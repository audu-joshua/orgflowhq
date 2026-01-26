"use server"

import { eotmService } from "./services/eotmService";
import { revalidatePath } from "next/cache";

export async function getActiveCompetitionAction(organizationId: string) {
    try {
        return await eotmService.getActiveCompetition(organizationId);
    } catch (error) {
        console.error("Failed to fetch active competition:", error);
        return null;
    }
}

export async function castVoteAction(competitionId: string, voterId: string, nomineeId: string, voterRole: string) {
    try {
        await eotmService.castVote(competitionId, voterId, nomineeId, voterRole);
        revalidatePath("/dashboard/departments");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getWinnerAction(competitionId: string) {
    try {
        return await eotmService.getWinner(competitionId);
    } catch (error) {
        console.error("Failed to fetch winner:", error);
        return null;
    }
}

export async function devForceStartVotingAction(organizationId: string) {
    try {
        const comp = await eotmService.devForceStartVoting(organizationId);
        revalidatePath("/dashboard/departments");
        return { success: true, competition: comp };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function devForceRevealAction(competitionId: string) {
    try {
        await eotmService.devForceReveal(competitionId);
        revalidatePath("/dashboard/departments");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
