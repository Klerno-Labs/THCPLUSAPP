import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    // Bypass age gate and onboarding overlays
    await page.addInitScript(() => {
      localStorage.setItem("thcplus-age-verified", "true");
      localStorage.setItem("thcplus-onboarded", "true");
    });
    await page.goto("/");
  });

  test("page loads with title containing THC Plus", async ({ page }) => {
    await expect(page).toHaveTitle(/THC Plus/i);
  });

  test("hero banner section is visible", async ({ page }) => {
    // The HomeHero renders a section with "Browse. Reserve. Pick Up." or dynamic banner text
    const heroSection = page.locator("section").first();
    await expect(heroSection).toBeVisible();

    // Check for the "Will-Call Ordering" badge text in the hero
    await expect(page.getByText("Will-Call Ordering")).toBeVisible();

    // The hero should show "Browse Menu" CTA button
    const browseMenuButton = page.getByRole("link", { name: /Browse Menu/i });
    await expect(browseMenuButton).toBeVisible();
  });

  test("hero shows the 3-step how it works section", async ({ page }) => {
    // The 3-step titles are h2 elements: "Browse", "Reserve", "Pick Up"
    await expect(page.getByRole("heading", { name: "Browse", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Reserve", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Pick Up", exact: true })).toBeVisible();
  });

  test("navigation links work - header links are present", async ({ page }) => {
    // Desktop header nav should have Home, Menu, Order links
    const mainNav = page.getByRole("navigation", { name: /Main navigation/i });
    await expect(mainNav).toBeVisible();

    await expect(mainNav.getByRole("link", { name: /Home/i })).toBeVisible();
    await expect(mainNav.getByRole("link", { name: /Menu/i })).toBeVisible();
    await expect(mainNav.getByRole("link", { name: /Order/i })).toBeVisible();
  });

  test("clicking Browse Menu navigates to products page", async ({ page }) => {
    const browseMenuLink = page.getByRole("link", { name: /Browse Menu/i }).first();
    await browseMenuLink.click();

    await expect(page).toHaveURL(/\/products/);
    await expect(page.getByRole("heading", { name: /Our Menu/i })).toBeVisible();
  });

  test("featured products section loads", async ({ page }) => {
    // The FeaturedProducts component renders a "Featured Products" heading
    // It may not render if no featured products exist in the DB, so we check
    // for either the featured products section or the category grid
    const featuredHeading = page.getByRole("heading", {
      name: /Featured Products/i,
    });
    const categorySection = page.getByText(/Browse by Category/i);

    // At least one of these sections should be visible on the homepage
    const hasFeatured = await featuredHeading.isVisible().catch(() => false);
    const hasCategories = await categorySection.isVisible().catch(() => false);

    expect(hasFeatured || hasCategories).toBeTruthy();
  });

  test("cart link in header navigates to cart page", async ({ page }) => {
    const cartLink = page.getByRole("link", { name: /Shopping cart/i });
    await expect(cartLink).toBeVisible();
    await cartLink.click();

    await expect(page).toHaveURL(/\/cart/);
  });

  test("account link in header is present", async ({ page }) => {
    const accountLink = page.getByRole("link", { name: /Account/i }).first();
    await expect(accountLink).toBeVisible();
  });

  test("trust badges are visible in hero", async ({ page }) => {
    await expect(page.getByText("No Payment Online")).toBeVisible();
    await expect(page.getByText("Lab Tested Products")).toBeVisible();
    await expect(page.getByText("ID Required at Pickup")).toBeVisible();
  });
});
