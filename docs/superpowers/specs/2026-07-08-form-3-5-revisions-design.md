# Design: Registration form 3 & 5 revisions

- **Date:** 2026-07-08
- **Branch:** `feat/registration-form-revisions`
- **Status:** Approved

## Goal

Simplify two onboarding steps and their persisted schema:

1. **Form 3 (addresses):** remove the `nationalId` field; merge the separate
   *current address* and *hometown address* blocks into a single
   **contact address** ("ที่อยู่ที่สามารถติดต่อได้") the student fills once.
2. **Form 5 (family):** remove the father, mother, sibling, and
   family-status sections. Keep a single **parent/contact** block collecting
   name, relation to the student (บิดา / มารดา / free-text อื่น ๆ), and a
   phone number the faculty can call.

## Decisions (locked during brainstorming)

- Merged address → **new `contactAddress*` fields**; drop `currentAddress*`
  and `hometownAddress*` (including the unused lat/long).
- Parent relation → **single `parent` string**: a Select (บิดา / มารดา /
  อื่น ๆ); choosing อื่น ๆ reveals a text input and stores the typed value in
  `parent`.
- **Drop** `parentAddress`.

## Schema (`src/server/db/types.ts` + `src/server/db/student.ts`)

**Remove:** `nationalId`; `currentAddress{Number,Province,District,Latitude,Longitude,Other}`;
`hometownAddress{Number,Province,District,Latitude,Longitude,Other}`;
`fatherName`, `fatherBirthYear`, `fatherStatus`; `motherName`,
`motherBirthYear`, `motherStatus`; `familyStatus`; `siblingTotal`,
`siblingOrder`; `parentAddress`.

**Add:** `contactAddressNumber?: string`, `contactAddressProvince?: Province`,
`contactAddressDistrict?: District`, `contactAddressOther?: string`,
`parentName?: string`.

**Keep:** `parent?: string` (now the relation label), `parentPhoneNumber?: string`.

The Mongoose `contactAddress{Province,District}` use the existing `geoRefSchema`.

## Form 3

- Keep: nationality, religion, email, phone, lineId, facebook.
- Remove the `nationalId` field + its zod/binding entries.
- Replace the two address sections with one contact-address section:
  บ้านเลขที่ (`contactAddressNumber`), จังหวัด (`contactAddressProvinceId`,
  combobox), เขต/อำเภอ (`contactAddressDistrictId`, combobox filtered by the
  selected province), รายละเอียดที่อยู่ (`contactAddressOther`). All four
  **required** (matching today's current-address rules). Remove the hometown
  state (`selectedHomeProvince`) and its JSX; rename the current-address state
  to a single `selectedContactProvince`.
- On submit, write `contactAddressProvince: { id }`, `contactAddressDistrict:
  { id }`, `contactAddressNumber`, `contactAddressOther`.

## Form 5

- Remove all father/mother/sibling/family-status fields, bindings, and JSX.
- New zod schema: `parentName: z.string().min(1).max(150)`,
  `parent: z.string().min(1).max(100)`,
  `parentPhoneNumber: z.string().regex(/^\d{2,3}-\d{3,4}-\d{3,4}$/)`.
- Relation UI: local `relationChoice` state drives a Select
  (บิดา / มารดา / อื่น ๆ). Presets set `parent` to the Thai label; อื่น ๆ
  reveals an Input whose value is written to `parent`.
- Drop the `familyStatuses` / `familyMemberStatuses` props; the page stops
  passing them.

## Save & load across pages (explicit requirement)

The existing pattern must keep working: each step upserts on **ถัดไป**, and
each step's `useEffect` prefills from the server-fetched `studentData` on
mount (so forward/back navigation reloads saved values). New-field specifics:

- **Contact address:** add `bindingMap` entries — `contactAddressProvince`/
  `contactAddressDistrict` with `objectKey: ["id"]` (and `stateBinding` for the
  province combobox), `contactAddressNumber`, `contactAddressOther`. Confirm a
  saved address round-trips: fill → next → back → values restored.
- **Parent relation (the tricky one):** on load, derive `relationChoice` from
  the stored `parent`: `บิดา`/`มารดา` → that preset; any other non-empty value
  → `อื่น ๆ` with the free-text input pre-filled to the stored value. Verify a
  custom relation reloads showing อื่น ๆ + the typed text.

## Cleanup

- Delete `FamilyStatus` and `FamilyMemberStatus` from `types.ts`, their
  `valuedRefSchema` usages in `student.ts` (schema fields removed), and
  `src/data/family-statuses.ts` + its re-exports in `src/data/index.ts`.

## Migration

None. Fresh DB with no real records; the new schema simply stops reading/
writing the removed fields (Mongoose strict mode ignores any stale fields on
existing test docs). No `$unset` script.

## Verification

- `tsc --noEmit`, `next lint`, `pnpm test`, `next build` all clean.
- Runtime drive with a session cookie: `/onboarding/3` shows one address block
  and no nationalId; `/onboarding/5` shows name/relation/phone with the อื่น ๆ
  free-text path. Confirm save→next→back reloads values on both, including a
  custom relation.
- Update the verify skill's step-3/step-5 drive notes.

## Out of scope

Profile display (unchanged — shows only name + studentId); the other three
forms; any data migration.