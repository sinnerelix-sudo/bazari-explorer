import { createServerFn } from "@tanstack/react-start";
import { createHash } from "crypto";

/**
 * Generates a signed Cloudinary upload signature.
 * The frontend uses this signature to upload directly to Cloudinary
 * without exposing the API secret.
 *
 * Cloudinary signature spec:
 *   sha1(sorted_params_string + api_secret)
 */
export const getCloudinarySignature = createServerFn({ method: "POST" })
  .inputValidator((input: { folder?: string; public_id?: string }) => input ?? {})
  .handler(async ({ data }) => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error("Cloudinary credentials not configured");
    }

    const timestamp = Math.floor(Date.now() / 1000);

    // Params to sign (alphabetical order, exclude file/api_key/signature/resource_type/cloud_name)
    const params: Record<string, string | number> = { timestamp };
    if (data.folder) params.folder = data.folder;
    if (data.public_id) params.public_id = data.public_id;

    const toSign = Object.keys(params)
      .sort()
      .map((k) => `${k}=${params[k]}`)
      .join("&");

    const signature = createHash("sha1")
      .update(toSign + apiSecret)
      .digest("hex");

    return {
      signature,
      timestamp,
      api_key: apiKey,
      cloud_name: cloudName,
      folder: data.folder ?? null,
      upload_url: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    };
  });
