import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // 1. Prevent clickjacking (deny opening page in iframe)
  response.headers.set("X-Frame-Options", "DENY");

  // 2. Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // 3. Control referrer information
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // 4. Enable XSS filter in older browsers
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // 5. Clean and robust Content Security Policy (CSP)
  // Allows fonts, scripts, and local images/styles safely
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self';"
  );

  return response;
}

// Apply middleware to all routes except Next.js internals, static assets, and images
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (maybe keep headers on api, but you can configure as needed)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logo files/images in public
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
