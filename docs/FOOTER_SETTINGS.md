# Footer Settings Management

## Overview

The footer settings admin panel allows you to configure all footer content including logo, descriptions, quick links, contact information, and social media links across all languages.

## Accessing Footer Settings

1. Log in to admin panel: `/admin/login`
2. Navigate to **頁腳設定 (Footer Settings)** from the dashboard
3. Or go directly to: `/admin/footer-settings`

## Configuration Sections

### 1. Logo Settings

#### Logo Source
- **Field**: Logo URL or path
- **Format**: Absolute URL or relative path (e.g., `/images/logo/logo.png`)
- **Supported**: PNG, SVG, WebP, JPG
- **Recommended**: SVG for best quality at all sizes

#### Logo Alt Text
- **Field**: Alternative text for accessibility
- **Purpose**: Screen readers and SEO
- **Example**: "Lihe Precision" or "Lihe Precision Machinery Logo"

### 2. Description (Tagline)

Multi-language company tagline displayed below logo:

- **English**: Short company description (1-2 sentences)
- **Russian**: Краткое описание компании
- **Spanish**: Breve descripción de la empresa

**Best Practices**:
- Keep under 150 characters per language
- Highlight core business value
- Use professional tone
- Include key industry terms for SEO

**Current Example**:
```
EN: Leading manufacturer of high-precision PET preform molds,
    compression molds, and blow molds.

RU: Ведущий производитель высокоточных пресс-форм для преформ
    из ПЭТ, компрессионных пресс-форм и выдувных форм.

ES: Fabricante líder de moldes de preforma PET de alta precisión,
    moldes de compresión y moldes de soplado.
```

### 3. Quick Links

Dynamic footer navigation links with multi-language labels.

#### Adding a Link
1. Click **+ Add Link** button
2. Fill in labels for all three languages:
   - **EN**: English label
   - **RU**: Russian label (Cyrillic)
   - **ES**: Spanish label
3. Enter URL (relative or absolute)
4. Click **Save Footer Settings**

#### Removing a Link
1. Find the link you want to remove
2. Click **Remove** button
3. Click **Save Footer Settings** to confirm

#### Link Structure
```json
{
  "label": {
    "en": "About Us",
    "ru": "О нас",
    "es": "Sobre nosotros"
  },
  "href": "/about"
}
```

**URL Best Practices**:
- Use relative URLs for internal pages (e.g., `/contact`)
- Use absolute URLs for external links (e.g., `https://example.com`)
- Keep navigation consistent across site
- Limit to 4-6 main links for better UX

### 4. Contact Information

#### Phone Number
- **Format**: Include country code (e.g., `+86 757 8555 1234`)
- **Display**: Formatted with spaces for readability
- **Function**: Automatically converted to clickable `tel:` link

#### Email Address
- **Format**: Standard email (e.g., `sales@lihe-preform.com`)
- **Display**: Shown as-is
- **Function**: Automatically converted to `mailto:` link

#### Address (Multi-language)

Three separate fields for localized addresses:

- **English**: "Foshan, Guangdong Province, China"
- **Russian**: "Фошань, провинция Гуандун, Китай"
- **Spanish**: "Foshan, Provincia de Guangdong, China"

**Tips**:
- Keep consistent location info across languages
- Include city, state/province, country
- Optionally add street address if needed

### 5. Social Media Links

Dynamic social media link manager supporting any platform.

#### Adding Social Link
1. Click **+ Add Social Link**
2. Enter **Platform** name (e.g., WhatsApp, Telegram, X, Facebook)
3. Enter full **URL** (e.g., `https://wa.me/8675785551234`)
4. Click **Save Footer Settings**

#### Platform Support

**Built-in Icons**:
- WhatsApp
- Telegram
- X (Twitter)

**Custom Platforms**:
Any platform can be added. If no icon is defined, platform name displays as text.

#### Adding Custom Icons

To add icons for new platforms, edit:
`src/components/layout/Footer/Footer.tsx`

```typescript
function SocialIcon({ platform }: { platform: string }) {
  switch (platform) {
    case "LinkedIn":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          {/* LinkedIn SVG path */}
        </svg>
      );
    // ... other cases
  }
}
```

**Recommended SVG Sources**:
- [Simple Icons](https://simpleicons.org/)
- [Feather Icons](https://feathericons.com/)
- [Hero Icons](https://heroicons.com/)

#### Removing Social Link
1. Find the link to remove
2. Click **Remove** button
3. Click **Save Footer Settings**

## Data Structure

Footer settings are stored as JSON in the database:

```json
{
  "logo": {
    "src": "/images/logo/logo.png",
    "alt": "Lihe Precision"
  },
  "description": {
    "en": "English description",
    "ru": "Русское описание",
    "es": "Descripción en español"
  },
  "links": [
    {
      "label": { "en": "About", "ru": "О нас", "es": "Acerca de" },
      "href": "/about"
    }
  ],
  "contact": {
    "phone": "+86 757 8555 1234",
    "email": "sales@lihe-preform.com",
    "address": {
      "en": "Foshan, Guangdong, China",
      "ru": "Фошань, Гуандун, Китай",
      "es": "Foshan, Guangdong, China"
    }
  },
  "social": [
    {
      "platform": "WhatsApp",
      "href": "https://wa.me/8675785551234"
    }
  ]
}
```

## API Endpoints

### GET /api/admin/footer-settings
Fetch current footer settings.

**Response**:
```json
{
  "logo": { ... },
  "description": { ... },
  "links": [ ... ],
  "contact": { ... },
  "social": [ ... ]
}
```

### PUT /api/admin/footer-settings
Update footer settings.

**Request Body**: Complete footer settings object

**Response**:
```json
{ "success": true }
```

## Best Practices

### SEO Optimization
- Use descriptive alt text for logo
- Include relevant keywords in description
- Maintain consistent NAP (Name, Address, Phone) across site
- Link to important pages for internal linking

### Internationalization
- Always fill all three language fields
- Use native speakers for translations when possible
- Keep tone and message consistent across languages
- Test footer display in all locales

### User Experience
- Limit quick links to most important pages (4-6 links)
- Keep social links current and active
- Ensure all URLs are valid and working
- Use HTTPS for all external links
- Test all links after updating

### Accessibility
- Provide meaningful alt text for logo
- Use semantic link labels
- Ensure sufficient color contrast
- Test with screen readers

## Troubleshooting

### Logo not displaying
1. Check file path is correct
2. Verify file exists in public folder or R2 storage
3. Check file permissions
4. Try absolute URL if relative path fails

### Social icons not showing
1. Verify platform name matches built-in cases (case-sensitive)
2. Add custom icon in `Footer.tsx` if needed
3. Check console for errors

### Links not working
1. Verify URL format (relative vs absolute)
2. Check for typos in href
3. Test link in incognito/private mode
4. Clear browser cache

### Translations missing
1. Ensure all language fields are filled
2. Check for special characters/encoding issues
3. Verify JSON structure is valid
4. Test in all locale versions of site

## Version History

- **v0.7.1**: Initial footer settings management system
- Supports multi-language content
- Dynamic link and social media management
- Full CRUD API integration

## Future Enhancements

Planned features:
- [ ] Footer template previewer
- [ ] Bulk import/export of settings
- [ ] Version history and rollback
- [ ] A/B testing different footer layouts
- [ ] Analytics integration for link tracking

## Support

For technical support or feature requests:
- Check `/docs/CHANGELOG.md` for version updates
- Review `/docs/CONTACT_FORM_SETUP.md` for email configuration
- Contact development team for custom requirements
