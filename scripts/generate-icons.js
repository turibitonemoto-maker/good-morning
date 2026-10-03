import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Standard 512x512 SVG
const standardSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#1e1b4b" />
      <stop offset="100%" stop-color="#312e81" />
    </linearGradient>
    <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
    <linearGradient id="mount1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#0284c7" stop-opacity="0.8" />
    </linearGradient>
    <linearGradient id="mount2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0ea5e9" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#0369a1" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="512" height="512" rx="104" fill="url(#bg)" />

  <!-- Rising Sun -->
  <circle cx="256" cy="230" r="90" fill="url(#sun)" />

  <!-- Sun Rays Glow -->
  <circle cx="256" cy="230" r="125" fill="#fef08a" opacity="0.18" />

  <!-- Back Mountains -->
  <polygon points="60,420 200,260 340,420" fill="url(#mount1)" />
  <polygon points="220,420 370,240 500,420" fill="url(#mount1)" />

  <!-- Front Mountains -->
  <polygon points="110,440 260,290 410,440" fill="url(#mount2)" />

  <!-- Clock Sync ring arc -->
  <path d="M 170,120 A 130,130 0 1,1 342,120" fill="none" stroke="#fde68a" stroke-width="12" stroke-linecap="round" stroke-dasharray="14 10" />

  <!-- Synchronize Arrow pointer -->
  <polygon points="340,105 355,128 325,128" fill="#fde68a" />
</svg>
`;

// Maskable 512x512 SVG (with 20% safe zone margin for Android adaptive circle/squircle)
const maskableSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#1e1b4b" />
      <stop offset="100%" stop-color="#312e81" />
    </linearGradient>
    <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
    <linearGradient id="mount1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#0284c7" stop-opacity="0.8" />
    </linearGradient>
    <linearGradient id="mount2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0ea5e9" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#0369a1" />
    </linearGradient>
  </defs>

  <!-- Full Background (no rounded corners for maskable) -->
  <rect width="512" height="512" fill="url(#bg)" />

  <!-- Center Content inside safe zone (scaled 0.72) -->
  <g transform="translate(71.68, 71.68) scale(0.72)">
    <!-- Rising Sun -->
    <circle cx="256" cy="230" r="90" fill="url(#sun)" />
    <circle cx="256" cy="230" r="125" fill="#fef08a" opacity="0.18" />

    <!-- Back Mountains -->
    <polygon points="60,420 200,260 340,420" fill="url(#mount1)" />
    <polygon points="220,420 370,240 500,420" fill="url(#mount1)" />

    <!-- Front Mountains -->
    <polygon points="110,440 260,290 410,440" fill="url(#mount2)" />

    <!-- Clock Sync ring arc -->
    <path d="M 170,120 A 130,130 0 1,1 342,120" fill="none" stroke="#fde68a" stroke-width="12" stroke-linecap="round" stroke-dasharray="14 10" />
    <polygon points="340,105 355,128 325,128" fill="#fde68a" />
  </g>
</svg>
`;

async function main() {
  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Write SVGs
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), standardSvg);

  // Generate 512x512 standard
  await sharp(Buffer.from(standardSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  // Generate 192x192 standard
  await sharp(Buffer.from(standardSvg))
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  // Generate 180x180 apple touch icon
  await sharp(Buffer.from(standardSvg))
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // Generate 512x512 maskable for Android
  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  console.log('All PWA and Android icons generated successfully!');
}

main().catch(console.error);
