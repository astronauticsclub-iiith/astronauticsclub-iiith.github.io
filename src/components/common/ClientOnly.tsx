"use client";

import { useIsClient } from "@/hooks/useIsClient";

interface ClientOnlyProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * Component that only renders children on the client side after hydration.
 * Prevents hydration mismatches for components that depend on browser APIs.
 */
export const ClientOnly: React.FC<ClientOnlyProps> = ({ children, fallback = null }) => {
    const hasMounted = useIsClient();

    if (!hasMounted) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};
