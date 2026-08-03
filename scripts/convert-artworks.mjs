#!/usr/bin/env node
// One-off ingestion script: converts the 8 real .tif scans in
// assets-source/originals/ into WebP derivatives, uploads all three tiers
// to Supabase Storage, and upserts the corresponding artworks /
// artwork_images rows. Safe to re-run (upserts by reference, re-uploads
// with upsert:true).
//
// Usage: fill .env.local (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY), then:
//   npm run convert:artworks

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Variables manquantes : renseignez SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans .env.local avant d'executer ce script.",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ORIGINALS_DIR = path.join(__dirname, "..", "assets-source", "originals");
const SOURCE_JSON = path.join(__dirname, "artworks.source.json");

const DISPLAY_MAX_DIMENSION = 1600;
const THUMBNAIL_MAX_DIMENSION = 480;

async function resolveTaxonomyId(table, slug) {
  if (!slug) return null;
  const { data, error } = await supabase.from(table).select("id").eq("slug", slug).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error(`${table} introuvable pour le slug "${slug}" — executez supabase db reset d'abord.`);
  return data.id;
}

async function processEntry(entry) {
  const sourcePath = path.join(ORIGINALS_DIR, entry.sourceFile);
  console.log(`\n-> ${entry.reference} : ${entry.sourceFile}`);

  const sourceBuffer = await readFile(sourcePath);
  const metadata = await sharp(sourceBuffer).metadata();

  const [displayBuffer, thumbnailBuffer] = await Promise.all([
    sharp(sourceBuffer)
      .rotate()
      .resize({ width: DISPLAY_MAX_DIMENSION, height: DISPLAY_MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer(),
    sharp(sourceBuffer)
      .rotate()
      .resize({ width: THUMBNAIL_MAX_DIMENSION, height: THUMBNAIL_MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 70 })
      .toBuffer(),
  ]);

  const originalPath = `${entry.reference}/original.tif`;
  const displayPath = `${entry.reference}/display.webp`;
  const thumbnailPath = `${entry.reference}/thumbnail.webp`;

  const uploads = await Promise.all([
    supabase.storage.from("artworks-original").upload(originalPath, sourceBuffer, {
      contentType: "image/tiff",
      upsert: true,
    }),
    supabase.storage.from("artworks-display").upload(displayPath, displayBuffer, {
      contentType: "image/webp",
      upsert: true,
    }),
    supabase.storage.from("artworks-thumbnail").upload(thumbnailPath, thumbnailBuffer, {
      contentType: "image/webp",
      upsert: true,
    }),
  ]);

  for (const upload of uploads) {
    if (upload.error) throw upload.error;
  }
  console.log("   images televersees (original / display / thumbnail)");

  const [categoryId, collectionId] = await Promise.all([
    resolveTaxonomyId("categories", entry.categorySlug),
    resolveTaxonomyId("collections", entry.collectionSlug),
  ]);

  const { data: artwork, error: upsertError } = await supabase
    .from("artworks")
    .upsert(
      {
        reference: entry.reference,
        title: entry.title,
        author: entry.author,
        technique: entry.technique,
        dimensions: entry.dimensions,
        year: entry.year,
        price: null,
        currency: "XOF",
        availability: "disponible",
        category_id: categoryId,
        collection_id: collectionId,
        is_published: false,
        is_protected: true,
      },
      { onConflict: "reference" },
    )
    .select("id")
    .single();

  if (upsertError) throw upsertError;
  console.log(`   fiche oeuvre upsert (id: ${artwork.id})`);

  await supabase.from("artwork_images").delete().eq("artwork_id", artwork.id);
  const { error: imageError } = await supabase.from("artwork_images").insert({
    artwork_id: artwork.id,
    storage_path: originalPath,
    display_path: displayPath,
    thumbnail_path: thumbnailPath,
    is_primary: true,
    sort_order: 0,
    width: metadata.width ?? null,
    height: metadata.height ?? null,
  });

  if (imageError) throw imageError;
  console.log("   image reference en base");
}

async function main() {
  const entries = JSON.parse(await readFile(SOURCE_JSON, "utf8"));

  for (const entry of entries) {
    try {
      await processEntry(entry);
    } catch (error) {
      console.error(`   ECHEC pour ${entry.reference} :`, error.message ?? error);
    }
  }

  console.log(
    "\nTermine. Les oeuvres sont creees en brouillon (is_published=false) — verifiez/completez le prix" +
      " et publiez-les depuis /admin/oeuvres.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
