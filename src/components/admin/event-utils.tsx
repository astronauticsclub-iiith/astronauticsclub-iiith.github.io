import React from "react";
import { Star, Camera, Brain, Trophy, Wrench, FolderOpen, Rocket } from "lucide-react";

export const getEventTypeIcon = (type: string) => {
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

export const getEventTypeColor = (type: string) => {
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

export const getStatusColor = (status: string) => {
    switch (status) {
        case "upcoming":
            return "bg-blue-600 border-blue-600";
        case "ongoing":
            return "bg-green-600 border-green-600";
        case "completed":
            return "bg-gray-600 border-gray-600";
        case "cancelled":
            return "bg-red-600 border-red-600";
        default:
            return "bg-gray-600 border-gray-600";
    }
};
