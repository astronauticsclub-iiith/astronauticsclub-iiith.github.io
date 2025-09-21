export function withBasePath(path: string) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export function withUploadPath(path: string) {
  const base = process.env.NEXT_PUBLIC_UPLOAD_DIRECTORY || "";
  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export function withStoragePath(path: string) {
  const base = process.env.FILE_DIRECTORY || "";
  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}