import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Inventory from "@/models/Inventory";
import { promises as fs } from "fs";
import { Logger } from "@/lib/logger";
import { requireAdmin } from "@/lib/auth";
import { withStoragePath, generateLabel } from "@/components/common/HelperFunction";


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
    const requiredFields = ["id", "name", "category", "description", "image", "year_purchase", "borrowed", "status"];
    for (const field of requiredFields) {
      if (!inventoryData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate category type
    const validCategoryTypes = ["astronomy", "electronics", "events", "others"];
    if (!validCategoryTypes.includes(inventoryData.category)) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatusTypes = ["working", "needs repair", "completely broken",];
    if (!validStatusTypes.includes(inventoryData.category)) {
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
    console.log("API: Event saved successfully:", newInventory.toObject());

    // Log the action
    Logger.info("Inventory created", {
      source: "admin/inventory",
      userEmail: user?.email || undefined,
      action: "add_inventory_item",
      details: {
        eventId: newInventory.id,
        title: newInventory.name,
        type: newInventory.category,
        date: newInventory.year_of_purchase,
      },
    });

    return NextResponse.json({
      message: "Inventory created successfully",
      event: newInventory,
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