import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { writeFile, mkdir } from "fs/promises";
import { requireWriter } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB for avatars
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/gif"];
const FILE_DIRECTORY = process.env.FILE_DIRECTORY || path.join(process.cwd(), "public/uploads");

const ensureUploadDirectory = async () => {
  try {
    await mkdir(FILE_DIRECTORY, { recursive: true });
  } catch (error) {
    console.error("Failed to create upload directory:", error);
  }
};

const generateUniqueFilename = (
  originalFilename: string,
  userId: string
): string => {
  const timestamp = Date.now();
  const extension = path.extname(originalFilename);
  return `avatar-${userId}-${timestamp}${extension}`;
};

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireWriter();
    await ensureUploadDirectory();

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File too large. Maximum size is ${
            MAX_FILE_SIZE / 1024 / 1024
          }MB`,
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: `File type not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    // Delete old avatar if exists
    if (user.avatar) {
      const oldAvatarPath = path.join(FILE_DIRECTORY, user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    const uniqueFilename = generateUniqueFilename(
      file.name,
      (user._id as { toString: () => string }).toString()
    );
    const filePath = path.join(FILE_DIRECTORY, "avatars", uniqueFilename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const publicPath = `/avatars/${uniqueFilename}`;

    // Update user's avatar in database
    await connectToDatabase();
    await User.findByIdAndUpdate(user._id, { avatar: publicPath });

    // Update user's avatar in constellation.json
    const jsonPath = path.join("/var/data/astronautics", "constellation.json");
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

    for (const constellationName in jsonData) 
    {
      const constellation = jsonData[constellationName];
      for (const starName in constellation.stars) 
        {
          const star = constellation.stars[starName];
          if (star.clickable && star.email == user.email){
            star.photo = publicPath;
          }
      }
    }
    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));


    return NextResponse.json(
      {
        success: true,
        filename: uniqueFilename,
        filePath: publicPath,
        fileSize: file.size,
        fileType: file.type,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return NextResponse.json(
      { error: "Internal server error during avatar upload" },
      { status: 500 }
    );
  }
}
