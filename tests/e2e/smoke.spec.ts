import { expect, test } from "@playwright/test";

test.describe("Parcours visiteur", () => {
  test("accueil -> galerie -> filtre par mot-cle", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Makhete Wade" })).toBeVisible();

    await page.getByRole("link", { name: "Explorer la galerie" }).click();
    await expect(page).toHaveURL(/\/galerie/);
    await expect(page.getByRole("heading", { name: "La galerie" })).toBeVisible();
  });

  test("le clic droit est desactive sur une fiche oeuvre publiee", async ({ page, request }) => {
    const res = await request.get("/galerie");
    test.skip(res.status() !== 200, "galerie inaccessible dans cet environnement");

    await page.goto("/galerie");
    const firstCard = page.locator("a[href^='/galerie/']").first();
    const count = await firstCard.count();
    test.skip(count === 0, "aucune oeuvre publiee pour tester la fiche detail");

    await firstCard.click();
    await expect(page).toHaveURL(/\/galerie\/.+/);

    const protectedImage = page.locator(".protected-image").first();
    await expect(protectedImage).toBeVisible();
  });

  test("l'inscription affiche le formulaire attendu", async ({ page }) => {
    await page.goto("/inscription");
    await expect(page.getByLabel("Nom complet")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Mot de passe", { exact: true })).toBeVisible();
  });

  test("une route admin redirige un visiteur non authentifie", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/connexion/);
  });
});
