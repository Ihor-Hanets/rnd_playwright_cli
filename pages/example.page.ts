import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class ExamplePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.navigate('/');
    await this.waitForPageLoad();
  }

  async getHeading(): Promise<string> {
    return this.page.getByRole('heading', { level: 1 }).innerText();
  }
}
