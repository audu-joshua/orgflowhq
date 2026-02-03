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

        const uploadWithRetry = async (retries = 3): Promise<{ success: boolean; url: string }> => {
            for (let i = 0; i < retries; i++) {
                try {
                    return await new Promise((resolve, reject) => {
                        cloudinary.uploader.upload_stream(
                            {
                                folder: `orgflow/${folder}`,
                                resource_type: "auto",
                                timeout: 60000, // 60s timeout
                            },
                            (error: any, result: any) => {
                                if (error) {
                                    console.error(`Cloudinary upload attempt ${i + 1} failed:`, error);
                                    reject(error);
                                } else {
                                    resolve({ success: true, url: result?.secure_url });
                                }
                            }
                        ).end(buffer);
                    });
                } catch (err) {
                    if (i === retries - 1) throw err;
                    // Wait 1s before retry
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            throw new Error("Upload failed after retries");
        };

        return await uploadWithRetry();
    } catch (error: any) {
        console.error("Upload action failed:", error);
        return { success: false, error: error.message };
    }
}
