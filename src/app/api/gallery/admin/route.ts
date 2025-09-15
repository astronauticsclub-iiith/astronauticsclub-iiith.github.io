import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { Logger } from "@/lib/logger";
import { requireAdmin } from "@/lib/auth";

// Helper function to generate label from filename
function generateLabel(filename: string): string {
  const nameWithoutExt = path.parse(filename).name;
  return nameWithoutExt
    .replace(/\s*\(.*?\)\s*/g, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

// GET - List all images for admin management
export async function GET() {
  try {
    await requireAdmin();

    const publicDir = path.join(process.cwd(), "public");
    const galleryDir = path.join(publicDir, "gallery");

    const imageExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
      ".gif",
      ".bmp",
      ".svg",
      ".avif",
    ];
    const categories = ["astrophotography", "events", "others"];
    const allImages = [];

    for (const category of categories) {
      const categoryDir = path.join(galleryDir, category);

      try {
        await fs.access(categoryDir);
        const files = await fs.readdir(categoryDir);

        const imageFiles = files.filter((file) => {
          const ext = path.extname(file).toLowerCase();
          return imageExtensions.includes(ext);
        });

        for (const file of imageFiles) {
          const filePath = path.join(categoryDir, file);
          const stats = await fs.stat(filePath);

          allImages.push({
            id: `${category}-${file}`,
            src: `/gallery/${category}/${file}`,
            alt: generateLabel(file),
            category: category as "astrophotography" | "events" | "others",
            label: generateLabel(file),
            filename: file,
            size: stats.size,
            modified: stats.mtime.toISOString(),
            created: stats.birthtime.toISOString(),
          });
        }
      } catch (error) {
        console.warn(`Could not read ${category} directory:`, error);
        continue;
      }
    }

    // Sort by modified date (newest first)
    allImages.sort(
      (a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime()
    );

    return NextResponse.json({ images: allImages });
  } catch (error) {
    console.error("Error fetching admin gallery images:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery images" },
      { status: 500 }
    );
  }
}

// POST - Upload new image
export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAdmin();

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const category = formData.get("category") as string;
    const customFilename = formData.get("filename") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!["astrophotography", "events", "others"].includes(category)) {
      return NextResponse.json(
        { error: "Invalid category. Must be 'astrophotography', 'events' or 'others'" },
        { status: 400 }
      );
    }

    // Validate file type
    const imageExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
      ".gif",
      ".bmp",
      ".svg",
      ".avif",
    ];
    const fileExtension = path.extname(file.name).toLowerCase();

    if (!imageExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: "Invalid file type. Only image files are allowed." },
        { status: 400 }
      );
    }

    // Create filename
    const filename = customFilename
      ? `${customFilename}${fileExtension}`
      : file.name;

    // Ensure gallery directory structure exists
    const publicDir = path.join(process.cwd(), "public");
    const galleryDir = path.join(publicDir, "gallery");
    const categoryDir = path.join(galleryDir, category);

    await fs.mkdir(categoryDir, { recursive: true });

    // Check if file already exists
    const filePath = path.join(categoryDir, filename);
    try {
      await fs.access(filePath);
      return NextResponse.json(
        { error: "File already exists. Please choose a different name." },
        { status: 409 }
      );
    } catch {
      // File doesn't exist, we can proceed
    }

    // Save file
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    // Log the action
    Logger.info("Gallery image uploaded", {
      source: "admin/gallery",
      userEmail: user?.email || undefined,
      action: "upload_image",
      details: {
        filename,
        category,
        fileSize: file.size,
      },
    });

    const newImage = {
      id: `${category}-${filename}`,
      src: `/gallery/${category}/${filename}`,
      alt: generateLabel(filename),
      category: category as "astrophotography" | "events" | "others",
      label: generateLabel(filename),
      filename,
      size: file.size,
      modified: new Date().toISOString(),
      created: new Date().toISOString(),
    };

    return NextResponse.json({
      message: "Image uploaded successfully",
      image: newImage,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}

// PUT - Update image (rename/move category)
export async function PUT(request: NextRequest) {
  try {
    const { user } = await requireAdmin();

    const { currentFilename, currentCategory, newFilename, newCategory } =
      await request.json();

    if (!currentFilename || !currentCategory) {
      return NextResponse.json(
        { error: "Current filename and category are required" },
        { status: 400 }
      );
    }

    if (
      !["astrophotography", "events", "others"].includes(currentCategory) ||
      (newCategory && !["astrophotography", "events", "others"].includes(newCategory))
    ) {
      return NextResponse.json(
        { error: "Invalid category. Must be 'astrophotography', 'events' or 'others'" },
        { status: 400 }
      );
    }

    const publicDir = path.join(process.cwd(), "public");
    const galleryDir = path.join(publicDir, "gallery");

    const oldPath = path.join(galleryDir, currentCategory, currentFilename);

    // Ensure the old file exists
    try {
      await fs.access(oldPath);
    } catch {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const targetCategory = newCategory || currentCategory;
    const targetFilename = newFilename || currentFilename;
    const newPath = path.join(galleryDir, targetCategory, targetFilename);

    // Ensure target directory exists
    await fs.mkdir(path.join(galleryDir, targetCategory), { recursive: true });

    // Check if target file already exists (unless it's the same file)
    if (oldPath !== newPath) {
      try {
        await fs.access(newPath);
        return NextResponse.json(
          {
            error:
              "Target file already exists. Please choose a different name.",
          },
          { status: 409 }
        );
      } catch {
        // Target doesn't exist, we can proceed
      }
    }

    // Move/rename the file
    await fs.rename(oldPath, newPath);

    // Log the action
    Logger.info("Gallery image updated", {
      source: "admin/gallery",
      userEmail: user?.email || undefined,
      action: "update_image",
      details: {
        oldFilename: currentFilename,
        newFilename: targetFilename,
        oldCategory: currentCategory,
        newCategory: targetCategory,
      },
    });

    const stats = await fs.stat(newPath);
    const updatedImage = {
      id: `${targetCategory}-${targetFilename}`,
      src: `/gallery/${targetCategory}/${targetFilename}`,
      alt: generateLabel(targetFilename),
      category: targetCategory as "astrophotography" | "events" | "others",
      label: generateLabel(targetFilename),
      filename: targetFilename,
      size: stats.size,
      modified: new Date().toISOString(),
      created: stats.birthtime.toISOString(),
    };

    return NextResponse.json({
      message: "Image updated successfully",
      image: updatedImage,
    });
  } catch (error) {
    console.error("Error updating image:", error);
    return NextResponse.json(
      { error: "Failed to update image" },
      { status: 500 }
    );
  }
}

// DELETE - Delete image
export async function DELETE(request: NextRequest) {
  try {
    const { user } = await requireAdmin();

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");
    const category = searchParams.get("category");

    if (!filename || !category) {
      return NextResponse.json(
        { error: "Filename and category are required" },
        { status: 400 }
      );
    }

    if (!["astrophotography", "events", "others"].includes(category)) {
      return NextResponse.json(
        { error: "Invalid category. Must be 'astrophotography', 'events' or 'others'" },
        { status: 400 }
      );
    }

    const publicDir = path.join(process.cwd(), "public");
    const galleryDir = path.join(publicDir, "gallery");
    const filePath = path.join(galleryDir, category, filename);

    // Ensure the file exists
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Delete the file
    await fs.unlink(filePath);

    // Log the action
    Logger.info("Gallery image deleted", {
      source: "admin/gallery",
      userEmail: user?.email || undefined,
      action: "delete_image",
      details: {
        filename,
        category,
      },
    });

    return NextResponse.json({
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
