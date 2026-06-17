'use client';

import { useState } from 'react';
import { createCustomerAction } from '@/app/actions';

export default function NewCustomerButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="btn" onClick={() => setOpen(true)}>
        + לקוח חדש
      </button>

      {open && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="modal">
            <div className="modal-head">
              <h2>לקוח חדש</h2>
              <button
                className="modal-close"
                onClick={() => setOpen(false)}
                aria-label="סגירה"
              >
                ✕
              </button>
            </div>
            <p className="muted small" style={{ marginTop: 0 }}>
              יצירת לקוח מאתחלת אוטומטית את כל שלבי הנוהל והתוצרים.
            </p>
            <form action={createCustomerAction}>
              <div className="field">
                <label htmlFor="name">שם לקוח *</label>
                <input id="name" name="name" className="input" required autoFocus />
              </div>
              <div className="field">
                <label htmlFor="projectType">סוג פרויקט</label>
                <input
                  id="projectType"
                  name="projectType"
                  className="input"
                  placeholder="הטמעה / אינטגרציה / BI / אחר"
                />
              </div>
              <div className="field">
                <label htmlFor="startDate">תאריך התחלה</label>
                <input id="startDate" name="startDate" type="date" className="input" />
              </div>
              <div className="row" style={{ justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => setOpen(false)}
                >
                  ביטול
                </button>
                <button type="submit" className="btn">
                  צור לקוח
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
