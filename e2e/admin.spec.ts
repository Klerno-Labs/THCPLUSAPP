import { test, expect } from "@playwright/test";

test.describe("Admin Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/login");
  });

  test("admin login page loads with branding", async ({ page }) => {
    // The page shows "THC+" branding text
    await expect(page.getByRole("heading", { name: /THC/i })).toBeVisible();

    // "Staff Portal" subtitle should be visible
    await expect(page.getByText("Staff Portal")).toBeVisible();
  });

  test("login form has email and password fields", async ({ page }) => {
    // Email field
    const emailLabel = page.getByText("Email Address");
    await expect(emailLabel).toBeVisible();

    const emailInput = page.getByLabel("Email Address");
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute("type", "email");

    // Password field
    const passwordLabel = page.getByText("Password", { exact: true });
    await expect(passwordLabel).toBeVisible();

    const passwordInput = page.getByLabel("Password");
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("login form has a submit button", async ({ page }) => {
    const signInButton = page.getByRole("button", { name: /Sign In/i });
    await expect(signInButton).toBeVisible();
    await expect(signInButton).toBeEnabled();
  });

  test("shows error on empty email submission", async ({ page }) => {
    // Leave email empty, enter a password
    const passwordInput = page.getByLabel("Password");
    await passwordInput.fill("somepassword");

    // Click sign in
    await page.getByRole("button", { name: /Sign In/i }).click();

    // Should show validation error for email
    await expect(page.getByText("Email is required")).toBeVisible({
      timeout: 5000,
    });
  });

  test("shows error on empty password submission", async ({ page }) => {
    // Enter email, leave password empty
    const emailInput = page.getByLabel("Email Address");
    await emailInput.fill("test@thcplus.com");

    // Click sign in
    await page.getByRole("button", { name: /Sign In/i }).click();

    // Should show validation error for password
    await expect(page.getByText("Password is required")).toBeVisible({
      timeout: 5000,
    });
  });

  test("shows error on invalid email format", async ({ page }) => {
    const emailInput = page.getByLabel("Email Address");
    await emailInput.fill("notanemail");

    const passwordInput = page.getByLabel("Password");
    await passwordInput.fill("somepassword");

    await page.getByRole("button", { name: /Sign In/i }).click();

    await expect(
      page.getByText("Please enter a valid email address")
    ).toBeVisible({ timeout: 5000 });
  });

  test("shows error on wrong credentials", async ({ page }) => {
    const emailInput = page.getByLabel("Email Address");
    await emailInput.fill("fake@thcplus.com");

    const passwordInput = page.getByLabel("Password");
    await passwordInput.fill("wrongpassword123");

    await page.getByRole("button", { name: /Sign In/i }).click();

    // The API call may fail or return an error — wait for the error message
    // The component shows "Invalid email or password." on auth failure
    // or "An unexpected error occurred." on network error
    const errorMessage = page.getByText(
      /Invalid email or password|unexpected error/i
    );
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
  });

  test("password visibility toggle works", async ({ page }) => {
    const passwordInput = page.getByLabel("Password");
    await passwordInput.fill("testpassword");

    // Password should be hidden by default
    await expect(passwordInput).toHaveAttribute("type", "password");

    // Click the eye toggle button (it has no accessible name, find by proximity)
    const toggleButton = page
      .locator('button[tabindex="-1"]')
      .first();
    await toggleButton.click();

    // Password should now be visible
    await expect(passwordInput).toHaveAttribute("type", "text");

    // Click again to hide
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("footer text is visible", async ({ page }) => {
    await expect(
      page.getByText(/THC Plus Staff Portal/i)
    ).toBeVisible();
    await expect(
      page.getByText(/Authorized access only/i)
    ).toBeVisible();
  });
});
