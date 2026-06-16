import type { Role } from './process-definition';

/** סטטוס תוצר במופע של לקוח */
export type DeliverableStatus = 'todo' | 'in_progress' | 'done';

/** מופע תוצר עבור לקוח ספציפי (שורה ב-customer_deliverables) */
export interface CustomerDeliverable {
  id: string;
  customerId: string;
  /** מפתח התוצר מ-process-definition */
  deliverableKey: string;
  status: DeliverableStatus;
  /** תאריך יעד (ISO date) */
  dueDate: string | null;
  /** תוכן הטמפלט (מבנה תלוי-סוג) */
  content: unknown | null;
  /** תאריך הפגישה — מוחצן, רלוונטי ל-type === 'meeting' */
  meetingDate: string | null;
  /** הערה חופשית (למשל למשימות action) */
  note: string | null;
  /** קישור לקובץ שהועלה (upload) */
  fileUrl: string | null;
  updatedAt: string | null;
}

export type CustomerStatus = 'active' | 'on_hold' | 'completed';

export interface Customer {
  id: string;
  name: string;
  projectType: string | null;
  startDate: string | null;
  status: CustomerStatus;
  currentStage: number;
  createdAt: string | null;
}

export interface AppUser {
  id: string;
  email: string;
  fullName: string | null;
  role: Role;
}
