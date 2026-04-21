import { getCloudinarySignature } from "@/server/cloudinary.functions";

/**
 * Uploads a File to Cloudinary using a server-generated signature.
 * Returns the secure_url of the uploaded image.
 */
export async function uploadToCloudinary(file, { folder = "modamall/products" } = {}) {
  const sig = await getCloudinarySignature({ data: { folder } });

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", sig.api_key);
  formData.append("timestamp", String(sig.timestamp));
  formData.append("signature", sig.signature);
  if (sig.folder) formData.append("folder", sig.folder);

  const res = await fetch(sig.upload_url, { method: "POST", body: formData });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudinary upload failed: ${res.status} ${text}`);
  }
  const json = await res.json();
  return json.secure_url;
}
