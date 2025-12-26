"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    Star,
    Rocket,
    Camera,
    Brain,
    Trophy,
    Wrench,
    FolderOpen,
} from "lucide-react";
import { Event } from "@/types/event";
import Image from "next/image";
import { useImagePreview } from "@/context/ImagePreviewContext";
import { withUploadPath } from "../common/HelperFunction";

interface EventTimelineProps {
    events: Event[];
}

const getEventTypeIcon = (type: string) => {
    switch (type) {
        case "stargazing":
            return <Star size={20} className="text-blue-400" />;
        case "starparty":
            return <Star size={20} className="text-yellow-400" />;
        case "astrophotography":
            return <Camera size={20} className="text-purple-400" />;
        case "theory":
            return <Brain size={20} className="text-green-400" />;
        case "competition":
            return <Trophy size={20} className="text-red-400" />;
        case "workshop":
            return <Wrench size={20} className="text-orange-400" />;
        case "project":
            return <FolderOpen size={20} className="text-cyan-400" />;
        default:
            return <Rocket size={20} className="text-white" />;
    }
};

const getEventTypeColor = (type: string) => {
    switch (type) {
        case "stargazing":
            return "border-blue-400 bg-blue-400/10";
        case "starparty":
            return "border-yellow-400 bg-yellow-400/10";
        case "astrophotography":
            return "border-purple-400 bg-purple-400/10";
        case "theory":
            return "border-green-400 bg-green-400/10";
        case "competition":
            return "border-red-400 bg-red-400/10";
        case "workshop":
            return "border-orange-400 bg-orange-400/10";
        case "project":
            return "border-cyan-400 bg-cyan-400/10";
        default:
            return "border-white bg-white/10";
    }
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
        year: date.getFullYear(),
        month: date.toLocaleDateString("en", { month: "short" }),
        day: date.getDate(),
    };
};

const EventTimelineItem: React.FC<{ event: Event; index: number }> = ({ event, index }) => {
    const { openPreview } = useImagePreview();
    const formattedDate = formatDate(event.date);
    const typeColor = getEventTypeColor(event.type);

    return (
        <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.6 }}
            className={`relative flex ${index % 2 === 0 ? "md:justify-end" : "md:justify-start"}`}
        >
            {/* Timeline connector line - Mobile: left side, Desktop: center */}
            <div className="absolute left-6 sm:left-7 md:left-1/2 top-0 w-0.5 sm:w-1 h-full bg-white transform md:-translate-x-1/2 z-0"></div>

            {/* Timeline dot - Mobile: left side, Desktop: center */}
            <div
                className={`absolute left-4 sm:left-5 md:left-1/2 top-6 sm:top-7 md:top-8 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${
                    typeColor.split(" ")[0]
                } bg-background border-2 sm:border-3 md:border-4 rounded-full transform md:-translate-x-1/2 z-10 flex items-center justify-center`}
            >
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 bg-white rounded-full"></div>
            </div>

            {/* Desktop: Date badge on OPPOSITE side of timeline from event card */}
            <div
                className={`hidden md:block absolute top-1/2 transform -translate-y-1/2 z-20 ${
                    index % 2 === 0 ? "right-1/2 mr-16" : "left-1/2 ml-16"
                }`}
            >
                <div
                    className={`${
                        typeColor.split(" ")[0]
                    } bg-background border-3 md:border-4 p-5 md:p-7 text-center shadow-[8px_8px_0px_0px_rgba(128,128,128,0.7)] min-w-[120px] md:min-w-[140px] transform hover:scale-105 transition-transform duration-200`}
                >
                    <div className="text-3xl md:text-4xl font-black text-white mb-1">
                        {formattedDate.day}
                    </div>
                    <div className="text-base md:text-lg font-bold text-white uppercase tracking-wider">
                        {formattedDate.month}
                    </div>
                    <div className="text-sm md:text-base font-bold text-white uppercase tracking-wider opacity-90">
                        {formattedDate.year}
                    </div>
                </div>
            </div>

            {/* Event card - Mobile: always right of spine, Desktop: alternating */}
            <div
                className={`w-full ml-12 sm:ml-14 md:ml-0 md:w-5/12 mb-12 sm:mb-14 md:mb-16 backdrop-blur-sm ${
                    index % 2 === 0 ? "md:mr-8" : "md:ml-8"
                } pr-4 sm:pr-6 md:pr-0`}
            >
                <motion.div
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
                    className={`bg-background border-2 sm:border-3 md:border-4 shadow-[4px_4px_0px_0px_rgba(128,128,128,0.5)] sm:shadow-[6px_6px_0px_0px_rgba(128,128,128,0.5)] md:shadow-[8px_8px_0px_0px_rgba(128,128,128,0.5)] hover:shadow-[6px_6px_0px_0px_rgba(128,128,128,0.5)] sm:hover:shadow-[8px_8px_0px_0px_rgba(128,128,128,0.5)] md:hover:shadow-[12px_12px_0px_0px_rgba(128,128,128,0.5)] transition-all duration-300 ${typeColor}`}
                >
                    {/* Date badge - Mobile and tablet only, hidden on desktop */}
                    <div
                        className={`md:hidden ${
                            typeColor.split(" ")[0]
                        } bg-background border-b-2 sm:border-b-3 md:border-b-4 p-3 sm:p-4 text-center`}
                    >
                        <div className="text-lg sm:text-xl md:text-2xl font-black text-white">
                            {formattedDate.day} {formattedDate.month} {formattedDate.year}
                        </div>
                    </div>

                    {/* Event image */}
                    {event.image && (
                        <div
                            className={`${
                                typeColor.split(" ")[0]
                            } relative h-36 sm:h-40 md:h-48 border-b-2 sm:border-b-3 md:border-b-4 overflow-hidden cursor-open`}
                        >
                            <Image
                                src={withUploadPath(event.image)}
                                alt={event.title}
                                unoptimized
                                fill
                                loading="lazy"
                                priority={index < 3} // this will load first 3 images immediately
                                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                className="transition-transform duration-300 hover:scale-105 cursor-pointer object-cover"
                                onClick={() =>
                                    event.image &&
                                    openPreview(withUploadPath(event.image), event.title)
                                }
                            />
                        </div>
                    )}

                    {/* Event content */}
                    <div className="p-3 sm:p-4 md:p-6">
                        {/* Event type and status */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2 mb-4">
                            <div className="flex items-center gap-2 flex-wrap">
                                <div
                                    className={`${
                                        typeColor.split(" ")[0]
                                    } bg-background border-2 rounded p-1 flex-shrink-0`}
                                >
                                    {getEventTypeIcon(event.type)}
                                </div>
                                <span
                                    className={`text-xs font-bold uppercase tracking-wider border-2 px-2 py-1 rounded ${
                                        typeColor.split(" ")[0]
                                    } bg-background text-white`}
                                >
                                    {event.type}
                                </span>
                            </div>
                            <div
                                className={`text-xs font-bold px-2 py-1 border-2 rounded uppercase tracking-wider self-start sm:self-auto ${
                                    event.status === "completed"
                                        ? "text-green-400 border-green-400 bg-green-400/10"
                                        : event.status === "upcoming"
                                          ? "text-blue-400 border-blue-400 bg-blue-400/10"
                                          : event.status === "ongoing"
                                            ? "text-yellow-400 border-yellow-400 bg-yellow-400/10"
                                            : "text-red-400 border-red-400 bg-red-400/10"
                                }`}
                            >
                                {event.status}
                            </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg sm:text-xl md:text-xl font-black text-white mb-3 uppercase tracking-tight leading-tight break-words">
                            {event.title}
                        </h3>

                        {/* Description */}
                        <p className="text-[#e0e0e0] mb-4 text-sm sm:text-sm md:text-sm leading-relaxed break-words">
                            {event.description}
                        </p>

                        {/* Event details */}
                        <div className="space-y-2 text-sm">
                            {event.time && (
                                <div className="flex items-start gap-2 text-[#e0e0e0]">
                                    <Clock size={16} className="mt-0.5 flex-shrink-0" />
                                    <span className="font-medium break-words">{event.time}</span>
                                </div>
                            )}
                            {event.location && (
                                <div className="flex items-start gap-2 text-[#e0e0e0]">
                                    <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                                    <span className="font-medium break-words">
                                        {event.location}
                                    </span>
                                </div>
                            )}
                            {event.participants && event.participants > 0 ? (
                                <div className="flex items-start gap-2 text-[#e0e0e0]">
                                    <Users size={16} className="mt-0.5 flex-shrink-0" />
                                    <span className="font-medium">
                                        {event.participants} participants
                                    </span>
                                </div>
                            ) : (
                                ""
                            )}

                            {event.organizer && (
                                <div className="text-xs text-[#e0e0e0] mt-3 border-t-2 border-white pt-2">
                                    <span className="font-bold">Organized by:</span>{" "}
                                    <span className="break-words">{event.organizer}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Registration Button - Separate bordered section */}
                    {event.registrationLink && (
                        <div
                            className={`${
                                typeColor.split(" ")[0]
                            } bg-background border-t-2 sm:border-t-3 md:border-t-4`}
                        >
                            <motion.a
                                href={event.registrationLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="inline-block w-full text-center px-4 py-3 border-2 border-white bg-background text-white font-bold text-sm uppercase tracking-wider transition-all duration-200 hover:bg-white hover:text-background shadow-[2px_2px_0px_0px_rgba(128,128,128,0.5)] hover:shadow-[4px_4px_0px_0px_rgba(128,128,128,0.5)]"
                            >
                                Register
                            </motion.a>
                        </div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
};

const EventTimeline: React.FC<EventTimelineProps> = ({ events }) => {
    if (events.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 sm:py-16 md:py-20 border-2 sm:border-3 md:border-4 border-white shadow-[4px_4px_0px_0px_rgba(128,128,128,0.5)] sm:shadow-[6px_6px_0px_0px_rgba(128,128,128,0.5)] md:shadow-[8px_8px_0px_0px_rgba(128,128,128,0.5)] bg-background mx-4 sm:mx-6 md:mx-0"
            >
                <div className="mb-6 sm:mb-8">
                    <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 border-2 sm:border-3 md:border-4 border-white flex items-center justify-center mx-auto transform rotate-12 shadow-[2px_2px_0px_0px_rgba(128,128,128,0.5)] sm:shadow-[3px_3px_0px_0px_rgba(128,128,128,0.5)] md:shadow-[4px_4px_0px_0px_rgba(128,128,128,0.5)]">
                        <Calendar
                            size={28}
                            className="sm:text-32 md:text-36 text-white -rotate-12"
                        />
                    </div>
                </div>
                <h3 className="text-2xl sm:text-2xl md:text-3xl font-black mb-3 sm:mb-4 uppercase tracking-wide text-white px-4">
                    No Events Found
                </h3>
                <p className="text-[#e0e0e0] max-w-xs sm:max-w-sm md:max-w-md mx-auto font-medium mb-6 sm:mb-8 border-l-2 border-r-2 sm:border-l-3 sm:border-r-3 md:border-l-4 md:border-r-4 border-white px-4 sm:px-5 md:px-6 py-2 text-sm sm:text-base">
                    No events match your current filters. Try adjusting your search criteria.
                </p>
            </motion.div>
        );
    }

    return (
        <div className="relative sm:px-4 md:px-0">
            {events.map((event, index) => (
                <EventTimelineItem key={event.id} event={event} index={index} />
            ))}
        </div>
    );
};

export default EventTimeline;
