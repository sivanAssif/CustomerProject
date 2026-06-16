import Link from 'next/link';
import { getStore } from '@/lib/store';
import { createCustomerAction } from './actions';
import { STAGES } from '@/lib/process-definition';

export const dynamic = 'force-dynamic';

const STATUS_LABELS: Record<string, string> = {
  active: 'פעיל',
  on_hold: 'בהמתנה',
  completed: 'הושלם',
};

export default async function DashboardPage() {
  const customers = await getStore().listCustomers();

  return (
    <main className="container">
      <div className="hero">
        <div className="eyebrow">תהליך פנימי · גלאור / TravelBooster</div>
        <h1>נוהל קליטת לקוח חדש</h1>
        <div className="sub">
          ניהול ומעקב אחר התהליך — מההכנה ועד העלייה לאוויר. כל לקוח, כל תוצר, כל
          אחריות במקום אחד.
        </div>
      </div>

      <div className="card accent" style={{ margin: '0 0 24px' }}>
        <h2 style={{ fontSize: 18 }}>לקוח חדש</h2>
        <form action={createCustomerAction}>
          <div className="row" style={{ alignItems: 'flex-end' }}>
            <div className="field" style={{ flex: '1 1 240px', marginBottom: 0 }}>
              <label htmlFor="name">שם לקוח *</label>
              <input id="name" name="name" className="input" required />
            </div>
            <div className="field" style={{ flex: '1 1 200px', marginBottom: 0 }}>
              <label htmlFor="projectType">סוג פרויקט</label>
              <input
                id="projectType"
                name="projectType"
                className="input"
                placeholder="הטמעה / אינטגרציה / ..."
              />
            </div>
            <div className="field" style={{ flex: '0 1 160px', marginBottom: 0 }}>
              <label htmlFor="startDate">תאריך התחלה</label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                className="input"
              />
            </div>
            <button className="btn" type="submit">
              + צור לקוח
            </button>
          </div>
        </form>
      </div>

      {customers.length === 0 ? (
        <div className="card muted">אין עדיין לקוחות. צרו לקוח חדש כדי להתחיל.</div>
      ) : (
        <div className="grid">
          {customers.map((c) => {
            const stage = STAGES.find((s) => s.number === c.currentStage);
            return (
              <Link
                key={c.id}
                href={`/customers/${c.id}`}
                className="card"
                style={{ display: 'block', color: 'inherit' }}
              >
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <div>
                    <strong style={{ fontSize: 17 }}>{c.name}</strong>
                    {c.projectType && (
                      <span className="muted small"> · {c.projectType}</span>
                    )}
                  </div>
                  <span className="badge type">
                    שלב {c.currentStage}: {stage?.title}
                  </span>
                </div>
                <div className="muted small" style={{ marginTop: 6 }}>
                  סטטוס: {STATUS_LABELS[c.status]}
                  {c.startDate ? ` · התחלה: ${c.startDate}` : ''}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
