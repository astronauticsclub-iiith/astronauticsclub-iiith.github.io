import { withBasePath } from "@/components/common/HelperFunction";
import { User } from "@/types/user";
import { Inventory } from "@/types/inventory-item";
import { Event } from "@/types/event";
import { LogEntry } from "@/types/log-entry";
import { GalleryImage } from "@/types/gallery-image";

// --- User Management ---

export async function fetchAllUsers(): Promise<User[]> {
    const response = await fetch(withBasePath(`/api/users`));
    if (!response.ok) {
        throw new Error("Failed to fetch users");
    }
    return await response.json();
}

export async function createUser(userData: {
    email: string;
    name: string;
    role: "admin" | "writer" | "none";
}): Promise<void> {
    const response = await fetch(withBasePath(`/api/users`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add user");
    }
}

export async function updateUserRole(
    userId: string,
    role: "admin" | "writer" | "none"
): Promise<void> {
    const response = await fetch(withBasePath(`/api/users/${userId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
    });

    if (!response.ok) {
        throw new Error("Failed to update user role");
    }
}

export async function updateUserDesignations(
    userId: string,
    designations: string[]
): Promise<void> {
    const response = await fetch(withBasePath(`/api/users/${userId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ designations }),
    });

    if (!response.ok) {
        throw new Error("Failed to update user designations");
    }
}

export async function deleteUser(userId: string): Promise<void> {
    const response = await fetch(withBasePath(`/api/users/${userId}`), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
        throw new Error("Failed to remove user");
    }
}

// --- Inventory Management ---

export async function fetchAdminInventory(): Promise<{ inventory: Inventory[] }> {
    const response = await fetch(withBasePath(`/api/inventory/admin`));
    if (!response.ok) {
        throw new Error("Failed to fetch inventory");
    }
    return await response.json();
}

export async function addInventoryItem(formData: FormData): Promise<void> {
    const response = await fetch(withBasePath(`/api/inventory/admin`), {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add inventory item");
    }
}

export async function updateInventoryItem(formData: FormData): Promise<void> {
    const response = await fetch(withBasePath(`/api/inventory/admin`), {
        method: "PUT",
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update inventory item");
    }
}

export async function deleteInventoryItem(inventoryId: string): Promise<void> {
    const response = await fetch(
        withBasePath(`/api/inventory/admin?id=${encodeURIComponent(inventoryId)}`),
        { method: "DELETE" }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete inventory item");
    }
}

// --- Gallery Management ---

export async function fetchAdminGalleryImages(): Promise<{
    images: GalleryImage[];
}> {
    const response = await fetch(withBasePath(`/api/gallery/admin`));
    if (!response.ok) {
        throw new Error("Failed to fetch gallery images");
    }
    return await response.json();
}

export async function uploadGalleryImage(formData: FormData): Promise<void> {
    const response = await fetch(withBasePath(`/api/gallery/admin`), {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload image");
    }
}

export async function updateGalleryImage(data: {
    currentFilename: string;
    currentCategory: string;
    newFilename?: string;
    newCategory?: string;
}): Promise<void> {
    const response = await fetch(withBasePath(`/api/gallery/admin`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update image");
    }
}

export async function deleteGalleryImage(
    filename: string,
    category: string
): Promise<void> {
    const response = await fetch(
        withBasePath(
            `/api/gallery/admin?filename=${encodeURIComponent(
                filename
            )}&category=${category}`
        ),
        { method: "DELETE" }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete image");
    }
}

// --- Event Management ---

export async function fetchAdminEvents(): Promise<{ events: Event[] }> {
    const response = await fetch(withBasePath(`/api/events/admin`));
    if (!response.ok) {
        throw new Error("Failed to fetch events");
    }
    return await response.json();
}

export async function createAdminEvent(eventData: Omit<Event, "id">): Promise<void> {
    const response = await fetch(withBasePath(`/api/events/admin`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create event");
    }
}

export async function updateEvent(
    eventId: string,
    eventData: Partial<Event>
): Promise<void> {
    const response = await fetch(withBasePath(`/api/events/admin`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...eventData, id: eventId }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update event");
    }
}

export async function deleteEvent(eventId: string): Promise<void> {
    const response = await fetch(
        withBasePath(`/api/events/admin?id=${encodeURIComponent(eventId)}`),
        { method: "DELETE" }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete event");
    }
}

// --- System Logs ---

export async function fetchLogs(limit = 50): Promise<{ logs: LogEntry[] }> {
    const response = await fetch(withBasePath(`/api/logs?limit=${limit}`));
    if (!response.ok) {
        throw new Error("Failed to fetch logs");
    }
    return await response.json();
}
