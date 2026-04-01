import { FrameLocator, Locator, Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { DealData } from '../../data/deals';

export class CreateDealModal extends BasePage {
  private readonly iframeLocator: FrameLocator;

  readonly dealNameInput: Locator;
  readonly pipelineButton: Locator;
  readonly dealStageButton: Locator;
  readonly amountInput: Locator;
  readonly closeDateInput: Locator;
  readonly dealOwnerButton: Locator;
  readonly dealTypeButton: Locator;
  readonly priorityButton: Locator;
  readonly createButton: Locator;
  readonly createAndAddAnotherButton: Locator;
  readonly cancelButton: Locator;
  readonly closeButton: Locator;
  readonly heading: Locator;
  readonly contactSearchButton: Locator;
  readonly companySearchButton: Locator;

  constructor(page: Page) {
    super(page);
    this.iframeLocator = page.frameLocator('[data-test-id="object-builder-ui-iframe"]');

    this.dealNameInput = this.iframeLocator.getByTestId('dealname-input');
    this.pipelineButton = this.iframeLocator.getByTestId('pipeline-input');
    this.dealStageButton = this.iframeLocator.getByTestId('dealstage-input');
    this.amountInput = this.iframeLocator.locator('[data-test-id="amount-input"], [name="amount"]').first();
    this.closeDateInput = this.iframeLocator.getByLabel('Close date');
    this.dealOwnerButton = this.iframeLocator.getByTestId('hubspot_owner_id-input');
    this.dealTypeButton = this.iframeLocator.getByTestId('dealtype-input');
    this.priorityButton = this.iframeLocator.getByTestId('hs_priority-input');
    this.createButton = this.iframeLocator.getByTestId('create-button');
    this.createAndAddAnotherButton = this.iframeLocator.getByRole('button', { name: 'Create and add another' });
    this.cancelButton = this.iframeLocator.getByRole('button', { name: 'Cancel' });
    this.closeButton = page.frameLocator('[data-test-id="object-builder-ui-iframe"]').getByRole('button', { name: 'Close' });
    this.heading = page.frameLocator('[data-test-id="object-builder-ui-iframe"]').getByRole('heading', { name: 'Create Deal', level: 2 });
    this.contactSearchButton = this.iframeLocator.getByRole('button', { name: 'Contact Search' });
    this.companySearchButton = this.iframeLocator.getByRole('button', { name: 'Company Search' });
  }

  async open(): Promise<void> {
    await this.page.getByTestId('create-object-dropdown').click();
    await this.page.getByTestId('create-object-dropdown-create-object').click();
    await this.heading.waitFor({ state: 'visible' });
  }

  async fillDealName(name: string): Promise<void> {
    await this.dealNameInput.fill(name);
  }

  async selectDealStage(stage: string): Promise<void> {
    await this.dealStageButton.click();
    await this.iframeLocator.getByRole('option', { name: stage }).first().click();
  }

  async fillAmount(amount: string): Promise<void> {
    await this.amountInput.fill(amount);
  }

  async fillCloseDate(date: string): Promise<void> {
    await this.closeDateInput.fill(date);
  }

  async create(dealData: DealData): Promise<void> {
    await this.fillDealName(dealData.name);

    if (dealData.dealStage) {
      await this.selectDealStage(dealData.dealStage);
    }

    if (dealData.amount) {
      await this.amountInput.fill(dealData.amount);
    }

    if (dealData.closeDate) {
      await this.closeDateInput.fill(dealData.closeDate);
      await this.closeDateInput.press('Escape');
    }

    await this.createButton.click();
  }

  async createAndAddAnother(dealData: DealData): Promise<void> {
    await this.fillDealName(dealData.name);

    if (dealData.dealStage) {
      await this.selectDealStage(dealData.dealStage);
    }

    await this.createAndAddAnotherButton.click();
  }

  async selectContact(name = ''): Promise<void> {
    await this.contactSearchButton.click();
    if (name) {
      await this.iframeLocator.getByRole('combobox', { name: 'Search' }).fill(name);
    }
    const firstOption = this.iframeLocator.getByRole('listbox').getByRole('option').first();
    await firstOption.waitFor({ state: 'visible' });
    await firstOption.click();
  }

  async selectCompany(name = ''): Promise<void> {
    await this.companySearchButton.click();
    if (name) {
      await this.iframeLocator.getByRole('combobox', { name: 'Search' }).fill(name);
    }
    const firstOption = this.iframeLocator.getByRole('listbox').getByRole('option').first();
    await firstOption.waitFor({ state: 'visible' });
    await firstOption.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
