"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { LogEntry } from "@/types/log-entry";
import { withBasePath } from "@/components/common/HelperFunction";

interface LogViewerProps {
    showError: (message: string) => void;
}

export default function LogViewer({ showError }: LogViewerProps) {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);

    const fetchLogs = useCallback(async () => {
        setLogsLoading(true);
        try {
            const response = await fetch(withBasePath(`/api/logs?limit=50`));
            if (response.ok) {
                const data = await response.json();
                setLogs(data.logs || []);
            } else {
                showError("Failed to fetch logs");
            }
        } catch (error) {
            console.error("Error fetching logs:", error);
            showError("Failed to fetch logs");
        } finally {
            setLogsLoading(false);
        }
    }, [showError]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="border-2 sm:border-4 border-white p-3 sm:p-4 lg:p-6 backdrop-blur-sm hover:shadow-lg hover:shadow-white/10 transition-all duration-300"
        >
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 text-white uppercase flex items-center gap-2">
                <AlertTriangle size={18} className="sm:w-6 sm:h-6" />
                SYSTEM LOGS ({logs.length})
            </h2>

            {logsLoading ? (
                <div className="flex items-center justify-center py-8">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span className="ml-3 text-white font-bold uppercase">Loading logs...</span>
                </div>
            ) : logs.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-white font-bold uppercase">No logs found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {logs.map((log, index) => (
                        <motion.div
                            key={`${log.timestamp}-${index}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index, duration: 0.3 }}
                            className="border-2 border-white p-3 sm:p-4 backdrop-blur-sm hover:shadow-lg hover:shadow-white/5 transition-all duration-200"
                        >
                            {/* Log Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <span
                                        className={`px-2 py-1 text-xs font-bold uppercase border ${
                                            log.level === "error"
                                                ? "bg-red-600 text-white border-red-600"
                                                : log.level === "warn"
                                                  ? "bg-yellow-600 text-white border-yellow-600"
                                                  : "bg-green-600 text-white border-green-600"
                                        }`}
                                    >
                                        {log.level}
                                    </span>
                                    <span className="text-white font-bold text-sm sm:text-base uppercase">
                                        {log.action}
                                    </span>
                                </div>
                                <span className="text-xs sm:text-sm text-[#e0e0e0] font-mono">
                                    {new Date(log.timestamp).toLocaleString()}
                                </span>
                            </div>

                            {/* Log Content */}
                            <div className="space-y-2">
                                <p className="text-white text-sm sm:text-base">
                                    <span className="font-bold">Message:</span> {log.message}
                                </p>

                                {log.userEmail && (
                                    <p className="text-[#e0e0e0] text-sm">
                                        <span className="font-bold">User:</span> {log.userEmail}
                                    </p>
                                )}

                                {log.source && (
                                    <p className="text-[#e0e0e0] text-sm">
                                        <span className="font-bold">Source:</span> {log.source}
                                    </p>
                                )}

                                {/* Log Details */}
                                {log.details && Object.keys(log.details).length > 0 && (
                                    <div className="mt-3 p-2 sm:p-3 bg-black border border-white overflow-scroll">
                                        <p className="text-xs sm:text-sm font-bold text-white mb-2 uppercase">
                                            Details:
                                        </p>
                                        <div className="text-xs text-green-400 font-mono space-y-1">
                                            {Object.entries(log.details).map(([key, value]) => (
                                                <div key={key} className="break-all">
                                                    <span className="text-yellow-400">{key}:</span>{" "}
                                                    <span className="text-green-400">
                                                        {typeof value === "object"
                                                            ? JSON.stringify(value, null, 2)
                                                            : String(value)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
