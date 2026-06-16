-- מדיניות RLS: כלי פנימי — כל משתמש מחובר יכול לקרוא ולערוך.
-- (החלוקה לפי תפקיד נאכפת בשכבת ה-UI; כאן רק דורשים אימות.)

alter table app_users enable row level security;
alter table customers enable row level security;
alter table customer_deliverables enable row level security;
alter table weekly_summaries enable row level security;
alter table stage_transitions enable row level security;

-- app_users: כל מחובר רואה את כולם; כל אחד מעדכן את עצמו בלבד.
create policy "read users" on app_users for select to authenticated using (true);
create policy "update self" on app_users for update to authenticated using (auth.uid () = id);
create policy "insert self" on app_users for insert to authenticated with check (auth.uid () = id);

-- שאר הטבלאות: גישה מלאה למשתמשים מאומתים.
create policy "rw customers" on customers for all to authenticated using (true) with check (true);
create policy "rw deliverables" on customer_deliverables for all to authenticated using (true) with check (true);
create policy "rw summaries" on weekly_summaries for all to authenticated using (true) with check (true);
create policy "rw transitions" on stage_transitions for all to authenticated using (true) with check (true);
