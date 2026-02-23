import { test, expect } from "@playwright/test";

test.describe("Sign In Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/signin");
  });

  test("sign in page loads with heading and form", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /Welcome Back/i })
    ).toBeVisible();
    await expect(
      page.getByText(/Sign in to your THC Plus account/i)
    ).toBeVisible();
  });

  test("sign in form has phone and password fields", async ({ page }) => {
    // Phone Number field
    const phoneLabel = page.getByText("Phone Number", { exact: false });
    await expect(phoneLabel).toBeVisible();

    const phoneInput = page.getByPlaceholder("(555) 123-4567");
    await expect(phoneInput).toBeVisible();
    await expect(phoneInput).toHaveAttribute("type", "tel");

    // Password field
    const passwordLabel = page.getByText("Password", { exact: true });
    await expect(passwordLabel).toBeVisible();

    const passwordInput = page.getByPlaceholder("Your password");
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("sign in form has submit button", async ({ page }) => {
    const signInButton = page.getByRole("button", { name: /Sign In/i });
    await expect(signInButton).toBeVisible();
    await expect(signInButton).toBeEnabled();
  });

  test("form validation shows errors on empty submit", async ({ page }) => {
    // Both fields have `required` attribute, so native validation should fire
    // Click submit without filling anything
    const signInButton = page.getByRole("button", { name: /Sign In/i });
    await signInButton.click();

    // The phone input has the `required` attribute — the browser should prevent submission
    const phoneInput = page.getByPlaceholder("(555) 123-4567");
    await expect(phoneInput).toHaveAttribute("required", "");

    const passwordInput = page.getByPlaceholder("Your password");
    await expect(passwordInput).toHaveAttribute("required", "");
  });

  test("forgot password link is visible", async ({ page }) => {
    const forgotLink = page.getByRole("link", {
      name: /Forgot password/i,
    });
    await expect(forgotLink).toBeVisible();
    await expect(forgotLink).toHaveAttribute("href", "/auth/forgot-password");
  });

  test("link to create account is visible", async ({ page }) => {
    await expect(page.getByText(/Don't have an account/i)).toBeVisible();

    const createAccountLink = page.getByRole("link", {
      name: /Create Account/i,
    });
    await expect(createAccountLink).toBeVisible();
    await expect(createAccountLink).toHaveAttribute("href", "/auth/signup");
  });

  test("create account link navigates to signup page", async ({ page }) => {
    await page.getByRole("link", { name: /Create Account/i }).click();
    await expect(page).toHaveURL(/\/auth\/signup/);
  });

  test("back to store link is visible and works", async ({ page }) => {
    const backLink = page.getByRole("link", { name: /Back to store/i });
    await expect(backLink).toBeVisible();
    await backLink.click();
    await expect(page).toHaveURL("/");
  });

  test("shows error on invalid credentials", async ({ page }) => {
    const phoneInput = page.getByPlaceholder("(555) 123-4567");
    await phoneInput.fill("5551234567");

    const passwordInput = page.getByPlaceholder("Your password");
    await passwordInput.fill("wrongpassword");

    await page.getByRole("button", { name: /Sign In/i }).click();

    // Should show an error message
    await expect(
      page.getByText(/Invalid phone number or password|Something went wrong/i)
    ).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Sign Up Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/signup");
  });

  test("sign up page loads with heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /Create Account/i })
    ).toBeVisible();
    await expect(
      page.getByText(/Join THC Plus to track orders and earn rewards/i)
    ).toBeVisible();
  });

  test("sign up form has all required fields", async ({ page }) => {
    // Full Name
    const nameLabel = page.getByText("Full Name");
    await expect(nameLabel).toBeVisible();
    const nameInput = page.getByPlaceholder("Your name");
    await expect(nameInput).toBeVisible();

    // Phone Number
    const phoneLabel = page.getByText("Phone Number", { exact: false });
    await expect(phoneLabel).toBeVisible();
    const phoneInput = page.getByPlaceholder("(555) 123-4567");
    await expect(phoneInput).toBeVisible();

    // Email (optional)
    const emailLabel = page.getByText("Email");
    await expect(emailLabel).toBeVisible();
    const emailInput = page.getByPlaceholder("you@example.com");
    await expect(emailInput).toBeVisible();
    // The "(optional)" note should be visible
    await expect(page.getByText("(optional)")).toBeVisible();

    // Password
    const passwordLabel = page.getByText("Password", { exact: true });
    await expect(passwordLabel).toBeVisible();
    const passwordInput = page.getByPlaceholder("At least 6 characters");
    await expect(passwordInput).toBeVisible();
  });

  test("sign up form has submit button", async ({ page }) => {
    const createButton = page.getByRole("button", {
      name: /Create Account/i,
    });
    await expect(createButton).toBeVisible();
    await expect(createButton).toBeEnabled();
  });

  test("form validation requires name, phone, and password", async ({
    page,
  }) => {
    // Click submit without filling anything
    const createButton = page.getByRole("button", {
      name: /Create Account/i,
    });
    await createButton.click();

    // Name input should have required attribute
    const nameInput = page.getByPlaceholder("Your name");
    await expect(nameInput).toHaveAttribute("required", "");

    // Phone input should have required attribute
    const phoneInput = page.getByPlaceholder("(555) 123-4567");
    await expect(phoneInput).toHaveAttribute("required", "");

    // Password input should have required attribute
    const passwordInput = page.getByPlaceholder("At least 6 characters");
    await expect(passwordInput).toHaveAttribute("required", "");

    // Email should NOT have required attribute (it's optional)
    const emailInput = page.getByPlaceholder("you@example.com");
    const isRequired = await emailInput.getAttribute("required");
    expect(isRequired).toBeNull();
  });

  test("password field has minimum length requirement", async ({ page }) => {
    const passwordInput = page.getByPlaceholder("At least 6 characters");
    await expect(passwordInput).toHaveAttribute("minlength", "6");
    await expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("link to sign in is visible", async ({ page }) => {
    await expect(page.getByText(/Already have an account/i)).toBeVisible();

    const signInLink = page.getByRole("link", { name: /Sign In/i });
    await expect(signInLink).toBeVisible();
    await expect(signInLink).toHaveAttribute("href", "/auth/signin");
  });

  test("sign in link navigates to signin page", async ({ page }) => {
    await page.getByRole("link", { name: /Sign In/i }).click();
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test("back to store link is visible and works", async ({ page }) => {
    const backLink = page.getByRole("link", { name: /Back to store/i });
    await expect(backLink).toBeVisible();
    await backLink.click();
    await expect(page).toHaveURL("/");
  });

  test("email field accepts email format", async ({ page }) => {
    const emailInput = page.getByPlaceholder("you@example.com");
    await expect(emailInput).toHaveAttribute("type", "email");
  });

  test("phone field accepts tel format", async ({ page }) => {
    const phoneInput = page.getByPlaceholder("(555) 123-4567");
    await expect(phoneInput).toHaveAttribute("type", "tel");
  });
});
