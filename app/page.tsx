import Link from 'next/link';
import { getStore } from '@/lib/store';
import { STAGES } from '@/lib/process-definition';
import NewCustomerButton from '@/components/NewCustomerButton';

export const dynamic = 'force-dynamic';

const STATUS_LABELS: Record<string, string> = {
  active: 'פעיל',
  on_hold: 'בהמתנה',
  completed: 'הושלם',
};

export default async function DashboardPage() {
  const customers = await getStore().listCustomers();
  const lastStage = STAGES[STAGES.length - 1].number;
  const total = customers.length;
  const completed = customers.filter(
    (c) => c.currentStage >= lastStage || c.status === 'completed'
  ).length;
  const active = customers.filter((c) => c.status === 'active').length;

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

      {/* סטטיסטיקות */}
      <div className="stats">
        <div className="stat">
          <div className="stat-num">{total}</div>
          <div className="stat-label">לקוחות בתהליך</div>
        </div>
        <div className="stat">
          <div className="stat-num">{active}</div>
          <div className="stat-label">פעילים</div>
        </div>
        <div className="stat">
          <div className="stat-num">{completed}</div>
          <div className="stat-label">הושלמו</div>
        </div>
        <div className="stat">
          <div className="stat-num">{STAGES.length}</div>
          <div className="stat-label">שלבים בנוהל</div>
        </div>
      </div>

      {/* כותרת רשימה + כפתור */}
      <div
        className="row"
        style={{ justifyContent: 'space-between', margin: '8px 0 16px' }}
      >
        <h2 style={{ margin: 0, fontSize: 22 }}>הלקוחות שלי</h2>
        <NewCustomerButton />
      </div>

      {customers.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 40, marginBottom: 8 }}>📋</div>
          <h3 style={{ margin: '0 0 6px' }}>אין עדיין לקוחות</h3>
          <p className="muted" style={{ margin: '0 0 16px' }}>
            צרו לקוח חדש כדי להתחיל לעקוב אחרי נוהל הקליטה.
          </p>
          <NewCustomerButton />
        </div>
      ) : (
        <div className="grid">
          {customers.map((c) => {
            const stage = STAGES.find((s) => s.number === c.currentStage);
            const pct = Math.round((c.currentStage / STAGES.length) * 100);
            return (
              <Link
                key={c.id}
                href={`/customers/${c.id}`}
                className="card customer-card"
              >
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <div>
                    <strong style={{ fontSize: 18 }}>{c.name}</strong>
                    {c.projectType && (
                      <span className="muted small"> · {c.projectType}</span>
                    )}
                  </div>
                  <span className="badge type">
                    שלב {c.currentStage}/{STAGES.length}: {stage?.title}
                  </span>
                </div>
                <div className="progress" style={{ margin: '12px 0 8px' }}>
                  <span style={{ width: `${pct}%` }} />
                </div>
                <div className="muted small">
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
