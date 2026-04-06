import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

export async function POST(request: Request) {
  const { password } = await request.json();
  const expected = process.env.TRACKER_PASSWORD;

  if (!expected) {
    return NextResponse.json({ error: "Tracker password not configured" }, { status: 500 });
  }

  // Timing-safe comparison to prevent timing attacks
  let match = false;
  try {
    const a = Buffer.from(password ?? "", "utf8");
    const b = Buffer.from(expected, "utf8");
    match = a.length === b.length && timingSafeEqual(a, b);
  } catch {
    match = false;
  }

  if (!match) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const response = NextResponse.json({ data: "ok" });
  response.cookies.set("tracker_auth", "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return response;
}
