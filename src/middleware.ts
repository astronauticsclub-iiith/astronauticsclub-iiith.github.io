import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { withBasePath } from "./components/common/HelperFunction";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const isAdminRoute = req.nextUrl.pathname.startsWith(withBasePath(`/imtheboss`));
        const isBlogAuthorRoute = req.nextUrl.pathname.startsWith(
            withBasePath(`/clickity-clackity-blogs-are-my-property`)
        );
        const isLoginRoute = req.nextUrl.pathname.startsWith(withBasePath(`/let-me-innn`));

        // If user is not authenticated and trying to access protected routes
        if (!token && (isAdminRoute || isBlogAuthorRoute)) {
            return NextResponse.redirect(new URL(withBasePath(`/let-me-innn`), req.url));
        }

        // If user is authenticated but doesn't have the right role
        if (token) {
            const userRole = (token as { role?: string }).role;

            console.log("Middleware - Auth check:", {
                path: req.nextUrl.pathname,
                isAdminRoute,
                userEmail: token.email,
                userRole,
                hasAdminRole: userRole === "admin",
            });

            if (isAdminRoute && userRole !== "admin") {
                console.log("Middleware - Redirecting to stay-away-snooper (no admin role)");
                return NextResponse.redirect(new URL(withBasePath(`/stay-away-snooper`), req.url));
            }

            if (isBlogAuthorRoute && userRole !== "admin" && userRole !== "writer") {
                return NextResponse.redirect(new URL(withBasePath(`/stay-away-snooper`), req.url));
            }

            // If authenticated user tries to access login page, redirect them appropriately
            if (isLoginRoute) {
                if (userRole === "admin") {
                    return NextResponse.redirect(new URL(withBasePath(`/imtheboss`), req.url));
                } else if (userRole === "writer") {
                    return NextResponse.redirect(
                        new URL(withBasePath("/clickity-clackity-blogs-are-my-property"), req.url)
                    );
                }
            }
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                // Allow access to public routes
                if (
                    req.nextUrl.pathname.startsWith(withBasePath(`/api/auth`)) ||
                    req.nextUrl.pathname.startsWith(withBasePath(`/api/blogs`)) ||
                    req.nextUrl.pathname.startsWith(withBasePath(`/api/gallery`)) ||
                    req.nextUrl.pathname === withBasePath(`/stay-away-snooper`) ||
                    req.nextUrl.pathname === withBasePath(`/let-me-innn`) ||
                    req.nextUrl.pathname === withBasePath(`/`) ||
                    req.nextUrl.pathname.startsWith(withBasePath(`/blogs`)) ||
                    req.nextUrl.pathname.startsWith(withBasePath(`/gallery`)) ||
                    req.nextUrl.pathname.startsWith(withBasePath(`/_next`)) ||
                    req.nextUrl.pathname.includes(".")
                ) {
                    return true;
                }

                // For protected routes, require authentication
                return !!token;
            },
        },
    }
);

export const config = {
    matcher: [
        `/imtheboss/:path*`,
        `/clickity-clackity-blogs-are-my-property/:path*`,
        `/let-me-innn/:path*`,
        `/api/upload/:path*`,
        `/api/users/:path*`,
        `/api/my-blogs/:path*`,

        // basePath can't be used here. So manually setting it for the Club server
        `/astronautics/imtheboss/:path*`,
        `/astronautics/clickity-clackity-blogs-are-my-property/:path*`,
        `/astronautics/let-me-innn/:path*`,
        `/astronautics/api/upload/:path*`,
        `/astronautics/api/users/:path*`,
        `/astronautics/api/my-blogs/:path*`,
    ],
};
