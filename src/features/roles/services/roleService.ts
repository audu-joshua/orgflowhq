// server-only: Do not import this file on the client. Use server actions instead.
import { connectToDatabase } from "@/lib/mongodb";
import { JobRole } from "@/models/Business";
import { Organization } from "@/models/User";
import { Application } from "@/models/Recruitment";
import { planLimitsService } from "@/lib/subscription/planLimits";
import mongoose from "mongoose";
import { slugify } from "@/lib/utils";

export interface Role {
  id: string;
  organization_id: string;
  title: string;
  description: string | null;
  department: string | null;
  location: string | null;
  employment_type: string | null;
  slug: string;
  status: 'active' | 'closed' | 'draft';
  stages: string[];
  hiring_manager?: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoleWithImages extends Role {
  role_images: Array<{
    id: string;
    role_id: string;
    image_url: string;
    display_order: number;
    created_at: string;
  }>;
  application_count?: number;
}

const mapModelToType = (doc: any): RoleWithImages => {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    id: obj._id.toString(),
    organization_id: obj.organizationId.toString(),
    title: obj.title,
    description: obj.description || null,
    department: obj.department || null,
    location: obj.location || null,
    employment_type: obj.employmentType || null,
    slug: obj.slug,
    status: obj.status,
    stages: obj.stages,
    hiring_manager: obj.hiringManager,
    created_by: obj.createdBy?.toString() || null,
    created_at: obj.createdAt.toISOString(),
    updated_at: obj.updatedAt.toISOString(),
    role_images: (obj.images || []).map((img: any) => ({
      id: img._id?.toString() || "",
      role_id: obj._id.toString(),
      image_url: img.imageUrl,
      display_order: img.displayOrder,
      created_at: img.createdAt?.toISOString() || new Date().toISOString()
    }))
  };
};

export const roleService = {
  async createRole(organizationId: string, roleData: any) {
    await connectToDatabase();

    // 1. Check Plan Limits
    const limitCheck = await planLimitsService.checkRoleLimit(organizationId);
    if (!limitCheck.allowed) throw new Error(limitCheck.message);

    // 2. Generate Slug
    const org = await Organization.findById(organizationId);
    const orgName = org?.name || "job";
    let slug = slugify(`${orgName}-${roleData.title}`);

    // Collision check
    const existing = await JobRole.findOne({ organizationId, slug });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    // 3. Create Role
    const data = await JobRole.create({
      ...roleData,
      organizationId: new mongoose.Types.ObjectId(organizationId),
      slug,
      employmentType: roleData.employment_type, // Map snake to camel
      hiringManager: roleData.hiring_manager,
      createdBy: roleData.created_by ? new mongoose.Types.ObjectId(roleData.created_by) : undefined
    });

    return mapModelToType(data);
  },

  async updateRole(roleId: string, roleData: any) {
    await connectToDatabase();

    const updates: any = { ...roleData };
    if (roleData.employment_type) updates.employmentType = roleData.employment_type;
    if (roleData.hiring_manager) updates.hiringManager = roleData.hiring_manager;

    // Regenerate slug if title changes
    if (roleData.title) {
      const role = await JobRole.findById(roleId);
      if (role) {
        const org = await Organization.findById(role.organizationId);
        const orgName = org?.name || "job";
        updates.slug = slugify(`${orgName}-${roleData.title}`);
      }
    }

    const data = await JobRole.findByIdAndUpdate(
      roleId,
      { $set: updates },
      { new: true }
    );
    if (!data) throw new Error("Role not found");
    return mapModelToType(data);
  },

  async updateRoleStatus(roleId: string, status: Role["status"]) {
    await connectToDatabase();
    const data = await JobRole.findByIdAndUpdate(roleId, { status }, { new: true });
    if (!data) throw new Error("Role not found");
    return mapModelToType(data);
  },

  async updateAllRolesStatus(organizationId: string, status: Role["status"]) {
    await connectToDatabase();
    await JobRole.updateMany({ organizationId: new mongoose.Types.ObjectId(organizationId) }, { status });
    const records = await JobRole.find({ organizationId: new mongoose.Types.ObjectId(organizationId) });
    return records.map(mapModelToType);
  },

  async deleteRole(roleId: string) {
    await connectToDatabase();
    // In MongoDB, we only need to delete the role document itself
    // unless we have external image storage or other collections to clean up.
    // Applications and Interviews should also be cleaned up.
    await Application.deleteMany({ roleId: new mongoose.Types.ObjectId(roleId) });
    const data = await JobRole.findByIdAndDelete(roleId);
    if (!data) throw new Error("Role not found");
    return [data.toObject()]; // Mirroring Supabase return
  },

  async getRoleById(roleId: string) {
    await connectToDatabase();
    const data = await JobRole.findById(roleId);
    if (!data) throw new Error("Role not found");

    const appCount = await Application.countDocuments({ roleId: data._id });
    const mapped = mapModelToType(data);
    mapped.application_count = appCount;
    return mapped;
  },

  async uploadRoleImage(roleId: string, file: File, displayOrder: number = 0) {
    throw new Error("File storage migration required (Cloudinary/S3). Supabase storage no longer supported.");
  },

  async deleteRoleImage(roleId: string, imageId: string) {
    await connectToDatabase();
    const data = await JobRole.findByIdAndUpdate(
      roleId,
      { $pull: { images: { _id: new mongoose.Types.ObjectId(imageId) } } },
      { new: true }
    );
    if (!data) throw new Error("Role not found");
    return data.toObject();
  },

  async getRolesByOrganization(organizationId: string): Promise<RoleWithImages[]> {
    await connectToDatabase();
    const records = await JobRole.find({
      organizationId: new mongoose.Types.ObjectId(organizationId)
    }).sort({ createdAt: -1 });

    const rolesWithCount = await Promise.all(records.map(async (role: any) => {
      const appCount = await Application.countDocuments({ roleId: role._id });
      const mapped = mapModelToType(role);
      mapped.application_count = appCount;
      return mapped;
    }));

    return rolesWithCount;
  },

  async getRoleBySlug(slug: string) {
    await connectToDatabase();
    const data = await JobRole.findOne({ slug });
    if (!data) throw new Error("Role not found");

    const appCount = await Application.countDocuments({ roleId: data._id });
    const mapped = mapModelToType(data);
    mapped.application_count = appCount;
    return mapped;
  },

  async getAllOpenRoles(): Promise<RoleWithImages[]> {
    await connectToDatabase();
    const records = await JobRole.find({ status: 'active' }).sort({ createdAt: -1 });
    return records.map(mapModelToType);
  }
};
