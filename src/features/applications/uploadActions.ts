"use server"

import cloudinary from "@/lib/cloudinary";

export async function uploadFileAction(formData: FormData) {
    try {
        const file = formData.get("file") as File;
        const folder = formData.get("folder") as string || "general";

        if (!file) {
            throw new Error("No file provided");
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: `orgflow/${folder}`,
                    resource_type: "auto",
                },
                (error: any, result: any) => {
                    if (error) {
                        console.error("Cloudinary upload error:", error);
                        reject(new Error("Failed to upload to Cloudinary"));
                    } else {
                        resolve({ success: true, url: result?.secure_url });
                    }
                }
            ).end(buffer);
        });
    } catch (error: any) {
        console.error("Upload action failed:", error);
        return { success: false, error: error.message };
    }
}
