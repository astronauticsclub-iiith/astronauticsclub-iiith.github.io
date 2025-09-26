export interface GalleryImage {
  src: string;
  alt: string;
  category: "astrophotography" | "events" | "others";
  label: string;
  filename: string;
  size: number;
  modified: string;
};