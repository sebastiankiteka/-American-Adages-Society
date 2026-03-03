# Updating archive adage definitions

You can change the **definition**, **origin**, or **first_known_usage** (timeline) for any of the archive adages in two ways.

---

## Option A: Edit the SQL script and run it (recommended)

1. Open **`update-archive-adages-definitions.sql`** in this folder.
2. Find the adage you want to change (each has a comment like `-- 1`, `-- 2`, … `-- 56`).
3. Edit the quoted values for **definition**, **origin**, and/or **first_known_usage** in that line.  
   - Use single quotes for text; escape any single quote inside the text by doubling it: `'don''t'`.
4. In **Supabase**: go to **SQL Editor** → paste the full file (or only the `UPDATE` lines you changed) → **Run**.
5. The script updates by **adage text** and sets **updated_at** to the current time.

To update **only one** adage: copy that single `UPDATE adages SET ...` line into the SQL Editor and run it.

---

## Option B: Edit the table in Supabase

1. In **Supabase**, open **Table Editor** and select the **adages** table.
2. Find the row (use search/filter on the **adage** column for the proverb text).
3. Click the cell you want to change (**definition**, **origin**, or **first_known_usage**).
4. Edit the value and save (checkmark or blur the field).
5. **updated_at** may not change automatically; you can set it to “now” in SQL if you care:
   ```sql
   UPDATE adages SET updated_at = now() WHERE id = 'the-row-uuid';
   ```

---

## Columns you can change

| Column               | Meaning                          |
|----------------------|----------------------------------|
| **definition**       | Short explanation of the adage. |
| **origin**           | Source / citation.               |
| **first_known_usage**| Timeline (e.g. “Modern idiom”, “Classical Chinese proverb”). |

Other columns (e.g. **etymology**, **historical_context**, **interpretation**, **modern_practicality**) can also be edited the same way in the table or added to the `UPDATE` script if you want to maintain them there.
