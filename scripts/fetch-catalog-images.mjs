/**
 * Download curated Unsplash stills and convert to webp for the catalog.
 * Run: node scripts/fetch-catalog-images.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const imagesDir = path.join(root, "public", "images");

/** Specific Unsplash photos — warm interiors + house exteriors. */
const sources = [
  {
    file: "property-loft-podil",
    url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=85",
  },
  {
    file: "property-studio-center",
    url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=85",
  },
  {
    file: "property-solomyanka",
    url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1600&q=85",
  },
  {
    file: "property-nyvky",
    url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=85",
  },
  {
    file: "property-shuliavka",
    url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=85",
  },
  {
    file: "property-demiivka",
    url: "https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=1600&q=85",
  },
  {
    file: "property-leftbank",
    url: "https://images.unsplash.com/photo-1554995207-c18c203806cb?auto=format&fit=crop&w=1600&q=85",
  },
  {
    file: "property-svyatoshyn",
    url: "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1600&q=85",
  },
  {
    file: "property-obolon-light",
    url: "https://images.unsplash.com/photo-1600607687939-ce8a6c5094d0?auto=format&fit=crop&w=1600&q=85",
  },
  {
    file: "property-pechersk-quiet",
    url: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1600&q=85",
  },
  {
    file: "property-podil-brick",
    url: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1600&q=85",
  },
  {
    file: "property-center-gallery",
    url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=85",
  },
  {
    file: "property-osokorky-view",
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
  },
  {
    file: "property-holosiiv-green",
    url: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1600&q=85",
  },
  {
    file: "house-koncha",
    url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85",
  },
  {
    file: "house-pushcha",
    url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=85",
  },
  {
    file: "house-osokorky",
    url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85",
  },
  {
    file: "house-bortnychi",
    url: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=1600&q=85",
  },
  {
    file: "house-vita",
    url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1600&q=85",
  },
  {
    file: "house-hatne",
    url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=85",
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

for (const item of sources) {
  const out = path.join(imagesDir, `${item.file}.webp`);
  try {
    await fs.access(out);
    console.log(`skip ${item.file}.webp (exists)`);
    continue;
  } catch {
    // download
  }

  try {
    console.log(`fetch ${item.file}…`);
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
  } catch (error) {
    console.error(`  ! ${item.file}: ${error instanceof Error ? error.message : error}`);
  }
}

console.log("Done.");
