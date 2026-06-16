/**
 * מקור האמת היחיד של נוהל "לקוח חדש".
 * משוחזר 1:1 מהפרוטוטייפ: https://wholesale-process.vercel.app/
 * כולל 4 שלבים, כל התוצרים, תרשימי ה-flow (מי מבצע / מוסר ל / מקבל), ותנאי המעבר.
 */

/** תפקידים בארגון (משמשים גם להרשאות וגם לשיוך אחריות) */
export type Role = 'pm' | 'product' | 'dev' | 'qa';

export const ROLE_LABELS: Record<Role, string> = {
  pm: 'מנהל הפרויקט',
  product: 'מוצר',
  dev: 'פיתוח',
  qa: 'QA',
};

export const ROLE_ABBR: Record<Role, string> = {
  pm: 'PM',
  product: 'PR',
  dev: 'DV',
  qa: 'QA',
};

/** מקרא בעלי התפקידים (כמו בנוהל) */
export const ROLES_LEGEND: Role[] = ['pm', 'product', 'dev', 'qa'];

/** טקסט "המטרה" — קופסת המבוא בראש הנוהל */
export const OVERVIEW_GOAL =
  'לגייס את כל הגורמים הפנימיים — כל אחד יודע מה עליו לעשות ולמי הוא מוסר את המידע. כשכולנו עובדים ביחד ובסדר, הלקוח מקבל את החוויה הכי מקצועית.';

export type DeliverableType = 'template' | 'action' | 'meeting';
export type TemplateKind = 'doc' | 'table' | 'list' | 'matrix' | 'upload';

/** צומת בתרשים ה-flow של קבוצה (מבצע → מוסר ל → מקבל) */
export interface FlowNode {
  /** התווית הקטנה מעל הצומת (למשל "מבצע ואחראי", "מוסר ל") */
  caption: string;
  /** תפקיד לצביעת ה-chip (אופציונלי — אם אין, זהו צומת-מחבר/חץ בלבד) */
  role?: Role;
  /** טקסט תצוגה ליד/במקום ה-chip (למשל "מוצר ופיתוח", "פיתוח · מוצר · QA") */
  text?: string;
  /** תגית קצרה לצד טקסט קבוצתי (למשל "כל") */
  tag?: string;
}

export interface Deliverable {
  key: string;
  title: string;
  taskDescription: string;
  /** הסבר קצר: מטרת התוצר ולמה הוא חשוב — מוצג בראש הטמפלט */
  purpose: string;
  assigneeRoles: Role[];
  /** תווית אחריות מילולית כפי שמופיעה בנוהל */
  responsibilityLabel: string;
  type: DeliverableType;
  templateKind?: TemplateKind;
  /** תת-סעיפים שמופיעים מתחת לתיאור (כמו ברשימת הגאנט / הסיכונים) */
  subItems?: string[];
  dependsOn?: string[];
}

export interface DeliverableGroup {
  key: string;
  title: string;
  deliverables: Deliverable[];
  /** תרשים ה-flow בתחתית הקבוצה */
  flow?: FlowNode[];
}

export interface Stage {
  number: number;
  key: string;
  /** כותרת קצרה ללשונית בראש (hero) */
  title: string;
  /** כותרת מלאה לכותרת השלב בגוף העמוד */
  heading: string;
  subtitle: string;
  groups: DeliverableGroup[];
  /** תנאי המעבר לשלב הבא (מילולי, מהנוהל). null בשלב האחרון */
  transitionCondition: string | null;
  /** תווית כפתור המעבר (למשל "מעבר לשלב 2") — מחושב, אך הטקסט מהנוהל */
  transitionLabel?: string;
}

export const STAGES: Stage[] = [
  // ───────────────────────── שלב 1 ─────────────────────────
  {
    number: 1,
    key: 'preparation',
    title: 'הכנה והגדרת הפרויקט',
    heading: 'שלב ההכנה והגדרת הפרויקט',
    subtitle: 'לפני שמתחילים — מוודאים שכולם מסונכרנים',
    transitionLabel: 'מעבר לשלב 2',
    transitionCondition:
      'מטרות מוגדרות, פערים ממופים, רשימת פיתוחים מוסכמת, אנשי קשר מוגדרים.',
    groups: [
      {
        key: 'goals',
        title: 'הגדרת מטרות ויעדים',
        flow: [
          { caption: 'מבצע ואחראי', role: 'pm', text: 'מנהל הפרויקט' },
          { caption: 'מוסר ל' },
          { caption: 'מקבלים', tag: 'כל', text: 'פיתוח · מוצר · QA · לקוחות' },
        ],
        deliverables: [
          {
            key: 'goals-doc',
            title: 'מסמך מטרות',
            taskDescription: 'הגדרה ברורה של מטרות הפרויקט ומה הלקוח מצפה להשיג',
            purpose:
              'מסמך המטרות מיישר את כל בעלי התפקידים סביב מה שהלקוח רוצה להשיג. בלעדיו כל אחד עלול לפעול לפי הבנה שונה. מטרות ברורות הן הבסיס לכל ההחלטות בהמשך.',
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
              'טבלת ה-KPIs הופכת את המטרות למדידות, ומאפשרת לדעת בצורה אובייקטיבית אם הפרויקט הצליח.',
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
              'הבנת תהליכי העבודה של הלקוח מאפשרת להתאים את המערכת לאופן שבו הוא באמת עובד, ומונעת פערים בהמשך.',
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
        flow: [
          { caption: 'מוביל', role: 'product', text: 'מוצר ופיתוח' },
          { caption: 'תיאום עם' },
          { caption: 'ממפה תהליכים', role: 'pm', text: 'מנהל הפרויקט' },
        ],
        deliverables: [
          {
            key: 'workspace-env',
            title: 'סביבת עבודה',
            taskDescription:
              'יצירת DB ייעודי עבור לקוחות סיטונאיים שיאפשר התחלת עבודה מסודרת',
            purpose:
              'סביבת עבודה ייעודית מאפשרת להתחיל לעבוד בצורה מסודרת ומבודדת. משימת תשתית — או שהוקמה או שלא.',
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
              'מיפוי התהליכים מתרגם את הבנת הלקוח לרשימה מסודרת של תהליכים שצריך לתמוך בהם במערכת.',
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
        title: 'תיעוד ראשוני ומיפוי פערים',
        flow: [
          { caption: 'מזהה פערים', role: 'product', text: 'מוצר' },
          { caption: 'עובד עם' },
          { caption: 'מעריך זמנים', role: 'dev', text: 'פיתוח' },
          { caption: 'מוסר ל' },
          { caption: 'מרכז ומתכנן', role: 'pm', text: 'מנהל הפרויקט' },
        ],
        deliverables: [
          {
            key: 'gaps-table',
            title: 'טבלת פערים',
            taskDescription:
              'זיהוי מוקדם של פערים במערכת הקיימת אל מול הצרכים של הלקוח',
            purpose:
              'טבלת הפערים מזהה את ההבדל בין יכולות המערכת הקיימות לצרכי הלקוח — הבסיס לתכנון הפיתוחים.',
            assigneeRoles: ['product'],
            responsibilityLabel: 'מוצר',
            type: 'template',
            templateKind: 'table',
            dependsOn: ['mapping-doc'],
          },
          {
            key: 'doc-requirements',
            title: 'מסמך דרישות',
            taskDescription:
              'תיעוד ראשוני של דרישות תיעוד, הסברים והדרכות שיידרשו בהמשך',
            purpose:
              'מסמך זה מזהה מראש איזה תיעוד והדרכות יידרשו, כדי שלא יישכחו לקראת העלייה לאוויר.',
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
              'רשימת הפיתוחים עם הערכות זמן היא הבסיס לתכנון לוחות הזמנים והתיעדוף.',
            assigneeRoles: ['pm', 'product', 'dev'],
            responsibilityLabel: 'מנהל הפרויקט + מוצר + פיתוח',
            type: 'template',
            templateKind: 'list',
            dependsOn: ['gaps-table'],
          },
          {
            key: 'work-plan',
            title: 'תכנית עבודה',
            taskDescription: 'בניית תכנית עבודה לפיתוח',
            purpose:
              'תכנית העבודה מסדרת את הפיתוחים ללוח זמנים מעשי עם סדר ביצוע ותלויות.',
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
              'רשימה זו מבהירה מה באחריות הלקוח לבצע בעצמו, כדי שאלו לא יעכבו את הפרויקט.',
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
        flow: [
          { caption: 'מגדיר ומאשר', role: 'pm', text: 'מנהל הפרויקט' },
          { caption: 'מתאם עם' },
          { caption: 'מנהל פיתוח', role: 'dev', text: 'פיתוח' },
          { caption: 'מנהל מוצר', role: 'product', text: 'מוצר' },
        ],
        deliverables: [
          {
            key: 'responsibility-matrix',
            title: 'מטריצת אחריות + פגישה',
            taskDescription:
              'קביעת אנשי קשר לכל נושא: תקלות, פיתוחים, פערים שנוצרים, תמיכה בזמן פרויקט ותמיכה לאחר העלייה לאוויר. פגישה פנימית בנושא זה לפני תחילת הפרויקט.',
            purpose:
              'מטריצת האחריות קובעת מי אחראי על כל נושא — תקלות, פיתוחים, תמיכה. מונעת מצב שלא ברור למי לפנות.',
            assigneeRoles: ['pm', 'dev', 'product'],
            responsibilityLabel: 'מנהל הפרויקט מול מנהל הפיתוח ומנהל המוצר',
            type: 'template',
            templateKind: 'matrix',
          },
        ],
      },
    ],
  },

  // ───────────────────────── שלב 2 ─────────────────────────
  {
    number: 2,
    key: 'alignment',
    title: 'יישור קו עם הצוותים',
    heading: 'פגישות יישור קו עם צוותים פנימיים',
    subtitle: 'כולם יוצאים מאותה נקודת מוצא — לפני שמתחילים לעבוד',
    transitionLabel: 'מעבר לשלב 3',
    transitionCondition:
      'פגישת יישור קו בוצעה, סיכונים זוהו, לוחות זמנים אושרו.',
    groups: [
      {
        key: 'forum',
        title: 'מפגש עם הפורום הרוחבי (פיתוח, מוצר, לקוחות)',
        flow: [
          { caption: 'מארגן ומנהל', role: 'pm', text: 'מנהל הפרויקט' },
          { caption: 'מציג בפני' },
          { caption: 'משתתפים', tag: 'כל', text: 'פיתוח · מוצר · לקוחות · QA' },
        ],
        deliverables: [
          {
            key: 'present-client',
            title: 'הצגת הלקוח',
            taskDescription:
              'הצגת הלקוח ותהליכי העבודה שלו כדי לוודא שכולם מבינים את הפעילות',
            purpose:
              'הצגת הלקוח לכלל הצוותים מוודאת שכולם מבינים את הפעילות ויוצאים מאותה נקודת מוצא.',
            assigneeRoles: ['pm'],
            responsibilityLabel: 'מנהל הפרויקט',
            type: 'meeting',
          },
          {
            key: 'present-solutions',
            title: 'הצגת הפתרונות',
            taskDescription:
              'הצגת הפתרונות שהוצגו ללקוח כדי לבדוק אם יש אלטרנטיבות טובות יותר',
            purpose:
              'הצגת הפתרונות בפני הצוות מאפשרת לאתר אלטרנטיבות טובות יותר לפני שמתחילים לפתח.',
            assigneeRoles: ['pm'],
            responsibilityLabel: 'מנהל הפרויקט',
            type: 'meeting',
          },
          {
            key: 'gantt',
            title: 'גאנט / לוח זמנים',
            taskDescription: 'הצגת לוחות זמנים לפרויקט הכוללים:',
            subItems: [
              'פיתוחים של גלאור',
              'פיתוחים מהצד של הלקוח',
              'בניית מוצרים',
              'הזנת נתונים למערכת',
              'הדרכות',
              'העלייה לאוויר',
            ],
            purpose:
              'הגאנט מרכז את כל אבני הדרך ולוחות הזמנים — פיתוחים, הזנת נתונים, הדרכות והעלייה לאוויר — לתמונה אחת.',
            assigneeRoles: ['pm'],
            responsibilityLabel: 'מנהל הפרויקט',
            type: 'template',
            templateKind: 'doc',
          },
          {
            key: 'risks-table',
            title: 'טבלת סיכונים',
            taskDescription: 'זיהוי מוקדם של סיכונים:',
            subItems: [
              'תהליכים חדשים או לא מספיק מבוססים במערכת',
              'וידוא שבוצעו בדיקות QA מספקות',
              'מיפוי תהליכים שדורשים תיעוד נוסף או הדרכה ייחודית',
            ],
            purpose:
              'טבלת הסיכונים מזהה מראש את הנקודות שעלולות להיכשל, כדי שנוכל להיערך אליהן לפני שהן הופכות לבעיה.',
            assigneeRoles: ['pm'],
            responsibilityLabel: 'מנהל הפרויקט',
            type: 'template',
            templateKind: 'table',
          },
        ],
      },
    ],
  },

  // ───────────────────────── שלב 3 ─────────────────────────
  {
    number: 3,
    key: 'development',
    title: 'פיתוח, בדיקות ותיעדוף',
    heading: 'פיתוח, בדיקות ותיעדוף שינויים',
    subtitle: 'עובדים בסדר — כל אחד יודע מה הוא עושה ומתי הוא מסיים',
    transitionLabel: 'מעבר לשלב הדרכות ועלייה לאוויר',
    transitionCondition:
      'כל הפיתוחים הושלמו, בדיקות QA ו-UAT עברו בהצלחה.',
    groups: [
      {
        key: 'dev-tracking',
        title: 'תיעדוף משימות וניהול הפיתוחים / הפערים ב-Asana',
        flow: [
          { caption: 'מנהל ומעקב', role: 'pm', text: 'מנהל הפרויקט' },
          { caption: 'מעדכן שבועי' },
          { caption: 'מקבלים עדכון', tag: 'כל', text: 'פיתוח · מוצר · QA' },
        ],
        deliverables: [
          {
            key: 'asana-board',
            title: 'בוארד Asana + סיכום שבועי',
            taskDescription:
              'מעקב אחרי סטטוס הפיתוחים עד להשלמת הפערים. פגישת סטטוס שבועית ושליחת סיכום.',
            purpose:
              'ניהול ב-Asana וסיכום שבועי שומרים על שקיפות ומעקב רציף אחר התקדמות הפיתוחים.',
            assigneeRoles: ['pm'],
            responsibilityLabel: 'מנהל הפרויקט',
            type: 'template',
            templateKind: 'doc',
          },
        ],
      },
      {
        key: 'testing',
        title: 'בדיקות פונקציונליות ומערכתיות',
        flow: [
          { caption: 'מבצע ואחראי', role: 'qa', text: 'QA' },
          { caption: 'מוסר תוצאות ל' },
          { caption: 'מתקן', role: 'dev', text: 'פיתוח' },
          { caption: 'מדווח ל' },
          { caption: 'עוקב ומחליט', role: 'pm', text: 'מנהל הפרויקט' },
        ],
        deliverables: [
          {
            key: 'functional-tests',
            title: 'דו"ח בדיקות',
            taskDescription:
              'וידוא שכל תהליכי העבודה הקריטיים נתמכים כראוי במערכת',
            purpose:
              'דו"ח הבדיקות הפונקציונליות מוודא שכל תהליך עבודה קריטי באמת עובד במערכת לפני שהלקוח נחשף אליו.',
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
              'בדיקות בסביבת הלקוח חושפות בעיות שלא מתגלות בסביבת פיתוח, כי הן בודקות בתנאים אמיתיים.',
            assigneeRoles: ['qa'],
            responsibilityLabel: 'QA',
            type: 'template',
            templateKind: 'doc',
            dependsOn: ['functional-tests'],
          },
        ],
      },
      {
        key: 'uat',
        title: 'בדיקות UAT — סביבת Live',
        flow: [
          { caption: 'מקים סביבת UAT', role: 'dev', text: 'פיתוח' },
          { caption: 'מוסר ל' },
          { caption: 'בודק ומאשר', role: 'qa', text: 'QA' },
          { caption: 'אישור סופי · מחליט על עלייה', role: 'pm', text: 'מנהל הפרויקט' },
        ],
        deliverables: [
          {
            key: 'uat-env',
            title: 'סביבת UAT מוקמת',
            taskDescription:
              'הבדיקות חייבות להתבצע על סביבת UAT שזהה לסביבת הלייב — לא על סביבת פיתוח',
            purpose:
              'הקמת סביבת UAT זהה ללייב היא תנאי הכרחי לבדיקות אמינות. משימת תשתית — או שהוקמה כראוי או שלא.',
            assigneeRoles: ['qa', 'dev'],
            responsibilityLabel: 'QA + פיתוח',
            type: 'action',
          },
          {
            key: 'uat-report',
            title: 'דו"ח UAT',
            taskDescription:
              'מעבר על כל תהליכי העבודה הקריטיים של הלקוח בסביבת UAT לפני אישור עלייה לאוויר',
            purpose:
              'דו"ח ה-UAT מאשר שכל התהליכים הקריטיים עובדים בסביבה זהה ללייב לפני העלייה לאוויר.',
            assigneeRoles: ['qa'],
            responsibilityLabel: 'QA',
            type: 'template',
            templateKind: 'doc',
            dependsOn: ['uat-env'],
          },
          {
            key: 'bug-list',
            title: 'רשימת באגים',
            taskDescription:
              'כל באג שמתגלה ב-UAT — נרשם ומקבל החלטה: חוסם עלייה / ניתן לטיפול לאחר',
            purpose:
              'רשימת הבאגים מבטיחה שכל תקלה מתועדת ומקבלת החלטה מודעת — חוסמת עלייה או נדחית לאחר.',
            assigneeRoles: ['pm'],
            responsibilityLabel: 'מנהל הפרויקט',
            type: 'template',
            templateKind: 'list',
            dependsOn: ['uat-report'],
          },
          {
            key: 'golive-approval',
            title: 'אישור עלייה לאוויר',
            taskDescription:
              'אישור סופי של QA ומנהל הפרויקט שהסביבה מוכנה לעלייה לאוויר',
            purpose:
              'האישור הסופי הוא נקודת ההחלטה המשותפת ש-QA והפרויקט מאשרים יחד שהמערכת מוכנה ללייב.',
            assigneeRoles: ['qa', 'pm'],
            responsibilityLabel: 'QA + מנהל הפרויקט',
            type: 'action',
            dependsOn: ['bug-list'],
          },
        ],
      },
    ],
  },

  // ───────────────────────── שלב 4 ─────────────────────────
  {
    number: 4,
    key: 'retrospective',
    title: 'שיפור ושימור',
    heading: 'שיפור ושימור — לאחר העלייה לאוויר',
    subtitle: 'מה עבד טוב? מה נשפר בפעם הבאה?',
    transitionLabel: null as unknown as string,
    transitionCondition: null,
    groups: [
      {
        key: 'retro',
        title: 'פגישת סיכום ושיפור תהליכים',
        flow: [
          { caption: 'מארגן ומנהל', role: 'pm', text: 'מנהל הפרויקט' },
          { caption: 'בפגישה עם' },
          { caption: 'כולם משתתפים', tag: 'כל', text: 'פיתוח · מוצר · QA · לקוחות' },
        ],
        deliverables: [
          {
            key: 'retro-meeting',
            title: 'פגישת סיכום',
            taskDescription:
              'קיום פגישת סטטוס פנימית X זמן לאחר העלייה לאוויר עם כל בעלי התפקידים שהיו מעורבים בתהליך',
            purpose:
              'פגישת הסיכום מאפשרת ללמוד מהפרויקט בזמן שהפרטים עדיין טריים — הבסיס לשיפור הנוהל לפרויקט הבא.',
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
              'מצגת הסיכום נותנת תמונת מצב מלאה בנקודת הסיום — מה הושג ומה נותר פתוח.',
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
              'רשימת התובנות מתעדת מה עבד טוב כדי לשמר אותו — שלא ילך לאיבוד בין פרויקטים.',
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
              'רשימת השיפורים הופכת בעיות שהתגלו לפעולות מתקנות קונקרטיות לפרויקט הבא.',
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
              'עדכון הנוהל סוגר את מעגל הלמידה — התובנות והשיפורים הופכים לחלק קבוע מאופן העבודה.',
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

/** טקסט סיום הנוהל (מוצג בתחתית השלב האחרון) */
export const COMPLETION_NOTE =
  'סיום הפרויקט: פגישת שיפור ושימור בוצעה, נוהל עודכן.';

export function allDeliverables(): Deliverable[] {
  return STAGES.flatMap((s) => s.groups.flatMap((g) => g.deliverables));
}

export function deliverablesForStage(stageNumber: number): Deliverable[] {
  const stage = STAGES.find((s) => s.number === stageNumber);
  if (!stage) return [];
  return stage.groups.flatMap((g) => g.deliverables);
}

export function findDeliverable(key: string): Deliverable | undefined {
  return allDeliverables().find((d) => d.key === key);
}

export function stageOfDeliverable(key: string): Stage | undefined {
  return STAGES.find((s) =>
    s.groups.some((g) => g.deliverables.some((d) => d.key === key))
  );
}
