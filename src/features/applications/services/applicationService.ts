// server-only: Do not import this file on the client. Use server actions instead.
import { connectToDatabase } from "@/lib/mongodb";
import { Application, IApplication } from "@/models/Recruitment";
import { JobRole } from "@/models/Business";
import { Organization } from "@/models/User";
import mongoose from "mongoose";

export const applicationService = {
  async createApplication(
    organizationId: string,
    applicationData: any,
  ) {
    await connectToDatabase();

    const data = await Application.create({
      ...applicationData,
      roleId: new mongoose.Types.ObjectId(applicationData.role_id),
      organizationId: new mongoose.Types.ObjectId(organizationId),
      applicantName: applicationData.applicant_name,
      applicantEmail: applicationData.applicant_email,
      applicantPhone: applicationData.applicant_phone,
      resumeUrl: applicationData.resume_url,
      coverLetter: applicationData.cover_letter,
      applicantPassport: applicationData.applicant_passport,
      status: "new",
      currentStage: "New"
    });

    return !!data;
  },

  async getApplicationsByRole(roleId: string) {
    await connectToDatabase();

    const records = await Application.find({
      roleId: new mongoose.Types.ObjectId(roleId)
    }).sort({ createdAt: -1 });

    return records.map(this.mapModelToType);
  },

  async getApplicationById(applicationId: string) {
    await connectToDatabase();

    const data = await Application.findById(applicationId).populate("roleId");

    if (!data) throw new Error("Application not found");

    const obj = data.toObject();
    return {
      ...this.mapModelToType(data),
      roles: obj.roleId ? { title: obj.roleId.title } : undefined
    };
  },

  async getApplicationsByOrganization(organizationId: string) {
    await connectToDatabase();

    const records = await Application.find({
      organizationId: new mongoose.Types.ObjectId(organizationId)
    }).populate("roleId").sort({ createdAt: -1 });

    return records.map(doc => {
      const obj = doc.toObject();
      return {
        ...this.mapModelToType(doc),
        roles: obj.roleId ? { title: obj.roleId.title } : undefined
      };
    });
  },

  async updateApplicationStatus(applicationId: string, status: any) {
    await connectToDatabase();

    const data = await Application.findByIdAndUpdate(
      applicationId,
      { $set: { status } },
      { new: true }
    );

    if (!data) throw new Error("Application not found");
    return this.mapModelToType(data);
  },

  async updateApplicationStage(applicationId: string, stage: string) {
    await connectToDatabase();

    let status = "new";
    const lowerStage = stage.toLowerCase();
    if (lowerStage.includes("shortlist")) status = "shortlisted";
    else if (lowerStage.includes("interview")) status = "interviewed";
    else if (lowerStage.includes("hire") || lowerStage.includes("offer")) status = "hired";
    else if (lowerStage.includes("reject")) status = "rejected";

    const data = await Application.findByIdAndUpdate(
      applicationId,
      { $set: { currentStage: stage, status } },
      { new: true }
    );

    if (!data) throw new Error("Application not found");
    return this.mapModelToType(data);
  },

  async deleteApplication(applicationId: string) {
    await connectToDatabase();
    await Application.findByIdAndDelete(applicationId);
  },

  async uploadResume(folder: string, file: File) {
    // TEMPORARY: Return a mock URL until a proper storage solution (Cloudinary/S3) is configured
    console.warn(`[applicationService] uploadResume: File storage migration required. Mocking URL for ${file.name}`);
    return `/temp_storage/${folder}/${Date.now()}_${file.name}`;
  },

  mapModelToType(doc: any) {
    const obj = doc.toObject ? doc.toObject() : doc;
    return {
      id: obj._id.toString(),
      role_id: obj.roleId?.toString(),
      organization_id: obj.organizationId?.toString(),
      applicant_name: obj.applicantName,
      applicant_email: obj.applicantEmail,
      applicant_phone: obj.applicantPhone,
      status: obj.status,
      current_stage: obj.currentStage,
      resume_url: obj.resumeUrl,
      cover_letter: obj.coverLetter,
      applicant_passport: obj.applicantPassport,
      additional_info: obj.additionalInfo,
      metadata: obj.metadata,
      source: obj.source,
      tags: obj.tags,
      notes: obj.notes,
      created_at: obj.createdAt?.toISOString(),
      updated_at: obj.updatedAt?.toISOString()
    };
  }
};
