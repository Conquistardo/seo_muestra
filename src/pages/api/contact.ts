import type { APIRoute } from "astro";
import { Resend } from "resend";

export const prerender = false;

const MAX_TEXT_LENGTH = 4000;

const clean = (value: FormDataEntryValue | null, maxLength = 200) => {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
};

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const redirect = (path: string) =>
  new Response(null, {
    status: 303,
    headers: {
      Location: path
    }
  });

export const GET: APIRoute = async () => redirect("/contact/");

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();

    // Honeypot field: bots that fill this are silently accepted and redirected.
    if (clean(formData.get("website"), 300)) {
      return redirect("/contact/thanks/");
    }

    const fullName = clean(formData.get("fullName"));
    const email = clean(formData.get("email"));
    const phone = clean(formData.get("phone"), 60);
    const city = clean(formData.get("city"), 120);
    const buildingType = clean(formData.get("buildingType"), 80);
    const dimensions = clean(formData.get("dimensions"), 80);
    const message = clean(formData.get("message"), MAX_TEXT_LENGTH);

    if (!fullName || !email || !buildingType || !message || !isEmail(email)) {
      return redirect("/contact/error/");
    }

    const resendApiKey = import.meta.env.RESEND_API_KEY;
    const toEmail = import.meta.env.CONTACT_TO_EMAIL;
    const fromEmail = import.meta.env.CONTACT_FROM_EMAIL ?? "onboarding@resend.dev";

    if (!resendApiKey || !toEmail) {
      console.error("Missing required email environment variables.");
      return redirect("/contact/error/");
    }

    const resend = new Resend(resendApiKey);
    const safeName = escapeHtml(fullName);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone || "Not provided");
    const safeCity = escapeHtml(city || "Not provided");
    const safeType = escapeHtml(buildingType);
    const safeDimensions = escapeHtml(dimensions || "Not provided");
    const safeMessage = escapeHtml(message).replaceAll("\n", "<br>");

    await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: email,
      subject: `New Wisconsin steel building lead - ${fullName}`,
      text: [
        "New quote request",
        `Name: ${fullName}`,
        `Email: ${email}`,
        `Phone: ${phone || "Not provided"}`,
        `City/ZIP: ${city || "Not provided"}`,
        `Building Type: ${buildingType}`,
        `Dimensions: ${dimensions || "Not provided"}`,
        "",
        "Message:",
        message
      ].join("\n"),
      html: `
        <h2>New quote request</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Phone:</strong> ${safePhone}</p>
        <p><strong>City/ZIP:</strong> ${safeCity}</p>
        <p><strong>Building Type:</strong> ${safeType}</p>
        <p><strong>Dimensions:</strong> ${safeDimensions}</p>
        <p><strong>Message:</strong><br>${safeMessage}</p>
      `
    });

    return redirect("/contact/thanks/");
  } catch (error) {
    console.error("Contact form error:", error);
    return redirect("/contact/error/");
  }
};
