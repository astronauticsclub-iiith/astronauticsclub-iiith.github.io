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