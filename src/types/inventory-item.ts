export interface InventoryInterface {
  id: string;
  name: string;
  image: string;
  category: "astronomy" | "electronics" | "events" | "others";
  description: string;
  year_of_purchase: number;
  status: "working" | "needs repair" | "completely broken";
  borrowed: boolean;
  borrower?: string;
  comments?: string;
};