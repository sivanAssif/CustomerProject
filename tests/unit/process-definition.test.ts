import { describe, it, expect } from 'vitest';
import {
  STAGES,
  allDeliverables,
  deliverablesForStage,
  findDeliverable,
  stageOfDeliverable,
  ROLE_LABELS,
  type Role,
} from '@/lib/process-definition';

describe('process-definition structure', () => {
  it('has exactly 3 stages numbered 1..3', () => {
    expect(STAGES).toHaveLength(3);
    expect(STAGES.map((s) => s.number)).toEqual([1, 2, 3]);
  });

  it('only the last stage has no transition condition', () => {
    expect(STAGES[0].transitionCondition).toBeTruthy();
    expect(STAGES[1].transitionCondition).toBeTruthy();
    expect(STAGES[2].transitionCondition).toBeNull();
  });

  it('every deliverable has a unique key', () => {
    const keys = allDeliverables().map((d) => d.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('every deliverable has title, purpose and responsibility', () => {
    for (const d of allDeliverables()) {
      expect(d.title.length, `${d.key} title`).toBeGreaterThan(0);
      expect(d.purpose.length, `${d.key} purpose`).toBeGreaterThan(20);
      expect(d.taskDescription.length, `${d.key} task`).toBeGreaterThan(0);
      expect(d.responsibilityLabel.length, `${d.key} resp`).toBeGreaterThan(0);
      expect(d.assigneeRoles.length, `${d.key} roles`).toBeGreaterThan(0);
    }
  });

  it('template deliverables always have a templateKind; others never do', () => {
    for (const d of allDeliverables()) {
      if (d.type === 'template') {
        expect(d.templateKind, `${d.key}`).toBeDefined();
      } else {
        expect(d.templateKind, `${d.key}`).toBeUndefined();
      }
    }
  });

  it('assignee roles are all valid roles', () => {
    const valid: Role[] = ['pm', 'product', 'dev', 'qa'];
    for (const d of allDeliverables()) {
      for (const r of d.assigneeRoles) {
        expect(valid).toContain(r);
        expect(ROLE_LABELS[r]).toBeTruthy();
      }
    }
  });

  it('dependsOn references existing deliverable keys', () => {
    const keys = new Set(allDeliverables().map((d) => d.key));
    for (const d of allDeliverables()) {
      for (const dep of d.dependsOn ?? []) {
        expect(keys.has(dep), `${d.key} depends on missing ${dep}`).toBe(true);
      }
    }
  });

  it('deliverablesForStage returns only that stage deliverables', () => {
    const s1 = deliverablesForStage(1);
    expect(s1.length).toBeGreaterThan(0);
    for (const d of s1) {
      expect(stageOfDeliverable(d.key)?.number).toBe(1);
    }
    expect(deliverablesForStage(99)).toEqual([]);
  });

  it('findDeliverable locates by key', () => {
    expect(findDeliverable('goals-doc')?.title).toBe('מסמך מטרות');
    expect(findDeliverable('nope')).toBeUndefined();
  });

  it('covers all three deliverable types', () => {
    const types = new Set(allDeliverables().map((d) => d.type));
    expect(types).toEqual(new Set(['template', 'action', 'meeting']));
  });
});
