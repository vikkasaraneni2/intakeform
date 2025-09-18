import nodemailer from "nodemailer";

export function makeTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({ host, port, secure: false, auth: { user, pass } });
}

export async function sendMail(opts: {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  ics?: { filename?: string; content: string };
}) {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || "no-reply@example.com";
  const t = makeTransport();
  if (!t) {
    console.log("[email:dev]", { ...opts, from });
    return;
  }
  const attachments = opts.ics
    ? [
        {
          filename: opts.ics.filename || "invite.ics",
          content: opts.ics.content,
          contentType: "text/calendar; method=REQUEST; charset=UTF-8",
        },
      ]
    : [];
  await t.sendMail({ from, to: opts.to, subject: opts.subject, text: opts.text, html: opts.html, attachments });
}




