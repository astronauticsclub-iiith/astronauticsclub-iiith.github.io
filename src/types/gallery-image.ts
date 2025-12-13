export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  category: "astrophotography" | "events" | "others";
  label: string;
  filename: string;
  size: number;
  modified: string;
}
