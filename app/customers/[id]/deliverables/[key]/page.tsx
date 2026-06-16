import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getStore } from '@/lib/store';
import {
  findDeliverable,
  stageOfDeliverable,
} from '@/lib/process-definition';
import { isStageUnlocked } from '@/lib/gating';
import DeliverableEditor from '@/components/DeliverableEditor';

export const dynamic = 'force-dynamic';

export default async function DeliverablePage({
  params,
}: {
  params: { id: string; key: string };
}) {
  const def = findDeliverable(params.key);
  if (!def) notFound();

  const store = getStore();
  const customer = await store.getCustomer(params.id);
  if (!customer) notFound();

  const stage = stageOfDeliverable(params.key);
  if (stage && !isStageUnlocked(stage.number, customer.currentStage)) {
    return (
      <main className="container">
        <Link href={`/customers/${params.id}`} className="small muted">
          ← חזרה לתהליך
        </Link>
        <div className="notice warn" style={{ marginTop: 20 }}>
          תוצר זה שייך לשלב {stage.number} שעדיין נעול. ניתן לצפות בו בעמוד התהליך,
          אך מילוי מתאפשר רק כשמגיעים לשלב.
        </div>
      </main>
    );
  }

  const deliverables = await store.getDeliverables(params.id);
  const instance =
    deliverables.find((d) => d.deliverableKey === params.key) ?? null;

  return (
    <main className="container">
      <Link href={`/customers/${params.id}`} className="small muted">
        ← חזרה לתהליך · {customer.name}
      </Link>
      <h1 style={{ marginTop: 8 }}>{def.title}</h1>
      <p className="muted">{def.taskDescription}</p>
      <DeliverableEditor def={def} instance={instance} customerId={customer.id} />
    </main>
  );
}
