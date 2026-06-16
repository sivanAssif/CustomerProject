'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getStore, type DeliverableUpdate } from '@/lib/store';
import { evaluateStageGate, nextStageNumber } from '@/lib/gating';

export async function createCustomerAction(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim();
  if (!name) throw new Error('שם לקוח הוא שדה חובה');
  const projectType = String(formData.get('projectType') ?? '').trim() || null;
  const startDate = String(formData.get('startDate') ?? '').trim() || null;

  const customer = await getStore().createCustomer({
    name,
    projectType,
    startDate,
  });
  revalidatePath('/');
  redirect(`/customers/${customer.id}`);
}

export async function updateDeliverableAction(
  customerId: string,
  deliverableKey: string,
  patch: DeliverableUpdate
) {
  await getStore().updateDeliverable(customerId, deliverableKey, patch);
  revalidatePath(`/customers/${customerId}`);
  revalidatePath(`/customers/${customerId}/deliverables/${deliverableKey}`);
}

export async function advanceStageAction(customerId: string, fromStage: number) {
  const store = getStore();
  const deliverables = await store.getDeliverables(customerId);
  const gate = evaluateStageGate(fromStage, deliverables);
  if (!gate.canAdvance) {
    throw new Error('לא ניתן לעבור לשלב הבא — יש תוצרים שטרם הושלמו');
  }
  const next = nextStageNumber(fromStage);
  if (next === null) return;
  await store.setCurrentStage(customerId, next);
  revalidatePath(`/customers/${customerId}`);
}
