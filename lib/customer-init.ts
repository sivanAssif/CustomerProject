import { allDeliverables } from './process-definition';
import type { CustomerDeliverable } from './types';

/**
 * בונה את רשימת מופעי התוצר ההתחלתית עבור לקוח חדש —
 * שורה אחת לכל תוצר מוגדר בנוהל, במצב 'todo'.
 * פונקציה טהורה (ללא תלות ב-DB) כדי שתהיה ניתנת לבדיקה.
 */
export function buildInitialDeliverables(
  customerId: string
): Omit<CustomerDeliverable, 'id' | 'updatedAt'>[] {
  return allDeliverables().map((d) => ({
    customerId,
    deliverableKey: d.key,
    status: 'todo' as const,
    dueDate: null,
    content: null,
    meetingDate: null,
    note: null,
    fileUrl: null,
  }));
}
