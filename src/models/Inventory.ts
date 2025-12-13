import mongoose, { Schema, Document } from "mongoose";
import { Inventory as InventoryInterface } from "@/types/inventory-item";

export interface InventoryDocument extends Omit<InventoryInterface, "_id" | "id">, Document {
  _id: mongoose.Types.ObjectId;
  id: string;
}

const InventorySchema = new Schema<InventoryDocument>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ["astronomy", "electronics", "events", "others"],
    },
    status: {
      type: String,
      required: true,
      enum: ["working", "needs repair", "completely broken"],
    },
    description: { type: String, required: true },
    year_of_purchase: { type: Number, required: true },
    isLent: { type: Boolean, required: true },
    borrower: { type: String },
    borrowed_date: { type: String },
    comments: { type: String },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better performance
InventorySchema.index({ year_of_purchase: -1 });
InventorySchema.index({ name: "text", description: "text" });

// Prevent recompilation during development
const Inventory =
  mongoose.models.Inventory || mongoose.model<InventoryDocument>("Inventory", InventorySchema);

export default Inventory;
