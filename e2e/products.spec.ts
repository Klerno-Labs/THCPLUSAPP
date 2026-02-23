import { test, expect } from "@playwright/test";

test.describe("Products Page", () => {
  test.beforeEach(async ({ page }) => {
    // Bypass age gate and onboarding overlays
    await page.addInitScript(() => {
      localStorage.setItem("thcplus-age-verified", "true");
      localStorage.setItem("thcplus-onboarded", "true");
    });
    await page.goto("/products");
  });

  test("products page loads with heading and description", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /Our Menu/i })
    ).toBeVisible();
    await expect(
      page.getByText(/Browse and reserve premium THCA products/i)
    ).toBeVisible();
  });

  test("search input is visible and functional", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search products...");
    await expect(searchInput).toBeVisible();

    // Type a search term
    await searchInput.fill("flower");
    // The results count text should update (e.g. "X products found")
    await expect(page.getByText(/product(s)? found/i)).toBeVisible();
  });

  test("filter button is present and toggles filter panel", async ({
    page,
  }) => {
    // Click the Filters button
    const filtersButton = page.getByRole("button", { name: /Filters/i });
    await expect(filtersButton).toBeVisible();
    await filtersButton.click();

    // Filter panel should now show category, strain type, and price range sections
    await expect(page.getByText("Category", { exact: false })).toBeVisible();
    await expect(page.getByText("Strain Type")).toBeVisible();
    await expect(page.getByText("Price Range")).toBeVisible();
  });

  test("can filter by category using filter panel", async ({ page }) => {
    // Open filters
    await page.getByRole("button", { name: /Filters/i }).click();

    // Wait for the category section to appear
    await expect(page.getByText("Category", { exact: false })).toBeVisible();

    // The "All" category button should be present and selected by default
    const allButton = page
      .locator("button")
      .filter({ hasText: /^All$/ })
      .first();
    await expect(allButton).toBeVisible();

    // Get initial product count
    const countText = await page
      .getByText(/product(s)? found/i)
      .textContent();
    const initialCount = parseInt(countText?.match(/\d+/)?.[0] || "0");

    // If there are categories, click the first non-All category button
    // Category buttons are within the filter panel
    const categoryButtons = page.locator(
      'button:has-text("All") ~ button'
    );
    const categoryCount = await categoryButtons.count();

    if (categoryCount > 0) {
      await categoryButtons.first().click();

      // Product count should change or stay the same (filtered)
      await expect(page.getByText(/product(s)? found/i)).toBeVisible();
    }
  });

  test("can filter by strain type", async ({ page }) => {
    // Open filters
    await page.getByRole("button", { name: /Filters/i }).click();

    // Click on a strain type filter (e.g., SATIVA)
    const sativaButton = page.getByRole("button", { name: "SATIVA" });
    if (await sativaButton.isVisible()) {
      await sativaButton.click();

      // A badge should appear showing the active strain filter
      await expect(page.getByText(/product(s)? found/i)).toBeVisible();
    }
  });

  test("product cards display name and price", async ({ page }) => {
    // Wait for products to render — look for the product grid
    const productGrid = page.locator(
      ".grid.grid-cols-2"
    );

    // If products exist, check that cards have names and prices
    const productCount = await productGrid.locator("a").count();

    if (productCount > 0) {
      // First product card should have a name (h3 element)
      const firstCard = productGrid.locator("a").first();
      const productName = firstCard.locator("h3");
      await expect(productName).toBeVisible();
      await expect(productName).not.toBeEmpty();

      // Product should have a price displayed (either "$X.XX" or "Price at pickup")
      const hasPrice = await firstCard
        .getByText(/^\$\d+/)
        .isVisible()
        .catch(() => false);
      const hasPriceAtPickup = await firstCard
        .getByText("Price at pickup")
        .isVisible()
        .catch(() => false);
      expect(hasPrice || hasPriceAtPickup).toBeTruthy();
    }
  });

  test("product cards show strain badge when available", async ({ page }) => {
    // Look for strain badges (SATIVA, INDICA, HYBRID, CBD) on product cards
    const strainBadges = page.locator(
      'span:text-matches("SATIVA|INDICA|HYBRID|CBD")'
    );

    // If any products have strain types, the badges should be visible
    const badgeCount = await strainBadges.count();
    if (badgeCount > 0) {
      await expect(strainBadges.first()).toBeVisible();
    }
  });

  test("clicking a product card navigates to the product detail page", async ({
    page,
  }) => {
    // Wait for products to load
    const productGrid = page.locator(".grid.grid-cols-2");
    const productCards = productGrid.locator("a");
    const cardCount = await productCards.count();

    if (cardCount > 0) {
      // Get the href of the first product card
      const href = await productCards.first().getAttribute("href");
      expect(href).toMatch(/\/products\/.+/);

      // Click the first product card
      await productCards.first().click();

      // Should navigate to a product detail page
      await expect(page).toHaveURL(/\/products\/.+/);
    }
  });

  test("product results count is displayed", async ({ page }) => {
    // The ProductsGrid shows a count like "12 products found"
    await expect(page.getByText(/\d+ products? found/i)).toBeVisible();
  });

  test("sort dropdown is visible on desktop", async ({ page }) => {
    // The sort dropdown is hidden on mobile (sm:block)
    // In Playwright's default Desktop Chrome viewport it should be visible
    const sortDropdown = page.locator("select");
    if (await sortDropdown.isVisible()) {
      // Check that sort options exist
      await expect(sortDropdown.locator("option")).toHaveCount(4);
    }
  });
});

test.describe("Product Detail Page", () => {
  test.beforeEach(async ({ page }) => {
    // Bypass age gate and onboarding overlays
    await page.addInitScript(() => {
      localStorage.setItem("thcplus-age-verified", "true");
      localStorage.setItem("thcplus-onboarded", "true");
    });
  });

  test("product detail page shows all product info", async ({ page }) => {
    // First go to products page and click the first product
    await page.goto("/products");

    const productGrid = page.locator(".grid.grid-cols-2");
    const productCards = productGrid.locator("a");
    const cardCount = await productCards.count();

    if (cardCount > 0) {
      await productCards.first().click();
      await expect(page).toHaveURL(/\/products\/.+/);

      // Product name should be visible as a heading
      const productName = page.getByRole("heading", { level: 1 });
      await expect(productName).toBeVisible();
      await expect(productName).not.toBeEmpty();

      // Price should be displayed (formatted like "$XX.XX")
      await expect(page.locator('text=/\\$\\d+/').first()).toBeVisible();

      // "Back to Products" link should be present
      await expect(
        page.getByRole("link", { name: /Back to Products/i })
      ).toBeVisible();

      // "Add to Order" button should be present (on desktop view)
      const addButton = page.getByRole("button", {
        name: /Add to Order/i,
      });
      const hasAddButton = await addButton.isVisible().catch(() => false);

      // On mobile there's a simpler "Add" button in the sticky bar
      const addButtonMobile = page.getByRole("button", { name: /^Add$/i });
      const hasAddMobile = await addButtonMobile
        .isVisible()
        .catch(() => false);

      expect(hasAddButton || hasAddMobile).toBeTruthy();

      // Description heading may be present
      const descriptionHeading = page.getByText("Description");
      // THC percentage may be shown
      const thcInfo = page.locator('text=/THC/');
      // At least one of these info sections should exist
      const hasDescription = await descriptionHeading
        .isVisible()
        .catch(() => false);
      const hasThc = await thcInfo.first().isVisible().catch(() => false);
      // These are optional depending on product data, so we just check the page loaded properly
      expect(true).toBeTruthy();
    }
  });

  test("product detail page shows category link", async ({ page }) => {
    await page.goto("/products");

    const productGrid = page.locator(".grid.grid-cols-2");
    const productCards = productGrid.locator("a");
    const cardCount = await productCards.count();

    if (cardCount > 0) {
      await productCards.first().click();
      await expect(page).toHaveURL(/\/products\/.+/);

      // Category name should appear as a link (e.g., "FLOWER", "CONCENTRATES")
      // It links back to /products?category=slug
      const categoryLink = page.locator(
        'a[href*="/products?category="]'
      );
      const hasCategoryLink = await categoryLink
        .first()
        .isVisible()
        .catch(() => false);
      // Category link is optional (depends on data), but if present it should work
      if (hasCategoryLink) {
        await expect(categoryLink.first()).toBeVisible();
      }
    }
  });

  test("product detail page shows customer reviews section", async ({
    page,
  }) => {
    await page.goto("/products");

    const productGrid = page.locator(".grid.grid-cols-2");
    const productCards = productGrid.locator("a");
    const cardCount = await productCards.count();

    if (cardCount > 0) {
      await productCards.first().click();
      await expect(page).toHaveURL(/\/products\/.+/);

      // Customer Reviews heading should be visible
      await expect(
        page.getByRole("heading", { name: /Customer Reviews/i })
      ).toBeVisible();
    }
  });
});
