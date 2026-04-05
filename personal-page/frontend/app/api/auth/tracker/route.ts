import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { password } = await request.json();
  const expected = process.env.TRACKER_PASSWORD;

  if (!expected) {
    return NextResponse.json({ error: "Tracker password not configured" }, { status: 500 });
  }

  if (password !== expected) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const response = NextResponse.json({ data: "ok" });
  response.cookies.set("tracker_auth", "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return response;
}
