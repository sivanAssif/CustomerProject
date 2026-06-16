import { describe, it, expect } from 'vitest';
import {
  evaluateStageGate,
  isStageUnlocked,
  nextStageNumber,
} from '@/lib/gating';
import { deliverablesForStage } from '@/lib/process-definition';
import type { CustomerDeliverable, DeliverableStatus } from '@/lib/types';

function makeDeliverables(
  stage: number,
  status: DeliverableStatus
): CustomerDeliverable[] {
  return deliverablesForStage(stage).map((d, i) => ({
    id: `id-${i}`,
    customerId: 'c1',
    deliverableKey: d.key,
    status,
    dueDate: null,
    content: null,
    meetingDate: null,
    note: null,
    fileUrl: null,
    updatedAt: null,
  }));
}

describe('evaluateStageGate', () => {
  it('blocks advancing when no deliverables are done', () => {
    const res = evaluateStageGate(1, makeDeliverables(1, 'todo'));
    expect(res.canAdvance).toBe(false);
    expect(res.completedCount).toBe(0);
    expect(res.missingTitles.length).toBe(res.totalCount);
  });

  it('blocks advancing when some deliverables are still open', () => {
    const dels = makeDeliverables(1, 'done');
    dels[0].status = 'in_progress';
    const res = evaluateStageGate(1, dels);
    expect(res.canAdvance).toBe(false);
    expect(res.missingTitles).toHaveLength(1);
    expect(res.completedCount).toBe(res.totalCount - 1);
  });

  it('allows advancing when all deliverables are done (non-last stage)', () => {
    const res = evaluateStageGate(1, makeDeliverables(1, 'done'));
    expect(res.canAdvance).toBe(true);
    expect(res.missingTitles).toHaveLength(0);
    expect(res.completedCount).toBe(res.totalCount);
    expect(res.transitionCondition).toContain('מטרות');
  });

  it('never allows advancing from the last stage even if all done', () => {
    const res = evaluateStageGate(4, makeDeliverables(4, 'done'));
    expect(res.isLastStage).toBe(true);
    expect(res.canAdvance).toBe(false);
  });

  it('allows advancing from stage 3 (no longer the last stage)', () => {
    const res = evaluateStageGate(3, makeDeliverables(3, 'done'));
    expect(res.isLastStage).toBe(false);
    expect(res.canAdvance).toBe(true);
  });

  it('returns safe defaults for unknown stage', () => {
    const res = evaluateStageGate(99, []);
    expect(res.canAdvance).toBe(false);
    expect(res.totalCount).toBe(0);
  });

  it('treats missing deliverable rows as not done', () => {
    // only the first deliverable exists and is done; the rest are absent
    const all = makeDeliverables(1, 'done');
    const res = evaluateStageGate(1, [all[0]]);
    expect(res.canAdvance).toBe(false);
    expect(res.completedCount).toBe(1);
  });
});

describe('isStageUnlocked', () => {
  it('unlocks current and previous stages, locks future ones', () => {
    expect(isStageUnlocked(1, 2)).toBe(true);
    expect(isStageUnlocked(2, 2)).toBe(true);
    expect(isStageUnlocked(3, 2)).toBe(false);
  });
});

describe('nextStageNumber', () => {
  it('returns the next stage or null at the end', () => {
    expect(nextStageNumber(1)).toBe(2);
    expect(nextStageNumber(2)).toBe(3);
    expect(nextStageNumber(3)).toBe(4);
    expect(nextStageNumber(4)).toBeNull();
    expect(nextStageNumber(99)).toBeNull();
  });
});
