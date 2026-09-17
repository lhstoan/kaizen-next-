import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import path from "path";

const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif"]);
const IMAGES_ROOT = path.join(process.cwd(), "public", "images");

async function walk(dir: string, base: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    const rel = `${base}/${entry.name}`;

    if (entry.isDirectory()) {
      files.push(...(await walk(abs, rel)));
    } else if (IMAGE_EXT.has(path.extname(entry.name).toLowerCase())) {
      files.push(rel);
    }
  }

  return files;
}

export async function GET() {
  const files = await walk(IMAGES_ROOT, "/images");
  return NextResponse.json({ images: files.sort() });
}
