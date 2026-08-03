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
  const clientEmail = `rls-client-${suffix}@example.com`;
  const password = "Str0ngPassword!";

  let adminUserId: string;
  let clientUserId: string;
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

    const { data: clientUser, error: clientErr } = await admin.auth.admin.createUser({
      email: clientEmail,
      password,
      email_confirm: true,
    });
    if (clientErr) throw clientErr;
    clientUserId = clientUser.user.id;

    const { data: adminRole } = await admin.from("roles").select("id").eq("name", "admin").single();
    const { data: clientRole } = await admin.from("roles").select("id").eq("name", "client_autorise").single();

    await admin.from("profiles").update({ status: "admin", role_id: adminRole!.id }).eq("id", adminUserId);
    await admin
      .from("profiles")
      .update({ status: "client_autorise", role_id: clientRole!.id })
      .eq("id", clientUserId);

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
    await admin.auth.admin.deleteUser(clientUserId);
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

  it("lets a client_autorise user manage their own favorites", async () => {
    const client = await createSignedInClient(clientEmail, password);

    const { error: insertError } = await client
      .from("favorites")
      .insert({ user_id: clientUserId, artwork_id: publishedArtworkId });
    expect(insertError).toBeNull();

    const { data: ownFavorites, error: selectError } = await client
      .from("favorites")
      .select("artwork_id")
      .eq("user_id", clientUserId);
    expect(selectError).toBeNull();
    expect(ownFavorites).toHaveLength(1);
  });

  it("lets a client_autorise user create a purchase request but not accept it themselves", async () => {
    const client = await createSignedInClient(clientEmail, password);

    const { data: request, error: insertError } = await client
      .from("purchase_requests")
      .insert({ artwork_id: publishedArtworkId, user_id: clientUserId, message: "Interesse" })
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

  it("blocks a non-admin from escalating their own role/status", async () => {
    const client = await createSignedInClient(clientEmail, password);
    const { data: adminRole } = await admin.from("roles").select("id").eq("name", "admin").single();

    const { error } = await client
      .from("profiles")
      .update({ role_id: adminRole!.id, status: "admin" })
      .eq("id", clientUserId);

    expect(error).not.toBeNull();

    const { data: profileAfter } = await admin.from("profiles").select("status").eq("id", clientUserId).single();
    expect(profileAfter!.status).toBe("client_autorise");
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
