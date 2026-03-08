# Contact Form & Email Setup Guide

## Overview

The enhanced contact form includes CAPTCHA verification, comprehensive field validation, and automated email notifications to both customers and administrators.

## Features

### 1. Enhanced Form Fields
- **First Name** & **Family Name** (separated for better personalization)
- **Email** (with validation)
- **Phone** (required)
- **Country** (190+ country dropdown)
- **Product Category** (dynamically loaded from products database)
- **Requirements** (detailed text area for customer needs)
- **CAPTCHA** (math-based verification with locale support)

### 2. Multi-language Support
The form is fully translated in:
- English (EN)
- Russian (RU)
- Spanish (ES)

### 3. Email System

#### Customer Thank-You Email
Professional HTML email sent to the customer with:
- Personalized greeting
- Confirmation of inquiry details
- 24-hour response commitment
- Company contact information

#### Admin Notification Email
Detailed email sent to `sales@lihe-preform.com` with:
- Complete form submission data
- Customer contact information
- Product category and requirements
- Submission timestamp
- Language/locale indicator

## Email Service Integration

### Current Setup
The email sending is currently a **placeholder**. To enable actual email sending, you need to integrate one of the following services:

### Option 1: Cloudflare Email Workers (Recommended for Cloudflare)
```typescript
// In src/app/api/contact/submit/route.ts
async function sendEmail(to: string, subject: string, html: string) {
  const { env } = await getCloudflareContext();

  await fetch("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: "noreply@lihe-preform.com", name: "Lihe Precision" },
      subject,
      content: [{ type: "text/html", value: html }],
    }),
  });
}
```

### Option 2: SendGrid
```bash
npm install @sendgrid/mail
```

```typescript
import sgMail from '@sendgrid/mail';

async function sendEmail(to: string, subject: string, html: string) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

  await sgMail.send({
    to,
    from: 'sales@lihe-preform.com',
    subject,
    html,
  });
}
```

Add to `.env`:
```
SENDGRID_API_KEY=your_api_key_here
```

### Option 3: AWS SES
```bash
npm install @aws-sdk/client-ses
```

```typescript
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

async function sendEmail(to: string, subject: string, html: string) {
  const client = new SESClient({ region: "us-east-1" });

  const command = new SendEmailCommand({
    Source: "sales@lihe-preform.com",
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject },
      Body: { Html: { Data: html } },
    },
  });

  await client.send(command);
}
```

Add to `.env`:
```
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
```

### Option 4: Resend (Modern Alternative)
```bash
npm install resend
```

```typescript
import { Resend } from 'resend';

async function sendEmail(to: string, subject: string, html: string) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: 'Lihe Precision <noreply@lihe-preform.com>',
    to,
    subject,
    html,
  });
}
```

## CAPTCHA System

### How It Works
1. Client requests CAPTCHA from `/api/contact/captcha?locale=en`
2. Server generates a simple math question (e.g., "What is 5 plus 3?")
3. Answer is encoded in a base64 token with timestamp
4. Client submits answer with token
5. Server verifies answer matches token and token is not expired (10 min)

### Locale Support
CAPTCHA questions are displayed in the user's language:
- **EN**: "What is 5 plus 3?"
- **RU**: "Сколько будет 5 плюс 3?"
- **ES**: "¿Cuánto es 5 más 3?"

## Form Validation

### Client-side
- All fields are `required` with HTML5 validation
- Email field has `type="email"` validation
- Real-time error display

### Server-side
- Verifies all required fields present
- Validates CAPTCHA token and answer
- Validates token expiry (10 minutes)
- Returns appropriate error messages

## Testing

### 1. Test Form Submission Locally
```bash
npm run dev
# Visit http://localhost:3000/en/contact
# Fill out the form and submit
# Check console logs for email content
```

### 2. Test CAPTCHA API
```bash
curl http://localhost:3000/api/contact/captcha?locale=en
```

Expected response:
```json
{
  "question": "What is 7 plus 2?",
  "token": "base64_encoded_token_here"
}
```

### 3. Test Form Submission API
```bash
curl -X POST http://localhost:3000/api/contact/submit \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "familyName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "country": "United States",
    "productCategory": "PET Preform Mold",
    "requirements": "Need 48-cavity mold for 500ml bottles",
    "captchaToken": "TOKEN_HERE",
    "captchaAnswer": "9",
    "locale": "en"
  }'
```

## Customization

### Modify Email Templates
Edit templates in `src/app/api/contact/submit/route.ts`:

```typescript
const customerEmailTemplates = {
  en: (data: any) => `
    <!-- Your custom HTML template here -->
  `,
  // ...
};
```

### Add More Countries
Edit the `countries` array in:
`src/components/contact/ContactForm/EnhancedContactForm.tsx`

### Change CAPTCHA Difficulty
Modify math operations in:
`src/app/api/contact/captcha/route.ts`

```typescript
const num1 = Math.floor(Math.random() * 20) + 1; // Harder numbers
const operations = ['+', '-', '*']; // Add multiplication
```

## Security Considerations

1. **CAPTCHA**: Prevents basic spam bots
2. **Token Expiry**: 10-minute window prevents replay attacks
3. **Server-side Validation**: All data validated before processing
4. **Email Sanitization**: HTML content is predefined, not user-generated
5. **Rate Limiting**: Consider adding rate limiting to prevent abuse

## Production Checklist

- [ ] Choose and configure email service provider
- [ ] Update `sendEmail()` function in `/api/contact/submit/route.ts`
- [ ] Add email service API keys to environment variables
- [ ] Test email delivery in staging environment
- [ ] Verify emails don't go to spam folder
- [ ] Set up email monitoring/logging
- [ ] Add rate limiting to prevent abuse
- [ ] Test CAPTCHA in all three languages
- [ ] Verify product categories load correctly
- [ ] Test form on mobile devices

## Troubleshooting

### Emails not sending
1. Check console logs for error messages
2. Verify email service API keys are correct
3. Check email service quotas/limits
4. Verify sender email is authorized (SPF/DKIM)

### CAPTCHA fails
1. Check token hasn't expired (10 min limit)
2. Verify answer is correct number (no spaces)
3. Check browser console for errors
4. Ensure `/api/contact/captcha` is accessible

### Form submission fails
1. Check all required fields are filled
2. Verify CAPTCHA was completed
3. Check network tab for API errors
4. Review server logs for validation errors

## Support

For issues or questions, contact the development team or refer to:
- `/docs/CHANGELOG.md` for version history
- `/docs/FOOTER_SETTINGS.md` for footer configuration
