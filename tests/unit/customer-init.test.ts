import { describe, it, expect } from 'vitest';
import { buildInitialDeliverables } from '@/lib/customer-init';
import { allDeliverables } from '@/lib/process-definition';

describe('buildInitialDeliverables', () => {
  it('creates one row per defined deliverable', () => {
    const rows = buildInitialDeliverables('cust-1');
    expect(rows).toHaveLength(allDeliverables().length);
  });

  it('initializes every row as todo for the given customer', () => {
    const rows = buildInitialDeliverables('cust-1');
    for (const r of rows) {
      expect(r.customerId).toBe('cust-1');
      expect(r.status).toBe('todo');
      expect(r.content).toBeNull();
      expect(r.meetingDate).toBeNull();
    }
  });

  it('covers exactly the defined deliverable keys', () => {
    const rows = buildInitialDeliverables('cust-1');
    expect(new Set(rows.map((r) => r.deliverableKey))).toEqual(
      new Set(allDeliverables().map((d) => d.key))
    );
  });
});
