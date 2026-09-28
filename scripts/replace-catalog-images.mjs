/**
 * Replace mismatched catalog photos with temperate / Eastern-European-plausible stills.
 * Run: node scripts/replace-catalog-images.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const imagesDir = path.join(root, "public", "images");

/** Interiors without famous landmarks + temperate houses (no palms / Cape Cod / US porch). */
const replacements = [
  {
    file: "property-skyline",
    url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=85",
  },
  {
    file: "property-central-park",
    url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=85",
  },
  {
    file: "living-salon",
    url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=85",
  },
  {
    file: "property-demiivka",
    url: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1600&q=85",
  },
  {
    file: "property-pechersk-quiet",
    url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1600&q=85",
  },
  {
    file: "property-osokorky-view",
    url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=85",
  },
  {
    file: "property-holosiiv-green",
    url: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=1600&q=85",
  },
  {
    file: "property-forest",
    url: "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1600&q=85",
  },
  {
    file: "property-terrace",
    url: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1600&q=85",
  },
  {
    file: "property-studio-center",
    url: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1600&q=85",
  },
  {
    file: "property-svyatoshyn",
    url: "https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=1600&q=85",
  },
  {
    file: "property-shuliavka",
    url: "https://images.unsplash.com/photo-1600121848594-d8642eef1aeb?auto=format&fit=crop&w=1600&q=85",
  },
  {
    file: "hero",
    url: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1600&q=85",
  },
  {
    file: "house-pushcha",
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
  },
  {
    file: "house-osokorky",
    url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85",
  },
  {
    file: "house-vita",
    url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=85",
  },
  {
    file: "house-bortnychi",
    url: "https://images.unsplash.com/photo-1600047509358-9dc7556ee70a?auto=format&fit=crop&w=1600&q=85",
  },
  {
    file: "house-hatne",
    url: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=1600&q=85",
  },
];

async function fetchBuffer(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "nova-estate-catalog/1.0",
      Accept: "image/*",
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

await fs.mkdir(imagesDir, { recursive: true });

for (const item of replacements) {
  const out = path.join(imagesDir, `${item.file}.webp`);
  const backup = path.join(imagesDir, `${item.file}.bak.webp`);
  try {
    try {
      await fs.access(out);
      await fs.copyFile(out, backup);
    } catch {
      // no existing
    }

    console.log(`replace ${item.file}…`);
    const buffer = await fetchBuffer(item.url);
    await sharp(buffer)
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .sharpen({ sigma: 0.55, m1: 0.8, m2: 0.4 })
      .webp({
        quality: 90,
        alphaQuality: 100,
        effort: 6,
        smartSubsample: true,
      })
      .toFile(out);

    const size = (await fs.stat(out)).size;
    console.log(`  → ${item.file}.webp ${Math.round(size / 1024)}KB`);
    await fs.unlink(backup).catch(() => undefined);
  } catch (error) {
    console.error(
      `  ! ${item.file}: ${error instanceof Error ? error.message : error}`,
    );
    try {
      await fs.copyFile(backup, out);
      await fs.unlink(backup);
      console.log(`  restored backup for ${item.file}`);
    } catch {
      // ignore
    }
  }
}

console.log("Done.");
