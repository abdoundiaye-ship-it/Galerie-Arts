"use server";

import "server-only";
import sharp from "sharp";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { artworkSchema, categorySchema, collectionSchema } from "@/lib/validations/artwork.schema";
import { slugify } from "@/lib/utils";

export interface ActionState {
  error?: string;
  success?: string;
}

function readArtworkForm(formData: FormData) {
  return artworkSchema.safeParse({
    reference: formData.get("reference"),
    title: formData.get("title"),
    author: formData.get("author"),
    technique: formData.get("technique") ?? "",
    dimensions: formData.get("dimensions") ?? "",
    year: formData.get("year") || null,
    description: formData.get("description") ?? "",
    price: formData.get("price") || null,
    currency: formData.get("currency") || "XOF",
    availability: formData.get("availability") || "disponible",
    categoryId: formData.get("categoryId") || null,
    collectionId: formData.get("collectionId") || null,
    isPublished: formData.get("isPublished") === "on",
    isProtected: formData.get("isProtected") !== "off",
  });
}

export async function createArtworkAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = readArtworkForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };

  const supabase = await createClient();
  const { data: created, error } = await supabase
    .from("artworks")
    .insert({
      reference: parsed.data.reference,
      title: parsed.data.title,
      author: parsed.data.author,
      technique: parsed.data.technique || null,
      dimensions: parsed.data.dimensions || null,
      year: parsed.data.year ?? null,
      description: parsed.data.description || null,
      price: parsed.data.price ?? null,
      currency: parsed.data.currency,
      availability: parsed.data.availability,
      category_id: parsed.data.categoryId || null,
      collection_id: parsed.data.collectionId || null,
      is_published: parsed.data.isPublished,
      is_protected: parsed.data.isProtected,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.code === "23505" ? "Cette reference existe deja." : "Erreur lors de la creation." };
  }

  revalidatePath("/admin/oeuvres");
  return { success: created ? `Oeuvre creee (id: ${created.id}).` : "Oeuvre creee." };
}

export async function updateArtworkAction(
  artworkId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = readArtworkForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("artworks")
    .update({
      reference: parsed.data.reference,
      title: parsed.data.title,
      author: parsed.data.author,
      technique: parsed.data.technique || null,
      dimensions: parsed.data.dimensions || null,
      year: parsed.data.year ?? null,
      description: parsed.data.description || null,
      price: parsed.data.price ?? null,
      currency: parsed.data.currency,
      availability: parsed.data.availability,
      category_id: parsed.data.categoryId || null,
      collection_id: parsed.data.collectionId || null,
      is_published: parsed.data.isPublished,
      is_protected: parsed.data.isProtected,
    })
    .eq("id", artworkId);

  if (error) {
    return { error: error.code === "23505" ? "Cette reference existe deja." : "Erreur lors de la mise a jour." };
  }

  revalidatePath("/admin/oeuvres");
  revalidatePath(`/admin/oeuvres/${artworkId}`);
  revalidatePath(`/galerie/${parsed.data.reference}`);
  return { success: "Oeuvre mise a jour." };
}

export async function deleteArtworkAction(artworkId: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("artworks").delete().eq("id", artworkId);
  revalidatePath("/admin/oeuvres");
}

const DISPLAY_MAX_DIMENSION = 1600;
const THUMBNAIL_MAX_DIMENSION = 480;
// Capped rather than byte-for-byte, same reasoning as scripts/convert-artworks.mjs:
// raw scans can exceed Supabase Storage's project-wide upload size limit.
const ARCHIVAL_MAX_DIMENSION = 4000;

export async function uploadArtworkImageAction(artworkId: string, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const supabase = await createClient();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Aucun fichier fourni." };
  }

  const sourceBuffer = Buffer.from(await file.arrayBuffer());
  const baseName = `${artworkId}-${Date.now()}`;

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

  const metadata = await sharp(sourceBuffer).metadata();
  const originalPath = `${baseName}/original.jpg`;
  const displayPath = `${baseName}/display.webp`;
  const thumbnailPath = `${baseName}/thumbnail.webp`;

  const [originalUpload, displayUpload, thumbnailUpload] = await Promise.all([
    supabase.storage.from("artworks-original").upload(originalPath, archivalBuffer, {
      contentType: "image/jpeg",
      upsert: false,
    }),
    supabase.storage.from("artworks-display").upload(displayPath, displayBuffer, {
      contentType: "image/webp",
      upsert: false,
    }),
    supabase.storage.from("artworks-thumbnail").upload(thumbnailPath, thumbnailBuffer, {
      contentType: "image/webp",
      upsert: false,
    }),
  ]);

  const uploadError = originalUpload.error || displayUpload.error || thumbnailUpload.error;
  if (uploadError) {
    return { error: `Echec de l'upload : ${uploadError.message}` };
  }

  const { count: existingCount } = await supabase
    .from("artwork_images")
    .select("id", { count: "exact", head: true })
    .eq("artwork_id", artworkId);

  const { error: insertError } = await supabase.from("artwork_images").insert({
    artwork_id: artworkId,
    storage_path: originalPath,
    display_path: displayPath,
    thumbnail_path: thumbnailPath,
    is_primary: (existingCount ?? 0) === 0,
    sort_order: existingCount ?? 0,
    width: metadata.width ?? null,
    height: metadata.height ?? null,
  });

  if (insertError) {
    return { error: "Image televersee mais impossible d'enregistrer la reference en base." };
  }

  revalidatePath(`/admin/oeuvres/${artworkId}`);
  return { success: "Image ajoutee." };
}

export async function deleteArtworkImageAction(imageId: string, artworkId: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { data: image } = await supabase
    .from("artwork_images")
    .select("storage_path, display_path, thumbnail_path")
    .eq("id", imageId)
    .single();

  if (image) {
    await Promise.all([
      supabase.storage.from("artworks-original").remove([image.storage_path]),
      supabase.storage.from("artworks-display").remove([image.display_path]),
      supabase.storage.from("artworks-thumbnail").remove([image.thumbnail_path]),
    ]);
  }

  await supabase.from("artwork_images").delete().eq("id", imageId);
  revalidatePath(`/admin/oeuvres/${artworkId}`);
}

export async function createCategoryAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };

  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert({
    name: parsed.data.name,
    slug: slugify(parsed.data.name),
    description: parsed.data.description || null,
  });

  if (error) return { error: error.code === "23505" ? "Cette categorie existe deja." : "Erreur." };

  revalidatePath("/admin/categories");
  return { success: "Categorie creee." };
}

export async function deleteCategoryAction(categoryId: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("categories").delete().eq("id", categoryId);
  revalidatePath("/admin/categories");
}

export async function createCollectionAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = collectionSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };

  const supabase = await createClient();
  const { error } = await supabase.from("collections").insert({
    name: parsed.data.name,
    slug: slugify(parsed.data.name),
    description: parsed.data.description || null,
  });

  if (error) return { error: error.code === "23505" ? "Cette collection existe deja." : "Erreur." };

  revalidatePath("/admin/collections");
  return { success: "Collection creee." };
}

export async function deleteCollectionAction(collectionId: string) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("collections").delete().eq("id", collectionId);
  revalidatePath("/admin/collections");
}
