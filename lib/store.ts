import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { randomUUID } from 'node:crypto';
import { getSupabase, isSupabaseConfigured } from './supabase';
import { buildInitialDeliverables } from './customer-init';
import type {
  Customer,
  CustomerDeliverable,
  DeliverableStatus,
} from './types';

export interface DeliverableUpdate {
  status?: DeliverableStatus;
  dueDate?: string | null;
  content?: unknown | null;
  meetingDate?: string | null;
  note?: string | null;
  fileUrl?: string | null;
}

export interface DataStore {
  listCustomers(): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | null>;
  createCustomer(input: {
    name: string;
    projectType?: string | null;
    startDate?: string | null;
  }): Promise<Customer>;
  setCurrentStage(id: string, stage: number): Promise<void>;
  getDeliverables(customerId: string): Promise<CustomerDeliverable[]>;
  updateDeliverable(
    customerId: string,
    deliverableKey: string,
    patch: DeliverableUpdate
  ): Promise<CustomerDeliverable>;
}

// ── מימוש מבוסס קובץ JSON (מצב דמו מקומי, ללא Supabase) ──────────
interface FileDB {
  customers: Customer[];
  deliverables: CustomerDeliverable[];
}

// בסביבה ללא כתיבה לתיקיית הפרויקט (כמו Vercel) כותבים לתיקייה זמנית.
// הערה: על Vercel האחסון הזמני אינו מתמיד — לפרודקשן יש להגדיר Supabase.
const DB_PATH = process.env.VERCEL
  ? path.join(os.tmpdir(), 'tb-onboarding-db.json')
  : path.join(process.cwd(), '.data', 'db.json');

async function readFileDB(): Promise<FileDB> {
  try {
    const raw = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(raw) as FileDB;
  } catch {
    return { customers: [], deliverables: [] };
  }
}

async function writeFileDB(db: FileDB): Promise<void> {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
}

class FileStore implements DataStore {
  async listCustomers(): Promise<Customer[]> {
    const db = await readFileDB();
    return [...db.customers].sort((a, b) =>
      (b.createdAt ?? '').localeCompare(a.createdAt ?? '')
    );
  }

  async getCustomer(id: string): Promise<Customer | null> {
    const db = await readFileDB();
    return db.customers.find((c) => c.id === id) ?? null;
  }

  async createCustomer(input: {
    name: string;
    projectType?: string | null;
    startDate?: string | null;
  }): Promise<Customer> {
    const db = await readFileDB();
    const now = new Date().toISOString();
    const customer: Customer = {
      id: randomUUID(),
      name: input.name,
      projectType: input.projectType ?? null,
      startDate: input.startDate ?? null,
      status: 'active',
      currentStage: 1,
      createdAt: now,
    };
    db.customers.push(customer);
    for (const seed of buildInitialDeliverables(customer.id)) {
      db.deliverables.push({ ...seed, id: randomUUID(), updatedAt: now });
    }
    await writeFileDB(db);
    return customer;
  }

  async setCurrentStage(id: string, stage: number): Promise<void> {
    const db = await readFileDB();
    const c = db.customers.find((x) => x.id === id);
    if (c) {
      c.currentStage = stage;
      await writeFileDB(db);
    }
  }

  async getDeliverables(customerId: string): Promise<CustomerDeliverable[]> {
    const db = await readFileDB();
    return db.deliverables.filter((d) => d.customerId === customerId);
  }

  async updateDeliverable(
    customerId: string,
    deliverableKey: string,
    patch: DeliverableUpdate
  ): Promise<CustomerDeliverable> {
    const db = await readFileDB();
    const d = db.deliverables.find(
      (x) => x.customerId === customerId && x.deliverableKey === deliverableKey
    );
    if (!d) throw new Error('Deliverable not found');
    Object.assign(d, patch);
    d.updatedAt = new Date().toISOString();
    await writeFileDB(db);
    return d;
  }
}

// ── מימוש מבוסס Supabase ─────────────────────────────────────────
function rowToCustomer(r: Record<string, unknown>): Customer {
  return {
    id: r.id as string,
    name: r.name as string,
    projectType: (r.project_type as string) ?? null,
    startDate: (r.start_date as string) ?? null,
    status: r.status as Customer['status'],
    currentStage: r.current_stage as number,
    createdAt: (r.created_at as string) ?? null,
  };
}

function rowToDeliverable(r: Record<string, unknown>): CustomerDeliverable {
  return {
    id: r.id as string,
    customerId: r.customer_id as string,
    deliverableKey: r.deliverable_key as string,
    status: r.status as DeliverableStatus,
    dueDate: (r.due_date as string) ?? null,
    content: r.content ?? null,
    meetingDate: (r.meeting_date as string) ?? null,
    note: (r.note as string) ?? null,
    fileUrl: (r.file_url as string) ?? null,
    updatedAt: (r.updated_at as string) ?? null,
  };
}

class SupabaseStore implements DataStore {
  private get sb() {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase not configured');
    return sb;
  }

  async listCustomers(): Promise<Customer[]> {
    const { data, error } = await this.sb
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(rowToCustomer);
  }

  async getCustomer(id: string): Promise<Customer | null> {
    const { data, error } = await this.sb
      .from('customers')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToCustomer(data) : null;
  }

  async createCustomer(input: {
    name: string;
    projectType?: string | null;
    startDate?: string | null;
  }): Promise<Customer> {
    const { data, error } = await this.sb
      .from('customers')
      .insert({
        name: input.name,
        project_type: input.projectType ?? null,
        start_date: input.startDate ?? null,
      })
      .select('*')
      .single();
    if (error) throw error;
    const customer = rowToCustomer(data);
    const seeds = buildInitialDeliverables(customer.id).map((s) => ({
      customer_id: s.customerId,
      deliverable_key: s.deliverableKey,
      status: s.status,
    }));
    const { error: insErr } = await this.sb
      .from('customer_deliverables')
      .insert(seeds);
    if (insErr) throw insErr;
    return customer;
  }

  async setCurrentStage(id: string, stage: number): Promise<void> {
    const { error } = await this.sb
      .from('customers')
      .update({ current_stage: stage })
      .eq('id', id);
    if (error) throw error;
  }

  async getDeliverables(customerId: string): Promise<CustomerDeliverable[]> {
    const { data, error } = await this.sb
      .from('customer_deliverables')
      .select('*')
      .eq('customer_id', customerId);
    if (error) throw error;
    return (data ?? []).map(rowToDeliverable);
  }

  async updateDeliverable(
    customerId: string,
    deliverableKey: string,
    patch: DeliverableUpdate
  ): Promise<CustomerDeliverable> {
    const dbPatch: Record<string, unknown> = {};
    if (patch.status !== undefined) dbPatch.status = patch.status;
    if (patch.dueDate !== undefined) dbPatch.due_date = patch.dueDate;
    if (patch.content !== undefined) dbPatch.content = patch.content;
    if (patch.meetingDate !== undefined) dbPatch.meeting_date = patch.meetingDate;
    if (patch.note !== undefined) dbPatch.note = patch.note;
    if (patch.fileUrl !== undefined) dbPatch.file_url = patch.fileUrl;
    const { data, error } = await this.sb
      .from('customer_deliverables')
      .update(dbPatch)
      .eq('customer_id', customerId)
      .eq('deliverable_key', deliverableKey)
      .select('*')
      .single();
    if (error) throw error;
    return rowToDeliverable(data);
  }
}

let store: DataStore | null = null;

/** מחזיר את שכבת הנתונים הפעילה (Supabase אם מוגדר, אחרת קובץ מקומי). */
export function getStore(): DataStore {
  if (!store) {
    store = isSupabaseConfigured ? new SupabaseStore() : new FileStore();
  }
  return store;
}
