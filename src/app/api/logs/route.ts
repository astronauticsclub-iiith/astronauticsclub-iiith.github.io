import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const logsPath = path.join(process.cwd(), 'logs/persistent_log.json');
    
    try {
      const logsData = await fs.readFile(logsPath, 'utf-8');
      const parsedData = JSON.parse(logsData);
      
      // Handle both array format and object format with logs property
      let logs;
      if (Array.isArray(parsedData)) {
        logs = parsedData;
      } else if (parsedData.logs && Array.isArray(parsedData.logs)) {
        logs = parsedData.logs;
      } else {
        logs = [];
      }
      
      // Sort logs by timestamp (newest first) and apply pagination
      const sortedLogs = logs.sort((a: { timestamp: string }, b: { timestamp: string }) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      const paginatedLogs = sortedLogs.slice(offset, offset + limit);
      
      return NextResponse.json({
        logs: paginatedLogs,
        total: logs.length,
        hasMore: offset + limit < logs.length
      });
      
    } catch (fileError) {
      console.error('Error reading log file:', fileError);
      return NextResponse.json({
        logs: [],
        total: 0,
        hasMore: false,
        error: 'Log file not found or empty'
      });
    }

  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}