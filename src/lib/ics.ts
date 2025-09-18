function dtStamp(d: Date) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function escapeText(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,|;/g, (m) => `\\${m}`);
}

export function buildICS(opts: {
  uid: string;
  start: Date;
  end: Date;
  summary: string;
  description?: string;
  location?: string;
  organizerEmail: string;
  organizerName?: string;
  attendeeEmails: string[];
}) {
  const lines = [
    "BEGIN:VCALENDAR",
    "PRODID:-//CEC//Intake//EN",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${opts.uid}`,
    `DTSTAMP:${dtStamp(new Date())}`,
    `DTSTART:${dtStamp(opts.start)}`,
    `DTEND:${dtStamp(opts.end)}`,
    `SUMMARY:${escapeText(opts.summary)}`,
    opts.description ? `DESCRIPTION:${escapeText(opts.description)}` : undefined,
    opts.location ? `LOCATION:${escapeText(opts.location)}` : undefined,
    `ORGANIZER;CN=${escapeText(opts.organizerName || "CEC")}:mailto:${opts.organizerEmail}`,
    ...opts.attendeeEmails.map((e) => `ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:${e}`),
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean) as string[];
  return lines.join("\r\n");
}




