import { NextRequest, NextResponse } from "next/server";

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
      <p>Our sales and engineering team will respond to your inquiry within 24 business hours. We look forward to discussing how Lihe Precision can meet your PET packaging tooling requirements.</p>
      <p>Best regards,<br>
      <strong>Lihe Precision Sales Team</strong><br>
      Foshan Lihe Precision Machinery Co., Ltd.</p>
    </div>
    <div class="footer">
      <p>Email: sales@lihe-preform.com | Phone: +86 757 8555 1234</p>
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
      <p>Наша команда продаж и инженеров ответит на ваш запрос в течение 24 рабочих часов. Мы с нетерпением ждем возможности обсудить, как Lihe Precision может удовлетворить ваши требования к инструментам для упаковки из ПЭТ.</p>
      <p>С уважением,<br>
      <strong>Отдел продаж Lihe Precision</strong><br>
      Foshan Lihe Precision Machinery Co., Ltd.</p>
    </div>
    <div class="footer">
      <p>Email: sales@lihe-preform.com | Телефон: +86 757 8555 1234</p>
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
      <p>Nuestro equipo de ventas e ingeniería responderá a su consulta dentro de las próximas 24 horas hábiles. Esperamos poder discutir cómo Lihe Precision puede satisfacer sus requisitos de herramientas de embalaje PET.</p>
      <p>Atentamente,<br>
      <strong>Equipo de Ventas de Lihe Precision</strong><br>
      Foshan Lihe Precision Machinery Co., Ltd.</p>
    </div>
    <div class="footer">
      <p>Email: sales@lihe-preform.com | Teléfono: +86 757 8555 1234</p>
      <p>Foshan, Provincia de Guangdong, China</p>
    </div>
  </div>
</body>
</html>
  `
};

const adminEmailTemplate = (data: any, locale: string) => `
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
        <span class="value">${data.firstName} ${data.familyName}</span>
      </div>
      <div class="field">
        <span class="label">Email:</span>
        <span class="value">${data.email}</span>
      </div>
      <div class="field">
        <span class="label">Phone:</span>
        <span class="value">${data.phone}</span>
      </div>
      <div class="field">
        <span class="label">Country:</span>
        <span class="value">${data.country}</span>
      </div>
      <div class="field">
        <span class="label">Product Category:</span>
        <span class="value">${data.productCategory}</span>
      </div>
      <div class="field">
        <span class="label">Requirements:</span>
        <div class="value" style="margin-top: 10px; white-space: pre-wrap;">${data.requirements}</div>
      </div>
      <div class="field">
        <span class="label">Submitted:</span>
        <span class="value">${new Date().toLocaleString()}</span>
      </div>
      <div class="field">
        <span class="label">Language:</span>
        <span class="value">${locale.toUpperCase()}</span>
      </div>
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
  // This is a placeholder for email sending
  // In production, you would integrate with:
  // - Cloudflare Email Routing + Workers
  // - SendGrid
  // - AWS SES
  // - Mailgun
  // - etc.

  // For now, we'll log the email content
  console.log('=== EMAIL SEND ===');
  console.log('To:', to);
  console.log('Subject:', subject);
  console.log('HTML:', html.substring(0, 200) + '...');
  console.log('==================');

  // TODO: Replace with actual email sending service
  // Example with fetch to an email API:
  // const response = await fetch('YOUR_EMAIL_API_ENDPOINT', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ to, subject, html })
  // });

  return { success: true };
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
      locale = 'en'
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
    await sendEmail('sales@lihe-preform.com', adminSubject, adminEmailTemplate(data, locale));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing contact form:", error);
    return NextResponse.json(
      { error: "Failed to process contact form" },
      { status: 500 }
    );
  }
}
