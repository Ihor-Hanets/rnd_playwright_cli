import { test as base } from '@playwright/test';
import { ExamplePage } from '../pages/example.page';
import { DealsListPage } from '../pages/deals/deals-list.page';
import { CreateDealModal } from '../pages/deals/create-deal-modal.page';
import { DealDetailPage } from '../pages/deals/deal-detail.page';
import { DealsBoardPage } from '../pages/deals/deals-board.page';

type Pages = {
  examplePage: ExamplePage;
  dealsListPage: DealsListPage;
  createDealModal: CreateDealModal;
  dealDetailPage: DealDetailPage;
  dealsBoardPage: DealsBoardPage;
};

export const test = base.extend<Pages>({
  examplePage: async ({ page }, use) => {
    await use(new ExamplePage(page));
  },
  dealsListPage: async ({ page }, use) => {
    await use(new DealsListPage(page));
  },
  createDealModal: async ({ page }, use) => {
    await use(new CreateDealModal(page));
  },
  dealDetailPage: async ({ page }, use) => {
    await use(new DealDetailPage(page));
  },
  dealsBoardPage: async ({ page }, use) => {
    await use(new DealsBoardPage(page));
  },
});

export { expect } from '@playwright/test';
