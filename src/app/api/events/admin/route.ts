import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Event from "@/models/Event";
import { Logger } from "@/lib/logger";
import { requireAdmin } from "@/lib/auth";

// GET - List all events for admin management
export async function GET() {
    try {
        await requireAdmin();
        await connectToDatabase();

        const events = await Event.find({}).sort({ date: -1 }).lean();

        return NextResponse.json({ events });
    } catch (error) {
        console.error("Error fetching admin events:", error);

        if (error instanceof Error && error.message.includes("access required")) {
            return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
    }
}

// POST - Create new event
export async function POST(request: NextRequest) {
    try {
        const { user } = await requireAdmin();
        await connectToDatabase();

        const eventData = await request.json();

        console.log("API: Received event data:", eventData);
        console.log("API: Registration link:", eventData.registrationLink);

        // Validate required fields
        const requiredFields = ["id", "title", "description", "date", "type"];
        for (const field of requiredFields) {
            if (!eventData[field]) {
                return NextResponse.json({ error: `${field} is required` }, { status: 400 });
            }
        }

        // Validate event type
        const validTypes = [
            "stargazing",
            "starparty",
            "astrophotography",
            "theory",
            "competition",
            "workshop",
            "project",
            "other",
        ];
        if (!validTypes.includes(eventData.type)) {
            return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
        }

        // Validate status if provided
        if (eventData.status) {
            const validStatuses = ["upcoming", "ongoing", "completed", "cancelled"];
            if (!validStatuses.includes(eventData.status)) {
                return NextResponse.json({ error: "Invalid event status" }, { status: 400 });
            }
        }

        // Check if event ID already exists
        const existingEvent = await Event.findOne({ id: eventData.id });
        if (existingEvent) {
            return NextResponse.json(
                { error: "Event with this ID already exists" },
                { status: 409 }
            );
        }

        // Create new event
        const newEvent = new Event({
            ...eventData,
            status: eventData.status || "upcoming",
        });

        console.log("API: About to save event with data:", newEvent.toObject());

        await newEvent.save();

        console.log("API: Event saved successfully:", newEvent.toObject());

        // Log the action
        Logger.info("Event created", {
            source: "admin/events",
            userEmail: user?.email || undefined,
            action: "create_event",
            details: {
                eventId: newEvent.id,
                title: newEvent.title,
                type: newEvent.type,
                date: newEvent.date,
            },
        });

        return NextResponse.json({
            message: "Event created successfully",
            event: newEvent,
        });
    } catch (error) {
        console.error("Error creating event:", error);

        if (error instanceof Error && error.message.includes("access required")) {
            return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
    }
}

// PUT - Update existing event
export async function PUT(request: NextRequest) {
    try {
        const { user } = await requireAdmin();
        await connectToDatabase();

        const eventData = await request.json();
        const { id } = eventData;

        if (!id) {
            return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
        }

        // Validate event type if provided
        if (eventData.type) {
            const validTypes = [
                "stargazing",
                "starparty",
                "astrophotography",
                "theory",
                "competition",
                "workshop",
                "project",
                "other",
            ];
            if (!validTypes.includes(eventData.type)) {
                return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
            }
        }

        // Validate status if provided
        if (eventData.status) {
            const validStatuses = ["upcoming", "ongoing", "completed", "cancelled"];
            if (!validStatuses.includes(eventData.status)) {
                return NextResponse.json({ error: "Invalid event status" }, { status: 400 });
            }
        }

        // Find and update the event
        const existingEvent = await Event.findOne({ id });
        if (!existingEvent) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        const updatedEvent = await Event.findOneAndUpdate(
            { id },
            { $set: eventData },
            { new: true, runValidators: true }
        );

        console.log("API PUT: Received event data:", eventData);

        console.log("API PUT: Event updated successfully:", updatedEvent?.toObject());

        // Log the action
        Logger.info("Event updated", {
            source: "admin/events",
            userEmail: user?.email || undefined,
            action: "update_event",
            details: {
                eventId: id,
                title: updatedEvent?.title,
                changes: eventData,
            },
        });

        return NextResponse.json({
            message: "Event updated successfully",
            event: updatedEvent,
        });
    } catch (error) {
        console.error("Error updating event:", error);

        if (error instanceof Error && error.message.includes("access required")) {
            return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
    }
}

// DELETE - Delete event
export async function DELETE(request: NextRequest) {
    try {
        const { user } = await requireAdmin();
        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
        }

        // Find the event first to get details for logging
        const event = await Event.findOne({ id });
        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        // Delete the event
        await Event.deleteOne({ id });

        // Log the action
        Logger.info("Event deleted", {
            source: "admin/events",
            userEmail: user?.email || undefined,
            action: "delete_event",
            details: {
                eventId: id,
                title: event.title,
                type: event.type,
                date: event.date,
            },
        });

        return NextResponse.json({
            message: "Event deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting event:", error);

        if (error instanceof Error && error.message.includes("access required")) {
            return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
    }
}
