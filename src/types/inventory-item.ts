export interface Inventory {
  id: string;
  name: string;
  image: string;
  category: "astronomy" | "electronics" | "event" | "others";
  description: string;
  year_of_purchase: number;
  status: "working" | "repair" | "broken";
  isLent: boolean;
  borrower?: string;
  borrowed_date?: string;
  comments?: string;
};

export const validCategoryTypes = [
  "astronomy",
  "electronics",
  "event",
  "others",
];
    
export const validStatusTypes = [
  "working",
  "repair",
  "broken",
];