import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'נוהל לקוח חדש — TravelBooster',
  description: 'כלי פנימי לניהול ומעקב אחר נוהל קליטת לקוח חדש',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body>
        <div className="topbar">
          <div className="container">
            <span className="brand">תהליך פנימי · גלאור / TravelBooster</span>
            <a href="/" className="title" style={{ color: '#fff' }}>
              נוהל לקוח חדש
            </a>
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
