import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertOrigin } from "@/lib/guard";

export async function POST(req: NextRequest) {
  try {
    assertOrigin(req as unknown as Request);
    const body = await req.json();
    const required = ["company", "contactName", "email", "siteAddress"] as const;
    for (const f of required) if (!body?.[f]) return NextResponse.json({ error: `Missing ${f}` }, { status: 400 });

    const emailDomain = String(body.email).includes("@") ? body.email.split("@")[1].toLowerCase() : null;
    const accountName = body.company.trim();

    let account = await prisma.account.findFirst({ where: { name: accountName } });
    if (!account) account = await prisma.account.create({ data: { name: accountName, domain: emailDomain || undefined } });

    let contact = await prisma.contact.findFirst({ where: { email: body.email } });
    if (!contact) {
      contact = await prisma.contact.create({ data: { accountId: account.id, name: body.contactName, email: body.email, phone: body.phone || null, role: body.role || null } });
    }

    const intake = await prisma.intake.create({ data: {
      accountId: account.id,
      contactId: contact.id,
      company: body.company,
      contactName: body.contactName,
      email: body.email,
      phone: body.phone || null,
      siteAddress: body.siteAddress,
      siteHours: body.siteHours || null,
      roofAccess: body.roofAccess || null,
      accessNotes: body.accessNotes || null,
      recentOutages: body.recentOutages || null,
      brokerContact: body.brokerContact || null,
      ppeRequired: typeof body.ppeRequired === "boolean" ? body.ppeRequired : null,
      escortRequired: typeof body.escortRequired === "boolean" ? body.escortRequired : null,
      photoPermission: typeof body.photoPermission === "boolean" ? body.photoPermission : null,
      notes: body.notes || null,
      source: body.source || null,
      leadScore: body.leadScore || null,
    }});

    await prisma.account.update({ where: { id: account.id }, data: { intakeCount: { increment: 1 }, lastActivityAt: new Date() } });

    const sid = req.cookies.get("sid")?.value || "unknown";
    await prisma.activity.create({ data: { sessionId: sid, type: "intake_submitted", path: "/walkthrough", intakeId: intake.id, accountId: account.id, contactId: contact.id } });

    return NextResponse.json({ intakeId: intake.id });
  } catch (e) {
    const err = e as { message?: string };
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}


