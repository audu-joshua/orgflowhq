"use server"

import { roleService } from "./services/roleService";
import { revalidatePath } from "next/cache";

export async function getRolesByOrganizationAction(organizationId: string) {
    try {
        return await roleService.getRolesByOrganization(organizationId);
    } catch (error) {
        console.error("Failed to fetch roles:", error);
        return [];
    }
}

export async function getRoleByIdAction(roleId: string) {
    try {
        return await roleService.getRoleById(roleId);
    } catch (error) {
        console.error("Failed to fetch role:", error);
        return null;
    }
}

export async function getRoleBySlugAction(slug: string) {
    try {
        return await roleService.getRoleBySlug(slug);
    } catch (error) {
        console.error("Failed to fetch role by slug:", error);
        return null;
    }
}

export async function getAllOpenRolesAction() {
    try {
        return await roleService.getAllOpenRoles();
    } catch (error) {
        console.error("Failed to fetch open roles:", error);
        return [];
    }
}

export async function createRoleAction(organizationId: string, roleData: any) {
    try {
        const role = await roleService.createRole(organizationId, roleData);
        revalidatePath("/dashboard/roles");
        return { success: true, role };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateRoleAction(roleId: string, roleData: any) {
    try {
        const role = await roleService.updateRole(roleId, roleData);
        revalidatePath("/dashboard/roles");
        revalidatePath(`/dashboard/roles/${roleId}`);
        return { success: true, role };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteRoleAction(roleId: string) {
    try {
        await roleService.deleteRole(roleId);
        revalidatePath("/dashboard/roles");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
export async function updateRoleStatusAction(roleId: string, status: 'active' | 'closed') {
    try {
        const role = await roleService.updateRoleStatus(roleId, status);
        revalidatePath("/dashboard");
        revalidatePath("/dashboard/roles");
        return role;
    } catch (error: any) {
        throw new Error(error.message);
    }
}
export async function uploadRoleImageAction(formData: FormData) {
    try {
        const roleId = formData.get("roleId") as string;
        const file = formData.get("file") as File;
        const displayOrder = parseInt(formData.get("displayOrder") as string || "0");

        if (!roleId || !file) {
            throw new Error("Missing roleId or file");
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const result = await roleService.uploadRoleImage(roleId, buffer, displayOrder);
        return { success: true, role: result };
    } catch (error: any) {
        console.error("Upload role image action failed:", error);
        return { success: false, error: error.message };
    }
}

export async function generateRoleDescriptionAction(title: string, department?: string) {
    const getTemplateFallback = () => {
        const templates: Record<string, string> = {
            "Developer": "We are seeking a skilled Developer to join our growing team. You will be responsible for building high-quality software, collaborating with cross-functional teams, and maintaining robust applications.",
            "Manager": "We are looking for an experienced Manager to lead our team and oversee daily operations. Strong leadership skills and a track record of project delivery are essential.",
            "Designer": "We need a creative Designer with a passion for user-centric design. You will work on creating beautiful interfaces and intuitive user experiences across our platforms.",
            "HR": "Join our HR team as a specialist. You will handle recruitment, employee relations, and help foster a positive company culture.",
        };

        const lowercaseTitle = title.toLowerCase();
        let description = `Join our team as a ${title}${department ? ` in the ${department} department` : ''}. We are looking for a dedicated professional who is passionate about their work and eager to contribute to our company's success.`;

        for (const [key, val] of Object.entries(templates)) {
            if (lowercaseTitle.includes(key.toLowerCase())) {
                description = val;
                break;
            }
        }
        return description;
    };

    try {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return { success: true, description: getTemplateFallback() };
        }

        const { GoogleGenAI } = await import("@google/genai");
        const ai = new GoogleGenAI({ apiKey });

        const prompt = `Write a professional and engaging job description for the role of "${title}"${department ? ` in the ${department} department` : ''}. 
        RULES:
        1. DO NOT use markdown bolding (like **text**).
        2. DO NOT include the role title or department name as a heading or at the start.
        3. Start directly with the description text.
        4. Focus on key responsibilities and a brief overview. 
        5. Keep it concise (around 100-150 words).`;

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
        });

        if (response.text) {
            // Post-processing to strip markdown and potential repeated titles
            const cleanedDescription = response.text
                .replace(/\*\*/g, '') // Remove double asterisks
                .replace(/^#+\s+.*$/gm, '') // Remove markdown headers
                .replace(new RegExp(`^${title}[\\s:]*`, 'i'), '') // Remove title if repeated at start
                .trim();

            return { success: true, description: cleanedDescription };
        } else {
            throw new Error("Empty response from AI");
        }
    } catch (error: any) {
        console.warn("AI Generation failed, using template fallback:", error.message);
        return {
            success: true,
            description: getTemplateFallback(),
            isFallback: true,
            error: error.message
        };
    }
}
