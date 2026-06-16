-- הרחבת מגבלת השלב מ-1..3 ל-1..4 (נוסף שלב "שיפור ושימור").
alter table customers drop constraint if exists customers_current_stage_check;
alter table customers
  add constraint customers_current_stage_check check (current_stage between 1 and 4);
