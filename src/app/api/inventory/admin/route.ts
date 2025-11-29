import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Inventory from "@/models/Inventory";
import { promises as fs } from "fs";
import { Logger } from "@/lib/logger";
import { requireAdmin } from "@/lib/auth";
import { withStoragePath, generateLabel } from "@/components/common/HelperFunction";

const requiredFields = [
    "id",
    "name",
    "category",
    "description",
    "image",
    "year_purchase",
    "borrowed", 
    "status",
];
    
const validCategoryTypes = [
    "astronomy",
    "electronics",
    "Inventorys",
    "others",
];
    
const validStatusTypes = [
    "working",
    "needs repair",
    "completely broken",
];
    

// GET - List all inventory items for admin management
export async function GET() {
  try {
    await requireAdmin();
    await connectToDatabase();

    const inventory = await Inventory.find({}).sort({ year_of_purchase: -1 }).lean();
    return NextResponse.json({ inventory });
  } 
  
  catch (error){
    console.error("Error fetching admin inventory:", error);

    if (error instanceof Error && error.message.includes("access required")) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}

// POST - Add new inventory item
export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAdmin();
    await connectToDatabase();

    const inventoryData = await request.json();

    // Validate required fields
    for (const field of requiredFields) {
      if (!inventoryData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate category type
    if (!validCategoryTypes.includes(inventoryData.category)) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      );
    }

    // Validate status
    if (!validStatusTypes.includes(inventoryData.status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Check if invnetory ID already exists
    const existingInventory = await Inventory.findOne({ id: inventoryData.id });
    if (existingInventory) {
      return NextResponse.json(
        { error: "Inventory with this ID already exists" },
        { status: 409 }
      );
    }

    // Create new inventory
    const newInventory = new Inventory({
      ...inventoryData,
    });

    // Store the image

    await newInventory.save();
    console.log("API: Inventory saved successfully:", newInventory.toObject());

    // Log the action
    Logger.info("Inventory created", {
      source: "admin/inventory",
      userEmail: user?.email || undefined,
      action: "add_inventory_item",
      details: {
        InventoryId: newInventory.id,
        title: newInventory.name,
        type: newInventory.category,
        date: newInventory.year_of_purchase,
      },
    });

    return NextResponse.json({
      message: "Inventory created successfully",
      Inventory: newInventory,
    });
  } 
  
  catch (error) {
    console.error("Error adding inventory:", error);

    if (error instanceof Error && error.message.includes("access required")) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to add inventory" },
      { status: 500 }
    );
  }
}

// PUT - Update existing Inventory Item
export async function PUT(request: NextRequest) {
  try {
    const { user } = await requireAdmin();
    await connectToDatabase();

    const inventoryData = await request.json();
    const { id } = inventoryData;

    if (!id) {
      return NextResponse.json(
        { error: "Inventory ID is required" },
        { status: 400 }
      );
    }

    // Validate catgeory type
    if (inventoryData.category) {
      if (!validCategoryTypes.includes(inventoryData.category)) {
        return NextResponse.json(
          { error: "Invalid Inventory type" },
          { status: 400 }
        );
      }
    }

    // Validate status if provided
    if (inventoryData.status) {
      if (!validStatusTypes.includes(inventoryData.status)) {
        return NextResponse.json(
          { error: "Invalid Inventory status" },
          { status: 400 }
        );
      }
    }

    // Find and update the Inventory
    const existingInventory = await Inventory.findOne({ id });
    if (!existingInventory) {
      return NextResponse.json({ error: "Inventory not found" }, { status: 404 });
    }

    // Update the image

    const updatedInventory = await Inventory.findOneAndUpdate(
      { id },
      { $set: inventoryData },
      { new: true, runValidators: true }
    );

    console.log(
      "API PUT: Inventory updated successfully:",
      updatedInventory?.toObject()
    );

    // Log the action
    Logger.info("Inventory updated", {
      source: "admin/inventory",
      userEmail: user?.email || undefined,
      action: "update_Inventory",
      details: {
        InventoryId: id,
        title: updatedInventory.name,
        changes: inventoryData,
      },
    });

    return NextResponse.json({
      message: "Inventory updated successfully",
      Inventory: updatedInventory,
    });
  } 
  
  catch (error) {
    console.error("Error updating Inventory:", error);

    if (error instanceof Error && error.message.includes("access required")) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update Inventory" },
      { status: 500 }
    );
  }
}