import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { clientKey, rateLimit } from "@/lib/services/rate-limit";

export const runtime = "nodejs";

function base64url(input: string): string {
  return Buffer.from(input).toString("base64url");
}

/** Mints a LiveKit-compatible access token (JWT, HS256) with a room grant. */
function signToken(
  apiKey: string,
  apiSecret: string,
  identity: string,
  room: string,
  name?: string,
): string {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    iss: apiKey,
    sub: identity,
    nbf: now - 10,
    exp: now + 60 * 60 * 6, // valid 6 hours
    name,
    video: {
      room,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    },
  };
  const data = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;
  const sig = crypto
    .createHmac("sha256", apiSecret)
    .update(data)
    .digest("base64url");
  return `${data}.${sig}`;
}

/**
 * Issues a room access token for the live session. Requires LiveKit API
 * credentials on the server; responds 501 when video isn't configured.
 */
export async function POST(request: Request) {
  if (
    !rateLimit(clientKey(request, "video-token"), {
      limit: 30,
      windowMs: 60_000,
    })
  ) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const url = process.env.NEXT_PUBLIC_LIVEKIT_URL;
  if (!apiKey || !apiSecret || !url) {
    return NextResponse.json(
      { error: "Live video is not configured." },
      { status: 501 },
    );
  }

  const body = await request.json().catch(() => null);
  const room = String(body?.room ?? "").trim();
  const identity = String(body?.identity ?? "").trim();
  const name = typeof body?.name === "string" ? body.name : undefined;
  if (!room || !identity) {
    return NextResponse.json(
      { error: "room and identity are required." },
      { status: 400 },
    );
  }

  return NextResponse.json({
    token: signToken(apiKey, apiSecret, identity, room, name),
    url,
  });
}
