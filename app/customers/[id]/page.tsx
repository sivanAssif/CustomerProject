import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getStore } from '@/lib/store';
import {
  STAGES,
  findDeliverable,
  type Deliverable,
} from '@/lib/process-definition';
import { evaluateStageGate, isStageUnlocked } from '@/lib/gating';
import type { CustomerDeliverable } from '@/lib/types';
import { advanceStageAction } from '@/app/actions';
import { RoleChips } from '@/components/RoleChip';

export const dynamic = 'force-dynamic';

const STATUS_LABELS: Record<string, string> = {
  todo: 'טרם החל',
  in_progress: 'בתהליך',
  done: 'הושלם',
};
const TYPE_LABELS: Record<string, string> = {
  template: 'תוצר',
  action: 'משימה',
  meeting: 'פגישה',
};

function DeliverableRow({
  def,
  instance,
  customerId,
  locked,
}: {
  def: Deliverable;
  instance: CustomerDeliverable | undefined;
  customerId: string;
  locked: boolean;
}) {
  const status = instance?.status ?? 'todo';
  const deps = (def.dependsOn ?? [])
    .map((k) => findDeliverable(k)?.title)
    .filter(Boolean);

  return (
    <div
      className={`card ${status === 'done' ? 'accent' : ''}`}
      style={{ padding: '16px 18px', opacity: locked ? 0.6 : 1 }}
    >
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div style={{ flex: '1 1 auto', minWidth: 0 }}>
          <div className="row" style={{ gap: 8 }}>
            <strong style={{ fontSize: 16 }}>{def.title}</strong>
            <span className="badge type small">{TYPE_LABELS[def.type]}</span>
            <span className={`badge ${status}`}>{STATUS_LABELS[status]}</span>
          </div>
          <div className="muted small" style={{ marginTop: 5 }}>
            {def.taskDescription}
          </div>
          <div className="row small" style={{ marginTop: 10, gap: 12 }}>
            <RoleChips roles={def.assigneeRoles} />
            {instance?.dueDate && (
              <span className="badge tozar">📅 יעד: {instance.dueDate}</span>
            )}
            {def.type === 'meeting' && instance?.meetingDate && (
              <span className="badge tozar">🗓️ פגישה: {instance.meetingDate}</span>
            )}
            {deps.length > 0 && (
              <span className="muted small">↳ תלוי ב: {deps.join(', ')}</span>
            )}
          </div>
        </div>
        <div style={{ flex: 'none' }}>
          {locked ? (
            <span className="muted small">🔒 נעול</span>
          ) : (
            <Link
              href={`/customers/${customerId}/deliverables/${def.key}`}
              className="btn secondary"
            >
              {def.type === 'template' ? 'הגשת תוצר' : 'עדכון'}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function CustomerPage({
  params,
}: {
  params: { id: string };
}) {
  const store = getStore();
  const customer = await store.getCustomer(params.id);
  if (!customer) notFound();
  const deliverables = await store.getDeliverables(params.id);
  const byKey = new Map(deliverables.map((d) => [d.deliverableKey, d]));

  return (
    <main className="container">
      <Link href="/" className="small muted">
        ← חזרה לכל הלקוחות
      </Link>

      <div className="hero" style={{ marginTop: 10 }}>
        <div className="eyebrow">לקוח · נוהל קליטת לקוח חדש</div>
        <h1>{customer.name}</h1>
        <div className="sub">
          {customer.projectType ? `${customer.projectType} · ` : ''}שלב נוכחי{' '}
          {customer.currentStage} מתוך {STAGES.length}
        </div>
        <div className="hero-tabs">
          {STAGES.map((s) => (
            <span
              key={s.key}
              className={`hero-tab ${s.number === customer.currentStage ? 'active' : ''}`}
            >
              <span className="num">{s.number}</span>
              {s.title}
            </span>
          ))}
        </div>
      </div>

      {STAGES.map((stage) => {
        const unlocked = isStageUnlocked(stage.number, customer.currentStage);
        const stageDeliverables = stage.groups.flatMap((g) => g.deliverables);
        const gate = evaluateStageGate(
          stage.number,
          stageDeliverables
            .map((d) => byKey.get(d.key))
            .filter(Boolean) as CustomerDeliverable[]
        );
        const isCurrent = stage.number === customer.currentStage;
        const pct = gate.totalCount
          ? Math.round((gate.completedCount / gate.totalCount) * 100)
          : 0;

        return (
          <section key={stage.key} style={{ marginTop: 34 }}>
            <div className="stage-head">
              <span
                className={`stage-num ${
                  isCurrent ? 'current' : unlocked ? 'other' : 'locked'
                }`}
              >
                {stage.number}
              </span>
              <div>
                <h2>{stage.title}</h2>
                <div className="muted small">{stage.subtitle}</div>
              </div>
            </div>

            <div className="row" style={{ margin: '10px 0 4px', gap: 10 }}>
              <span className="small muted" style={{ flex: 'none' }}>
                הושלמו {gate.completedCount}/{gate.totalCount}
              </span>
              <div className="progress">
                <span style={{ width: `${pct}%` }} />
              </div>
              {!unlocked && (
                <span className="badge todo small">🔒 גלוי לצפייה — נפתח בשלב הקודם</span>
              )}
            </div>

            {stage.groups.map((group) => (
              <div key={group.key} style={{ marginBottom: 14 }}>
                <div className="group-title">{group.title}</div>
                <div className="grid">
                  {group.deliverables.map((def) => (
                    <DeliverableRow
                      key={def.key}
                      def={def}
                      instance={byKey.get(def.key)}
                      customerId={customer.id}
                      locked={!unlocked}
                    />
                  ))}
                </div>
              </div>
            ))}

            {stage.transitionCondition && (
              <div className="card accent-amber" style={{ marginTop: 10 }}>
                <div className="small">
                  <strong>תנאי מעבר לשלב הבא:</strong> {stage.transitionCondition}
                </div>
                {isCurrent ? (
                  <form
                    action={advanceStageAction.bind(null, customer.id, stage.number)}
                    style={{ marginTop: 12 }}
                  >
                    <button className="btn" type="submit" disabled={!gate.canAdvance}>
                      מעבר לשלב {stage.number + 1} →
                    </button>
                    {!gate.canAdvance && (
                      <div className="notice warn" style={{ marginTop: 10 }}>
                        חסר להשלמה: {gate.missingTitles.join(', ')}
                      </div>
                    )}
                  </form>
                ) : (
                  unlocked && (
                    <div className="notice ok" style={{ marginTop: 10 }}>
                      ✓ השלב הושלם
                    </div>
                  )
                )}
              </div>
            )}
          </section>
        );
      })}
    </main>
  );
}
