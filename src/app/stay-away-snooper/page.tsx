"use client";

import Link from "next/link";
import { ShieldX } from "lucide-react";

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
            <div className="text-center space-y-8 max-w-md w-full mx-auto p-4 sm:p-8">
                <div className="mb-4">
                    <ShieldX size={96} className="mx-auto text-red-500" />
                </div>

                <h1 className="text-2xl sm:text-4xl font-bold text-red-500 mb-4">Access Denied</h1>

                <p className="text-lg sm:text-xl text-gray-300 mb-6">
                    You don&apos;t have permission to access this area.
                </p>

                <p className="text-gray-500 mb-8">
                    This section is restricted to authorized personnel only. If you believe you
                    should have access, please contact the administrator.
                </p>

                <div className="space-y-4">
                    <Link
                        href="/"
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        Return to Homepage
                    </Link>
                </div>

                <div className="text-xs text-gray-600 mt-8">Error Code: 403 - Forbidden</div>
            </div>
        </div>
    );
}
