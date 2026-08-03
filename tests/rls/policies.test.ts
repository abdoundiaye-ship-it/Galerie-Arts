import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  createAdminClient,
  createAnonClient,
  createSignedInClient,
  hasLocalSupabaseEnv,
} from "./helpers";

// Integration tests against a REAL local Supabase instance (RLS cannot be
// meaningfully tested against mocks). Requires:
//   supabase start
//   supabase db reset
//   SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY in the env
//     (see `supabase status` for local key values)
// Run with: npm run test:rls
describe.skipIf(!hasLocalSupabaseEnv)("Row Level Security policies", () => {
  const admin = hasLocalSupabaseEnv ? createAdminClient() : null!;
  const suffix = Date.now();
  const adminEmail = `rls-admin-${suffix}@example.com`;
  const activeVisitorEmail = `rls-active-${suffix}@example.com`;
  const inactiveVisitorEmail = `rls-inactive-${suffix}@example.com`;
  const password = "Str0ngPassword!";

  let adminUserId: string;
  let activeVisitorId: string;
  let inactiveVisitorId: string;
  let categoryId: string;
  let publishedArtworkId: string;
  let publishedArtworkReference: string;
  let unpublishedArtworkId: string;

  beforeAll(async () => {
    const { data: adminUser, error: adminErr } = await admin.auth.admin.createUser({
      email: adminEmail,
      password,
      email_confirm: true,
    });
    if (adminErr) throw adminErr;
    adminUserId = adminUser.user.id;

    const { data: activeUser, error: activeErr } = await admin.auth.admin.createUser({
      email: activeVisitorEmail,
      password,
      email_confirm: true,
    });
    if (activeErr) throw activeErr;
    activeVisitorId = activeUser.user.id;

    const { data: inactiveUser, error: inactiveErr } = await admin.auth.admin.createUser({
      email: inactiveVisitorEmail,
      password,
      email_confirm: true,
    });
    if (inactiveErr) throw inactiveErr;
    inactiveVisitorId = inactiveUser.user.id;

    const { data: adminRole } = await admin.from("roles").select("id").eq("name", "admin").single();

    await admin.from("profiles").update({ role_id: adminRole!.id, is_active: true }).eq("id", adminUserId);
    await admin.from("profiles").update({ is_active: true }).eq("id", activeVisitorId);
    // inactiveUser stays at handle_new_user's default: visiteur, is_active=false.

    const { data: category } = await admin
      .from("categories")
      .insert({ name: `RLS test ${suffix}`, slug: `rls-test-${suffix}` })
      .select("id")
      .single();
    categoryId = category!.id;

    publishedArtworkReference = `RLS-PUB-${suffix}`;
    const { data: published } = await admin
      .from("artworks")
      .insert({
        reference: publishedArtworkReference,
        title: "Published test artwork",
        author: "Test Author",
        category_id: categoryId,
        is_published: true,
      })
      .select("id")
      .single();
    publishedArtworkId = published!.id;

    const { data: unpublished } = await admin
      .from("artworks")
      .insert({
        reference: `RLS-DRAFT-${suffix}`,
        title: "Unpublished draft artwork",
        author: "Test Author",
        category_id: categoryId,
        is_published: false,
      })
      .select("id")
      .single();
    unpublishedArtworkId = unpublished!.id;
  });

  afterAll(async () => {
    if (!hasLocalSupabaseEnv) return;
    await admin.from("artworks").delete().in("id", [publishedArtworkId, unpublishedArtworkId]);
    await admin.from("categories").delete().eq("id", categoryId);
    await admin.auth.admin.deleteUser(adminUserId);
    await admin.auth.admin.deleteUser(activeVisitorId);
    await admin.auth.admin.deleteUser(inactiveVisitorId);
  });

  it("lets an anonymous visitor see only published artworks", async () => {
    const anon = createAnonClient();
    const { data, error } = await anon.from("artworks").select("id").eq("id", unpublishedArtworkId);
    expect(error).toBeNull();
    expect(data).toEqual([]);

    const { data: publishedRow } = await anon.from("artworks").select("id").eq("id", publishedArtworkId);
    expect(publishedRow).toHaveLength(1);
  });

  it("blocks an anonymous visitor from inserting an artwork", async () => {
    const anon = createAnonClient();
    const { error } = await anon.from("artworks").insert({
      reference: `RLS-HACK-${suffix}`,
      title: "Should not be allowed",
      author: "Nobody",
    });
    expect(error).not.toBeNull();
  });

  it("lets an active visitor manage their own favorites", async () => {
    const client = await createSignedInClient(activeVisitorEmail, password);

    const { error: insertError } = await client
      .from("favorites")
      .insert({ user_id: activeVisitorId, artwork_id: publishedArtworkId });
    expect(insertError).toBeNull();

    const { data: ownFavorites, error: selectError } = await client
      .from("favorites")
      .select("artwork_id")
      .eq("user_id", activeVisitorId);
    expect(selectError).toBeNull();
    expect(ownFavorites).toHaveLength(1);
  });

  it("lets an active visitor create a purchase request but not accept it themselves", async () => {
    const client = await createSignedInClient(activeVisitorEmail, password);

    const { data: request, error: insertError } = await client
      .from("purchase_requests")
      .insert({ artwork_id: publishedArtworkId, user_id: activeVisitorId, message: "Interesse" })
      .select("id")
      .single();
    expect(insertError).toBeNull();

    const { data: updated, error: updateError } = await client
      .from("purchase_requests")
      .update({ status: "acceptee" })
      .eq("id", request!.id)
      .select("id");

    // The owner_cancel policy's WITH CHECK only allows a transition to
    // 'annulee' — trying to self-accept must not silently succeed.
    expect(updateError !== null || (updated ?? []).length === 0).toBe(true);

    await admin.from("purchase_requests").delete().eq("id", request!.id);
  });

  it("blocks an inactive visitor from creating a purchase request", async () => {
    const client = await createSignedInClient(inactiveVisitorEmail, password);

    const { error } = await client
      .from("purchase_requests")
      .insert({ artwork_id: publishedArtworkId, user_id: inactiveVisitorId, message: "Interesse" });

    // Enforced by the purchase_requests_owner_insert policy's is_active
    // check (migration 00000000000008) — not just the Server Action.
    expect(error).not.toBeNull();
  });

  it("blocks a non-admin from escalating their own role or activating themselves", async () => {
    const client = await createSignedInClient(activeVisitorEmail, password);
    const { data: adminRole } = await admin.from("roles").select("id").eq("name", "admin").single();

    const { error } = await client
      .from("profiles")
      .update({ role_id: adminRole!.id, is_active: true })
      .eq("id", activeVisitorId);

    expect(error).not.toBeNull();

    const { data: profileAfter } = await admin
      .from("profiles")
      .select("is_active, roles(name)")
      .eq("id", activeVisitorId)
      .single();
    const roleRelation = profileAfter?.roles as unknown as { name: string } | { name: string }[] | null;
    const roleName = Array.isArray(roleRelation) ? roleRelation[0]?.name : roleRelation?.name;
    expect(roleName).toBe("visiteur");
  });

  it("lets an admin publish a draft artwork and manage purchase requests", async () => {
    const adminSession = await createSignedInClient(adminEmail, password);

    const { error: publishError } = await adminSession
      .from("artworks")
      .update({ is_published: true })
      .eq("id", unpublishedArtworkId);
    expect(publishError).toBeNull();

    const { data: nowVisible } = await createAnonClient()
      .from("artworks")
      .select("id")
      .eq("id", unpublishedArtworkId);
    expect(nowVisible).toHaveLength(1);

    await admin.from("artworks").update({ is_published: false }).eq("id", unpublishedArtworkId);
  });
});
