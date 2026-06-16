/**
 * מקור האמת היחיד של נוהל "לקוח חדש".
 * כל שינוי בנוהל (טקסטים, אחריות, סוגי תוצר, תנאי מעבר) נעשה כאן בלבד.
 * הטקסטים נלקחו 1:1 מהפרוטוטייפ הקיים: https://wholesale-process.vercel.app/
 */

/** תפקידים בארגון (משמשים גם להרשאות וגם לשיוך אחריות) */
export type Role = 'pm' | 'product' | 'dev' | 'qa';

export const ROLE_LABELS: Record<Role, string> = {
  pm: 'מנהל הפרויקט',
  product: 'מוצר',
  dev: 'פיתוח',
  qa: 'QA',
};

/** סוג התוצר — קובע איזה רכיב/דף מילוי ייפתח */
export type DeliverableType = 'template' | 'action' | 'meeting';

/** תת-סוג של טמפלט — קובע את מבנה דף המילוי */
export type TemplateKind = 'doc' | 'table' | 'list' | 'matrix' | 'upload';

export interface Deliverable {
  /** מזהה יציב לשימוש ב-URL וב-DB */
  key: string;
  /** שם התוצר כפי שמופיע בנוהל */
  title: string;
  /** תיאור המשימה שמובילה לתוצר (מהנוהל) */
  taskDescription: string;
  /** הסבר קצר: מטרת התוצר ולמה הוא חשוב — מוצג בראש הטמפלט */
  purpose: string;
  /** תפקידים אחראים */
  assigneeRoles: Role[];
  /** תווית אחריות מילולית כפי שמופיעה בנוהל (יכולה להיות מורכבת) */
  responsibilityLabel: string;
  type: DeliverableType;
  /** רלוונטי רק כאשר type === 'template' */
  templateKind?: TemplateKind;
  /** מפתחות תוצרים שתוצר זה תלוי בהם (להצגת תלויות) */
  dependsOn?: string[];
}

export interface DeliverableGroup {
  key: string;
  title: string;
  /** כותרת משנה מהנוהל */
  subtitle?: string;
  deliverables: Deliverable[];
}

export interface Stage {
  /** מספר השלב (1-based) */
  number: number;
  key: string;
  title: string;
  subtitle: string;
  groups: DeliverableGroup[];
  /** תנאי המעבר לשלב הבא (מילולי, מהנוהל). null בשלב האחרון */
  transitionCondition: string | null;
}

export const STAGES: Stage[] = [
  {
    number: 1,
    key: 'preparation',
    title: 'הכנה והגדרת הפרויקט',
    subtitle: 'לפני שמתחילים — מוודאים שכולם מסונכרנים',
    transitionCondition:
      'מטרות מוגדרות, פערים ממופים, רשימת פיתוחים מוסכמת, אנשי קשר מוגדרים.',
    groups: [
      {
        key: 'goals',
        title: 'הגדרת מטרות ויעדים',
        deliverables: [
          {
            key: 'goals-doc',
            title: 'מסמך מטרות',
            taskDescription: 'הגדרה ברורה של מטרות הפרויקט ומה הלקוח מצפה להשיג',
            purpose:
              'מסמך המטרות מיישר את כל בעלי התפקידים סביב מה שהלקוח רוצה להשיג. בלעדיו כל אחד עלול לפעול לפי הבנה שונה. מטרות ברורות הן הבסיס לכל ההחלטות בהמשך הפרויקט.',
            assigneeRoles: ['pm'],
            responsibilityLabel: 'מנהל הפרויקט',
            type: 'template',
            templateKind: 'doc',
          },
          {
            key: 'kpis-table',
            title: 'טבלת KPIs',
            taskDescription: 'הגדרה ברורה למדדים של הצלחת הפרויקט',
            purpose:
              'טבלת ה-KPIs הופכת את המטרות למדידות. היא מאפשרת לדעת בצורה אובייקטיבית אם הפרויקט הצליח, ומהווה בסיס למדידה לאחר העלייה לאוויר.',
            assigneeRoles: ['pm'],
            responsibilityLabel: 'מנהל הפרויקט',
            type: 'template',
            templateKind: 'table',
            dependsOn: ['goals-doc'],
          },
          {
            key: 'processes-doc',
            title: 'מסמך תהליכים',
            taskDescription: 'הבנה מעמיקה של תהליכי העבודה של הלקוח',
            purpose:
              'הבנת תהליכי העבודה של הלקוח מאפשרת להתאים את המערכת לאופן שבו הוא באמת עובד. מסמך זה מונע פערים בין מה שהמערכת מספקת לבין מה שהלקוח צריך בפועל.',
            assigneeRoles: ['pm'],
            responsibilityLabel: 'מנהל הפרויקט',
            type: 'template',
            templateKind: 'doc',
          },
        ],
      },
      {
        key: 'environment',
        title: 'הקמת סביבת עבודה ראשונית',
        deliverables: [
          {
            key: 'workspace-env',
            title: 'סביבת עבודה',
            taskDescription:
              'יצירת DB ייעודי עבור לקוחות סיטונאיים שיאפשר התחלת עבודה מסודרת',
            purpose:
              'סביבת עבודה ייעודית מאפשרת להתחיל לעבוד בצורה מסודרת ומבודדת. זוהי משימת תשתית — או שהיא הוקמה או שלא.',
            assigneeRoles: ['product', 'dev'],
            responsibilityLabel: 'מוצר ופיתוח',
            type: 'action',
          },
          {
            key: 'mapping-doc',
            title: 'מסמך מיפוי',
            taskDescription:
              'מיפוי תהליכי העבודה שהלקוח יצטרך להשתמש בהם במערכת',
            purpose:
              'מיפוי התהליכים מתרגם את הבנת הלקוח לרשימה מסודרת של תהליכים שצריך לתמוך בהם במערכת. זהו הגשר בין הבנת הלקוח לבין ניתוח הפערים.',
            assigneeRoles: ['pm'],
            responsibilityLabel: 'מנהל הפרויקט',
            type: 'template',
            templateKind: 'doc',
            dependsOn: ['processes-doc'],
          },
        ],
      },
      {
        key: 'gaps',
        title: 'ניתוח פערים ותכנון פיתוח',
        deliverables: [
          {
            key: 'gaps-table',
            title: 'טבלת פערים',
            taskDescription:
              'ניתוח הפערים במערכת הקיימת אל מול הצרכים של הלקוח',
            purpose:
              'טבלת הפערים מזהה את ההבדל בין יכולות המערכת הקיימות לבין צרכי הלקוח. זהו הבסיס לתכנון הפיתוחים — בלעדיה לא ניתן לדעת מה צריך לפתח.',
            assigneeRoles: ['product'],
            responsibilityLabel: 'מוצר',
            type: 'template',
            templateKind: 'table',
            dependsOn: ['mapping-doc'],
          },
          {
            key: 'doc-requirements',
            title: 'מסמך דרישות תיעוד',
            taskDescription:
              'תיעוד ראשוני של דרישות תיעוד, הסברים והדרכות שיידרשו בהמשך',
            purpose:
              'מסמך זה מזהה מראש איזה תיעוד והדרכות יידרשו, כדי שלא יישכחו לקראת העלייה לאוויר ולהקל על ההעברה לתמיכה בהמשך.',
            assigneeRoles: ['pm'],
            responsibilityLabel: 'מנהל הפרויקט',
            type: 'template',
            templateKind: 'doc',
          },
          {
            key: 'dev-list',
            title: 'רשימת פיתוחים',
            taskDescription: 'רשימה מלאה של כל הפיתוחים הנדרשים עם הערכות מהפיתוח',
            purpose:
              'רשימת הפיתוחים עם הערכות זמן היא הבסיס לתכנון לוחות הזמנים והתיעדוף. היא מבטיחה שכל הצדדים מסכימים על היקף העבודה הנדרש.',
            assigneeRoles: ['pm', 'product', 'dev'],
            responsibilityLabel: 'מנהל הפרויקט + מוצר + פיתוח',
            type: 'template',
            templateKind: 'list',
            dependsOn: ['gaps-table'],
          },
          {
            key: 'work-plan',
            title: 'תכנית עבודה לפיתוח',
            taskDescription: 'בניית תכנית עבודה לפיתוח',
            purpose:
              'תכנית העבודה מסדרת את הפיתוחים ללוח זמנים מעשי עם סדר ביצוע ותלויות, כדי שהפיתוח יתקדם בצורה צפויה ומבוקרת.',
            assigneeRoles: ['product', 'dev'],
            responsibilityLabel: 'מוצר ופיתוח',
            type: 'template',
            templateKind: 'doc',
            dependsOn: ['dev-list'],
          },
          {
            key: 'client-tasks',
            title: 'רשימת משימות לקוח',
            taskDescription: 'רשימה מלאה של כל הפיתוחים המבוצעים על ידי הלקוח',
            purpose:
              'רשימה זו מבהירה מה באחריות הלקוח לבצע בעצמו, כדי שאלו לא ייפלו בין הכיסאות ויעכבו את הפרויקט.',
            assigneeRoles: ['pm'],
            responsibilityLabel: 'מנהל הפרויקט',
            type: 'template',
            templateKind: 'list',
          },
        ],
      },
      {
        key: 'roles',
        title: 'הגדרת בעלי תפקידים ואחריות',
        deliverables: [
          {
            key: 'responsibility-matrix',
            title: 'מטריצת אחריות',
            taskDescription:
              'קביעת אנשי קשר לכל נושא: תקלות, פיתוחים, פערים שנוצרים, תמיכה בזמן פרויקט ותמיכה לאחר העלייה לאוויר. פגישה פנימית בנושא זה לפני תחילת הפרויקט.',
            purpose:
              'מטריצת האחריות קובעת מי אחראי על כל נושא — תקלות, פיתוחים, תמיכה. היא מונעת מצב שבו לא ברור למי לפנות, ומבטיחה שכל אחד יודע מה תחומי אחריותו.',
            assigneeRoles: ['pm', 'dev', 'product'],
            responsibilityLabel: 'מנהל הפרויקט מול מנהל הפיתוח ומנהל המוצר',
            type: 'template',
            templateKind: 'matrix',
          },
          {
            key: 'roles-meeting',
            title: 'פגישת הגדרת אחריות',
            taskDescription:
              'פגישה פנימית להגדרת בעלי תפקידים ואחריות לפני תחילת הפרויקט',
            purpose:
              'הפגישה הפנימית מבטיחה שכל בעלי התפקידים מסכימים על חלוקת האחריות בעל פה ולא רק על הנייר — כך לא נשארים פערים בהבנה.',
            assigneeRoles: ['pm'],
            responsibilityLabel: 'מנהל הפרויקט',
            type: 'meeting',
            dependsOn: ['responsibility-matrix'],
          },
        ],
      },
    ],
  },
  {
    number: 2,
    key: 'alignment',
    title: 'יישור קו עם הצוותים',
    subtitle: 'כולם יוצאים מאותה נקודת מוצא — לפני שמתחילים',
    transitionCondition:
      'פגישת יישור קו בוצעה, סיכונים זוהו, לוחות זמנים אושרו.',
    groups: [
      {
        key: 'alignment-meeting',
        title: 'פגישות יישור קו עם צוותים פנימיים',
        deliverables: [
          {
            key: 'kickoff-meeting',
            title: 'פגישת יישור קו',
            taskDescription:
              'פגישת יישור קו עם כל הצוותים הפנימיים: בניית מוצרים, הזנת נתונים, הדרכות, העלייה לאוויר',
            purpose:
              'פגישת יישור הקו מוודאת שכל הצוותים יוצאים מאותה נקודת מוצא לפני תחילת העבודה. היא מסנכרנת ציפיות, לוחות זמנים ותחומי אחריות בין כל המעורבים.',
            assigneeRoles: ['pm'],
            responsibilityLabel: 'מנהל הפרויקט',
            type: 'meeting',
          },
          {
            key: 'risks-table',
            title: 'טבלת סיכונים',
            taskDescription:
              'זיהוי מוקדם של סיכונים: תהליכים חדשים או לא מספיק מבוססים, בדיקות QA מספקות, מיפוי תהליכים שדורשים תיעוד או הדרכה ייחודית',
            purpose:
              'טבלת הסיכונים מזהה מראש את הנקודות שעלולות להיכשל, כדי שנוכל להיערך אליהן לפני שהן הופכות לבעיה. זיהוי מוקדם חוסך זמן וטעויות בהמשך.',
            assigneeRoles: ['pm'],
            responsibilityLabel: 'מנהל הפרויקט',
            type: 'template',
            templateKind: 'table',
            dependsOn: ['kickoff-meeting'],
          },
        ],
      },
    ],
  },
  {
    number: 3,
    key: 'development',
    title: 'פיתוח, בדיקות ותיעדוף',
    subtitle: 'עובדים בסדר — כל אחד יודע מה הוא עושה ומתי הוא מסיים',
    transitionCondition: null,
    groups: [
      {
        key: 'dev-tracking',
        title: 'תיעדוף וניהול פיתוחים',
        deliverables: [
          {
            key: 'asana-board',
            title: 'בוארד Asana + סיכום שבועי',
            taskDescription:
              'תיעדוף משימות וניהול הפיתוחים / הפערים ב-Asana. מעקב אחרי סטטוס הפיתוחים עד להשלמת הפערים. פגישת סטטוס שבועית ושליחת סיכום.',
            purpose:
              'ניהול ב-Asana וסיכום שבועי שומרים על שקיפות ומעקב רציף אחר התקדמות הפיתוחים. הסיכום השבועי מבטיח שכל בעלי התפקידים מעודכנים בסטטוס.',
            assigneeRoles: ['pm'],
            responsibilityLabel: 'מנהל הפרויקט',
            type: 'template',
            templateKind: 'doc',
          },
        ],
      },
      {
        key: 'testing',
        title: 'בדיקות',
        deliverables: [
          {
            key: 'functional-tests',
            title: 'דו"ח בדיקות פונקציונליות',
            taskDescription:
              'בדיקות פונקציונליות ומערכתיות — וידוא שכל תהליכי העבודה הקריטיים נתמכים כראוי במערכת',
            purpose:
              'דו"ח הבדיקות הפונקציונליות מוודא שכל תהליך עבודה קריטי באמת עובד במערכת לפני שהלקוח נחשף אליו. זהו קו ההגנה מפני תקלות בלייב.',
            assigneeRoles: ['qa'],
            responsibilityLabel: 'QA',
            type: 'template',
            templateKind: 'doc',
          },
          {
            key: 'client-env-tests',
            title: 'דו"ח בדיקות בסביבת לקוח',
            taskDescription: 'בדיקות בסביבת לקוח אמיתית במידת האפשר',
            purpose:
              'בדיקות בסביבת הלקוח חושפות בעיות שלא מתגלות בסביבת פיתוח, כי הן בודקות את ההתנהגות בתנאים אמיתיים עם הנתונים והאינטגרציות של הלקוח.',
            assigneeRoles: ['qa'],
            responsibilityLabel: 'QA',
            type: 'template',
            templateKind: 'doc',
            dependsOn: ['functional-tests'],
          },
          {
            key: 'uat-env',
            title: 'סביבת UAT',
            taskDescription:
              'בדיקות UAT — הבדיקות חייבות להתבצע על סביבת UAT שזהה לסביבת הלייב, לא על סביבת פיתוח',
            purpose:
              'הקמת סביבת UAT זהה ללייב היא תנאי הכרחי לבדיקות אמינות. זוהי משימת תשתית — או שהסביבה הוקמה כראוי או שלא.',
            assigneeRoles: ['qa', 'dev'],
            responsibilityLabel: 'QA + פיתוח',
            type: 'action',
          },
        ],
      },
      {
        key: 'retrospective',
        title: 'פגישת סיכום ושיפור תהליכים',
        subtitle: 'לאחר העלייה לאוויר — לומדים ומשתפרים לפרויקט הבא',
        deliverables: [
          {
            key: 'retro-meeting',
            title: 'פגישת סיכום',
            taskDescription:
              'קיום פגישת סטטוס פנימית X זמן לאחר העלייה לאוויר עם כל בעלי התפקידים שהיו מעורבים בתהליך',
            purpose:
              'פגישת הסיכום מאפשרת ללמוד מהפרויקט בזמן שהפרטים עדיין טריים. היא הבסיס לשיפור מתמיד של הנוהל לפרויקטים הבאים.',
            assigneeRoles: ['pm'],
            responsibilityLabel: 'מנהל הפרויקט',
            type: 'meeting',
          },
          {
            key: 'summary-presentation',
            title: 'מצגת סיכום',
            taskDescription:
              'הצגת סטטוס הפרויקט — מה בוצע, מה עדיין פתוח, ואיך הלקוח מסתדר בשטח',
            purpose:
              'מצגת הסיכום נותנת תמונת מצב מלאה של הפרויקט בנקודת הסיום, כך שכל בעלי התפקידים מבינים מה הושג ומה נותר פתוח.',
            assigneeRoles: ['pm'],
            responsibilityLabel: 'מנהל הפרויקט',
            type: 'template',
            templateKind: 'upload',
            dependsOn: ['retro-meeting'],
          },
          {
            key: 'insights-list',
            title: 'רשימת תובנות',
            taskDescription:
              'התייחסות לתהליך שנעשה לפני העלייה: מה עבד טוב ומה כדאי לשמר לפרויקטים הבאים',
            purpose:
              'רשימת התובנות מתעדת מה עבד טוב כדי לשמר אותו. בלי תיעוד, ידע חשוב הולך לאיבוד בין פרויקט לפרויקט.',
            assigneeRoles: ['pm', 'product', 'dev', 'qa'],
            responsibilityLabel: 'כל המשתתפים',
            type: 'template',
            templateKind: 'list',
          },
          {
            key: 'improvements-list',
            title: 'רשימת שיפורים',
            taskDescription:
              'זיהוי נקודות לשיפור — בין אם בתיאום, בבדיקות, בתיעוד, בלוחות הזמנים או בכל שלב אחר',
            purpose:
              'רשימת השיפורים הופכת בעיות שהתגלו לפעולות מתקנות קונקרטיות לפרויקט הבא. זהו הלב של תהליך השיפור המתמיד.',
            assigneeRoles: ['pm', 'product', 'dev', 'qa'],
            responsibilityLabel: 'כל המשתתפים',
            type: 'template',
            templateKind: 'list',
          },
          {
            key: 'updated-procedure',
            title: 'נוהל מעודכן',
            taskDescription:
              'עדכון הנוהל הפנימי בהתאם לתובנות שעלו, כדי שהפרויקט הבא יהיה חלק יותר',
            purpose:
              'עדכון הנוהל סוגר את מעגל הלמידה — התובנות והשיפורים הופכים לחלק קבוע מאופן העבודה. או שהנוהל עודכן או שלא.',
            assigneeRoles: ['pm'],
            responsibilityLabel: 'מנהל הפרויקט',
            type: 'action',
            dependsOn: ['insights-list', 'improvements-list'],
          },
        ],
      },
    ],
  },
];

/** כל התוצרים בכל השלבים, שטוחים, לפי סדר */
export function allDeliverables(): Deliverable[] {
  return STAGES.flatMap((s) => s.groups.flatMap((g) => g.deliverables));
}

/** כל התוצרים של שלב מסוים */
export function deliverablesForStage(stageNumber: number): Deliverable[] {
  const stage = STAGES.find((s) => s.number === stageNumber);
  if (!stage) return [];
  return stage.groups.flatMap((g) => g.deliverables);
}

/** איתור תוצר לפי key */
export function findDeliverable(key: string): Deliverable | undefined {
  return allDeliverables().find((d) => d.key === key);
}

/** איתור השלב שאליו שייך תוצר */
export function stageOfDeliverable(key: string): Stage | undefined {
  return STAGES.find((s) =>
    s.groups.some((g) => g.deliverables.some((d) => d.key === key))
  );
}
