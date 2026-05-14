import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const { image, file, fileType } = await req.json();

    const data = image || file;
    if (!data) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const isPdf = fileType === "pdf" || data.startsWith("data:application/pdf");

    const result = await cloudinary.uploader.upload(data, {
      folder: "freelancer-projects",
      resource_type: isPdf ? "raw" : "image",
      format: isPdf ? "pdf" : undefined,
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (error: any) {
    console.error("Cloudinary Upload Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
