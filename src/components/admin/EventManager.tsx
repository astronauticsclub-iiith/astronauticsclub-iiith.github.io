"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, CalendarDays } from "lucide-react";
import { Event } from "@/types/event";
import AdminEventCard from "@/components/admin/AdminEventCard";
import ImageSelector from "@/components/admin/ImageSelector";
import { withBasePath } from "@/components/common/HelperFunction";

interface EventManagerProps {
    showSuccess: (message: string) => void;
    showError: (message: string) => void;
}

export default function EventManager({ showSuccess, showError }: EventManagerProps) {
    const [events, setEvents] = useState<Event[]>([]);
    const [eventsLoading, setEventsLoading] = useState(false);
    const [editingEvent, setEditingEvent] = useState<string | null>(null);
    const [newEvent, setNewEvent] = useState({
        id: "",
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        type: "stargazing" as const,
        participants: undefined as number | undefined,
        organizer: "",
        registrationLink: "",
        status: "upcoming" as const,
        image: "",
    });

    const fetchEvents = useCallback(async () => {
        setEventsLoading(true);
        try {
            const response = await fetch(withBasePath(`/api/events/admin`));
            if (response.ok) {
                const data = await response.json();
                setEvents(data.events || []);
            } else {
                showError("Failed to fetch events");
            }
        } catch (error) {
            console.error("Error fetching events:", error);
            showError("Failed to fetch events");
        } finally {
            setEventsLoading(false);
        }
    }, [showError]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const addEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const eventData = {
                id: newEvent.id,
                title: newEvent.title,
                description: newEvent.description,
                date: newEvent.date,
                type: newEvent.type,
                status: newEvent.status,
                registrationLink: newEvent.registrationLink || "",
                ...(newEvent.time && { time: newEvent.time }),
                ...(newEvent.location && { location: newEvent.location }),
                ...(newEvent.organizer && { organizer: newEvent.organizer }),
                ...(newEvent.participants !== undefined && {
                    participants: newEvent.participants,
                }),
                ...(newEvent.image && { image: newEvent.image }),
            };

            const response = await fetch(withBasePath(`/api/events/admin`), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(eventData),
            });

            if (response.ok) {
                setNewEvent({
                    id: "",
                    title: "",
                    description: "",
                    date: "",
                    time: "",
                    location: "",
                    type: "stargazing",
                    participants: undefined,
                    organizer: "",
                    registrationLink: "",
                    status: "upcoming",
                    image: "",
                });
                fetchEvents();
                showSuccess("Event created successfully");
            } else {
                const error = await response.json();
                showError(error.error || "Failed to create event");
            }
        } catch (error) {
            console.error("Error creating event:", error);
            showError("Failed to create event");
        }
    };

    const updateEvent = async (eventId: string, eventData: Partial<Event>) => {
        try {
            const response = await fetch(withBasePath(`/api/events/admin`), {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...eventData, id: eventId }),
            });

            if (response.ok) {
                setEditingEvent(null);
                fetchEvents();
                showSuccess("Event updated successfully");
            } else {
                const error = await response.json();
                showError(error.error || "Failed to update event");
            }
        } catch (error) {
            console.error("Error updating event:", error);
            showError("Failed to update event");
            throw error;
        }
    };

    const deleteEvent = async (eventId: string) => {
        try {
            const response = await fetch(
                withBasePath(`/api/events/admin?id=${encodeURIComponent(eventId)}`),
                { method: "DELETE" }
            );

            if (response.ok) {
                fetchEvents();
                showSuccess("Event deleted successfully");
            } else {
                const error = await response.json();
                showError(error.error || "Failed to delete event");
            }
        } catch (error) {
            console.error("Error deleting event:", error);
            showError("Failed to delete event");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-6 sm:space-y-8"
        >
            {/* Add Event Form */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="border-2 sm:border-4 border-white p-3 sm:p-4 lg:p-6 backdrop-blur-sm hover:shadow-lg hover:shadow-white/10 transition-all duration-300"
            >
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 text-white uppercase flex items-center gap-2">
                    <Plus size={18} className="sm:w-6 sm:h-6" />
                    CREATE NEW EVENT
                </h2>
                <form onSubmit={addEvent} className="space-y-4">
                    {/* Event ID and Title */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <input
                            type="text"
                            placeholder="EVENT ID (UNIQUE)"
                            value={newEvent.id}
                            onChange={(e) => setNewEvent({ ...newEvent, id: e.target.value })}
                            className="bg-background border-2 border-white p-3 sm:p-4 text-white font-medium placeholder-[#666] uppercase text-sm sm:text-base transition-all duration-200 focus:scale-[1.02] hover:border-opacity-80 focus:ring-2 focus:ring-white focus:border-white"
                            required
                        />
                        <input
                            type="text"
                            placeholder="EVENT TITLE"
                            value={newEvent.title}
                            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                            className="bg-background border-2 border-white p-3 sm:p-4 text-white font-medium placeholder-[#666] uppercase text-sm sm:text-base transition-all duration-200 focus:scale-[1.02] hover:border-opacity-80 focus:ring-2 focus:ring-white focus:border-white"
                            required
                        />
                    </div>

                    {/* Description */}
                    <textarea
                        placeholder="EVENT DESCRIPTION"
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                        className="w-full bg-background border-2 border-white p-3 sm:p-4 text-white font-medium placeholder-[#666] text-sm sm:text-base transition-all duration-200 focus:scale-[1.02] hover:border-opacity-80 focus:ring-2 focus:ring-white focus:border-white resize-none"
                        rows={3}
                        required
                    />

                    {/* Date, Time, Location */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        <div>
                            <label className="block text-white text-xs font-bold mb-1 uppercase">
                                Date *
                            </label>
                            <input
                                type="date"
                                value={newEvent.date}
                                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                                className="w-full bg-background border-2 border-white p-3 sm:p-4 text-white font-medium text-sm sm:text-base transition-all duration-200 focus:scale-[1.02] hover:border-opacity-80 focus:ring-2 focus:ring-white focus:border-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-white text-xs font-bold mb-1 uppercase">
                                Time (Optional)
                            </label>
                            <input
                                type="time"
                                value={newEvent.time}
                                onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                                className="w-full bg-background border-2 border-white p-3 sm:p-4 text-white font-medium text-sm sm:text-base transition-all duration-200 focus:scale-[1.02] hover:border-opacity-80 focus:ring-2 focus:ring-white focus:border-white"
                            />
                        </div>
                        <input
                            type="text"
                            placeholder="LOCATION (OPTIONAL)"
                            value={newEvent.location}
                            onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                            className="bg-background border-2 border-white p-3 sm:p-4 text-white font-medium placeholder-[#666] text-sm sm:text-base transition-all duration-200 focus:scale-[1.02] hover:border-opacity-80 focus:ring-2 focus:ring-white focus:border-white"
                        />
                    </div>

                    {/* Type, Status, Participants, Organizer */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <div>
                            <label className="block text-white text-xs font-bold mb-1 uppercase">
                                Event Type *
                            </label>
                            <select
                                value={newEvent.type}
                                onChange={(e) =>
                                    setNewEvent({
                                        ...newEvent,
                                        type: e.target.value as typeof newEvent.type,
                                    })
                                }
                                className="w-full bg-background border-2 border-white p-3 sm:p-4 text-white font-medium text-sm sm:text-base transition-all duration-200 focus:scale-[1.02] hover:border-opacity-80 focus:ring-2 focus:ring-white focus:border-white"
                                required
                            >
                                <option value="stargazing">STARGAZING</option>
                                <option value="starparty">STARPARTY</option>
                                <option value="astrophotography">ASTROPHOTOGRAPHY</option>
                                <option value="theory">THEORY</option>
                                <option value="competition">COMPETITION</option>
                                <option value="workshop">WORKSHOP</option>
                                <option value="project">PROJECT</option>
                                <option value="other">OTHER</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-white text-xs font-bold mb-1 uppercase">
                                Status *
                            </label>
                            <select
                                value={newEvent.status}
                                onChange={(e) =>
                                    setNewEvent({
                                        ...newEvent,
                                        status: e.target.value as typeof newEvent.status,
                                    })
                                }
                                className="w-full bg-background border-2 border-white p-3 sm:p-4 text-white font-medium text-sm sm:text-base transition-all duration-200 focus:scale-[1.02] hover:border-opacity-80 focus:ring-2 focus:ring-white focus:border-white"
                                required
                            >
                                <option value="upcoming">UPCOMING</option>
                                <option value="ongoing">ONGOING</option>
                                <option value="completed">COMPLETED</option>
                                <option value="cancelled">CANCELLED</option>
                            </select>
                        </div>
                        <input
                            type="number"
                            placeholder="PARTICIPANTS"
                            value={newEvent.participants || ""}
                            onChange={(e) =>
                                setNewEvent({
                                    ...newEvent,
                                    participants: e.target.value
                                        ? parseInt(e.target.value)
                                        : undefined,
                                })
                            }
                            className="bg-background border-2 border-white p-3 sm:p-4 text-white font-medium placeholder-[#666] text-sm sm:text-base transition-all duration-200 focus:scale-[1.02] hover:border-opacity-80 focus:ring-2 focus:ring-white focus:border-white"
                            min="0"
                        />
                        <input
                            type="text"
                            placeholder="ORGANIZER"
                            value={newEvent.organizer}
                            onChange={(e) =>
                                setNewEvent({ ...newEvent, organizer: e.target.value })
                            }
                            className="bg-background border-2 border-white p-3 sm:p-4 text-white font-medium placeholder-[#666] text-sm sm:text-base transition-all duration-200 focus:scale-[1.02] hover:border-opacity-80 focus:ring-2 focus:ring-white focus:border-white"
                        />
                    </div>

                    {/* Registration Link */}
                    <input
                        type="url"
                        placeholder="REGISTRATION LINK (OPTIONAL)"
                        value={newEvent.registrationLink}
                        onChange={(e) =>
                            setNewEvent({
                                ...newEvent,
                                registrationLink: e.target.value,
                            })
                        }
                        className="w-full bg-background border-2 border-white p-3 sm:p-4 text-white font-medium placeholder-[#666] text-sm sm:text-base transition-all duration-200 focus:scale-[1.02] hover:border-opacity-80 focus:ring-2 focus:ring-white focus:border-white"
                    />

                    {/* Image Selection */}
                    <ImageSelector
                        selectedImage={newEvent.image}
                        onChange={(image) => setNewEvent({ ...newEvent, image })}
                    />

                    <button
                        type="submit"
                        className="w-full sm:w-auto px-3 sm:px-4 py-3 sm:py-4 border-2 border-white bg-white text-background font-bold hover:bg-[#e0e0e0] transition-all duration-200 uppercase text-sm sm:text-base hover:scale-105 active:scale-95"
                    >
                        <Plus className="inline mr-2" size={14} />
                        CREATE EVENT
                    </button>
                </form>
            </motion.div>

            {/* Events List */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="border-2 sm:border-4 border-white p-3 sm:p-4 lg:p-6 backdrop-blur-sm hover:shadow-lg hover:shadow-white/10 transition-all duration-300"
            >
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 text-white uppercase flex items-center gap-2">
                    <CalendarDays size={18} className="sm:w-6 sm:h-6" />
                    ALL EVENTS ({events.length})
                </h2>

                {eventsLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                            className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span className="ml-3 text-white font-bold uppercase">
                            Loading events...
                        </span>
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-white font-bold uppercase">No events found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        {events.map((event, index) => (
                            <AdminEventCard
                                key={event.id}
                                event={event}
                                index={index}
                                onEdit={updateEvent}
                                onDelete={deleteEvent}
                                isEditing={editingEvent === event.id}
                                onStartEdit={() => setEditingEvent(event.id)}
                                onCancelEdit={() => setEditingEvent(null)}
                            />
                        ))}
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}
