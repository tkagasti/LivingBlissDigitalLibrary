import nodemailer from "nodemailer";

let transport: nodemailer.Transporter | undefined;

function smtpTransport() {
  if (transport) return transport;
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASSWORD;
  if (!host || !user || !pass) throw new Error("SMTP_HOST, SMTP_USER and SMTP_PASSWORD are required.");
  const port = Number(process.env.SMTP_PORT ?? "465");
  transport = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
  return transport;
}

const subjects = {
  signin: "Your Living Bliss sign-in code",
  verify: "Verify your Living Bliss email",
  reset: "Reset your Living Bliss password",
  "oidc-link": "Confirm your email for Living Bliss",
} as const;

export type EmailPurpose = keyof typeof subjects;

export async function sendOtpEmail(email: string, code: string, purpose: EmailPurpose) {
  const from = process.env.SMTP_FROM?.trim() || "Living Bliss <no-reply@livingbliss.org>";
  await smtpTransport().sendMail({
    from,
    to: email,
    subject: subjects[purpose],
    text: `Your Living Bliss verification code is ${code}. It expires in 5 minutes. If you did not request this, you can ignore this email.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#18264f"><h1 style="font-family:Georgia,serif">Living Bliss</h1><p>Use this verification code to continue:</p><p style="font-size:32px;font-weight:700;letter-spacing:8px">${code}</p><p>This code expires in 5 minutes. If you did not request this, you can safely ignore this email.</p></div>`,
  });
}
