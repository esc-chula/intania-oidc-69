# Reference-data mapping tables

CSV lookup tables that map the numeric **id** stored in student records to its
human-readable value (Thai / English) — and back. Each file is a single table
that works **both directions**: read `id → value`, or filter by a name to get
its `id`.

| File | Rows | Columns | `student.*` field that stores the id |
| --- | --- | --- | --- |
| `departments.csv` | 22 | `id, code, nameTh, nameEn` | `department.id` |
| `religions.csv` | 7 | `id, nameTh, nameEn` | `religion.id` |
| `countries.csv` | 250 | `id, code, name` | `nationality.id` |
| `provinces.csv` | 77 | `id, provinceCode, nameTh, nameEn` | `contactAddressProvince.id` |
| `districts.csv` | 930 | `id, districtCode, provinceCode, nameTh, nameEn` | `contactAddressDistrict.id` |

Notes:

- Encoded as UTF-8 **with BOM** so Excel opens the Thai columns correctly.
- A district belongs to the province with the matching `provinceCode`.
- Department ids are **append-only** — they are stable keys in the database, so
  a value's id never changes (see `src/data/departments.ts`).

## Source of truth & regeneration

These files are generated from `src/data/*.ts`. After editing that data,
regenerate them with:

```bash
node --experimental-strip-types scripts/generate-mapping-csv.mjs
```