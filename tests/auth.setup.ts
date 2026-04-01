import { test as setup } from '@playwright/test';
import path from 'path';
import { ENV } from '../utils/env';
import { generateTotp } from '../utils/otp';

export const AUTH_FILE = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate with HubSpot MFA', async ({ page }) => {
  setup.setTimeout(120_000);

  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');

  await page.getByTestId('email-input-field').fill(ENV.username);
  await page.getByTestId('email-input-field').press('Enter');

  // HubSpot may show SSO options first, then require clicking "Sign in with password",
  // or it may go directly to the password field depending on the account type.
  const passwordLoginBtn = page.getByTestId('password-login-button');
  const passwordInput = page.getByTestId('password-input-field');

  await Promise.race([
    passwordLoginBtn.waitFor({ state: 'visible' }),
    passwordInput.waitFor({ state: 'visible' }),
  ]);

  if (await passwordLoginBtn.isVisible()) {
    await passwordLoginBtn.click();
  }

  await passwordInput.fill(ENV.password);
  await passwordInput.press('Enter');

  const otpInput = page.getByTestId('two-factor-code-input');

  // Attempt OTP auth with automatic retry on "Invalid code" error
  // (HubSpot blocks TOTP code reuse across sessions for a brief period)
  let otp = generateTotp(ENV.otpSecret);
  await otpInput.fill(otp);
  await page.getByRole('button', { name: 'Continue' }).click();

  const invalidCodeError = page.getByText('Invalid code. Try again.');
  const firstAttemptFailed = await invalidCodeError.waitFor({ state: 'visible', timeout: 5_000 })
    .then(() => true)
    .catch(() => false);

  if (firstAttemptFailed) {
    // Wait for the next complete TOTP window to ensure a fresh unused code
    const secondsUntilNext = 30 - (Math.floor(Date.now() / 1000) % 30);
    await page.waitForTimeout((secondsUntilNext + 2) * 1000);
    otp = generateTotp(ENV.otpSecret);
    await otpInput.fill(otp);
    await page.getByRole('button', { name: 'Continue' }).click();
  }

  await page.getByTestId('2fa-remember-me-not-button').waitFor({ state: 'visible' });
  await page.getByTestId('2fa-remember-me-not-button').click();

  // HubSpot may show a "Simplify your sign-in" passkey promo popup — dismiss it
  const skipPasskeyButton = page.getByRole('button', { name: 'Skip for now' });
  await skipPasskeyButton.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => null);
  if (await skipPasskeyButton.isVisible()) {
    await skipPasskeyButton.click();
  }

  // HubSpot may land directly on the portal home page (single account)
  // or show the account selection page (multiple accounts) — handle both
  await page.waitForFunction(
    (portalId: string) => {
      const url = window.location.href;
      const bodyText = document.body ? document.body.innerText : '';
      return url.includes(`/${portalId}/`) || bodyText.includes('myowncompany');
    },
    ENV.portalId,
    { timeout: 30_000 },
  );

  const accountLink = page.getByRole('link', { name: 'myowncompany' });
  if (await accountLink.isVisible()) {
    await accountLink.click();
    await page.waitForURL(`**/${ENV.portalId}**`);
  }

  await page.context().storageState({ path: AUTH_FILE });
});
