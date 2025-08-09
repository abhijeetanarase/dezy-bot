import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  if (shouldSkipMiddleware(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return unauthorizedResponse("No token provided");
  }

  const token = authHeader.split(" ")[1];

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not set");
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    
    const { payload } = await jwtVerify(token, secret);
  
    

    // Attach user info to request headers
    const headers = new Headers(request.headers);
    if (payload.id) headers.set("x-user-id", String(payload.id));
    if (payload.email) headers.set("x-user-email", String(payload.email));

    return NextResponse.next({ request: { headers } });

  } catch (error: any) {
    if (error.code === "ERR_JWT_EXPIRED") {
      return unauthorizedResponse("Token expired");
    }
    if (error.code === "ERR_JWT_INVALID") {
      return unauthorizedResponse("Invalid token");
    }
    console.error("Middleware error:", error);
    return serverErrorResponse();
  }
}

function shouldSkipMiddleware(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.includes(".") ||
    !pathname.startsWith("/api") ||
    pathname.startsWith("/api/auth")
  );
}

function unauthorizedResponse(message: string): NextResponse {
  return new NextResponse(
    JSON.stringify({ error: `Unauthorized - ${message}` }),
    { status: 401, headers: { "Content-Type": "application/json" } }
  );
}

function serverErrorResponse(): NextResponse {
  return new NextResponse(
    JSON.stringify({ error: "Internal server error" }),
    { status: 500, headers: { "Content-Type": "application/json" } }
  );
}

export const config = {
  matcher: ["/api/appointments/:path*"],
};
