import { test, expect, type Page } from '@playwright/test';

// פותח את המודאל, ממלא שם ויוצר לקוח
async function createCustomer(page: Page, name: string) {
  await page.goto('/');
  await page.getByRole('button', { name: '+ לקוח חדש' }).first().click();
  await page.getByLabel('שם לקוח *').fill(name);
  await page.getByRole('button', { name: 'צור לקוח', exact: true }).click();
}

// בדיקת זרימה מלאה: יצירת לקוח → מילוי תוצר → גייטינג → מעבר שלב.
test('full onboarding flow with stage gating', async ({ page }) => {
  const name = `לקוח בדיקה ${Date.now()}`;
  await createCustomer(page, name);

  // הגענו לעמוד הלקוח, כל 4 השלבים גלויים (כותרות הגוף)
  await expect(page.getByRole('heading', { name, level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'שלב ההכנה והגדרת הפרויקט' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'פגישות יישור קו עם צוותים פנימיים' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'פיתוח, בדיקות ותיעדוף שינויים' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'שיפור ושימור — לאחר העלייה לאוויר' })).toBeVisible();

  // קופסת המטרה ומקרא בעלי התפקידים מופיעים (תוכן מהנוהל המקורי)
  await expect(page.getByRole('heading', { name: 'המטרה' })).toBeVisible();
  await expect(page.getByText('בעלי התפקידים', { exact: true })).toBeVisible();

  // כפתור המעבר חסום בהתחלה, ומציג מה חסר
  const advanceBtn = page.getByRole('button', { name: /מעבר לשלב 2/ });
  await expect(advanceBtn).toBeDisabled();
  await expect(page.getByText(/חסר להשלמה/)).toBeVisible();

  // שלבים 2-4 נעולים למילוי אך גלויים לצפייה
  await expect(
    page.getByText('🔒 גלוי לצפייה — נפתח בשלב הקודם').first()
  ).toBeVisible();
  await expect(page.getByText('🔒 גלוי לצפייה — נפתח בשלב הקודם')).toHaveCount(3);
});

test('purpose box and template appear on deliverable page', async ({ page }) => {
  const name = `לקוח תוצר ${Date.now()}`;
  await createCustomer(page, name);

  // פתיחת התוצר הראשון — מסמך מטרות
  await page
    .getByRole('link', { name: 'הגשת תוצר' })
    .first()
    .click();

  await expect(page.getByRole('heading', { name: 'מסמך מטרות' })).toBeVisible();
  await expect(page.getByText('מטרת התוצר')).toBeVisible();
  // סעיף ייחודי לטמפלט מסמך מטרות
  await expect(page.getByText('מטרות עסקיות')).toBeVisible();

  // מילוי והגשה
  await page.getByPlaceholder('מה הלקוח רוצה להשיג מבחינה עסקית?').fill('הגדלת מכירות');
  await page.getByRole('button', { name: /הגשת תוצר/ }).click();
  await expect(page.getByText('נשמר בהצלחה ✓')).toBeVisible();
});
