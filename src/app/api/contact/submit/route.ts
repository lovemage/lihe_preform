import { NextRequest, NextResponse } from "next/server";
import { sendResendEmail } from "@/lib/email/resend";
import { classifyAttribution, sanitizeAttribution } from "@/lib/attribution";

// Email templates
const customerEmailTemplates = {
  en: (data: any) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2c5aa0; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Thank You for Contacting Lihe Precision</h1>
    </div>
    <div class="content">
      <p>Dear ${data.firstName} ${data.familyName},</p>
      <p>Thank you for your inquiry regarding our PET preform mold solutions. We have received your request and our team will review it carefully.</p>
      <p><strong>Your Inquiry Details:</strong></p>
      <ul>
        <li><strong>Product Category:</strong> ${data.productCategory}</li>
        <li><strong>Country:</strong> ${data.country}</li>
      </ul>
      <p>Your inquiry is handled directly by our international sales department at the factory — no agents or distributors in between. Our sales and engineering team will respond within 24 business hours, and you can reply to this email at any time to reach us.</p>
      <p>Best regards,<br>
      <strong>Johnnason Bai</strong><br>
      International Sales Department, Lihe Precision<br>
      Foshan Lihe Precision Machinery Co., Ltd.</p>
    </div>
    <div class="footer">
      <p>Email: sales@lihe-preform.com | Phone: +886 938 198 675</p>
      <p>Foshan, Guangdong Province, China</p>
    </div>
  </div>
</body>
</html>
  `,
  ru: (data: any) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2c5aa0; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Благодарим за обращение в Lihe Precision</h1>
    </div>
    <div class="content">
      <p>Уважаемый(-ая) ${data.firstName} ${data.familyName},</p>
      <p>Благодарим вас за запрос относительно наших решений для пресс-форм преформ из ПЭТ. Мы получили ваш запрос, и наша команда внимательно его рассмотрит.</p>
      <p><strong>Детали вашего запроса:</strong></p>
      <ul>
        <li><strong>Категория продукта:</strong> ${data.productCategory}</li>
        <li><strong>Страна:</strong> ${data.country}</li>
      </ul>
      <p>Ваш запрос обрабатывает напрямую международный отдел продаж завода — без агентов и дистрибьюторов. Наши специалисты по продажам и инженеры ответят в течение 24 рабочих часов; вы можете в любой момент ответить на это письмо, чтобы связаться с нами.</p>
      <p>С уважением,<br>
      <strong>Johnnason Bai</strong><br>
      Международный отдел продаж Lihe Precision<br>
      Foshan Lihe Precision Machinery Co., Ltd.</p>
    </div>
    <div class="footer">
      <p>Email: sales@lihe-preform.com | Телефон: +886 938 198 675</p>
      <p>Фошань, провинция Гуандун, Китай</p>
    </div>
  </div>
</body>
</html>
  `,
  es: (data: any) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2c5aa0; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Gracias por contactar a Lihe Precision</h1>
    </div>
    <div class="content">
      <p>Estimado/a ${data.firstName} ${data.familyName},</p>
      <p>Gracias por su consulta sobre nuestras soluciones de moldes de preforma PET. Hemos recibido su solicitud y nuestro equipo la revisará cuidadosamente.</p>
      <p><strong>Detalles de su consulta:</strong></p>
      <ul>
        <li><strong>Categoría de producto:</strong> ${data.productCategory}</li>
        <li><strong>País:</strong> ${data.country}</li>
      </ul>
      <p>Su consulta la atiende directamente el departamento de ventas internacionales de la fábrica, sin agentes ni distribuidores intermedios. Nuestro equipo de ventas e ingeniería responderá dentro de las próximas 24 horas hábiles, y puede responder a este correo en cualquier momento para contactarnos.</p>
      <p>Atentamente,<br>
      <strong>Johnnason Bai</strong><br>
      Departamento de Ventas Internacionales, Lihe Precision<br>
      Foshan Lihe Precision Machinery Co., Ltd.</p>
    </div>
    <div class="footer">
      <p>Email: sales@lihe-preform.com | Teléfono: +886 938 198 675</p>
      <p>Foshan, Provincia de Guangdong, China</p>
    </div>
  </div>
</body>
</html>
  `
};

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const attributionRows = (
  attribution: ReturnType<typeof sanitizeAttribution>,
  channel: ReturnType<typeof classifyAttribution> | null,
) => {
  if (!attribution || !channel) {
    return `<div class="field"><span class="label">Source:</span><span class="value">not captured</span></div>`;
  }
  const rows: [string, string][] = [
    ["Source channel", `${channel.channel.toUpperCase()} — ${channel.source}`],
    ["First referrer", attribution.referrer || "(none)"],
    ["Landing page", attribution.landingPage],
    ["UTM", [attribution.utmSource, attribution.utmMedium, attribution.utmCampaign].filter(Boolean).join(" / ") || "(none)"],
    ["Click ID", attribution.clickId || "(none)"],
    ["First seen", attribution.firstSeen],
  ];
  return rows
    .map(([label, value]) => `<div class="field"><span class="label">${label}:</span><span class="value">${escapeHtml(value)}</span></div>`)
    .join("\n      ");
};

const adminEmailTemplate = (
  data: any,
  locale: string,
  attribution: ReturnType<typeof sanitizeAttribution> = null,
  channel: ReturnType<typeof classifyAttribution> | null = null,
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 700px; margin: 0 auto; padding: 20px; }
    .header { background: #2c5aa0; color: white; padding: 20px; }
    .content { padding: 20px; background: #f9f9f9; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #2c5aa0; }
    .value { margin-left: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>New Contact Form Submission</h2>
    </div>
    <div class="content">
      <div class="field">
        <span class="label">Name:</span>
        <span class="value">${escapeHtml(data.firstName)} ${escapeHtml(data.familyName)}</span>
      </div>
      <div class="field">
        <span class="label">Email:</span>
        <span class="value">${escapeHtml(data.email)}</span>
      </div>
      <div class="field">
        <span class="label">Phone:</span>
        <span class="value">${escapeHtml(data.phone)}</span>
      </div>
      <div class="field">
        <span class="label">Country:</span>
        <span class="value">${escapeHtml(data.country)}</span>
      </div>
      <div class="field">
        <span class="label">Product Category:</span>
        <span class="value">${escapeHtml(data.productCategory)}</span>
      </div>
      <div class="field">
        <span class="label">Requirements:</span>
        <div class="value" style="margin-top: 10px; white-space: pre-wrap;">${escapeHtml(data.requirements)}</div>
      </div>
      <div class="field">
        <span class="label">Submitted:</span>
        <span class="value">${new Date().toLocaleString()}</span>
      </div>
      <div class="field">
        <span class="label">Language:</span>
        <span class="value">${escapeHtml(String(locale).toUpperCase())}</span>
      </div>
      ${attributionRows(attribution, channel)}
    </div>
  </div>
</body>
</html>
`;

function verifyCaptcha(token: string, answer: string): boolean {
  if (!token || !answer) {
    return false;
  }

  try {
    const [correctAnswer, timestamp] = token.split(':');

    if (!correctAnswer || !timestamp) {
      return false;
    }

    // Check if token is not older than 10 minutes
    const issuedAt = Number.parseInt(timestamp, 10);
    if (Number.isNaN(issuedAt)) {
      return false;
    }

    const tokenAge = Date.now() - issuedAt;
    if (tokenAge > 10 * 60 * 1000) {
      return false;
    }

    return correctAnswer === answer;
  } catch {
    return false;
  }
}

async function sendEmail(to: string, subject: string, html: string) {
  return sendResendEmail({
    to,
    subject,
    html,
    from: "Lihe Precision <sales@lihe-preform.com>",
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      familyName,
      email,
      phone,
      country,
      productCategory,
      requirements,
      captchaToken,
      captchaAnswer,
      locale = 'en',
      attribution: rawAttribution,
    } = body;

    // Validate required fields
    if (!firstName || !familyName || !email || !phone || !country || !productCategory || !requirements) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Verify CAPTCHA
    if (!verifyCaptcha(captchaToken, captchaAnswer)) {
      return NextResponse.json(
        { error: "Invalid CAPTCHA answer" },
        { status: 400 }
      );
    }

    const data = {
      firstName,
      familyName,
      email,
      phone,
      country,
      productCategory,
      requirements
    };
    const attribution = sanitizeAttribution(rawAttribution);
    const channel = attribution ? classifyAttribution(attribution) : null;

    // Send thank-you email to customer
    const customerTemplate = customerEmailTemplates[locale as keyof typeof customerEmailTemplates] || customerEmailTemplates.en;
    const customerSubject = locale === 'ru'
      ? 'Благодарим за обращение - Lihe Precision'
      : locale === 'es'
      ? 'Gracias por su contacto - Lihe Precision'
      : 'Thank You for Your Inquiry - Lihe Precision';

    await sendEmail(email, customerSubject, customerTemplate(data));

    // Send notification to admin
    const adminSubject = `New Contact Form Submission from ${firstName} ${familyName}`;
    await sendResendEmail({
      to: "sales@lihe-preform.com",
      subject: adminSubject,
      html: adminEmailTemplate(data, locale, attribution, channel),
      from: "Lihe Precision <sales@lihe-preform.com>",
      replyTo: email,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing contact form:", error);
    return NextResponse.json(
      { error: "Failed to process contact form" },
      { status: 500 }
    );
  }
}
