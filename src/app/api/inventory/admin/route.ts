import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Inventory from "@/models/Inventory";
import { validStatusTypes, validCategoryTypes } from "@/types/inventory-item";
import { promises as fs } from "fs";
import path from "path";
import { Logger } from "@/lib/logger";
import { requireAdmin } from "@/lib/auth";
import { withStoragePath } from "@/components/common/HelperFunction";


// GET - List all inventory items for admin management
export async function GET() {
  try {
    await requireAdmin();
    await connectToDatabase();

    const inventory = await Inventory.find({}).sort({ year_of_purchase: -1 }).lean();
    return NextResponse.json({ inventory });
  }

  catch (error) {
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

    const formData = await request.formData();
    const file = formData.get("file") as File;

    // Extract fields
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const year_of_purchase = parseInt(formData.get("year_of_purchase") as string);
    const status = formData.get("status") as string;

    // Validate required fields
    if (!id || !name || !category || !description || !year_of_purchase || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate category type
    if (!validCategoryTypes.includes(category)) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      );
    }

    // Validate status
    if (!validStatusTypes.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Check if invnetory ID already exists
    const existingInventory = await Inventory.findOne({ id });
    if (existingInventory) {
      return NextResponse.json(
        { error: "Inventory with this ID already exists" },
        { status: 409 }
      );
    }

    let imagePath = "";

    // Handle File Upload
    if (file) {
      // Validate file type
      const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".svg", ".avif"];
      const fileExtension = path.extname(file.name).toLowerCase();

      if (!imageExtensions.includes(fileExtension)) {
        return NextResponse.json(
          { error: "Invalid file type. Only image files are allowed." },
          { status: 400 }
        );
      }

      // Create filename (using ID to ensure uniqueness and relation)
      const filename = `${id}${fileExtension}`;

      // Ensure inventory directory structure exists
      const inventoryDir = withStoragePath("inventory");
      const categoryDir = path.join(inventoryDir, category);

      await fs.mkdir(categoryDir, { recursive: true });

      // Save file
      const filePath = path.join(categoryDir, filename);
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filePath, buffer);

      imagePath = `/inventory/${category}/${filename}`;
    }

    // Create new inventory
    const newInventory = new Inventory({
      id,
      name,
      category,
      description,
      year_of_purchase,
      status,
      isLent: false,
      image: imagePath,
    });

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

    const formData = await request.formData();
    const id = formData.get("id") as string;
    const file = formData.get("file") as File;

    if (!id) {
      return NextResponse.json(
        { error: "Inventory ID is required" },
        { status: 400 }
      );
    }

    const existingInventory = await Inventory.findOne({ id });
    if (!existingInventory) {
      return NextResponse.json(
        { error: "Inventory item not found" },
        { status: 404 }
      );
    }

    // Extract fields to update
    const updateData: Record<string, string | number | boolean | undefined> = {};
    const fields = [
      "name",
      "category",
      "description",
      "year_of_purchase",
      "status",
      "isLent",
      "borrower",
      "borrowed_date",
      "comments",
    ];

    fields.forEach((field) => {
      const value = formData.get(field);
      if (value !== null) {
        if (field === "year_of_purchase") {
          updateData[field] = parseInt(value as string);
        } else if (field === "isLent") {
          updateData[field] = value === "true";
        } else {
          updateData[field] = value as string;
        }
      }
    });

    // Validate category type if provided
    if (updateData.category && !validCategoryTypes.includes(updateData.category as string)) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (updateData.status && !validStatusTypes.includes(updateData.status as string)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // If isLent is true then some related fields can't be empty
    if (updateData.isLent === true) {
      if (!updateData.borrower && !existingInventory.borrower) {
        return NextResponse.json(
          { error: "Borrower can't be empty" },
          { status: 400 }
        );
      }

      if (!updateData.borrowed_date && !existingInventory.borrowed_date) {
        return NextResponse.json(
          { error: "Empty Borrow date" },
          { status: 400 }
        );
      }

      if (!updateData.comments && !existingInventory.comments) {
        return NextResponse.json(
          { error: "Specify the purpose in the comments" },
          { status: 400 }
        );
      }
    } else if (updateData.isLent === false) {
      // If isLent is explicitly set to false, clear borrower-related fields
      updateData.borrower = "";
      updateData.borrowed_date = "";
      updateData.comments = "";
    }

    // Handle File Upload
    if (file) {
      // Validate file type
      const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".svg", ".avif"];
      const fileExtension = path.extname(file.name).toLowerCase();

      if (!imageExtensions.includes(fileExtension)) {
        return NextResponse.json(
          { error: "Invalid file type. Only image files are allowed." },
          { status: 400 }
        );
      }

      // Create filename (using ID)
      const filename = `${id}${fileExtension}`;

      // Ensure inventory directory structure exists
      const inventoryDir = withStoragePath("inventory");
      const category = updateData.category || existingInventory.category;
      const categoryDir = path.join(inventoryDir, category);

      await fs.mkdir(categoryDir, { recursive: true });

      // Save file
      const filePath = path.join(categoryDir, filename);
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filePath, buffer);

      updateData.image = `/inventory/${category}/${filename}`;
    }

    const updatedInventory = await Inventory.findOneAndUpdate(
      { id },
      { $set: updateData },
      { new: true }
    );

    console.log(
      "API PUT: Inventory updated successfully:",
      updatedInventory?.toObject()
    );

    // Log the action
    Logger.info("Inventory updated", {
      source: "admin/inventory",
      userEmail: user?.email || undefined,
      action: "update_inventory_item",
      details: {
        InventoryId: id,
        title: updatedInventory?.name,
        updates: Object.keys(updateData),
      },
    });

    return NextResponse.json({
      message: "Inventory updated successfully",
      inventory: updatedInventory,
    });
  } catch (error) {
    console.error("Error updating inventory:", error);
    return NextResponse.json(
      { error: "Failed to update inventory" },
      { status: 500 }
    );
  }
}

// DELETE - Delete Inventory
export async function DELETE(request: NextRequest) {
  try {
    const { user } = await requireAdmin();
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Inventory ID is required" },
        { status: 400 }
      );
    }

    // Find the Inventory first to get details for logging
    const inventoryData = await Inventory.findOne({ id });
    if (!inventoryData) {
      return NextResponse.json({ error: "Inventory not found" }, { status: 404 });
    }

    // Delete the Inventory
    await inventoryData.deleteOne({ id });

    // Log the action
    Logger.info("Inventory deleted", {
      source: "admin/inventory",
      userEmail: user?.email || undefined,
      action: "delete_inventory",
      details: {
        InventoryId: id,
        title: inventoryData.name,
        type: inventoryData.category,
        date: inventoryData.year_of_purchase,
      },
    });

    return NextResponse.json({
      message: "Inventory deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting Inventory:", error);

    if (error instanceof Error && error.message.includes("access required")) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete Inventory" },
      { status: 500 }
    );
  }
}