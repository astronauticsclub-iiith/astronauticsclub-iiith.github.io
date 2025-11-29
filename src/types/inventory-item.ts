export interface InventoryItem {
  id: string;
  name: string;
  category: "astrophotography" | "events" | "others";
  description: string;
  year_of_purchase: number;
  status: "working" | "needs repair" | "completely broken";
  borrowed: boolean;
  borrower: string;
  comments?: string;
};