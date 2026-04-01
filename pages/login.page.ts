import { Page } from '@playwright/test';
import { BasePage } from './base.page';
import { ENV } from '../utils/env';
import { generateTotp } from '../utils/otp';

export class LoginPage extends BasePage {
  readonly emailInput = this.page.getByTestId('email-input-field');
  readonly passwordLoginButton = this.page.getByTestId('password-login-button');
  readonly passwordInput = this.page.getByTestId('password-input-field');
  readonly otpInput = this.page.getByTestId('two-factor-code-input');
  readonly rememberDeviceNotButton = this.page.getByTestId('2fa-remember-me-not-button');
  readonly accountLink = this.page.getByRole('link', { name: 'myowncompany' });

  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.navigate('/login');
    await this.waitForPageLoad();
  }

  async loginWithMfa(username: string, password: string, otpSecret: string): Promise<void> {
    await this.emailInput.fill(username);
    await this.emailInput.press('Enter');

    await this.passwordLoginButton.click();

    await this.passwordInput.fill(password);
    await this.passwordInput.press('Enter');

    const otp = generateTotp(otpSecret);
    await this.otpInput.fill(otp);
    await this.otpInput.press('Enter');

    await this.rememberDeviceNotButton.waitFor({ state: 'visible' });
    await this.rememberDeviceNotButton.click();

    await this.accountLink.waitFor({ state: 'visible' });
    await this.accountLink.click();

    await this.page.waitForURL(`**/${ENV.portalId}/**`);
  }
}
