export interface DealData {
  name: string;
  pipeline?: string;
  dealStage?: string;
  amount?: string;
  closeDate?: string;
  dealType?: string;
  priority?: string;
}

export const DEAL_STAGES = {
  APPOINTMENT_SCHEDULED: 'Appointment Scheduled',
  QUALIFIED_TO_BUY: 'Qualified To Buy',
  PRESENTATION_SCHEDULED: 'Presentation Scheduled',
  DECISION_MAKER_BOUGHT_IN: 'Decision Maker Bought-In',
  CONTRACT_SENT: 'Contract Sent',
  CLOSED_WON: 'Closed Won',
  CLOSED_LOST: 'Closed Lost',
} as const;

export const PIPELINES = {
  SALES: 'Sales Pipeline',
} as const;

export function generateDealName(prefix = 'QA Test Deal'): string {
  return `${prefix} ${Date.now()}`;
}
