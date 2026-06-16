# כלי ניהול נוהל "לקוח חדש" — TravelBooster

כלי פנימי למילוי ומעקב אחר נוהל קליטת לקוח חדש: 3 שלבים, ~22 תוצרים, גייטינג בין שלבים, וטמפלט ייחודי לכל תוצר.

## טכנולוגיה
- **Next.js 14** (App Router) + **TypeScript**, RTL בעברית, עיצוב תואם לפרוטוטייפ הקיים.
- **Supabase (Postgres)** לאחסון — עם **fallback לקובץ JSON מקומי** (`.data/db.json`) כשאין מפתחות, כדי שהכלי ירוץ מיד.
- **Vitest** לבדיקות לוגיקה, **Playwright** ל-E2E.

## הרצה מקומית
```bash
npm install
npm run dev      # http://localhost:3000  (רץ מיד גם בלי Supabase)
```

## חיבור Supabase (פרודקשן)
1. צרו פרויקט ב-Supabase.
2. הריצו ב-SQL Editor את `supabase/migrations/0001_init.sql` ואז `0002_rls.sql`.
3. העתיקו `.env.local.example` ל-`.env.local` ומלאו `NEXT_PUBLIC_SUPABASE_URL` ו-`NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   > את המפתחות יש להזין ידנית — הם אינם נשמרים ב-repo.

## בדיקות
```bash
npm test          # Vitest — לוגיקת נוהל, גייטינג, אתחול לקוח
npm run test:e2e  # Playwright — זרימת קליטה מלאה
```

## מבנה
- `lib/process-definition.ts` — **מקור האמת** של הנוהל (שלבים, תוצרים, אחריות, תנאי מעבר, הסברי-מטרה). שינוי נוהל נעשה כאן בלבד.
- `lib/template-schemas.ts` — הטמפלט הייחודי לכל תוצר (עמודות/שדות/סעיפים).
- `lib/gating.ts` — לוגיקת חסימת מעבר שלב.
- `lib/store.ts` — שכבת נתונים (Supabase / קובץ מקומי).
- `app/` — דשבורד, עמוד סטפר, דפי טמפלט.
- `components/DeliverableEditor.tsx` — טופס המילוי הדינמי לפי סוג תוצר.

## הערה
זהו **שלב ראשון** המכסה את נוהל "לקוח חדש" בלבד. נוהל "מעבר לתמיכה" יטופל בהמשך (נקודת חפיפה: קבוצת "פגישת סיכום ושיפור תהליכים" בסוף שלב 3).
