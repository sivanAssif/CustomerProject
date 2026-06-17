/**
 * יוצר לקוח לדוגמה "Acme Travel" שעבר את כל 4 השלבים, עם תוכן לדוגמה בכל תוצר.
 * הרצה:  node scripts/seed-demo.mjs
 * קורא את מפתחות Supabase מ-.env.local.
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import path from 'node:path';

// קריאת .env.local
const env = {};
try {
  const raw = readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
} catch {}

const URL = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!URL || !KEY) {
  console.error('חסרים מפתחות Supabase ב-.env.local');
  process.exit(1);
}
const sb = createClient(URL, KEY);

// תוכן לדוגמה לכל תוצר (key → {content, note, fileUrl, meetingDate, dueDate})
const meeting = (participants, topics, decisions, actions) => ({
  content: { participants, topics, decisions, actions },
});

const DEMO = {
  'goals-doc': {
    content: {
      business: 'הגדלת היקף ההזמנות הסיטונאיות ב-30% תוך שנה וקיצור זמן הפקת הזמנה.',
      expectations: 'מערכת אחת שמרכזת הזמנות, מלאי ותשלומים מול הספקים.',
      scope: 'כלול: מודול הזמנות, אינטגרציית ספקים. לא כלול: אפליקציית מובייל ללקוח הקצה.',
    },
  },
  'kpis-table': {
    content: {
      rows: [
        { metric: 'זמן הפקת הזמנה', target: 'מתחת ל-5 דק׳', measurement: 'ממוצע חודשי במערכת' },
        { metric: 'שיעור שגיאות בהזמנות', target: 'מתחת ל-2%', measurement: 'דוח BI שבועי' },
        { metric: 'שביעות רצון ספקים', target: '85%+', measurement: 'סקר רבעוני' },
      ],
    },
  },
  'processes-doc': {
    content: {
      current: 'הזמנות מתקבלות במייל ומוזנות ידנית לאקסל; תיאום מלאי טלפוני.',
      pain: 'כפילויות, טעויות הקלדה, חוסר נראות על מצב המלאי בזמן אמת.',
      desired: 'קליטת הזמנה אוטומטית, עדכון מלאי מיידי, התראות חוסרים.',
    },
  },
  'workspace-env': { content: null, note: 'DB ייעודי ללקוחות סיטונאיים הוקם והופרד מסביבת הליבה.' },
  'mapping-doc': {
    content: {
      processes: 'קליטת הזמנה → בדיקת מלאי → אישור → הפקת תעודת משלוח → חיוב.',
      modules: 'הזמנות, מלאי, תשלומים, דוחות BI, אוטומציות התראה.',
    },
  },
  'gaps-table': {
    content: {
      rows: [
        { need: 'עדכון מלאי בזמן אמת', current: 'עדכון ידני יומי', gap: 'נדרש סנכרון אוטומטי', severity: 'גבוהה' },
        { need: 'התראות חוסרים', current: 'לא קיים', gap: 'פיתוח מנגנון התראות', severity: 'בינונית' },
      ],
    },
  },
  'doc-requirements': {
    content: {
      docs: 'מדריך משתמש למזמין, נוהל טיפול בחריגות.',
      training: 'הדרכה לצוות התפעול (2 מפגשים) + סרטון קצר לספקים.',
    },
  },
  'dev-list': {
    content: {
      items: [
        { title: 'סנכרון מלאי אוטומטי מול ERP', estimate: '12 ימי פיתוח', owner: 'צוות אינטגרציות' },
        { title: 'מנגנון התראות חוסרים', estimate: '5 ימי פיתוח', owner: 'צוות מוצר' },
        { title: 'דוח BI הזמנות סיטונאיות', estimate: '4 ימי פיתוח', owner: 'צוות BI' },
      ],
    },
  },
  'work-plan': {
    content: {
      milestones: 'שבוע 1-2: אינטגרציית מלאי · שבוע 3: התראות · שבוע 4: דוחות · שבוע 5: בדיקות.',
      sequence: 'סנכרון המלאי חוסם את ההתראות; הדוחות עצמאיים וניתנים לפיתוח במקביל.',
    },
  },
  'client-tasks': {
    content: {
      items: [
        { title: 'אספקת קובץ ספקים מעודכן', due: '2026-05-10' },
        { title: 'מינוי איש קשר טכני מצד הלקוח', due: '2026-05-05' },
      ],
    },
  },
  'responsibility-matrix': {
    content: {
      rows: [
        { topic: 'תקלות מערכת', contact: 'דנה לוי', role: 'תמיכה' },
        { topic: 'פיתוחים', contact: 'יואב כהן', role: 'מנהל פיתוח' },
        { topic: 'פערים ודרישות', contact: 'מאיה ברק', role: 'מוצר' },
      ],
    },
  },
  // שלב 2
  'present-client': {
    meetingDate: '2026-05-12',
    ...meeting('מנהל פרויקט, מוצר, פיתוח, QA, נציג לקוח', 'הצגת הלקוח ותהליכי העבודה', 'כולם מיישרים קו על היקף הפעילות', 'מוצר יכין מסמך תהליכים מורחב'),
  },
  'present-solutions': {
    meetingDate: '2026-05-12',
    ...meeting('מנהל פרויקט, מוצר, פיתוח', 'סקירת הפתרונות שהוצעו ללקוח', 'נבחר פתרון אינטגרציה ישירה מול ERP', 'פיתוח יבדוק היתכנות API'),
  },
  'gantt': {
    content: {
      gantt: 'https://example.com/acme-gantt',
      milestones: 'פיתוחי גלאור (5 שבועות), הזנת נתונים (שבוע), הדרכות (3 ימים), עלייה לאוויר 2026-06-15.',
    },
  },
  'risks-table': {
    content: {
      rows: [
        { risk: 'עיכוב באספקת נתוני ספקים', impact: 'דחיית עלייה לאוויר', mitigation: 'תזכורת שבועית + תאריך יעד מחייב', owner: 'מנהל הפרויקט' },
        { risk: 'תהליך תשלומים חדש לא מבוסס', impact: 'באגים בלייב', mitigation: 'בדיקות UAT מורחבות', owner: 'QA' },
      ],
    },
  },
  // שלב 3
  'asana-board': {
    content: { link: 'https://app.asana.com/acme-wholesale', cadence: 'פגישת סטטוס כל יום ראשון 10:00 + סיכום שבועי במייל.' },
  },
  'functional-tests': {
    content: {
      scope: 'נבדקו: קליטת הזמנה, עדכון מלאי, התראות, הפקת דוחות.',
      results: 'כל התהליכים הקריטיים עברו. 3 תקלות מינוריות תוקנו.',
      issues: 'אין תקלות פתוחות חוסמות.',
    },
  },
  'client-env-tests': {
    content: {
      env: 'נבדק בסביבת הלקוח עם נתוני אמת של 50 ספקים.',
      results: 'התגלה פער בפורמט קובץ ספק אחד — תוקן.',
    },
  },
  'uat-env': { content: null, note: 'סביבת UAT זהה ללייב הוקמה ואושרה.' },
  'uat-report': {
    content: {
      scope: 'מעבר מלא על כל תהליכי העבודה הקריטיים בסביבת UAT.',
      result: 'כל התהליכים עברו בהצלחה. אושר להמשך.',
    },
  },
  'bug-list': {
    content: {
      items: [
        { bug: 'תצוגת מלאי שלילי במקרה קצה', decision: 'ניתן לטיפול לאחר' },
        { bug: 'אי-שליחת התראה בחוסר חלקי', decision: 'חוסם עלייה' },
      ],
    },
  },
  'golive-approval': { content: null, note: 'QA ומנהל הפרויקט אישרו עלייה לאוויר בתאריך 2026-06-15.' },
  // שלב 4
  'retro-meeting': {
    meetingDate: '2026-07-20',
    ...meeting('כל בעלי התפקידים שהיו מעורבים', 'סיכום הפרויקט וחווית הלקוח בשטח', 'הלקוח עובד עצמאית; פניות התמיכה נמוכות', 'לעדכן את הנוהל בהתאם לתובנות'),
  },
  'summary-presentation': {
    fileUrl: 'https://example.com/acme-summary.pptx',
    note: 'מצגת סיכום הוצגה להנהלה.',
  },
  'insights-list': {
    content: {
      items: [
        { title: 'פגישת יישור קו מוקדמת חסכה אי-הבנות רבות' },
        { title: 'בדיקות בסביבת לקוח אמיתית תפסו פערים קריטיים' },
      ],
    },
  },
  'improvements-list': {
    content: {
      items: [
        { title: 'להגדיר תאריך יעד מחייב לאספקת נתונים מהלקוח', area: 'לוחות זמנים' },
        { title: 'להוסיף תבנית קבועה לדוח בדיקות', area: 'תיעוד' },
      ],
    },
  },
  'updated-procedure': { content: null, note: 'הנוהל הפנימי עודכן בהתאם לתובנות הפרויקט.' },
};

async function main() {
  // מחיקת לקוח לדוגמה קיים
  await sb.from('customers').delete().eq('name', 'Acme Travel — לדוגמה');

  const { data: customer, error } = await sb
    .from('customers')
    .insert({
      name: 'Acme Travel — לדוגמה',
      project_type: 'הטמעה + אינטגרציה',
      start_date: '2026-05-01',
      status: 'completed',
      current_stage: 4,
    })
    .select('*')
    .single();
  if (error) {
    console.error('שגיאה ביצירת לקוח:', error.message);
    if (error.message.includes('current_stage')) {
      console.error('\n>>> צריך להריץ קודם את ה-ALTER להרחבת המגבלה ל-4 שלבים (supabase/migrations/0003_stage4.sql)');
    }
    process.exit(1);
  }
  console.log('נוצר לקוח לדוגמה:', customer.id);

  const rows = Object.entries(DEMO).map(([key, d]) => ({
    customer_id: customer.id,
    deliverable_key: key,
    status: 'done',
    content: d.content ?? null,
    note: d.note ?? null,
    file_url: d.fileUrl ?? null,
    meeting_date: d.meetingDate ?? null,
    due_date: d.dueDate ?? null,
  }));

  const { error: insErr } = await sb.from('customer_deliverables').insert(rows);
  if (insErr) {
    console.error('שגיאה בהכנסת תוצרים:', insErr.message);
    process.exit(1);
  }
  console.log(`הוכנסו ${rows.length} תוצרים עם תוכן לדוגמה. ✅`);
}

main();
