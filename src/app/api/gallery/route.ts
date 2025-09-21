import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { withStoragePath } from "@/components/common/HelperFunction";

export async function GET() {
  try {
    const galleryDir = withStoragePath("gallery");

    // Check if gallery directory exists
    try {
      await fs.access(galleryDir);
    } catch {
      return NextResponse.json({ images: [] });
    }

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

          // Convert filename to label (remove extension, remove content in (), replace underscores with spaces, capitalize)
          const nameWithoutExt = path.parse(file).name;
          const label = nameWithoutExt
            .replace(/\s*\(.*?\)\s*/g, "")
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());

          allImages.push({
            src: `/gallery/${category}/${file}`,
            alt: label,
            category: category as "astrophotography" | "events" | "others",
            label,
            filename: file,
            size: stats.size,
            modified: stats.mtime.toISOString(),
          });
        }
      } catch (error) {
        // Category directory doesn't exist or can't be read, skip it
        console.warn(`Could not read ${category} directory:`, error);
        continue;
      }
    }

    // Shuffle array randomly using Fisher-Yates algorithm
    for (let i = allImages.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allImages[i], allImages[j]] = [allImages[j], allImages[i]];
    }

    return NextResponse.json({ images: allImages });
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery images" },
      { status: 500 }
    );
  }
}
