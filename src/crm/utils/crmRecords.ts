import { CustomerContact, PipelineStage } from '../types/crm.types';
import { normalizePhoneNumber } from './crmPhoneUtils';

export const ACTIVE_LEAD_STAGES: PipelineStage[] = [
  'new_lead',
  'contacted',
  'consulting',
  'proposal',
  'negotiation'
];

export const PIPELINE_CARD_STAGES: PipelineStage[] = [
  ...ACTIVE_LEAD_STAGES,
  'won',
  'lost'
];

export function isPersonaContact(customer: CustomerContact | null | undefined): boolean {
  if (!customer) return false;
  return (
    customer.source === 'persona' ||
    String(customer.id || '').startsWith('persona-') ||
    (customer.tags || []).includes('پرسونا')
  );
}

export function resolvePipelineStage(customer: CustomerContact): PipelineStage {
  if (isPersonaContact(customer)) return 'directory';
  const stage = customer.pipelineStage as PipelineStage | undefined;
  if (stage && (PIPELINE_CARD_STAGES as string[]).includes(stage)) return stage;
  if (stage === 'directory') return 'directory';
  return 'new_lead';
}

export function isDirectoryContact(customer: CustomerContact): boolean {
  return resolvePipelineStage(customer) === 'directory';
}

export function isOpenLead(customer: CustomerContact): boolean {
  return (ACTIVE_LEAD_STAGES as string[]).includes(resolvePipelineStage(customer));
}

export function isPipelineCard(customer: CustomerContact): boolean {
  return (PIPELINE_CARD_STAGES as string[]).includes(resolvePipelineStage(customer));
}

export function migrateCustomerRecord(customer: CustomerContact): CustomerContact {
  if (isPersonaContact(customer) && customer.pipelineStage !== 'directory') {
    return { ...customer, pipelineStage: 'directory' };
  }
  return customer;
}

export function findContactByPhone(
  customers: CustomerContact[],
  phone: string | undefined | null
): CustomerContact | undefined {
  const normalized = normalizePhoneNumber(phone);
  if (!normalized || normalized.length < 10) return undefined;
  return (customers || []).find((customer) => {
    if (isPersonaContact(customer)) return false;
    return normalizePhoneNumber(customer.phoneNumber) === normalized;
  });
}

export function phonesMatch(a: string | undefined | null, b: string | undefined | null): boolean {
  const left = normalizePhoneNumber(a);
  const right = normalizePhoneNumber(b);
  return Boolean(left && right && left.length >= 10 && left === right);
}

export function isOpenInbound(status?: string): boolean {
  return status === 'new' || status === 'in_progress' || !status;
}
