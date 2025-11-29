import path from "path";

export function withBasePath(basePath: string) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return `${base.replace(/\/$/, "")}/${basePath.replace(/^\//, "")}`;
}

export function withUploadPath(uploadPath: string) {
  const base = process.env.NEXT_PUBLIC_UPLOAD_DIRECTORY || "";
  return `${base.replace(/\/$/, "")}/${uploadPath.replace(/^\//, "")}`;
}

export function withStoragePath(storagePath: string) {
  const base = process.env.FILE_DIRECTORY || "";
  return `${base.replace(/\/$/, "")}/${storagePath.replace(/^\//, "")}`;
}

export function safeKey(email?: string) {
  return (email || "").trim().toLowerCase();
}

// Helper function to generate label from filename
export function generateLabel(filename: string): string {
  const nameWithoutExt = path.parse(filename).name;
  return nameWithoutExt
    .replace(/\s*\(.*?\)\s*/g, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}