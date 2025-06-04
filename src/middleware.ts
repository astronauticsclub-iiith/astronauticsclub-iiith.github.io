import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith("/imtheboss");
    const isBlogAuthorRoute = req.nextUrl.pathname.startsWith(
      "/clickity-clackity-blogs-are-my-property"
    );
    const isLoginRoute = req.nextUrl.pathname.startsWith("/let-me-innn");

    // If user is not authenticated and trying to access protected routes
    if (!token && (isAdminRoute || isBlogAuthorRoute)) {
      return NextResponse.redirect(new URL("/let-me-innn", req.url));
    }

    // If user is authenticated but doesn't have the right role
    if (token) {
      const userRoles = (token as { roles?: string[] }).roles || [];

      console.log("Middleware - Auth check:", {
        path: req.nextUrl.pathname,
        isAdminRoute,
        userEmail: token.email,
        userRoles,
        hasAdminRole: userRoles.includes("admin"),
      });

      if (isAdminRoute && !userRoles.includes("admin")) {
        console.log(
          "Middleware - Redirecting to stay-away-snooper (no admin role)"
        );
        return NextResponse.redirect(new URL("/stay-away-snooper", req.url));
      }

      if (
        isBlogAuthorRoute &&
        !userRoles.some((role) => ["admin", "writer"].includes(role))
      ) {
        return NextResponse.redirect(new URL("/stay-away-snooper", req.url));
      }

      // If authenticated user tries to access login page, redirect them appropriately
      if (isLoginRoute) {
        if (userRoles.includes("admin")) {
          return NextResponse.redirect(new URL("/imtheboss", req.url));
        } else if (userRoles.includes("writer")) {
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
          req.nextUrl.pathname.startsWith("/api/auth") ||
          req.nextUrl.pathname.startsWith("/api/blogs") ||
          req.nextUrl.pathname.startsWith("/api/gallery") ||
          req.nextUrl.pathname === "/stay-away-snooper" ||
          req.nextUrl.pathname === "/let-me-innn" ||
          req.nextUrl.pathname === "/" ||
          req.nextUrl.pathname.startsWith("/blogs") ||
          req.nextUrl.pathname.startsWith("/gallery") ||
          req.nextUrl.pathname.startsWith("/_next") ||
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
    "/imtheboss/:path*",
    "/clickity-clackity-blogs-are-my-property/:path*",
    "/let-me-innn/:path*",
    "/api/upload/:path*",
    "/api/users/:path*",
    "/api/my-blogs/:path*",
  ],
};
