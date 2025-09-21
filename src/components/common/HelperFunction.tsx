export function withBasePath(path: string) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export function withUploadPath(path: string) {
  // const base = process.env.UPLOAD_DIRECTORY || "";
  const base = "/astronautics/uploads";
  console.log("base", base)
  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}