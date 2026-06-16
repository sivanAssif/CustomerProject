import { STAGES, deliverablesForStage } from './process-definition';
import type { CustomerDeliverable } from './types';

export interface StageGateResult {
  /** האם ניתן לעבור לשלב הבא */
  canAdvance: boolean;
  /** האם זהו השלב האחרון (אין מעבר נוסף) */
  isLastStage: boolean;
  /** מספר התוצרים שהושלמו בשלב */
  completedCount: number;
  /** סך התוצרים בשלב */
  totalCount: number;
  /** רשימת תוצרים שעדיין לא הושלמו (titles) — להצגה למשתמש */
  missingTitles: string[];
  /** תנאי המעבר המילולי של השלב */
  transitionCondition: string | null;
}

/**
 * בודק האם ניתן לעבור משלב נתון לשלב הבא.
 * תנאי: כל התוצרים של השלב במצב 'done'.
 * תנאי המעבר המילולי מוצג למשתמש כתזכורת אך נאכף דרך השלמת התוצרים.
 */
export function evaluateStageGate(
  stageNumber: number,
  deliverables: CustomerDeliverable[]
): StageGateResult {
  const stage = STAGES.find((s) => s.number === stageNumber);
  if (!stage) {
    return {
      canAdvance: false,
      isLastStage: false,
      completedCount: 0,
      totalCount: 0,
      missingTitles: [],
      transitionCondition: null,
    };
  }

  const stageDeliverables = deliverablesForStage(stageNumber);
  const statusByKey = new Map(
    deliverables.map((d) => [d.deliverableKey, d.status])
  );

  const missingTitles: string[] = [];
  let completedCount = 0;

  for (const def of stageDeliverables) {
    const status = statusByKey.get(def.key);
    if (status === 'done') {
      completedCount += 1;
    } else {
      missingTitles.push(def.title);
    }
  }

  const isLastStage = stage.transitionCondition === null;
  const allDone = missingTitles.length === 0 && stageDeliverables.length > 0;

  return {
    canAdvance: allDone && !isLastStage,
    isLastStage,
    completedCount,
    totalCount: stageDeliverables.length,
    missingTitles,
    transitionCondition: stage.transitionCondition,
  };
}

/**
 * האם שלב נתון פתוח למילוי/אישור עבור לקוח.
 * שלב פתוח אם הוא <= השלב הנוכחי של הלקוח.
 * שלבים מאוחרים יותר גלויים לצפייה (read-ahead) אך נעולים למילוי.
 */
export function isStageUnlocked(
  stageNumber: number,
  currentStage: number
): boolean {
  return stageNumber <= currentStage;
}

/**
 * חישוב השלב הבא לאחר מעבר מוצלח. מחזיר null אם אין שלב הבא.
 */
export function nextStageNumber(stageNumber: number): number | null {
  const idx = STAGES.findIndex((s) => s.number === stageNumber);
  if (idx === -1 || idx === STAGES.length - 1) return null;
  return STAGES[idx + 1].number;
}
