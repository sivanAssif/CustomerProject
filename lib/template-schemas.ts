/**
 * מיפוי טמפלט ייחודי לכל תוצר.
 * מגדיר את השדות/עמודות הספציפיים לכל תוצר, מעבר לסוג הגנרי.
 * מקור האמת למבנה דפי המילוי.
 */

/** עמודה בטבלה / שדה בפריט רשימה */
export interface ColumnDef {
  key: string;
  label: string;
  /** סוג שדה הקלט */
  kind?: 'text' | 'textarea' | 'date' | 'select';
  options?: string[];
}

/** סעיף במסמך (doc) */
export interface SectionDef {
  key: string;
  label: string;
  placeholder?: string;
}

export interface TableSchema {
  columns: ColumnDef[];
}
export interface ListSchema {
  itemFields: ColumnDef[];
}
export interface DocSchema {
  sections: SectionDef[];
}
export interface MeetingSchema {
  sections: SectionDef[];
}

/** סכמת doc לכל תוצר doc (אם לא מוגדר — סעיף תוכן יחיד) */
export const DOC_SCHEMAS: Record<string, DocSchema> = {
  'goals-doc': {
    sections: [
      { key: 'business', label: 'מטרות עסקיות', placeholder: 'מה הלקוח רוצה להשיג מבחינה עסקית?' },
      { key: 'expectations', label: 'ציפיות הלקוח', placeholder: 'מה הלקוח מצפה לקבל מהמערכת?' },
      { key: 'scope', label: 'גבולות הפרויקט (In/Out)', placeholder: 'מה כלול ומה אינו כלול בפרויקט?' },
    ],
  },
  'processes-doc': {
    sections: [
      { key: 'current', label: 'תהליכי העבודה הנוכחיים של הלקוח', placeholder: 'איך הלקוח עובד היום?' },
      { key: 'pain', label: 'נקודות כאב', placeholder: 'אילו קשיים קיימים בתהליך הנוכחי?' },
      { key: 'desired', label: 'התהליך הרצוי', placeholder: 'איך התהליך אמור להיראות במערכת?' },
    ],
  },
  'mapping-doc': {
    sections: [
      { key: 'processes', label: 'תהליכים למימוש במערכת', placeholder: 'פירוט התהליכים שיש לתמוך בהם' },
      { key: 'modules', label: 'מודולים רלוונטיים', placeholder: 'אילו מודולים במערכת נדרשים?' },
    ],
  },
  'doc-requirements': {
    sections: [
      { key: 'docs', label: 'דרישות תיעוד', placeholder: 'איזה תיעוד יידרש?' },
      { key: 'training', label: 'דרישות הדרכה', placeholder: 'אילו הדרכות יידרשו ולמי?' },
    ],
  },
  'work-plan': {
    sections: [
      { key: 'milestones', label: 'אבני דרך', placeholder: 'אבני הדרך המרכזיות ולוחות הזמנים' },
      { key: 'sequence', label: 'סדר ביצוע ותלויות', placeholder: 'מה תלוי במה ובאיזה סדר' },
    ],
  },
  'asana-board': {
    sections: [
      { key: 'link', label: 'קישור לבוארד Asana', placeholder: 'https://app.asana.com/...' },
      { key: 'cadence', label: 'מקצב פגישות הסטטוס', placeholder: 'למשל: כל יום ראשון 10:00' },
    ],
  },
  'functional-tests': {
    sections: [
      { key: 'scope', label: 'היקף הבדיקות', placeholder: 'אילו תהליכים נבדקו?' },
      { key: 'results', label: 'תוצאות', placeholder: 'סיכום תוצאות הבדיקות' },
      { key: 'issues', label: 'תקלות שנמצאו', placeholder: 'רשימת תקלות פתוחות' },
    ],
  },
  'client-env-tests': {
    sections: [
      { key: 'env', label: 'תיאור הסביבה', placeholder: 'פרטי סביבת הלקוח שנבדקה' },
      { key: 'results', label: 'תוצאות', placeholder: 'סיכום תוצאות הבדיקות בסביבת הלקוח' },
    ],
  },
  gantt: {
    sections: [
      { key: 'gantt', label: 'קישור לגאנט / לוח זמנים', placeholder: 'קישור או תיאור לוחות הזמנים' },
      { key: 'milestones', label: 'אבני דרך מרכזיות', placeholder: 'פיתוחים, הזנת נתונים, הדרכות, עלייה לאוויר...' },
    ],
  },
  'uat-report': {
    sections: [
      { key: 'scope', label: 'תהליכים שנבדקו ב-UAT', placeholder: 'אילו תהליכים קריטיים נבדקו?' },
      { key: 'result', label: 'תוצאה', placeholder: 'סיכום תוצאות ה-UAT' },
    ],
  },
};

/** סכמת טבלה לכל תוצר table */
export const TABLE_SCHEMAS: Record<string, TableSchema> = {
  'kpis-table': {
    columns: [
      { key: 'metric', label: 'מדד' },
      { key: 'target', label: 'יעד' },
      { key: 'measurement', label: 'אופן מדידה' },
    ],
  },
  'gaps-table': {
    columns: [
      { key: 'need', label: 'צורך הלקוח' },
      { key: 'current', label: 'מצב במערכת היום' },
      { key: 'gap', label: 'הפער' },
      { key: 'severity', label: 'חומרה', kind: 'select', options: ['נמוכה', 'בינונית', 'גבוהה'] },
    ],
  },
  'risks-table': {
    columns: [
      { key: 'risk', label: 'סיכון' },
      { key: 'impact', label: 'השפעה' },
      { key: 'mitigation', label: 'דרך התמודדות' },
      { key: 'owner', label: 'אחראי' },
    ],
  },
};

/** סכמת רשימה לכל תוצר list */
export const LIST_SCHEMAS: Record<string, ListSchema> = {
  'dev-list': {
    itemFields: [
      { key: 'title', label: 'פיתוח' },
      { key: 'estimate', label: 'הערכת זמן' },
      { key: 'owner', label: 'אחראי פיתוח' },
    ],
  },
  'client-tasks': {
    itemFields: [
      { key: 'title', label: 'משימת לקוח' },
      { key: 'due', label: 'תאריך יעד', kind: 'date' },
    ],
  },
  'insights-list': {
    itemFields: [{ key: 'title', label: 'תובנה — מה עבד טוב' }],
  },
  'improvements-list': {
    itemFields: [
      { key: 'title', label: 'נקודה לשיפור' },
      { key: 'area', label: 'תחום', kind: 'select', options: ['תיאום', 'בדיקות', 'תיעוד', 'לוחות זמנים', 'אחר'] },
    ],
  },
  'bug-list': {
    itemFields: [
      { key: 'bug', label: 'תיאור הבאג' },
      { key: 'decision', label: 'החלטה', kind: 'select', options: ['חוסם עלייה', 'ניתן לטיפול לאחר'] },
    ],
  },
};

/** סכמת מטריצת אחריות */
export const MATRIX_SCHEMA: TableSchema = {
  columns: [
    { key: 'topic', label: 'נושא' },
    { key: 'contact', label: 'איש קשר' },
    { key: 'role', label: 'תפקיד' },
  ],
};

/** סכמת סיכום פגישה (משותפת לכל הפגישות) */
export const MEETING_SCHEMA: MeetingSchema = {
  sections: [
    { key: 'participants', label: 'משתתפים', placeholder: 'מי השתתף בפגישה?' },
    { key: 'topics', label: 'נושאים שעלו', placeholder: 'הנושאים המרכזיים שנדונו' },
    { key: 'decisions', label: 'החלטות', placeholder: 'החלטות שהתקבלו' },
    { key: 'actions', label: 'פעולות המשך', placeholder: 'מי עושה מה ועד מתי' },
  ],
};

/** ברירת מחדל ל-doc ללא סכמה מפורשת */
export const DEFAULT_DOC_SCHEMA: DocSchema = {
  sections: [{ key: 'content', label: 'תוכן', placeholder: 'תוכן התוצר' }],
};
