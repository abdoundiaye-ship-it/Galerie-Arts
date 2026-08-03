#!/usr/bin/env node
// Ingestion script: converts the real .tif scans in
// assets-source/originals/ into WebP derivatives, uploads all three tiers
// to Supabase Storage, and upserts the corresponding artworks /
// artwork_images rows. Safe to re-run (upserts by reference, re-uploads
// with upsert:true) — reference is the sole identity key, so an entry
// already present in scripts/artworks.source.json is never duplicated,
// only refreshed.
//
// Usage: fill .env.local (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY), then:
//   npm run convert:artworks

import { readFile, readdir } from "node:fs/promises";
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
// Archival "original" copy: capped rather than byte-for-byte, because a
// raw scanner TIFF (these run 10-100MB+) can exceed Supabase Storage's
// project-wide upload size limit. 4000px + high-quality JPEG keeps it
// visually near-lossless for print/reference while staying well under
// any reasonable limit.
const ARCHIVAL_MAX_DIMENSION = 4000;

// Source filenames have gone through Mac NFD-normalization (e.g. "e" +
// combining acute, U+0065 U+0301) and, for one batch, a CP437 mojibake
// round-trip that was already reversed before these names were written to
// artworks.source.json. Either way, a hand-typed sourceFile value can
// differ byte-for-byte from the on-disk name while being the same string
// once normalized — so resolve by comparing normalized forms against the
// real directory listing instead of trusting an exact match.
let dirEntriesCache = null;
async function resolveSourceFilePath(sourceFile) {
  dirEntriesCache ??= await readdir(ORIGINALS_DIR);
  const target = sourceFile.normalize("NFC");
  const match = dirEntriesCache.find((entry) => entry.normalize("NFC") === target);
  if (!match) {
    throw new Error(`fichier introuvable dans ${ORIGINALS_DIR} pour "${sourceFile}"`);
  }
  return path.join(ORIGINALS_DIR, match);
}

async function resolveTaxonomyId(table, slug) {
  if (!slug) return null;
  const { data, error } = await supabase.from(table).select("id").eq("slug", slug).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error(`${table} introuvable pour le slug "${slug}" — executez supabase db reset d'abord.`);
  return data.id;
}

async function processImageFile(sourceFile, reference, index) {
  const sourcePath = await resolveSourceFilePath(sourceFile);
  const sourceBuffer = await readFile(sourcePath);
  const metadata = await sharp(sourceBuffer).metadata();

  const [archivalBuffer, displayBuffer, thumbnailBuffer] = await Promise.all([
    sharp(sourceBuffer)
      .rotate()
      .resize({ width: ARCHIVAL_MAX_DIMENSION, height: ARCHIVAL_MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 92, mozjpeg: true })
      .toBuffer(),
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

  const originalPath = `${reference}/original-${index}.jpg`;
  const displayPath = `${reference}/display-${index}.webp`;
  const thumbnailPath = `${reference}/thumbnail-${index}.webp`;

  const uploads = await Promise.all([
    supabase.storage.from("artworks-original").upload(originalPath, archivalBuffer, {
      contentType: "image/jpeg",
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

  return {
    storage_path: originalPath,
    display_path: displayPath,
    thumbnail_path: thumbnailPath,
    is_primary: index === 0,
    sort_order: index,
    width: metadata.width ?? null,
    height: metadata.height ?? null,
  };
}

// Existence check happens by `reference` — the one identity key this
// catalog actually enforces uniqueness on (see the DB unique constraint).
// An artwork that already exists is skipped entirely, not re-upserted:
// once imported, price/availability/is_published become admin-owned state
// (set through /admin/oeuvres) and must never be silently reset back to
// import defaults by a later, unrelated import run.
async function artworkAlreadyExists(reference) {
  const { data, error } = await supabase.from("artworks").select("id").eq("reference", reference).maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

async function processEntry(entry) {
  const sourceFiles = entry.sourceFiles ?? [entry.sourceFile];
  console.log(`\n-> ${entry.reference} : ${entry.title} (${sourceFiles.length} image${sourceFiles.length > 1 ? "s" : ""})`);

  const imageRows = [];
  for (let i = 0; i < sourceFiles.length; i++) {
    imageRows.push(await processImageFile(sourceFiles[i], entry.reference, i));
  }
  console.log(`   ${imageRows.length} image(s) televersee(s) (original / display / thumbnail)`);

  const [categoryId, collectionId] = await Promise.all([
    resolveTaxonomyId("categories", entry.categorySlug),
    resolveTaxonomyId("collections", entry.collectionSlug),
  ]);

  const { data: artwork, error: insertError } = await supabase
    .from("artworks")
    .insert({
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
    })
    .select("id")
    .single();

  if (insertError) throw insertError;
  console.log(`   fiche oeuvre creee (id: ${artwork.id})`);

  const { error: imageError } = await supabase
    .from("artwork_images")
    .insert(imageRows.map((row) => ({ ...row, artwork_id: artwork.id })));

  if (imageError) throw imageError;
  console.log("   image(s) reference(es) en base");
}

async function main() {
  const entries = JSON.parse(await readFile(SOURCE_JSON, "utf8"));

  const refs = new Set();
  for (const entry of entries) {
    if (refs.has(entry.reference)) {
      throw new Error(`Reference dupliquee dans artworks.source.json : ${entry.reference}`);
    }
    refs.add(entry.reference);
  }

  let succeeded = 0;
  let skipped = 0;
  const failures = [];

  for (const entry of entries) {
    try {
      if (await artworkAlreadyExists(entry.reference)) {
        console.log(`\n-> ${entry.reference} : ${entry.title} — deja importee, ignoree (aucune modification).`);
        skipped += 1;
        continue;
      }
      await processEntry(entry);
      succeeded += 1;
    } catch (error) {
      console.error(`   ECHEC pour ${entry.reference} :`, error.message ?? error);
      failures.push({ reference: entry.reference, title: entry.title, error: String(error.message ?? error) });
    }
  }

  console.log("\n===== Rapport d'import =====");
  console.log(`Oeuvres decouvertes dans artworks.source.json : ${entries.length}`);
  console.log(`Nouvellement importees                        : ${succeeded}`);
  console.log(`Ignorees (deja presentes, par reference)      : ${skipped}`);
  console.log(`Echecs                                        : ${failures.length}`);
  if (failures.length) {
    console.log("Details des echecs :");
    for (const f of failures) console.log(`  - ${f.reference} (${f.title}) : ${f.error}`);
  }
  console.log(
    "\nLes nouvelles oeuvres sont creees en brouillon (is_published=false) — verifiez/completez le prix" +
      " et publiez-les depuis /admin/oeuvres. Les oeuvres deja importees n'ont pas ete modifiees.",
  );

  if (failures.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
