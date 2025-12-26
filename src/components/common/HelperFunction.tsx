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
