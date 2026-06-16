import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getStore } from '@/lib/store';
import {
  STAGES,
  ROLE_LABELS,
  ROLES_LEGEND,
  OVERVIEW_GOAL,
  COMPLETION_NOTE,
  findDeliverable,
  type Deliverable,
} from '@/lib/process-definition';
import { evaluateStageGate, isStageUnlocked } from '@/lib/gating';
import type { CustomerDeliverable } from '@/lib/types';
import { advanceStageAction } from '@/app/actions';
import { RoleChip, ROLE_VAR } from '@/components/RoleChip';
import { Flow } from '@/components/Flow';

export const dynamic = 'force-dynamic';

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
  const check = status === 'done' ? '✓' : status === 'in_progress' ? '◐' : '';

  return (
    <div className="deliv">
      <span className={`check ${status}`}>{check}</span>
      <div className="body">
        <div className="desc">{def.taskDescription}</div>
        {def.subItems && (
          <ul className="subitems">
            {def.subItems.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        )}
        <div className="meta">
          <span className="resp">
            <span
              className="dot"
              style={{ background: ROLE_VAR[def.assigneeRoles[0]] }}
            />
            אחריות: <strong>{def.responsibilityLabel}</strong>
          </span>
          <span className="tozar-pill">◎ תוצר: {def.title}</span>
          {instance?.dueDate && (
            <span className="resp">📅 יעד: {instance.dueDate}</span>
          )}
          {def.type === 'meeting' && instance?.meetingDate && (
            <span className="resp">🗓️ פגישה: {instance.meetingDate}</span>
          )}
          {deps.length > 0 && (
            <span className="resp">↳ תלוי ב: {deps.join(', ')}</span>
          )}
        </div>
      </div>
      <div className="actions">
        {locked ? (
          <span className="muted small">🔒</span>
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

      {/* Hero */}
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

      {/* המטרה */}
      <div className="intro-card">
        <span className="icon">🎯</span>
        <div>
          <h2>המטרה</h2>
          <div>{OVERVIEW_GOAL}</div>
        </div>
      </div>

      {/* בעלי התפקידים */}
      <div className="legend">
        <span className="legend-title">בעלי התפקידים</span>
        {ROLES_LEGEND.map((r) => (
          <RoleChip key={r} role={r} />
        ))}
      </div>

      {/* שלבים */}
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
              <div style={{ flex: '1 1 auto' }}>
                <h2>{stage.heading}</h2>
                <div className="muted small">{stage.subtitle}</div>
              </div>
              <span
                className={`stage-num ${
                  isCurrent ? 'current' : unlocked ? 'other' : 'locked'
                }`}
              >
                {stage.number}
              </span>
            </div>

            <div className="row" style={{ margin: '10px 0 16px', gap: 10 }}>
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
              <div key={group.key} className="group-card">
                <div className="gc-head">
                  <span className="gc-icon">◎</span>
                  <h3>{group.title}</h3>
                </div>
                {group.deliverables.map((def) => (
                  <DeliverableRow
                    key={def.key}
                    def={def}
                    instance={byKey.get(def.key)}
                    customerId={customer.id}
                    locked={!unlocked}
                  />
                ))}
                {group.flow && <Flow nodes={group.flow} />}
              </div>
            ))}

            {stage.transitionCondition ? (
              <div className="card accent-amber" style={{ marginTop: 10 }}>
                <div className="small">
                  <strong>תנאי מעבר: </strong>
                  {stage.transitionCondition}
                </div>
                {isCurrent ? (
                  <form
                    action={advanceStageAction.bind(null, customer.id, stage.number)}
                    style={{ marginTop: 12 }}
                  >
                    <button className="btn" type="submit" disabled={!gate.canAdvance}>
                      {stage.transitionLabel} →
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
            ) : (
              isCurrent && (
                <div className="card accent" style={{ marginTop: 10 }}>
                  <div className="small">
                    <strong>{COMPLETION_NOTE}</strong>
                  </div>
                  {gate.canAdvance === false && gate.missingTitles.length > 0 && (
                    <div className="notice warn" style={{ marginTop: 10 }}>
                      להשלמת הפרויקט חסר: {gate.missingTitles.join(', ')}
                    </div>
                  )}
                  {gate.missingTitles.length === 0 && (
                    <div className="notice ok" style={{ marginTop: 10 }}>
                      ✓ הנוהל הושלם במלואו
                    </div>
                  )}
                </div>
              )
            )}
          </section>
        );
      })}
    </main>
  );
}
