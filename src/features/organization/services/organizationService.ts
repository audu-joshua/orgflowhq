// server-only: Do not import this file on the client. Use server actions instead.
import { connectToDatabase } from "@/lib/mongodb";
import { Organization as OrganizationModel } from "@/models/User";
import { User } from "@/models/User";
import { slugify } from "@/lib/utils";

export const organizationService = {
    async getOrganizationBySlug(slug: string) {
        await connectToDatabase();
        const data = await OrganizationModel.findOne({ slug });

        if (!data) throw new Error("Organization not found");

        return data.toObject();
    },

    async getOrganizationById(id: string) {
        await connectToDatabase();
        const data = await OrganizationModel.findById(id);

        if (!data) throw new Error("Organization not found");

        return data.toObject();
    },

    async updateOrganization(id: string, updates: any) {
        await connectToDatabase();

        let finalUpdates = { ...updates };

        // If name changes, update slug too
        if (updates.name) {
            let slug = slugify(updates.name);

            // Check for potential collisions
            const existingOrgs = await OrganizationModel.find({
                slug: new RegExp(`^${slug}`, "i"),
                _id: { $ne: id }
            });

            if (existingOrgs && existingOrgs.length > 0) {
                const slugs = existingOrgs.map((o: any) => o.slug);
                if (slugs.includes(slug)) {
                    let counter = 1;
                    while (slugs.includes(`${slug}-${counter}`)) {
                        counter++;
                    }
                    slug = `${slug}-${counter}`;
                }
            }
            finalUpdates.slug = slug;
        }

        const data = await OrganizationModel.findByIdAndUpdate(
            id,
            { $set: finalUpdates },
            { new: true }
        );

        if (!data) throw new Error("Organization not found");
        return data.toObject();
    },

    async getOrganizationStaff(organizationId: string) {
        await connectToDatabase();

        // Fetch users linked to the organization via memberships array
        const members = await User.find({
            "memberships.organizationId": organizationId
        });

        return members.map((user: any) => {
            const membership = user.memberships.find(
                (m: any) => m.organizationId?.toString() === organizationId
            );
            return {
                id: user._id.toString(),
                email: user.email,
                name: user.fullName || user.name || user.email.split('@')[0],
                role: membership?.role || "member"
            };
        });
    },

    async getOrganizationSubscription(organizationId: string) {
        // Need to implement Billing/Subscription models later
        return null;
    }
};
