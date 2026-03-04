# Project Agent Rules

## Factory Page Image Generation Workflow

Use this workflow when generating or updating images for:
- `Global Sales Network`
- `After-Sale Technical Support`
- `Custom Solutions`

### Requirements
- Output format must be `.webp`.
- Visual style must be professional/corporate industrial.
- Do not include text blocks or watermarks from the model output.
- Use official logo: `public/images/logo/logo_w.png`.
- Final images must place the official logo at the bottom-right corner.

### Generation Method
1. Load API key from project env:
   - `set -a; source .env.local; set +a`
2. Generate base images with Nano Banana Pro script:
   - Script path: `/home/aistorm/.agents/skills/nano-banana-pro/scripts/generate_image.py`
   - Resolution: `2K`
   - Output base files as `*-base.png`
3. Overlay official logo with ImageMagick:
   - Resize logo to `380px` width
   - Position: `-gravity southeast -geometry +56+42`
4. Convert final PNG to WebP:
   - `cwebp -q 88 input.png -o output.webp`
5. Keep generated files under:
   - `public/images/factory/generated/`

### Naming Convention
- Base image: `YYYY-MM-DD-HH-MM-SS-<topic>-base.png`
- Final image: `YYYY-MM-DD-HH-MM-SS-<topic>.webp`
- Topics:
  - `global-sales-network`
  - `after-sale-technical-support`
  - `custom-solutions`

### Data Wiring
After generation, update `data/factory.json`:
- `sections[id="sales-network"].image.src`
- `sections[id="after-sale-service"].image.src`
- `sections[id="solution"].image.src`

### Logo Replacement Rule
If site logo needs replacement with the official uploaded logo:
- Source: `public/images/logo/logo_w.png`
- Replace runtime logo asset by regenerating:
  - `public/images/logo/logo.webp`
  - Example: `cwebp -q 92 public/images/logo/logo_w.png -o public/images/logo/logo.webp`
