import { NextResponse } from "next/server";

const supportedLanguages = new Set(["en", "hi", "or"]);

export async function POST(request: Request) {
  let language: unknown;

  try {
    ({ language } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (typeof language !== "string" || !supportedLanguages.has(language)) {
    return NextResponse.json({ error: "Unsupported language." }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("living_bliss_gita_language", language, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}
