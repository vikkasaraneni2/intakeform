import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertOrigin } from "@/lib/guard";
import { buildICS } from "@/lib/ics";
import { sendMail } from "@/lib/email";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    assertOrigin(req as unknown as Request);
    const body = await req.json();
    const { intakeId, slotId } = body || {};
    if (!intakeId || !slotId) return NextResponse.json({ error: "Missing intakeId or slotId" }, { status: 400 });

    const result = await prisma.$transaction(async (tx) => {
      const slot = await tx.availabilitySlot.findUnique({ where: { id: slotId } });
      if (!slot || !slot.isActive) throw new Error("Slot not available");
      if (slot.startTime < new Date()) throw new Error("Slot expired");
      if (slot.bookedCount >= slot.capacity) throw new Error("Slot full");

      const intake = await tx.intake.findUnique({ where: { id: intakeId } });
      if (!intake) throw new Error("Intake missing");

      const visit = await tx.visit.create({ data: { intakeId, type: "WALKTHROUGH_V1", scheduledAt: slot.startTime, slotId: slot.id } });
      await tx.intake.update({ where: { id: intakeId }, data: { status: "SCHEDULED", scheduledAt: slot.startTime } });
      await tx.account.update({ where: { id: intake.accountId }, data: { bookedCount: { increment: 1 }, visitCount: { increment: 1 }, lastActivityAt: new Date() } });
      await tx.availabilitySlot.update({ where: { id: slot.id }, data: { bookedCount: { increment: 1 } } });
      return { visit, slot, intake };
    });

    const sid = req.cookies.get("sid")?.value || "unknown";
    await prisma.activity.create({ data: { sessionId: sid, type: "schedule_booked", path: "/walkthrough", intakeId } });

    const start = result.slot.startTime;
    const end = result.slot.endTime;
    const summary = `NFPA 70B Walkthrough — ${result.intake.company}`;
    const description = `Site: ${result.intake.siteAddress}\nContact: ${result.intake.contactName} (${result.intake.email}${result.intake.phone ? ", "+result.intake.phone : ""})`;
    const location = result.intake.siteAddress;
    const organizerEmail = process.env.ORGANIZER_EMAIL || "no-reply@example.com";
    const organizerName = process.env.ORGANIZER_NAME || "CEC";

    const attendees = [result.intake.email];
    const team = (process.env.TEAM_INVITE_EMAILS || "").split(",").map((s) => s.trim()).filter(Boolean);

    const ics = buildICS({ uid: uuidv4(), start, end, summary, description, location, organizerEmail, organizerName, attendeeEmails: [...attendees, ...team] });

    await sendMail({ to: result.intake.email, subject: summary, text: `You're scheduled for ${start.toLocaleString()} - ${end.toLocaleString()}`, html: `<p>You're scheduled for <b>${start.toLocaleString()}</b> – <b>${end.toLocaleString()}</b>.</p><p>${description}</p>`, ics: { content: ics } });
    if (team.length) await sendMail({ to: team, subject: summary, text: `Scheduled: ${result.intake.company} at ${start.toLocaleString()}`, html: `<p>Scheduled: <b>${result.intake.company}</b> at <b>${start.toLocaleString()}</b>.</p><p>${description}</p>`, ics: { content: ics } });

    return NextResponse.json({ ok: true, scheduledAt: result.slot.startTime });
  } catch (e) {
    const err = e as { status?: number; message?: string };
    const status = err?.status || 400;
    return NextResponse.json({ error: err?.message || "Booking error" }, { status });
  }
}


