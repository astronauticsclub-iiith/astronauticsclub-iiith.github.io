export interface Event {
  _id?: string;
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string
  time?: string; // Optional time (e.g., "19:00")
  location?: string;
  type:
    | "stargazing"
    | "starparty"
    | "astrophotography"
    | "theory"
    | "competition"
    | "workshop"
    | "project"
    | "other";
  image?: string;
  participants?: number;
  organizer?: string;
  registrationLink?: string; // Optional registration URL
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EventFilters {
  search: string;
  type: string[];
  status: string[];
  sortBy: "latest" | "oldest" | "alphabetical";
}

export interface EventResponse {
  events: Event[];
  total: number;
}
