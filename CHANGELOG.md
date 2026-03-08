# Changelog

All notable changes to this project will be documented in this file.

## [0.7.2] - 2026-03-08

### Added

#### Email Template Management System
- **New admin page**: `/admin/email-templates`
- Manage contact form auto-reply and admin notification templates
- **Multi-language support**: Edit templates in English, Russian, and Spanish
- **Template editor** with syntax highlighting for HTML
- **Variable system** for dynamic content (firstName, familyName, email, phone, country, productCategory, requirements, timestamp, locale)
- Two pre-built templates:
  - Customer Thank You Email (sent to customers after form submission)
  - Admin Notification Email (sent to sales@lihe-preform.com)
- Real-time preview and editing for all three languages
- Help sidebar showing all available variables

#### Official Email Sender
- **New admin page**: `/admin/send-email`
- Send professional emails from `sales@lihe-preform.com`
- **Customizable email signature** with fields:
  - Name, Title, Company
  - Email, Phone, Website
- **Quick insert templates**:
  - Greeting template
  - Quote/proposal template
  - Follow-up template
  - Meeting follow-up template
- Signature preview before sending
- Signature saved to browser localStorage
- Email validation and error handling

#### API Endpoints
- `GET/PUT /api/admin/email-templates` - Template CRUD operations
- `POST /api/admin/send-email` - Send emails via Resend (ready for integration)

#### Admin Dashboard Updates
- Added "Email 模板管理" card linking to template editor
- Added "發送官方郵件" card linking to email composer

### Technical Details

**Email Template System**:
- Templates stored in D1 database under `email-templates` content ID
- Support for template versioning (updatedAt timestamp)
- Variable replacement using `{{variableName}}` syntax
- HTML email support with inline CSS

**Email Sender**:
- Authentication required for all email operations
- Email format validation
- Resend API integration ready (placeholder currently)
- Professional HTML signature generation

### Resend Integration Status

🚧 **Not Yet Integrated** - Email sending is currently in preview mode

To enable actual email sending:
1. Sign up for [Resend](https://resend.com/)
2. Get API Key and set `RESEND_API_KEY` environment variable
3. Verify domain `lihe-preform.com` in Resend dashboard
4. Update API routes as documented in `/docs/RESEND_EMAIL_SETUP.md`

### Documentation
- Created comprehensive guide: `/docs/RESEND_EMAIL_SETUP.md`
  - Email template management instructions
  - Email sender usage guide
  - Resend API integration steps
  - DNS configuration examples
  - Best practices and troubleshooting

---

## [0.7.1] - 2026-03-08

### Added

#### Version Management
- Implemented automatic version increment system with git pre-push hook
- Created `scripts/version-bump.mjs` for automatic patch version bumping
- Version now increments automatically on every push

#### Footer Settings Management
- New admin page at `/admin/footer-settings` for managing footer content
- Configurable logo (src & alt text)
- Multi-language descriptions (English, Russian, Spanish)
- Dynamic quick links with multi-language labels
- Contact information (phone, email, address in 3 languages)
- Social media links manager (add/remove platforms and URLs)
- Footer settings stored in database with full CRUD API

#### Enhanced Contact Form
- **New required fields:**
  - First Name (separate from Family Name)
  - Family Name
  - Email (validated)
  - Phone (required)
  - Country (dropdown with 190+ countries)
  - Product Category (dynamic, loaded from products data)
  - Requirements (detailed text area)

- **Security Features:**
  - Math-based CAPTCHA with locale support (EN/RU/ES)
  - CAPTCHA tokens expire after 10 minutes
  - Form validation on both client and server

- **Email Notifications:**
  - Professional thank-you email sent to customer (locale-aware templates)
  - Detailed notification email sent to `sales@lihe-preform.com`
  - HTML email templates with company branding
  - Includes all submission details with timestamp and language

#### API Endpoints
- `GET/POST /api/admin/footer-settings` - Footer configuration management
- `GET /api/contact/captcha?locale={locale}` - CAPTCHA generation
- `POST /api/contact/submit` - Contact form submission with email sending

#### Internationalization
- Added contact form translations for EN, RU, ES
- New i18n keys:
  - `firstName`, `familyName`, `country`, `productCategory`, `requirements`
  - `captcha`, `sending`, `required`
  - `successTitle`, `successMessage`, `errorMessage`

### Changed
- Contact form completely redesigned with enhanced fields
- Contact page now uses `EnhancedContactForm` component
- Product categories dynamically loaded from data for contact form dropdown

### Technical Improvements
- Email sending infrastructure ready (placeholder for SendGrid/SES/Mailgun integration)
- Type-safe footer settings with validation
- Improved form UX with loading states and error handling
- CAPTCHA system prevents spam submissions

### Migration Notes
For production deployment:
1. Configure email service provider (SendGrid, AWS SES, Mailgun, or Cloudflare Email Workers)
2. Update `/api/contact/submit/route.ts` with actual email API endpoint
3. Seed initial footer settings data to database:
   ```bash
   # Import data/footer-settings.json to D1 database
   ```

---

## [0.1.0] - Initial Release
- Basic website structure
- Multi-language support (EN, RU, ES)
- Product catalog
- Factory showcase
- Equipment pages
