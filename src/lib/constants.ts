export const EVENT_TYPES = [
    "stargazing",
    "starparty",
    "astrophotography",
    "theory",
    "competition",
    "workshop",
    "project",
    "other",
] as const;

export const EVENT_STATUSES = ["upcoming", "ongoing", "completed", "cancelled"] as const;

export const INVENTORY_CATEGORIES = ["astronomy", "event", "electronics", "others"] as const;

export const INVENTORY_STATUSES = ["working", "repair", "broken"] as const;
