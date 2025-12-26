import fs from "fs";
import path from "path";

const LOG_FILE = path.join(process.env.FILE_DIRECTORY!, "logs", "persistent_log.json");

interface LogEntry {
    timestamp: string;
    level: "info" | "warn" | "error";
    message: string;
    source?: string;
    userId?: string;
    userEmail?: string;
    action?: string;
    details?: Record<string, unknown>;
}

export class Logger {
    private static ensureLogDirectory() {
        const logDir = path.dirname(LOG_FILE);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
            console.log("Logger: Created log directory:", logDir);
        }
    }

    private static readLogs(): LogEntry[] {
        try {
            this.ensureLogDirectory();
            if (!fs.existsSync(LOG_FILE)) {
                this.writeLogs([]);
                return [];
            }
            const data = fs.readFileSync(LOG_FILE, "utf8");
            const parsedData = JSON.parse(data);

            // Handle both array format and object format with logs property
            if (Array.isArray(parsedData)) {
                return parsedData;
            } else if (parsedData.logs && Array.isArray(parsedData.logs)) {
                // Convert old format to new format
                this.writeLogs(parsedData.logs);
                return parsedData.logs;
            } else {
                return [];
            }
        } catch (error) {
            console.error("Error reading logs:", error);
            return [];
        }
    }

    private static writeLogs(logs: LogEntry[]) {
        try {
            this.ensureLogDirectory();
            // Keep only the latest 1000 logs to prevent file from growing too large
            const recentLogs = logs.slice(-1000);
            fs.writeFileSync(LOG_FILE, JSON.stringify(recentLogs, null, 2));
        } catch (error) {
            console.error("Error writing logs:", error);
        }
    }

    static log(
        level: "info" | "warn" | "error",
        message: string,
        options?: {
            source?: string;
            userId?: string;
            userEmail?: string;
            action?: string;
            details?: Record<string, unknown>;
        }
    ) {
        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            ...options,
        };

        const logs = this.readLogs();
        logs.push(entry);
        this.writeLogs(logs);

        // Also log to console in development
        if (process.env.NODE_ENV === "development") {
            console.log(`[${level.toUpperCase()}] ${message}`, options || "");
        }
    }

    static info(
        message: string,
        options?: {
            source?: string;
            userId?: string;
            userEmail?: string;
            action?: string;
            details?: Record<string, unknown>;
        }
    ) {
        this.log("info", message, options);
    }

    static warn(
        message: string,
        options?: {
            source?: string;
            userId?: string;
            userEmail?: string;
            action?: string;
            details?: Record<string, unknown>;
        }
    ) {
        this.log("warn", message, options);
    }

    static error(
        message: string,
        options?: {
            source?: string;
            userId?: string;
            userEmail?: string;
            action?: string;
            details?: Record<string, unknown>;
        }
    ) {
        this.log("error", message, options);
    }

    static getLogs(limit = 50): LogEntry[] {
        const logs = this.readLogs();
        return logs.slice(-limit).reverse(); // Return most recent first
    }

    // Log specific actions
    static logUserAction(userEmail: string, action: string, details?: Record<string, unknown>) {
        this.info(`User action: ${action}`, {
            source: "user_action",
            userEmail,
            action,
            details,
        });
    }

    static logAPICall(method: string, endpoint: string, userEmail?: string, status?: number) {
        this.info(`API ${method} ${endpoint} - ${status || "Unknown"}`, {
            source: "api",
            userEmail,
            action: `${method} ${endpoint}`,
            details: { status },
        });
    }

    static logWriteOperation(
        operation: string,
        userEmail: string,
        resourceType: string,
        resourceId?: string,
        details?: Record<string, unknown>
    ) {
        this.info(`Write operation: ${operation} ${resourceType}`, {
            source: "write_operation",
            userEmail,
            action: operation,
            details: {
                resourceType,
                resourceId,
                ...details,
            },
        });
    }
}

export default Logger;
