'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Deliverable } from '@/lib/process-definition';
import type { CustomerDeliverable, DeliverableStatus } from '@/lib/types';
import {
  DOC_SCHEMAS,
  DEFAULT_DOC_SCHEMA,
  TABLE_SCHEMAS,
  LIST_SCHEMAS,
  MATRIX_SCHEMA,
  MEETING_SCHEMA,
  type ColumnDef,
} from '@/lib/template-schemas';
import { updateDeliverableAction } from '@/app/actions';
import type { DeliverableUpdate } from '@/lib/store';
import { RoleChips } from '@/components/RoleChip';

type ContentObj = Record<string, unknown>;

function Field({
  col,
  value,
  onChange,
}: {
  col: ColumnDef;
  value: string;
  onChange: (v: string) => void;
}) {
  if (col.kind === 'select') {
    return (
      <select className="select" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">—</option>
        {col.options?.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    );
  }
  if (col.kind === 'textarea') {
    return (
      <textarea
        className="textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  return (
    <input
      className="input"
      type={col.kind === 'date' ? 'date' : 'text'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export default function DeliverableEditor({
  def,
  instance,
  customerId,
}: {
  def: Deliverable;
  instance: CustomerDeliverable | null;
  customerId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const initial = (instance?.content as ContentObj) ?? {};
  const [content, setContent] = useState<ContentObj>(initial);
  const [status, setStatus] = useState<DeliverableStatus>(
    instance?.status ?? 'todo'
  );
  const [dueDate, setDueDate] = useState(instance?.dueDate ?? '');
  const [meetingDate, setMeetingDate] = useState(instance?.meetingDate ?? '');
  const [note, setNote] = useState(instance?.note ?? '');
  const [fileUrl, setFileUrl] = useState(instance?.fileUrl ?? '');

  function setField(key: string, value: unknown) {
    setContent((c) => ({ ...c, [key]: value }));
    setSaved(false);
  }

  function getRows(): Record<string, string>[] {
    const r = content.rows;
    return Array.isArray(r) ? (r as Record<string, string>[]) : [];
  }
  function getItems(): Record<string, string>[] {
    const r = content.items;
    return Array.isArray(r) ? (r as Record<string, string>[]) : [];
  }

  function save() {
    const patch: DeliverableUpdate = {
      status,
      dueDate: dueDate || null,
      content,
      note: note || null,
      fileUrl: fileUrl || null,
    };
    if (def.type === 'meeting') patch.meetingDate = meetingDate || null;
    startTransition(async () => {
      await updateDeliverableAction(customerId, def.key, patch);
      setSaved(true);
      router.refresh();
    });
  }

  function submitAsDone() {
    setStatus('done');
    const patch: DeliverableUpdate = {
      status: 'done',
      dueDate: dueDate || null,
      content,
      note: note || null,
      fileUrl: fileUrl || null,
    };
    if (def.type === 'meeting') patch.meetingDate = meetingDate || null;
    startTransition(async () => {
      await updateDeliverableAction(customerId, def.key, patch);
      setSaved(true);
      router.refresh();
    });
  }

  // ── רכיבי תוכן לפי סוג ───────────────────────────────
  function renderDoc(sections: { key: string; label: string; placeholder?: string }[]) {
    return sections.map((s) => (
      <div className="field" key={s.key}>
        <label>{s.label}</label>
        <textarea
          className="textarea"
          placeholder={s.placeholder}
          value={(content[s.key] as string) ?? ''}
          onChange={(e) => setField(s.key, e.target.value)}
        />
      </div>
    ));
  }

  function renderTable(columns: ColumnDef[]) {
    const rows = getRows();
    return (
      <div className="field">
        <table className="tmpl">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key}>{c.label}</th>
              ))}
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {columns.map((c) => (
                  <td key={c.key} style={{ padding: 4 }}>
                    <Field
                      col={c}
                      value={row[c.key] ?? ''}
                      onChange={(v) => {
                        const next = [...rows];
                        next[i] = { ...next[i], [c.key]: v };
                        setField('rows', next);
                      }}
                    />
                  </td>
                ))}
                <td>
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={() => setField('rows', rows.filter((_, j) => j !== i))}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          type="button"
          className="btn secondary"
          style={{ marginTop: 10 }}
          onClick={() => setField('rows', [...rows, {}])}
        >
          + הוסף שורה
        </button>
      </div>
    );
  }

  function renderList(fields: ColumnDef[]) {
    const items = getItems();
    return (
      <div className="field">
        <div className="grid">
          {items.map((item, i) => (
            <div className="card" key={i} style={{ padding: 12 }}>
              <div className="row">
                {fields.map((f) => (
                  <div key={f.key} style={{ flex: '1 1 160px' }}>
                    <label className="small">{f.label}</label>
                    <Field
                      col={f}
                      value={item[f.key] ?? ''}
                      onChange={(v) => {
                        const next = [...items];
                        next[i] = { ...next[i], [f.key]: v };
                        setField('items', next);
                      }}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => setField('items', items.filter((_, j) => j !== i))}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="btn secondary"
          style={{ marginTop: 10 }}
          onClick={() => setField('items', [...items, {}])}
        >
          + הוסף פריט
        </button>
      </div>
    );
  }

  function renderBody() {
    if (def.type === 'action') {
      return (
        <div className="field">
          <label>הערה (אופציונלי)</label>
          <textarea
            className="textarea"
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              setSaved(false);
            }}
            placeholder="הערות על ביצוע המשימה"
          />
        </div>
      );
    }
    if (def.type === 'meeting') {
      return (
        <>
          <div className="field">
            <label>תאריך הפגישה</label>
            <input
              className="input"
              type="date"
              value={meetingDate}
              onChange={(e) => {
                setMeetingDate(e.target.value);
                setSaved(false);
              }}
            />
            <div className="hint">תאריך הפגישה נשמר בנפרד מתוכן הסיכום.</div>
          </div>
          {renderDoc(MEETING_SCHEMA.sections)}
        </>
      );
    }
    // template
    switch (def.templateKind) {
      case 'table':
        return renderTable(TABLE_SCHEMAS[def.key]?.columns ?? []);
      case 'matrix':
        return renderTable(MATRIX_SCHEMA.columns);
      case 'list':
        return renderList(LIST_SCHEMAS[def.key]?.itemFields ?? [{ key: 'title', label: 'פריט' }]);
      case 'upload':
        return (
          <>
            <div className="field">
              <label>קישור לקובץ</label>
              <input
                className="input"
                value={fileUrl}
                onChange={(e) => {
                  setFileUrl(e.target.value);
                  setSaved(false);
                }}
                placeholder="הדביקו קישור למצגת / קובץ"
              />
            </div>
            <div className="field">
              <label>הערות</label>
              <textarea
                className="textarea"
                value={note}
                onChange={(e) => {
                  setNote(e.target.value);
                  setSaved(false);
                }}
              />
            </div>
          </>
        );
      case 'doc':
      default:
        return renderDoc((DOC_SCHEMAS[def.key] ?? DEFAULT_DOC_SCHEMA).sections);
    }
  }

  return (
    <div>
      <div className="purpose-box">
        <div className="label">מטרת התוצר</div>
        {def.purpose}
      </div>

      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
          <div className="row small" style={{ gap: 8 }}>
            <span className="muted">אחריות:</span>
            <RoleChips roles={def.assigneeRoles} />
          </div>
          <div className="field" style={{ marginBottom: 0, minWidth: 160 }}>
            <label className="small">תאריך יעד</label>
            <input
              className="input"
              type="date"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                setSaved(false);
              }}
            />
          </div>
        </div>

        {renderBody()}

        <div className="row" style={{ marginTop: 16, justifyContent: 'space-between' }}>
          <div className="field" style={{ marginBottom: 0, minWidth: 160 }}>
            <label className="small">סטטוס</label>
            <select
              className="select"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as DeliverableStatus);
                setSaved(false);
              }}
            >
              <option value="todo">טרם החל</option>
              <option value="in_progress">בתהליך</option>
              <option value="done">הושלם</option>
            </select>
          </div>
          <div className="row">
            <button type="button" className="btn ghost" onClick={save} disabled={pending}>
              שמירת טיוטה
            </button>
            <button type="button" className="btn" onClick={submitAsDone} disabled={pending}>
              {def.type === 'template' ? 'הגשת תוצר ✓' : 'סמן כהושלם ✓'}
            </button>
          </div>
        </div>
        {saved && <div className="notice ok" style={{ marginTop: 12 }}>נשמר בהצלחה ✓</div>}
      </div>
    </div>
  );
}
