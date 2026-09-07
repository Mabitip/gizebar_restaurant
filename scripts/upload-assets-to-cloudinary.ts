import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config({ path: path.join(__dirname, "../.env") });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dyf8tcuy6",
  api_key: process.env.CLOUDINARY_API_KEY || "962919218992843",
  api_secret: process.env.CLOUDINARY_API_SECRET || "0RKE532xwE74cJDuJnLTCNZ0S4U",
  secure: true,
});

const PUBLIC_DIR = path.join(__dirname, "../public");
const IMAGES_DIR = path.join(PUBLIC_DIR, "images");

async function uploadFile(filePath: string, folder: string, publicIdCustom?: string) {
  const fileBuffer = fs.readFileSync(filePath);
  const base64 = fileBuffer.toString("base64");
  const ext = path.extname(filePath).toLowerCase();
  const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : ext === ".gif" ? "image/gif" : "image/jpeg";
  const dataUri = `data:${mime};base64,${base64}`;

  const res = await cloudinary.uploader.upload(dataUri, {
    folder,
    public_id: publicIdCustom,
    overwrite: true,
    resource_type: "image",
    transformation: [{ quality: "auto:good", fetch_format: "auto" }],
  });

  return res.secure_url;
}

async function main() {
  console.log("🚀 Starting Cloudinary Media Migration for Gize Bar & Restaurant...");
  console.log(`Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME || "dyf8tcuy6"}`);

  const results: Record<string, string> = {};

  const scanDir = async (dir: string, currentFolder: string) => {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await scanDir(fullPath, `${currentFolder}/${entry.name}`);
      } else if (/\.(png|jpe?g|webp|gif|svg)$/i.test(entry.name)) {
        const relativeToPublic = "/" + path.relative(PUBLIC_DIR, fullPath).replace(/\\/g, "/");
        const fileBaseName = path.basename(entry.name, path.extname(entry.name));
        try {
          console.log(`Uploading: ${relativeToPublic} -> folder: ${currentFolder}...`);
          const url = await uploadFile(fullPath, currentFolder, fileBaseName);
          results[relativeToPublic] = url;
          console.log(`✅ Uploaded: ${url}`);
        } catch (err) {
          console.error(`❌ Failed to upload ${relativeToPublic}:`, err);
        }
      }
    }
  };

  await scanDir(IMAGES_DIR, "gize");

  // Also check root brand logos if present
  const rootLogos = ["GIZE ORGINAL.png", "png main logo.png"];
  for (const logo of rootLogos) {
    const logoPath = path.join(__dirname, "../", logo);
    if (fs.existsSync(logoPath)) {
      try {
        const fileBaseName = path.basename(logo, path.extname(logo)).replace(/\s+/g, "-").toLowerCase();
        console.log(`Uploading brand logo: ${logo}...`);
        const url = await uploadFile(logoPath, "gize/brand", fileBaseName);
        results[`/brand/${logo}`] = url;
        console.log(`✅ Uploaded: ${url}`);
      } catch (err) {
        console.error(`❌ Failed to upload ${logo}:`, err);
      }
    }
  }

  console.log("\n✨ Migration Summary ✨");
  console.log(JSON.stringify(results, null, 2));

  // Write mapping artifact file
  const outputPath = path.join(__dirname, "../lib/cloudinary-assets.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), "utf8");
  console.log(`\n💾 Saved Cloudinary mapping to ${outputPath}`);
}

main().catch(console.error);
