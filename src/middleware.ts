import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith(`${basePath}/imtheboss`);
    const isBlogAuthorRoute = req.nextUrl.pathname.startsWith(
      `${basePath}/clickity-clackity-blogs-are-my-property`
    );
    const isLoginRoute = req.nextUrl.pathname.startsWith(`${basePath}/let-me-innn`);

    // If user is not authenticated and trying to access protected routes
    if (!token && (isAdminRoute || isBlogAuthorRoute)) {
      return NextResponse.redirect(new URL(`${basePath}/let-me-innn`, req.url));
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
        console.log(
          "Middleware - Redirecting to stay-away-snooper (no admin role)"
        );
        return NextResponse.redirect(new URL(`${basePath}/stay-away-snooper`, req.url));
      }

      if (
        isBlogAuthorRoute &&
        userRole !== "admin" && userRole !== "writer"
      ) {
        return NextResponse.redirect(new URL(`${basePath}/stay-away-snooper`, req.url));
      }

      // If authenticated user tries to access login page, redirect them appropriately
      if (isLoginRoute) {
        if (userRole === "admin") {
          return NextResponse.redirect(new URL(`${basePath}/imtheboss`, req.url));
        } else if (userRole === "writer") {
          return NextResponse.redirect(
            new URL("/clickity-clackity-blogs-are-my-property", req.url)
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
          req.nextUrl.pathname.startsWith(`${basePath}/api/auth`) ||
          req.nextUrl.pathname.startsWith(`${basePath}/api/blogs`) ||
          req.nextUrl.pathname.startsWith(`${basePath}/api/gallery`) ||
          req.nextUrl.pathname === `${basePath}/stay-away-snooper` ||
          req.nextUrl.pathname === `${basePath}/let-me-innn` ||
          req.nextUrl.pathname === `${basePath}/` ||
          req.nextUrl.pathname.startsWith(`${basePath}/blogs`) ||
          req.nextUrl.pathname.startsWith(`${basePath}/gallery`) ||
          req.nextUrl.pathname.startsWith(`${basePath}/_next`) ||
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
    `/astronautics/imtheboss/:path*`,
    `/astronautics/clickity-clackity-blogs-are-my-property/:path*`,
    `/astronautics/let-me-innn/:path*`,
    `/astronautics/api/upload/:path*`,
    `/astronautics/api/users/:path*`,
    `/astronautics/api/my-blogs/:path*`,
  ],
};
