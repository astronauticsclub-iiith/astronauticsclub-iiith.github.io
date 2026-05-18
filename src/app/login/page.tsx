"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import Link from "next/link";
import { Lock } from "lucide-react";
import Loader from "@/components/ui/Loader";
import { withBasePath } from "@/components/common/HelperFunction";

function LoginContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCASCallback = useCallback(
        async (ticket: string) => {
            setLoading(true);
            setError(null);

            try {
                const serviceUrl = `${window.location.origin}${withBasePath(`login`)}`;

                const result = await signIn("credentials", {
                    ticket,
                    service: serviceUrl,
                    redirect: false,
                });

                if (result?.error) {
                    console.error("SignIn error:", result.error);
                    setError("Authentication failed. Please try again.");
                } else {
                    // Fetch session with retries to avoid race condition.
                    // After signIn(), the JWT cookie may not be fully
                    // propagated when getSession() fires, causing it to
                    // return stale data with no role.
                    interface ExtendedUser {
                        id?: string;
                        name?: string | null;
                        email?: string | null;
                        image?: string | null;
                        role?: "admin" | "writer" | "none";
                    }

                    let userRole: string | undefined;
                    const maxRetries = 5;
                    for (let attempt = 0; attempt < maxRetries; attempt++) {
                        const session = await getSession();
                        const user = session?.user as ExtendedUser;
                        userRole = user?.role;

                        if (userRole) break;

                        // Wait before retrying (200ms, 400ms, 600ms, 800ms)
                        await new Promise((resolve) => setTimeout(resolve, 200 * (attempt + 1)));
                    }

                    console.log("Login redirect - User role:", userRole);

                    if (userRole === "admin") {
                        router.push("/admin");
                    } else if (userRole === "writer") {
                        router.push("/blog-editor");
                    } else {
                        router.push("/stay-away-snooper");
                    }
                }
            } catch {
                setError("An error occurred during authentication.");
            } finally {
                setLoading(false);
            }
        },
        [router],
    );

    useEffect(() => {
        const ticket = searchParams.get("ticket");

        if (ticket) {
            // Handle CAS callback
            handleCASCallback(ticket);
        }
    }, [searchParams, handleCASCallback]);

    const initiateLogin = () => {
        const serviceUrl = `${window.location.origin}${withBasePath(`login`)}`;
        const casLoginUrl = `https://login.iiit.ac.in/cas/login?service=${encodeURIComponent(
            serviceUrl,
        )}`;
        window.location.href = casLoginUrl;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4 w-full flex flex-col items-center">
                    <Loader overlay />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="text-center space-y-8 max-w-md w-full mx-auto p-4 sm:p-8">
                <div className="mb-4">
                    <Lock size={96} className="mx-auto accent" />
                </div>

                <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-4">
                    Authentication Required
                </h1>

                <p className="text-lg sm:text-xl text-gray-300 mb-6">
                    Please sign in with your IIIT credentials to access the maintenance panels
                </p>

                {error && (
                    <div className="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <button
                        onClick={initiateLogin}
                        className="inline-block bg-[--accent-really-dark] hover:bg-[--accent-dark] text-white px-6 py-3 rounded-lg font-medium transition-colors w-full"
                    >
                        Sign In with CAS
                    </button>

                    <Link
                        href="/"
                        className="inline-block text-gray-400 hover:text-foreground transition-colors"
                    >
                        Return to Homepage
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-background flex items-center justify-center w-full">
                    <Loader overlay />
                </div>
            }
        >
            <LoginContent />
        </Suspense>
    );
}
