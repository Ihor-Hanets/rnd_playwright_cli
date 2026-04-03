import { Locator, Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { ENV } from '../../utils/env';

export class DealsBoardPage extends BasePage {
  readonly boardContainer: Locator;
  readonly addDealsButton: Locator;
  readonly helpTooltipCloseButton: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    super(page);
    this.boardContainer = page.getByText('You are currently on the board view');
    this.addDealsButton = page.getByTestId('create-object-dropdown');
    this.helpTooltipCloseButton = page.getByTestId('help-tooltip-close-button');
    this.searchInput = page.getByRole('searchbox', { name: 'Search', exact: true });
  }

  async open(): Promise<void> {
    await this.navigate(`/contacts/${ENV.portalId}/objects/0-3/views/all/board`);
    await this.waitForPageLoad();
    await this.dismissHelpTooltip();
  }

  async dismissHelpTooltip(): Promise<void> {
    if (await this.helpTooltipCloseButton.isVisible()) {
      await this.helpTooltipCloseButton.click();
    }
  }

  async getColumnByStage(stageName: string): Promise<Locator> {
    return this.page.getByText(stageName, { exact: true }).first();
  }

  async getDealCountForStage(stageName: string): Promise<number> {
    const column = this.page.getByText(stageName, { exact: true }).first();
    const countText = await column.locator('..').locator('..').getByRole('paragraph').innerText();
    return parseInt(countText, 10);
  }

  async getAllStageNames(): Promise<string[]> {
    const stages = [
      'Appointment Scheduled',
      'Qualified To Buy',
      'Presentation Scheduled',
      'Decision Maker Bought-In',
      'Contract Sent',
      'Closed Won',
      'Closed Lost',
    ];
    return stages;
  }

  async searchDeals(dealName: string): Promise<void> {
    await this.searchInput.clear();
    await this.searchInput.fill(dealName);
  }

  async getDealCardByName(dealName: string): Promise<Locator> {
    return this.page.getByRole('link', { name: dealName }).first();
  }

  async switchToListView(): Promise<void> {
    await this.navigate(`/contacts/${ENV.portalId}/objects/0-3/views/all/list`);
    await this.waitForPageLoad();
  }
}
