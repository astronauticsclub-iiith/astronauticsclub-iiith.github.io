import mongoose, { Schema, Document } from "mongoose";
import { Event as EventInterface } from "../types/event";

export interface EventDocument
  extends Omit<EventInterface, "_id" | "id">,
    Document {
  _id: mongoose.Types.ObjectId;
  id: string;
}

const EventSchema = new Schema<EventDocument>(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: String, required: true }, // ISO date string
    time: { type: String }, // Optional time (e.g., "19:00")
    location: { type: String },
    type: {
      type: String,
      required: true,
      enum: [
        "stargazing",
        "starparty",
        "astrophotography",
        "theory",
        "competition",
        "workshop",
        "project",
        "other",
      ],
    },
    image: { type: String },
    participants: { type: Number },
    organizer: { type: String },
    registrationLink: { type: String }, // Optional registration URL
    status: {
      type: String,
      required: true,
      default: "upcoming",
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better performance
EventSchema.index({ date: -1 });
EventSchema.index({ type: 1 });
EventSchema.index({ status: 1 });
EventSchema.index({ title: "text", description: "text" });

// Prevent recompilation during development
const Event =
  mongoose.models.Event || mongoose.model<EventDocument>("Event", EventSchema);

export default Event;
