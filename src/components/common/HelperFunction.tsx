export function withBasePath(path: string) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export function withUploadPath(path: string) {
  const base = process.env.UPLOAD_DIRECTORY || "";
  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}