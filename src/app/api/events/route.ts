import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Event from "@/models/Event";
import { Event as EventInterface } from "@/types/event";
import { requireWriter } from "@/lib/auth";
import Logger from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const status = searchParams.get("status") || "";
    const sortBy = searchParams.get("sortBy") || "latest";
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");

    // Build query
    const query: Record<string, unknown> = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { organizer: { $regex: search, $options: "i" } },
      ];
    }

    if (type) {
      const typeArray = type.split(",").filter((t) => t.trim());
      if (typeArray.length > 0) {
        query.type = { $in: typeArray };
      }
    }

    if (status) {
      const statusArray = status.split(",").filter((s) => s.trim());
      if (statusArray.length > 0) {
        query.status = { $in: statusArray };
      }
    }

    // Build sort
    let sort: Record<string, 1 | -1> = {};
    switch (sortBy) {
      case "latest":
        sort = { date: -1 };
        break;
      case "oldest":
        sort = { date: 1 };
        break;
      case "alphabetical":
        sort = { title: 1 };
        break;
      default:
        sort = { date: -1 };
    }

    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      Event.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Event.countDocuments(query),
    ]);

    return NextResponse.json({
      events,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireWriter();
    await connectToDatabase();

    const eventData: Omit<EventInterface, "_id" | "createdAt" | "updatedAt"> = await request.json();

    // Validate required fields
    const requiredFields = ["id", "title", "description", "date", "type"];
    for (const field of requiredFields) {
      if (!eventData[field as keyof typeof eventData]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Check if event with same id already exists
    const existingEvent = await Event.findOne({ id: eventData.id });

    if (existingEvent) {
      return NextResponse.json({ error: "Event with this ID already exists" }, { status: 409 });
    }

    const event = new Event({
      ...eventData,
      organizer: eventData.organizer || user.name || user.email,
      status: eventData.status || "upcoming",
    });

    await event.save();

    // Log the action
    Logger.logWriteOperation("CREATE_EVENT", user.email, "event", event._id.toString(), {
      title: event.title,
      date: event.date,
    });

    return NextResponse.json(event.toObject(), { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
