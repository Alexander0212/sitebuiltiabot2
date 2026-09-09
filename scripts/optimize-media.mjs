/**
 * Convert public/images/*.jpg → high-quality .webp and re-encode hero video.
 * Run: node scripts/optimize-media.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import sharp from "sharp";

const root = process.cwd();
const imagesDir = path.join(root, "public", "images");
const videoIn = path.join(root, "public", "videos", "hero-penthouse.mp4");
const videoTmp = path.join(root, "public", "videos", "hero-penthouse.tmp.mp4");
const videoWebm = path.join(root, "public", "videos", "hero-penthouse.webm");

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit" });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited ${code}`));
    });
  });
}

async function optimizeImages() {
  const files = (await fs.readdir(imagesDir)).filter((f) =>
    /\.jpe?g$/i.test(f),
  );

  if (!files.length) {
    console.log("No JPG sources to convert.");
    return;
  }

  for (const file of files) {
    const input = path.join(imagesDir, file);
    const base = file.replace(/\.jpe?g$/i, "");
    const webpOut = path.join(imagesDir, `${base}.webp`);
    const before = (await fs.stat(input)).size;

    await sharp(input)
      .rotate()
      .sharpen({ sigma: 0.6, m1: 0.8, m2: 0.4 })
      .webp({
        quality: 92,
        alphaQuality: 100,
        effort: 6,
        smartSubsample: true,
      })
      .toFile(webpOut);

    const after = (await fs.stat(webpOut)).size;
    console.log(
      `${file} → ${base}.webp  ${Math.round(before / 1024)}KB → ${Math.round(after / 1024)}KB`,
    );
    await fs.unlink(input);
  }
}

async function optimizeVideo() {
  try {
    await fs.access(videoIn);
  } catch {
    console.log("No hero video, skip");
    return;
  }

  const before = (await fs.stat(videoIn)).size;

  // High visual quality, smaller than typical 4 Mbps CBR; muted hero needs no audio.
  await run("ffmpeg", [
    "-y",
    "-i",
    videoIn,
    "-an",
    "-c:v",
    "libx264",
    "-crf",
    "23",
    "-preset",
    "slow",
    "-profile:v",
    "high",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    videoTmp,
  ]);

  await fs.rename(videoTmp, videoIn);

  await run("ffmpeg", [
    "-y",
    "-i",
    videoIn,
    "-an",
    "-c:v",
    "libvpx-vp9",
    "-crf",
    "33",
    "-b:v",
    "0",
    "-row-mt",
    "1",
    "-deadline",
    "good",
    "-cpu-used",
    "2",
    videoWebm,
  ]);

  const after = (await fs.stat(videoIn)).size;
  const webm = (await fs.stat(videoWebm)).size;
  console.log(
    `hero-penthouse.mp4  ${Math.round(before / 1024)}KB → ${Math.round(after / 1024)}KB`,
  );
  console.log(`hero-penthouse.webm ${Math.round(webm / 1024)}KB`);
}

await optimizeImages();
await optimizeVideo();
console.log("Done.");
