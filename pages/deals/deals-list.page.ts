import { Locator, Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { ENV } from '../../utils/env';

export class DealsListPage extends BasePage {
  readonly addDealsButton: Locator;
  readonly createNewButton: Locator;
  readonly searchInput: Locator;
  readonly filterToggleButton: Locator;
  readonly editColumnsButton: Locator;
  readonly selectAllCheckbox: Locator;
  readonly dealsTable: Locator;
  readonly tableViewBoardToggle: Locator;
  readonly dealNameColumnHeader: Locator;
  readonly helpTooltipCloseButton: Locator;
  readonly allDealsTab: Locator;
  readonly myDealsTab: Locator;

  constructor(page: Page) {
    super(page);
    this.addDealsButton = page.getByTestId('create-object-dropdown');
    this.createNewButton = page.getByTestId('create-object-dropdown-create-object');
    // Use the table-level search, not the global HubSpot header search
    this.searchInput = page.locator('[data-selenium-test="search-input"], [placeholder="Search"]').first();
    this.filterToggleButton = page.getByTestId('filter-toggle-button');
    this.editColumnsButton = page.getByRole('button', { name: 'Edit columns' });
    this.selectAllCheckbox = page.getByRole('checkbox', { name: 'Select all records.' });
    this.dealsTable = page.getByRole('table');
    this.tableViewBoardToggle = page.getByRole('button', { name: /Table view|Board view/ });
    this.dealNameColumnHeader = page.getByRole('columnheader', { name: /Deal Name/ });
    this.helpTooltipCloseButton = page.getByTestId('help-tooltip-close-button');
    this.allDealsTab = page.getByRole('button', { name: /All deals/ }).first();
    this.myDealsTab = page.getByRole('button', { name: 'My deals' });
  }

  async open(): Promise<void> {
    await this.navigate(`/contacts/${ENV.portalId}/objects/0-3/views/all/list`);
    await this.waitForPageLoad();
    await this.dismissHelpTooltip();
  }

  async dismissHelpTooltip(): Promise<void> {
    if (await this.helpTooltipCloseButton.isVisible()) {
      await this.helpTooltipCloseButton.click();
    }
  }

  async openCreateDealModal(): Promise<void> {
    await this.addDealsButton.click();
    await this.createNewButton.click();
  }

  async searchDeal(query: string): Promise<void> {
    await this.searchInput.click();
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
  }

  async getDealRowByName(dealName: string): Promise<Locator> {
    return this.page.getByRole('row', { name: new RegExp(dealName) });
  }

  async getDealLinkByName(dealName: string): Promise<Locator> {
    return this.page.getByRole('link', { name: dealName });
  }

  async clickDeal(dealName: string): Promise<void> {
    await this.page.getByRole('link', { name: dealName }).first().click();
  }

  async getDealCount(): Promise<number> {
    const rows = this.page.getByRole('row').filter({ hasNotText: 'Deal Name' });
    return rows.count();
  }

  async sortByDealName(): Promise<void> {
    await this.dealNameColumnHeader.click();
  }

  async selectDealByName(dealName: string): Promise<void> {
    const row = await this.getDealRowByName(dealName);
    await row.getByRole('checkbox').click();
  }

  async switchToBoardView(): Promise<void> {
    await this.navigate(`/contacts/${ENV.portalId}/objects/0-3/views/all/board`);
    await this.waitForPageLoad();
  }
}
