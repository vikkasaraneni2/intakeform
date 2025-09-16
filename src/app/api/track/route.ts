import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { getClientIp, hashIp } from "@/lib/analytics";
import { assertOrigin } from "@/lib/guard";

export async function POST(req: NextRequest) {
  try {
    assertOrigin(req as unknown as Request);
    const body = await req.json();
    const { type, path, referrer, utmSource, utmMedium, utmCampaign, intakeId, accountId, contactId } = body || {};

    const cookies = req.cookies;
    let sid = cookies.get("sid")?.value;
    if (!sid) sid = uuidv4();

    const ip = getClientIp(req.headers);
    const ipHash = hashIp(ip);
    const ua = req.headers.get("user-agent") || undefined;

    await prisma.activity.create({ data: { sessionId: sid, type, path: path || "/", referrer, utmSource, utmMedium, utmCampaign, ua, ipHash, intakeId: intakeId || undefined, accountId: accountId || undefined, contactId: contactId || undefined } });

    const res = NextResponse.json({ ok: true });
    if (!cookies.get("sid")) res.cookies.set("sid", sid, { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 60 * 60 * 24 * 365 });
    return res;
  } catch (e) {
    const err = e as { message?: string };
    return NextResponse.json({ error: err?.message || "track error" }, { status: 500 });
  }
}


