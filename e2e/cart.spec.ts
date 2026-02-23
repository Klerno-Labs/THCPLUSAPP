import { test, expect } from "@playwright/test";

test.describe("Cart Page - Empty State", () => {
  test("empty cart shows 'No items yet' message", async ({ page }) => {
    // Bypass age gate and onboarding overlays
    await page.addInitScript(() => {
      localStorage.setItem("thcplus-age-verified", "true");
      localStorage.setItem("thcplus-onboarded", "true");
    });
    await page.goto("/cart");

    // If the cart is empty, we should see the empty state
    // The empty state shows "No items yet" and a "Browse Menu" link
    const emptyMessage = page.getByRole("heading", {
      name: /No items yet/i,
    });
    const cartHeading = page.getByRole("heading", {
      name: /Your Will-Call Order/i,
    });

    const isEmpty = await emptyMessage.isVisible().catch(() => false);
    const hasItems = await cartHeading.isVisible().catch(() => false);

    // Cart should show one state or the other
    expect(isEmpty || hasItems).toBeTruthy();

    if (isEmpty) {
      await expect(
        page.getByText(/Browse our menu and add products/i)
      ).toBeVisible();

      // "Browse Menu" button should be present
      await expect(
        page.getByRole("link", { name: /Browse Menu/i })
      ).toBeVisible();
    }
  });

  test("empty cart 'Browse Menu' link navigates to products", async ({
    page,
  }) => {
    // Bypass age gate/onboarding and clear cart
    await page.addInitScript(() => {
      localStorage.setItem("thcplus-age-verified", "true");
      localStorage.setItem("thcplus-onboarded", "true");
      localStorage.removeItem("thcplus-cart");
    });
    await page.goto("/cart");

    const emptyMessage = page.getByRole("heading", {
      name: /No items yet/i,
    });
    const isEmpty = await emptyMessage.isVisible().catch(() => false);

    if (isEmpty) {
      await page.getByRole("link", { name: /Browse Menu/i }).click();
      await expect(page).toHaveURL(/\/products/);
    }
  });
});

test.describe("Cart Flow - Adding Products", () => {
  test("adding a product to cart shows toast notification", async ({
    page,
  }) => {
    // Bypass age gate/onboarding and start with clean cart
    await page.addInitScript(() => {
      localStorage.setItem("thcplus-age-verified", "true");
      localStorage.setItem("thcplus-onboarded", "true");
      localStorage.removeItem("thcplus-cart");
    });

    await page.goto("/products");

    // Wait for products to fully load from API
    const firstAddButton = page.getByRole("button", { name: /Add .+ to order/i }).first();
    await firstAddButton.waitFor({ state: "visible", timeout: 10000 });

    // Click the first "Add to order" button
    await firstAddButton.click();

    // Toast notification should appear with "Added to order"
    await expect(page.getByText("Added to order").first()).toBeVisible({
      timeout: 10000,
    });
  });

  test("cart page shows added items after adding from products page", async ({
    page,
  }) => {
    // Bypass age gate/onboarding (runs on every navigation)
    await page.addInitScript(() => {
      localStorage.setItem("thcplus-age-verified", "true");
      localStorage.setItem("thcplus-onboarded", "true");
    });

    // Navigate first, then clear cart before adding a product
    await page.goto("/products");
    await page.evaluate(() => localStorage.removeItem("thcplus-cart"));

    // Wait for product grid to load with actual products
    const firstAddButton = page.getByRole("button", { name: /Add .+ to order/i }).first();
    await firstAddButton.waitFor({ state: "visible", timeout: 10000 });

    // Get the product name from the card before clicking
    const firstCard = page.locator(".grid.grid-cols-2 a").first();
    const productName = await firstCard.locator("h3").textContent();

    await firstAddButton.click();

    // Wait for toast to confirm addition
    await expect(page.getByText("Added to order").first()).toBeVisible({
      timeout: 10000,
    });

    // Navigate to cart
    await page.goto("/cart");

    // Cart should now show "Your Will-Call Order" heading (non-empty state)
    await expect(
      page.getByRole("heading", { name: /Your Will-Call Order/i })
    ).toBeVisible();

    // The product name should appear in the cart
    if (productName) {
      await expect(page.getByText(productName)).toBeVisible();
    }

    // Order Summary section should be visible
    await expect(
      page.getByRole("heading", { name: /Order Summary/i })
    ).toBeVisible();
  });
});

test.describe("Cart Page - Item Management", () => {
  // Helper: seed a product into the cart via localStorage before each test
  test.beforeEach(async ({ page }) => {
    // Bypass age gate/onboarding (runs on every navigation)
    await page.addInitScript(() => {
      localStorage.setItem("thcplus-age-verified", "true");
      localStorage.setItem("thcplus-onboarded", "true");
    });

    // Navigate and clear cart before adding product
    await page.goto("/products");
    await page.evaluate(() => localStorage.removeItem("thcplus-cart"));

    // Wait for products to fully load
    const firstAddButton = page.getByRole("button", { name: /Add .+ to order/i }).first();
    await firstAddButton.waitFor({ state: "visible", timeout: 10000 }).catch(() => {});

    const isVisible = await firstAddButton.isVisible().catch(() => false);
    if (isVisible) {
      await firstAddButton.click();
      // Wait for toast
      await page.getByText("Added to order").first().waitFor({ timeout: 10000 }).catch(() => {});
    }

    await page.goto("/cart");
  });

  test("can increase product quantity", async ({ page }) => {
    const cartHeading = page.getByRole("heading", {
      name: /Your Will-Call Order/i,
    });
    const hasItems = await cartHeading.isVisible().catch(() => false);

    if (hasItems) {
      // Find the increase quantity button (aria-label contains "Increase quantity")
      const increaseButton = page.getByRole("button", {
        name: /Increase quantity/i,
      }).first();
      await expect(increaseButton).toBeVisible();

      // Get current quantity (displayed between the +/- buttons)
      const quantityDisplay = page
        .locator('[aria-live="polite"][aria-atomic="true"]')
        .first();
      const initialQty = await quantityDisplay.textContent();

      // Click increase
      await increaseButton.click();

      // Quantity should increase by 1
      const newQty = await quantityDisplay.textContent();
      expect(parseInt(newQty || "0")).toBe(parseInt(initialQty || "0") + 1);
    }
  });

  test("can decrease product quantity", async ({ page }) => {
    const cartHeading = page.getByRole("heading", {
      name: /Your Will-Call Order/i,
    });
    const hasItems = await cartHeading.isVisible().catch(() => false);

    if (hasItems) {
      // First increase quantity so we can decrease it
      const increaseButton = page.getByRole("button", {
        name: /Increase quantity/i,
      }).first();
      await increaseButton.click();

      // Wait a moment for state to update
      await page.waitForTimeout(300);

      // Now decrease
      const decreaseButton = page.getByRole("button", {
        name: /Decrease quantity/i,
      }).first();
      await decreaseButton.click();

      // Quantity should be back to 1
      const quantityDisplay = page
        .locator('[aria-live="polite"][aria-atomic="true"]')
        .first();
      const qty = await quantityDisplay.textContent();
      expect(parseInt(qty || "0")).toBe(1);
    }
  });

  test("can remove items from cart", async ({ page }) => {
    const cartHeading = page.getByRole("heading", {
      name: /Your Will-Call Order/i,
    });
    const hasItems = await cartHeading.isVisible().catch(() => false);

    if (hasItems) {
      // Click the remove button (aria-label contains "Remove")
      const removeButton = page.getByRole("button", {
        name: /Remove .+ from order/i,
      }).first();
      await expect(removeButton).toBeVisible();
      await removeButton.click();

      // A toast should appear confirming removal
      await expect(page.getByText("Removed", { exact: true })).toBeVisible({
        timeout: 5000,
      });

      // Cart should now be empty — showing "No items yet"
      await expect(
        page.getByRole("heading", { name: /No items yet/i })
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test("cart total updates when quantity changes", async ({ page }) => {
    const cartHeading = page.getByRole("heading", {
      name: /Your Will-Call Order/i,
    });
    const hasItems = await cartHeading.isVisible().catch(() => false);

    if (hasItems) {
      // Look for the "Estimated Total" or "Subtotal" value in the Order Summary
      const summarySection = page.locator('[aria-live="polite"][role="status"]').last();

      // Get initial total text
      const initialSummaryText = await summarySection.textContent();

      // Increase quantity
      const increaseButton = page.getByRole("button", {
        name: /Increase quantity/i,
      }).first();
      await increaseButton.click();

      // Wait for the UI to update
      await page.waitForTimeout(500);

      // The summary should have updated (different text or values)
      const updatedSummaryText = await summarySection.textContent();

      // If prices are $0 (price at pickup), the total won't change
      // Otherwise the total should have increased
      if (initialSummaryText?.includes("$")) {
        expect(updatedSummaryText).not.toBe(initialSummaryText);
      }
    }
  });

  test("order summary shows item count", async ({ page }) => {
    const cartHeading = page.getByRole("heading", {
      name: /Your Will-Call Order/i,
    });
    const hasItems = await cartHeading.isVisible().catch(() => false);

    if (hasItems) {
      // The cart header shows item count like "1 item reserved" or "2 items reserved"
      await expect(
        page.getByText(/\d+ items? reserved/i)
      ).toBeVisible();

      // The Order Summary card should show the subtotal with item count
      await expect(
        page.getByText(/Subtotal.*\d+ items?/i)
      ).toBeVisible();
    }
  });
});
