export interface LogEntry {
    timestamp: string;
    level: string;
    message: string;
    source: string;
    userEmail: string;
    action: string;
    details: Record<string, unknown>;
}
