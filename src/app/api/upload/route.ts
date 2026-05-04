import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { writeFile, mkdir } from "fs/promises";
import { requireWriter } from "@/lib/auth";

// Function to generate a unique filename
const generateUniqueFilename = (originalFilename: string): string => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 12);
    const extension = path.extname(originalFilename);
    const safeName = path
        .basename(originalFilename, extension)
        .replace(/[^a-zA-Z0-9]/g, "-")
        .toLowerCase();

    return `${safeName}-${timestamp}-${randomString}${extension}`;
};

// Load environment variables
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "10485760", 10); // Default 10MB
const ALLOWED_FILE_TYPES = (
    process.env.ALLOWED_FILE_TYPES ||
    "image/jpeg,image/png,image/gif,application/pdf,application/jpg"
).split(",");
const FILE_DIRECTORY = process.env.FILE_DIRECTORY || path.join(process.cwd(), "public/uploads");

// Ensure the upload directory exists
const ensureUploadDirectory = async () => {
    try {
        await mkdir(FILE_DIRECTORY, { recursive: true });
    } catch (error) {
        console.error("Failed to create upload directory:", error);
    }
};

// Handle GET request to list files or get a specific file
export async function GET(request: NextRequest) {
    try {
        await requireWriter();
        // Get query parameters
        const { searchParams } = new URL(request.url);
        const filename = searchParams.get("filename");

        // If a specific filename is requested, return its details
        if (filename) {
            const filePath = path.join(FILE_DIRECTORY, filename);

            // Check if file exists
            if (!fs.existsSync(filePath)) {
                return NextResponse.json({ error: "File not found" }, { status: 404 });
            }

            // Get file stats
            const stats = fs.statSync(filePath);

            return NextResponse.json({
                filename,
                filePath: filename,
                fileSize: stats.size,
                createdAt: stats.birthtime,
                modifiedAt: stats.mtime,
            });
        }

        // Otherwise, list all files in the uploads directory
        const files = fs
            .readdirSync(FILE_DIRECTORY)
            .filter((file) => !fs.statSync(path.join(FILE_DIRECTORY, file)).isDirectory())
            .map((filename) => {
                const stats = fs.statSync(path.join(FILE_DIRECTORY, filename));
                return {
                    filename,
                    filePath: filename,
                    fileSize: stats.size,
                    createdAt: stats.birthtime,
                    modifiedAt: stats.mtime,
                };
            });

        return NextResponse.json({ files });
    } catch (error) {
        console.error("Error retrieving files:", error);
        return NextResponse.json(
            {
                error: "Internal server error while retrieving files",
            },
            { status: 500 }
        );
    }
}

// Handle POST request for file upload
export async function POST(request: NextRequest) {
    try {
        await requireWriter();
        // Ensure the upload directory exists
        await ensureUploadDirectory();

        // Parse the form data
        const formData = await request.formData();
        const file = formData.get("file") as File;

        // Validation: Check if file exists
        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validation: Check file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                {
                    error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
                },
                { status: 400 }
            );
        }

        // Validation: Check file type
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            return NextResponse.json(
                {
                    error: `File type not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(", ")}`,
                },
                { status: 400 }
            );
        }

        // Generate a unique filename
        const uniqueFilename = generateUniqueFilename(file.name);
        const filePath = path.join(FILE_DIRECTORY, "blogs", uniqueFilename);

        // Convert the file to a Buffer and save it
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(filePath, buffer);

        // Return the URL to the uploaded file
        const publicPath = `/blogs/${uniqueFilename}`;

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
        console.error("Error uploading file:", error);
        return NextResponse.json(
            {
                error: "Internal server error during file upload",
            },
            { status: 500 }
        );
    }
}

// Handle DELETE request to delete files or imges
export async function DELETE(request: NextRequest) {
    try {
        await requireWriter();
        const { searchParams } = new URL(request.url);
        const filename = searchParams.get("filename");

        // If a specific filename is requested, return its details
        if (filename) {
            const filePath = path.join(FILE_DIRECTORY, filename);

            // Check if file exists
            if (!fs.existsSync(filePath)) {
                return NextResponse.json({ error: "Image not found" }, { status: 404 });
            }

            // Delete the file
            fs.unlinkSync(filePath);
            return NextResponse.json({ success: true }, { status: 201 });
        }
    } catch (error) {
        console.error("Error deleting image:", error);
        return NextResponse.json(
            {
                error: "Internal server error while deleting image",
            },
            { status: 500 }
        );
    }
}
