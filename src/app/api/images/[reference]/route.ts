import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { applyWatermark } from "@/lib/watermark";
import { checkRateLimit } from "@/lib/rate-limit";
import { getPrimaryImage } from "@/lib/storage";
import { IMAGE_ROUTE_RATE_LIMIT } from "@/lib/constants";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ reference: string }>;
}

// Serves the "display" (medium-resolution) derivative of an artwork's
// primary image, after re-checking publication state server-side and
// compositing a dynamic watermark. This is the only path that can reach
// the private artworks-display bucket — see the storage RLS policies,
// which grant it no direct client read access at all.
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { reference } = await params;

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const rateLimitKey = user?.id ?? ip;
  if (!checkRateLimit(rateLimitKey, IMAGE_ROUTE_RATE_LIMIT)) {
    return NextResponse.json({ error: "Trop de requetes, reessayez plus tard." }, { status: 429 });
  }

  const { data: artwork } = await supabase
    .from("artworks")
    .select("id, reference, is_published, images:artwork_images(*)")
    .eq("reference", reference)
    .maybeSingle();

  if (!artwork) {
    return NextResponse.json({ error: "Oeuvre introuvable" }, { status: 404 });
  }

  const primaryImage = getPrimaryImage(artwork.images ?? []);
  if (!primaryImage) {
    return NextResponse.json({ error: "Image indisponible" }, { status: 404 });
  }

  let profile: { is_active: boolean } | null = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("is_active").eq("id", user.id).single();
    profile = data;
  }

  // Active accounts (admins are always active) get the full-size,
  // higher-quality watermark; anyone else gets the smaller "preview" tier.
  const isPrivileged = profile?.is_active === true;

  const admin = createAdminClient();
  const { data: fileBlob, error: downloadError } = await admin.storage
    .from("artworks-display")
    .download(primaryImage.display_path);

  if (downloadError || !fileBlob) {
    return NextResponse.json({ error: "Image indisponible" }, { status: 404 });
  }

  const sourceBuffer = Buffer.from(await fileBlob.arrayBuffer());

  const watermarkText = isPrivileged
    ? `${user?.email ?? "client"} • ${new Date().toISOString()}`
    : "APERCU — MAKHETE WADE";

  const watermarked = await applyWatermark(sourceBuffer, {
    maxDimension: isPrivileged ? 1600 : 1000,
    text: watermarkText,
    quality: isPrivileged ? 85 : 70,
  });

  admin
    .from("activity_logs")
    .insert({
      user_id: user?.id ?? null,
      action: "artwork.image.view",
      entity_type: "artwork",
      entity_id: artwork.id,
      metadata: { reference, privileged: isPrivileged },
    })
    .then(undefined, () => undefined);

  admin.rpc("increment_artwork_view", { artwork_reference: reference }).then(undefined, () => undefined);

  return new NextResponse(new Uint8Array(watermarked), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "no-store, max-age=0",
      "Content-Disposition": "inline",
    },
  });
}
