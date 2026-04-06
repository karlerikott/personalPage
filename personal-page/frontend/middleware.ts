import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/tracker") && !pathname.startsWith("/tracker/login")) {
    const auth = request.cookies.get("tracker_auth");
    if (!auth || auth.value !== "1") {
      return NextResponse.redirect(new URL("/tracker/login", request.url));
    }
  }

  if (pathname.startsWith("/diary") && !pathname.startsWith("/diary/login")) {
    const auth = request.cookies.get("tracker_auth");
    if (!auth || auth.value !== "1") {
      return NextResponse.redirect(new URL("/diary/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/tracker/:path*", "/diary/:path*"],
};
