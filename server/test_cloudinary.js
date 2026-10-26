import "dotenv/config";
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// A real, valid public image URL of a portrait photo (larger than 64x64)
const dummyImage = "https://randomuser.me/api/portraits/men/75.jpg";

async function test() {
  try {
    console.log("Attempting upload with background_removal and format: png...");
    const res = await cloudinary.uploader.upload(dummyImage, {
      folder: "test_resumes",
      width: 300,
      height: 300,
      crop: "thumb",
      gravity: "face",
      effect: "background_removal",
      format: "png"
    });
    console.log("SUCCESS:", res.secure_url);
  } catch (err) {
    console.error("FAILED:", err.message);
  }
}

test();
