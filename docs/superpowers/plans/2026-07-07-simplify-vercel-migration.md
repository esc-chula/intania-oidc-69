# Simplify to Vercel + Google Auth + MongoDB Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert `intania-oidc` from an Ory-Hydra/gRPC OIDC identity provider into a standalone Next.js 14 student-registration app on Vercel, with NextAuth v5 Google sign-in (`@student.chula.ac.th` only) and MongoDB Atlas storage.

**Architecture:** Incremental refactor. Build the new infrastructure first (pure auth helpers → types → static reference data → Mongoose layer → NextAuth), then rewire consumers page by page, then delete the legacy OIDC/gRPC/Docker world in one sweep, then update CI/docs. The old code keeps compiling until the deletion task.

**Tech Stack:** Next.js 14 App Router, TypeScript (strict), NextAuth (Auth.js) v5 beta, Mongoose 8, MongoDB Atlas, Tailwind + shadcn/ui (unchanged), vitest, pnpm.

**Spec:** `docs/superpowers/specs/2026-07-07-simplify-vercel-migration-design.md`

## Global Constraints

- Branch: `feat/simplify-vercel-migration`. Commit freely; **never push to GitHub**.
- Package manager: **pnpm** (delete `bun.lockb` in Task 9; never regenerate it).
- Code style: 4-space indent, double quotes, prettier with tailwind plugin (run `pnpm format` before each commit if unsure).
- Path alias: `@/*` → `./src/*`.
- UI copy is Thai; do not change existing Thai strings except where a task says so.
- Allowed sign-in domain, exact string: `student.chula.ac.th`. Rejection message, exact string: `กรุณาเข้าสู่ระบบด้วยอีเมลนิสิตจุฬาฯ (@student.chula.ac.th)`.
- Student ID = email local part (`693xxxxx21@student.chula.ac.th` → `693xxxxx21`).
- The five form components in `src/components/register/` must keep their existing props and behavior; only import paths and the two hardcoded `221` country checks in `2-form.tsx` may change.
- `next build` must succeed with **no env vars set** (CI has no secrets). Never validate env at module top-level; validate inside functions called at request time.
- The gRPC infinite-retry pattern must not be reproduced anywhere. Fail fast.
- TypeScript strict + `noUncheckedIndexedAccess` are on — index access returns `T | undefined`.

---

### Task 1: Dependencies and scripts

**Files:**
- Modify: `package.json`

**Interfaces:**
- Produces: `next-auth` (v5 beta) and `mongoose` importable; `pnpm test` (vitest run), `pnpm typecheck` (tsc --noEmit) scripts.

- [ ] **Step 1: Verify pnpm is available**

Run: `pnpm --version`
Expected: a version number (any 8+/9+/10+). If the command is missing, run `corepack enable` and retry.

- [ ] **Step 2: Install new dependencies**

Run (from the repo root):
```bash
pnpm add next-auth@beta mongoose
pnpm add -D vitest
```
Expected: `package.json` gains `"next-auth": "5.0.0-beta.x"` (any beta), `"mongoose": "^8.x"`, and devDependency `"vitest": "^3.x"` (2.x also fine). `pnpm-lock.yaml` updated. Do NOT remove any old dependency yet — legacy code must keep compiling until Task 9.

- [ ] **Step 3: Add scripts**

In `package.json`, change the `scripts` block to:
```json
"scripts": {
    "build": "next build",
    "dev": "next dev",
    "lint": "next lint",
    "start": "next start",
    "format": "prettier --write .",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
}
```

- [ ] **Step 4: Sanity check**

Run: `pnpm typecheck`
Expected: PASS (no output / exit 0). The codebase currently typechecks; if pre-existing errors appear, report them — do not fix unrelated code.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add next-auth v5, mongoose, vitest"
```

---

### Task 2: Pure auth helpers (TDD)

**Files:**
- Create: `src/lib/auth-shared.ts`
- Test: `src/lib/auth-shared.test.ts`

**Interfaces:**
- Produces:
  - `ALLOWED_EMAIL_DOMAIN: string` — `"student.chula.ac.th"`
  - `isAllowedEmail(email: string | null | undefined): boolean`
  - `studentIdFromEmail(email: string): string`
- Consumed by Task 6 (`src/server/auth.ts`).

- [ ] **Step 1: Write the failing test**

Create `src/lib/auth-shared.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import {
    ALLOWED_EMAIL_DOMAIN,
    isAllowedEmail,
    studentIdFromEmail,
} from "./auth-shared";

describe("isAllowedEmail", () => {
    it("accepts a student.chula.ac.th address", () => {
        expect(isAllowedEmail("6930000021@student.chula.ac.th")).toBe(true);
    });

    it("accepts mixed-case domain", () => {
        expect(isAllowedEmail("6930000021@Student.Chula.ac.th")).toBe(true);
    });

    it("rejects other domains", () => {
        expect(isAllowedEmail("someone@gmail.com")).toBe(false);
        expect(isAllowedEmail("staff@chula.ac.th")).toBe(false);
    });

    it("rejects lookalike domains", () => {
        expect(isAllowedEmail("x@student.chula.ac.th.evil.com")).toBe(false);
        expect(isAllowedEmail("x@notstudent.chula.ac.th")).toBe(false);
    });

    it("rejects null, undefined, and empty", () => {
        expect(isAllowedEmail(null)).toBe(false);
        expect(isAllowedEmail(undefined)).toBe(false);
        expect(isAllowedEmail("")).toBe(false);
    });

    it("exposes the expected domain constant", () => {
        expect(ALLOWED_EMAIL_DOMAIN).toBe("student.chula.ac.th");
    });
});

describe("studentIdFromEmail", () => {
    it("returns the local part", () => {
        expect(studentIdFromEmail("6930000021@student.chula.ac.th")).toBe(
            "6930000021",
        );
    });

    it("returns empty string for a string without local part", () => {
        expect(studentIdFromEmail("@student.chula.ac.th")).toBe("");
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test`
Expected: FAIL — cannot resolve `./auth-shared`.

- [ ] **Step 3: Write the implementation**

Create `src/lib/auth-shared.ts`:
```ts
export const ALLOWED_EMAIL_DOMAIN = "student.chula.ac.th";

export function isAllowedEmail(email: string | null | undefined): boolean {
    if (!email) return false;
    return email.toLowerCase().endsWith(`@${ALLOWED_EMAIL_DOMAIN}`);
}

export function studentIdFromEmail(email: string): string {
    return email.split("@")[0] ?? "";
}
```
Note: `x@notstudent.chula.ac.th` must fail — the `@` in the `endsWith` needle guarantees it.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test`
Expected: PASS, 8 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth-shared.ts src/lib/auth-shared.test.ts
git commit -m "feat: add email domain check and student id extraction"
```

---

### Task 3: Hand-written Student and reference types

**Files:**
- Create: `src/server/db/types.ts`

**Interfaces:**
- Produces (all exported from `src/server/db/types.ts`): `Student`, `Department`, `Country`, `Religion`, `FamilyStatus`, `FamilyMemberStatus`, `Province`, `District`.
- These intentionally mirror `src/generated/intania/auth/student/v1/student.ts` (lines 78–210) minus gRPC baggage, so form components keep compiling when their import path is swapped in Task 8.

- [ ] **Step 1: Create the types file**

Create `src/server/db/types.ts` with exactly:
```ts
// Plain replacements for the protobuf-generated student types.
// Shapes must stay compatible with the form components in
// src/components/register/, which were written against the proto types.

export interface Department {
    id: number;
    nameTh?: string | undefined;
    nameEn?: string | undefined;
    code?: string | undefined;
}

export interface Country {
    id: number;
    name?: string | undefined;
    code?: string | undefined;
}

export interface Religion {
    id: number;
    nameTh?: string | undefined;
    nameEn?: string | undefined;
}

export interface FamilyStatus {
    id: number;
    valueTh?: string | undefined;
    valueEn?: string | undefined;
}

export interface FamilyMemberStatus {
    id: number;
    valueTh?: string | undefined;
    valueEn?: string | undefined;
}

export interface Province {
    id: number;
    nameTh?: string | undefined;
    nameEn?: string | undefined;
    provinceCode?: number | undefined;
}

export interface District {
    id: number;
    nameTh?: string | undefined;
    nameEn?: string | undefined;
    provinceCode?: number | undefined;
    districtCode?: number | undefined;
    postalCode?: number | undefined;
}

export interface Student {
    /** Legacy numeric id from the gRPC era. Ignored by the server; kept so
     * form components that submit `id: studentData.id` keep compiling. */
    id?: number | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    profilePictureKey?: string | undefined;
    /** Student related data */
    studentId?: string | undefined;
    department?: Department | undefined;
    /** Personal data 1 */
    titleTh?: string | undefined;
    titleEn?: string | undefined;
    firstNameTh?: string | undefined;
    firstNameEn?: string | undefined;
    familyNameTh?: string | undefined;
    familyNameEn?: string | undefined;
    middleNameTh?: string | undefined;
    middleNameEn?: string | undefined;
    nicknameTh?: string | undefined;
    nicknameEn?: string | undefined;
    preferredPronoun?: string | undefined;
    nationalId?: string | undefined;
    /** Personal data 2 */
    nationality?: Country | undefined;
    birthDate?: Date | undefined;
    religion?: Religion | undefined;
    bloodType?: string | undefined;
    foodLimitations?: string | undefined;
    drugAllergies?: string | undefined;
    medicalConditions?: string | undefined;
    medications?: string | undefined;
    shirtSize?: number | undefined;
    /** Social */
    email?: string | undefined;
    emailVerified?: boolean | undefined;
    phoneNumber?: string | undefined;
    phoneNumberVerified?: boolean | undefined;
    lineId?: string | undefined;
    facebook?: string | undefined;
    instagram?: string | undefined;
    /** Family */
    familyStatus?: FamilyStatus | undefined;
    /** string enum: "Father", "Mother", "Other" */
    parent?: string | undefined;
    siblingTotal?: number | undefined;
    siblingOrder?: number | undefined;
    parentPhoneNumber?: string | undefined;
    parentAddress?: string | undefined;
    /** Father & Mother */
    fatherName?: string | undefined;
    fatherBirthYear?: number | undefined;
    fatherStatus?: FamilyMemberStatus | undefined;
    motherName?: string | undefined;
    motherBirthYear?: number | undefined;
    motherStatus?: FamilyMemberStatus | undefined;
    /** Current address */
    currentAddressNumber?: string | undefined;
    currentAddressProvince?: Province | undefined;
    currentAddressDistrict?: District | undefined;
    currentAddressLatitude?: number | undefined;
    currentAddressLongitude?: number | undefined;
    currentAddressOther?: string | undefined;
    /** Hometown address */
    hometownAddressNumber?: string | undefined;
    hometownAddressProvince?: Province | undefined;
    hometownAddressDistrict?: District | undefined;
    hometownAddressLatitude?: number | undefined;
    hometownAddressLongitude?: number | undefined;
    hometownAddressOther?: string | undefined;
    /** Miscellaneous */
    cueaDataTransferAgreement?: boolean | undefined;
}
```
Differences from the proto version, on purpose: `id` is optional (Mongo has no numeric id; forms still send it, server ignores it); reference types drop `createdAt`/`updatedAt` (never used by the UI).

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/server/db/types.ts
git commit -m "feat: add hand-written student and reference types"
```

---

### Task 4: Static reference data

**Files:**
- Create: `scripts/generate-geo-data.mjs` (generator, kept for regeneration)
- Create: `src/data/departments.ts`, `src/data/religions.ts`, `src/data/family-statuses.ts` (hand-written)
- Create: `src/data/provinces.ts`, `src/data/districts.ts`, `src/data/countries.ts` (generated by the script)
- Create: `src/data/index.ts`

**Interfaces:**
- Produces (via `src/data/index.ts` re-exports):
  - `departments: Department[]`, `religions: Religion[]`, `familyStatuses: FamilyStatus[]`, `familyMemberStatuses: FamilyMemberStatus[]`, `countries: Country[]`, `provinces: Province[]`, `districts: District[]`
  - `THAILAND_COUNTRY_ID: number` (from `src/data/countries.ts`)
- Invariants the UI depends on (`2-form.tsx`): every district's `provinceCode` equals its province's `provinceCode`; a province named exactly `กรุงเทพมหานคร` exists; countries use English `name`; Thailand's entry is found via `THAILAND_COUNTRY_ID`.

- [ ] **Step 1: Write the hand-written data files**

Create `src/data/departments.ts`:
```ts
import type { Department } from "@/server/db/types";

// รายชื่อภาควิชา/หลักสูตร คณะวิศวกรรมศาสตร์ จุฬาฯ — แก้ไขรายการได้ที่ไฟล์นี้
export const departments: Department[] = [
    { id: 1, nameTh: "วิศวกรรมโยธา", nameEn: "Civil Engineering", code: "CE" },
    {
        id: 2,
        nameTh: "วิศวกรรมไฟฟ้า",
        nameEn: "Electrical Engineering",
        code: "EE",
    },
    {
        id: 3,
        nameTh: "วิศวกรรมเครื่องกล",
        nameEn: "Mechanical Engineering",
        code: "ME",
    },
    {
        id: 4,
        nameTh: "วิศวกรรมอุตสาหการ",
        nameEn: "Industrial Engineering",
        code: "IE",
    },
    {
        id: 5,
        nameTh: "วิศวกรรมเคมี",
        nameEn: "Chemical Engineering",
        code: "CHE",
    },
    {
        id: 6,
        nameTh: "วิศวกรรมเหมืองแร่และปิโตรเลียม",
        nameEn: "Mining and Petroleum Engineering",
        code: "MN",
    },
    {
        id: 7,
        nameTh: "วิศวกรรมสิ่งแวดล้อม",
        nameEn: "Environmental Engineering",
        code: "ENV",
    },
    {
        id: 8,
        nameTh: "วิศวกรรมสำรวจ",
        nameEn: "Survey Engineering",
        code: "SV",
    },
    {
        id: 9,
        nameTh: "วิศวกรรมโลหการ",
        nameEn: "Metallurgical Engineering",
        code: "MT",
    },
    {
        id: 10,
        nameTh: "วิศวกรรมคอมพิวเตอร์",
        nameEn: "Computer Engineering",
        code: "CP",
    },
    {
        id: 11,
        nameTh: "วิศวกรรมนิวเคลียร์",
        nameEn: "Nuclear Engineering",
        code: "NE",
    },
    {
        id: 12,
        nameTh: "วิศวกรรมแหล่งน้ำ",
        nameEn: "Water Resources Engineering",
        code: "WR",
    },
    {
        id: 13,
        nameTh: "วิศวกรรมคอมพิวเตอร์และเทคโนโลยีดิจิทัล (CEDT)",
        nameEn: "Computer Engineering and Digital Technology",
        code: "CEDT",
    },
    {
        id: 14,
        nameTh: "หลักสูตรนานาชาติ (ISE)",
        nameEn: "International School of Engineering",
        code: "ISE",
    },
];
```

Create `src/data/religions.ts`:
```ts
import type { Religion } from "@/server/db/types";

export const religions: Religion[] = [
    { id: 1, nameTh: "พุทธ", nameEn: "Buddhism" },
    { id: 2, nameTh: "อิสลาม", nameEn: "Islam" },
    { id: 3, nameTh: "คริสต์", nameEn: "Christianity" },
    { id: 4, nameTh: "ฮินดู", nameEn: "Hinduism" },
    { id: 5, nameTh: "ซิกข์", nameEn: "Sikhism" },
    { id: 6, nameTh: "ไม่นับถือศาสนา", nameEn: "None" },
    { id: 7, nameTh: "อื่น ๆ", nameEn: "Other" },
];
```

Create `src/data/family-statuses.ts`:
```ts
import type { FamilyMemberStatus, FamilyStatus } from "@/server/db/types";

export const familyStatuses: FamilyStatus[] = [
    { id: 1, valueTh: "อยู่ด้วยกัน", valueEn: "Together" },
    { id: 2, valueTh: "แยกกันอยู่", valueEn: "Separated" },
    { id: 3, valueTh: "หย่าร้าง", valueEn: "Divorced" },
    { id: 4, valueTh: "อื่น ๆ", valueEn: "Other" },
];

export const familyMemberStatuses: FamilyMemberStatus[] = [
    { id: 1, valueTh: "มีชีวิตอยู่", valueEn: "Alive" },
    { id: 2, valueTh: "เสียชีวิต", valueEn: "Deceased" },
    { id: 3, valueTh: "ไม่ทราบ", valueEn: "Unknown" },
];
```

- [ ] **Step 2: Write the generator script**

Create `scripts/generate-geo-data.mjs`:
```js
// One-time generator for src/data/{provinces,districts,countries}.ts
// Sources:
//   Thai provinces/districts: https://github.com/kongvut/thai-province-data (MIT)
//   Countries: https://github.com/mledoze/countries (ODbL)
// Usage: node scripts/generate-geo-data.mjs && pnpm format
import { writeFileSync } from "node:fs";

const PROVINCE_URL =
    "https://raw.githubusercontent.com/kongvut/thai-province-data/master/api/latest/province.json";
const AMPHURE_URL =
    "https://raw.githubusercontent.com/kongvut/thai-province-data/master/api/latest/amphure.json";
const COUNTRY_URL =
    "https://raw.githubusercontent.com/mledoze/countries/master/countries.json";

async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
    return res.json();
}

const [provincesRaw, amphuresRaw, countriesRaw] = await Promise.all([
    fetchJson(PROVINCE_URL),
    fetchJson(AMPHURE_URL),
    fetchJson(COUNTRY_URL),
]);

const provinces = provincesRaw.map((p) => ({
    id: p.id,
    nameTh: p.name_th,
    nameEn: p.name_en,
    provinceCode: p.id,
}));

const districts = amphuresRaw.map((a) => ({
    id: a.id,
    nameTh: a.name_th,
    nameEn: a.name_en,
    provinceCode: a.province_id,
    districtCode: a.id,
}));

const countries = countriesRaw
    .map((c) => ({ name: c.name.common, code: c.cca2 }))
    .sort((a, b) => a.name.localeCompare(b.name, "en"))
    .map((c, i) => ({ id: i + 1, ...c }));

const thailand = countries.find((c) => c.name === "Thailand");
if (!thailand) throw new Error("Thailand missing from country data");
const bangkok = provinces.find((p) => p.nameTh === "กรุงเทพมหานคร");
if (!bangkok) throw new Error("กรุงเทพมหานคร missing from province data");

function file(typeName, varName, rows, extra = "") {
    return (
        `// Generated by scripts/generate-geo-data.mjs — do not edit by hand.\n` +
        `import type { ${typeName} } from "@/server/db/types";\n\n` +
        `export const ${varName}: ${typeName}[] = ${JSON.stringify(rows)};\n` +
        extra
    );
}

writeFileSync(
    "src/data/provinces.ts",
    file("Province", "provinces", provinces),
);
writeFileSync("src/data/districts.ts", file("District", "districts", districts));
writeFileSync(
    "src/data/countries.ts",
    file(
        "Country",
        "countries",
        countries,
        `\nexport const THAILAND_COUNTRY_ID = ${thailand.id};\n`,
    ),
);

console.log(
    `provinces=${provinces.length} districts=${districts.length} countries=${countries.length} thailandId=${thailand.id}`,
);
```

- [ ] **Step 3: Run the generator**

Run: `node scripts/generate-geo-data.mjs && pnpm format`
Expected output like: `provinces=77 districts=928 countries=250 thailandId=<n>` and three new files in `src/data/`. If the network fetch fails, stop and report — do not hand-fabricate geo data.

- [ ] **Step 4: Create the barrel**

Create `src/data/index.ts`:
```ts
export { departments } from "./departments";
export { religions } from "./religions";
export { familyStatuses, familyMemberStatuses } from "./family-statuses";
export { countries, THAILAND_COUNTRY_ID } from "./countries";
export { provinces } from "./provinces";
export { districts } from "./districts";
```

- [ ] **Step 5: Verify**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add scripts/generate-geo-data.mjs src/data
git commit -m "feat: add static reference data with geo generator script"
```

---

### Task 5: Mongoose connection and student store

**Files:**
- Create: `src/server/db/mongoose.ts`
- Create: `src/server/db/student.ts`

**Interfaces:**
- Consumes: `Student` type from Task 3.
- Produces:
  - `connectDb(): Promise<typeof import("mongoose")>` from `src/server/db/mongoose.ts`
  - `getOrCreateStudent(studentId: string, email: string): Promise<Student>` from `src/server/db/student.ts`
  - `upsertStudent(studentId: string, data: Student): Promise<void>` from `src/server/db/student.ts`
- No retry loops. Missing `MONGODB_URI` throws a clear error at call time (never at import time — CI builds without env vars).

- [ ] **Step 1: Write the connection helper**

Create `src/server/db/mongoose.ts`:
```ts
import mongoose from "mongoose";

// Cached across hot reloads in dev and across invocations of a warm
// serverless function in production.
const globalForMongoose = globalThis as unknown as {
    mongooseConn?: Promise<typeof mongoose>;
};

export function connectDb(): Promise<typeof mongoose> {
    if (!globalForMongoose.mongooseConn) {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error("MONGODB_URI is not set");
        }
        globalForMongoose.mongooseConn = mongoose
            .connect(uri, { serverSelectionTimeoutMS: 5000 })
            .catch((err) => {
                // Allow the next request to retry instead of caching a rejection.
                globalForMongoose.mongooseConn = undefined;
                throw err;
            });
    }
    return globalForMongoose.mongooseConn;
}
```

- [ ] **Step 2: Write the student model and store**

Create `src/server/db/student.ts`:
```ts
import mongoose, { Schema } from "mongoose";
import { connectDb } from "./mongoose";
import type { Student } from "./types";

const ref = { _id: false, id: false };

const namedRefSchema = new Schema(
    { id: Number, nameTh: String, nameEn: String, code: String },
    ref,
);
const countryRefSchema = new Schema({ id: Number, name: String, code: String }, ref);
const valuedRefSchema = new Schema(
    { id: Number, valueTh: String, valueEn: String },
    ref,
);
const geoRefSchema = new Schema(
    {
        id: Number,
        nameTh: String,
        nameEn: String,
        provinceCode: Number,
        districtCode: Number,
        postalCode: Number,
    },
    ref,
);

const studentSchema = new Schema<Student>(
    {
        studentId: { type: String, required: true, unique: true },
        email: { type: String, required: true },
        emailVerified: Boolean,
        phoneNumber: String,
        phoneNumberVerified: Boolean,
        profilePictureKey: String,
        department: namedRefSchema,
        titleTh: String,
        titleEn: String,
        firstNameTh: String,
        firstNameEn: String,
        familyNameTh: String,
        familyNameEn: String,
        middleNameTh: String,
        middleNameEn: String,
        nicknameTh: String,
        nicknameEn: String,
        preferredPronoun: String,
        nationalId: String,
        nationality: countryRefSchema,
        birthDate: Date,
        religion: namedRefSchema,
        bloodType: String,
        foodLimitations: String,
        drugAllergies: String,
        medicalConditions: String,
        medications: String,
        shirtSize: Number,
        lineId: String,
        facebook: String,
        instagram: String,
        familyStatus: valuedRefSchema,
        parent: String,
        siblingTotal: Number,
        siblingOrder: Number,
        parentPhoneNumber: String,
        parentAddress: String,
        fatherName: String,
        fatherBirthYear: Number,
        fatherStatus: valuedRefSchema,
        motherName: String,
        motherBirthYear: Number,
        motherStatus: valuedRefSchema,
        currentAddressNumber: String,
        currentAddressProvince: geoRefSchema,
        currentAddressDistrict: geoRefSchema,
        currentAddressLatitude: Number,
        currentAddressLongitude: Number,
        currentAddressOther: String,
        hometownAddressNumber: String,
        hometownAddressProvince: geoRefSchema,
        hometownAddressDistrict: geoRefSchema,
        hometownAddressLatitude: Number,
        hometownAddressLongitude: Number,
        hometownAddressOther: String,
        cueaDataTransferAgreement: Boolean,
    },
    { timestamps: true },
);

const StudentModel: mongoose.Model<Student> =
    (mongoose.models.Student as mongoose.Model<Student>) ??
    mongoose.model<Student>("Student", studentSchema);

/** Fields a client payload must never overwrite (same policy as the old
 * gRPC field-mask map, which marked these null/non-editable). */
const PROTECTED_FIELDS = [
    "id",
    "studentId",
    "createdAt",
    "updatedAt",
    "profilePictureKey",
    "emailVerified",
    "phoneNumberVerified",
] as const;

function toPlain(doc: Record<string, unknown>): Student {
    const { _id, __v, ...student } = doc;
    return student as Student;
}

export async function getOrCreateStudent(
    studentId: string,
    email: string,
): Promise<Student> {
    await connectDb();
    const doc = await StudentModel.findOneAndUpdate(
        { studentId },
        { $setOnInsert: { studentId, email, emailVerified: true } },
        { upsert: true, new: true },
    ).lean();
    return toPlain(doc as Record<string, unknown>);
}

export async function upsertStudent(
    studentId: string,
    data: Student,
): Promise<void> {
    await connectDb();

    const fields: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
        if ((PROTECTED_FIELDS as readonly string[]).includes(key)) continue;
        if (value === undefined) continue;
        fields[key] = value;
    }

    await StudentModel.updateOne({ studentId }, { $set: fields }, { upsert: true });
}
```
Notes for the implementer:
- `{ _id: false, id: false }` on subschemas stops Mongoose from adding ObjectIds to nested refs and lets our numeric `id` field pass through unchanged.
- `.lean()` returns POJOs; `toPlain` strips `_id`/`__v` so the object is serializable to client components.
- `upsertStudent` upserts (not update-only) so a mid-flow document loss can't strand a signed-in user.

- [ ] **Step 3: Verify**

Run: `pnpm typecheck`
Expected: PASS. (If `mongoose.models.Student` typing complains, the `as mongoose.Model<Student>` cast shown above is the accepted pattern.)

- [ ] **Step 4: Commit**

```bash
git add src/server/db/mongoose.ts src/server/db/student.ts
git commit -m "feat: add mongoose connection and student store"
```

---

### Task 6: NextAuth v5 wiring

**Files:**
- Create: `src/server/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/types/next-auth.d.ts`
- Create: `src/server/actions/auth.ts`
- Create: `src/server/require-student.ts`
- Modify: `.env.example` (full replacement)

**Interfaces:**
- Consumes: `isAllowedEmail`, `studentIdFromEmail`, `ALLOWED_EMAIL_DOMAIN` (Task 2); `getOrCreateStudent` (Task 5).
- Produces:
  - `auth`, `signIn`, `signOut`, `handlers` from `src/server/auth.ts`
  - `session.user.studentId: string` (typed via module augmentation)
  - Server actions `signInWithGoogle(): Promise<void>` and `logout(): Promise<void>` from `src/server/actions/auth.ts`
  - `requireStudent(): Promise<Student>` from `src/server/require-student.ts` — redirects to `/` when unauthenticated
- Behavior: non-`student.chula.ac.th` emails are rejected by the `signIn` callback → NextAuth redirects to `/?error=AccessDenied` (because `pages.signIn` and `pages.error` are `/`).

- [ ] **Step 1: Write the NextAuth config**

Create `src/server/auth.ts`:
```ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import {
    ALLOWED_EMAIL_DOMAIN,
    isAllowedEmail,
    studentIdFromEmail,
} from "@/lib/auth-shared";

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Google({
            authorization: {
                params: {
                    // UX hint only: pre-filters the Google account picker.
                    // Real enforcement happens in the signIn callback below.
                    hd: ALLOWED_EMAIL_DOMAIN,
                    prompt: "select_account",
                },
            },
        }),
    ],
    session: { strategy: "jwt" },
    pages: {
        signIn: "/",
        error: "/",
    },
    callbacks: {
        signIn({ profile }) {
            return isAllowedEmail(profile?.email);
        },
        jwt({ token, profile }) {
            if (profile?.email) {
                token.studentId = studentIdFromEmail(profile.email);
            }
            return token;
        },
        session({ session, token }) {
            if (typeof token.studentId === "string") {
                session.user.studentId = token.studentId;
            }
            return session;
        },
    },
});
```

- [ ] **Step 2: Write the route handler**

Create `src/app/api/auth/[...nextauth]/route.ts`:
```ts
import { handlers } from "@/server/auth";

export const { GET, POST } = handlers;
```

- [ ] **Step 3: Write the type augmentation**

Create `src/types/next-auth.d.ts`:
```ts
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            studentId: string;
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        studentId?: string;
    }
}
```

- [ ] **Step 4: Write the auth server actions**

Create `src/server/actions/auth.ts`:
```ts
"use server";

import { signIn, signOut } from "@/server/auth";

export async function signInWithGoogle(): Promise<void> {
    await signIn("google", { redirectTo: "/profile" });
}

export async function logout(): Promise<void> {
    await signOut({ redirectTo: "/" });
}
```

- [ ] **Step 5: Write the page-level session helper**

Create `src/server/require-student.ts`:
```ts
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { getOrCreateStudent } from "@/server/db/student";
import type { Student } from "@/server/db/types";

/** For server components: returns the signed-in student's document,
 * creating it on first visit. Redirects to the login page when there is
 * no session. */
export async function requireStudent(): Promise<Student> {
    const session = await auth();
    const studentId = session?.user?.studentId;
    const email = session?.user?.email;
    if (!studentId || !email) {
        redirect("/");
    }
    return getOrCreateStudent(studentId, email);
}
```

- [ ] **Step 6: Replace `.env.example`**

Replace the entire content of `.env.example` with:
```bash
# NextAuth — generate AUTH_SECRET with: openssl rand -base64 32
AUTH_SECRET=""
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
# Local dev only (Vercel sets this automatically)
AUTH_URL="http://localhost:3000"

# MongoDB Atlas connection string, including the database name
MONGODB_URI="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/intania-registration"
```

- [ ] **Step 7: Verify**

Run: `pnpm typecheck && pnpm test`
Expected: both PASS.

- [ ] **Step 8: Commit**

```bash
git add src/server/auth.ts src/app/api/auth src/types/next-auth.d.ts src/server/actions/auth.ts src/server/require-student.ts .env.example
git commit -m "feat: add NextAuth v5 Google auth restricted to student emails"
```

---

### Task 7: Rewire login, logout, and route protection

**Files:**
- Modify: `src/app/page.tsx` (full replacement)
- Modify: `src/components/login/login-box.tsx` (full replacement)
- Modify: `src/app/logout/page.tsx`
- Modify: `src/app/register/onboarding/layout.tsx`
- Modify: `src/app/register/page.tsx` (full replacement)
- Create: `src/app/error.tsx`

**Interfaces:**
- Consumes: `auth` (Task 6), `signInWithGoogle`/`logout` actions (Task 6).
- Produces: `LoginBox` prop change — now `{ errorMessage?: string | null }`.

- [ ] **Step 1: Replace the home page**

Replace `src/app/page.tsx` entirely with:
```tsx
import LoginBox from "@/components/login/login-box";
import LoginFooter from "@/components/login/login-footer";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";

const ERROR_MESSAGES: Record<string, string> = {
    AccessDenied: "กรุณาเข้าสู่ระบบด้วยอีเมลนิสิตจุฬาฯ (@student.chula.ac.th)",
};

const DEFAULT_ERROR_MESSAGE =
    "เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง";

export default async function Page({
    searchParams,
}: {
    searchParams: { error?: string };
}) {
    const session = await auth();
    if (session?.user?.studentId) {
        redirect("/profile");
    }

    const errorMessage = searchParams.error
        ? (ERROR_MESSAGES[searchParams.error] ?? DEFAULT_ERROR_MESSAGE)
        : null;

    return (
        <div className="flex size-full flex-col items-center">
            <div className="absolute top-1/2 flex size-full max-w-3xl -translate-y-1/2 flex-col items-center justify-between md:h-auto md:justify-center md:px-32 lg:max-w-6xl">
                <LoginBox errorMessage={errorMessage} />
                <LoginFooter />
            </div>
        </div>
    );
}
```
(The old `validateRedirectUrl` / `ALLOW_REDIRECT_URLS` logic is gone on purpose — no other app redirects here anymore.)

- [ ] **Step 2: Replace the login box**

Replace `src/components/login/login-box.tsx` entirely with:
```tsx
import ESCLogoWithoutText from "@/components/esc/esc-logo-without-text";
import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/server/actions/auth";

function GoogleIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
            <path
                fill="#4285F4"
                d="M23.52 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81Z"
            />
            <path
                fill="#34A853"
                d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3.01c-1.07.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.72-4.95H1.27v3.11A12 12 0 0 0 12 24Z"
            />
            <path
                fill="#FBBC05"
                d="M5.28 14.28A7.22 7.22 0 0 1 4.9 12c0-.79.14-1.56.38-2.28V6.61H1.27a12 12 0 0 0 0 10.78l4.01-3.11Z"
            />
            <path
                fill="#EA4335"
                d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.97 11.97 0 0 0 12 0 12 12 0 0 0 1.27 6.61l4.01 3.11C6.22 6.88 8.87 4.77 12 4.77Z"
            />
        </svg>
    );
}

export default function LoginBox({
    errorMessage,
}: {
    errorMessage?: string | null;
}) {
    return (
        <div className="relative flex size-full flex-col gap-16 rounded-2xl border-[#F5F5F5] p-12 md:aspect-[614/764] md:border-2 md:bg-card md:shadow-2xl lg:aspect-[1024/460] lg:grid-cols-2 lg:flex-row lg:p-14">
            <div className="flex w-full flex-col justify-between text-center md:text-start">
                <div className="flex flex-col items-center gap-10 md:items-start">
                    <ESCLogoWithoutText className="h-14 w-fit fill-primary md:h-16" />
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-semibold md:text-3xl">
                            เข้าสู่ระบบ
                        </h2>
                        <h1 className="text-5xl font-bold text-primary md:text-6xl">
                            INTANIA
                        </h1>
                        <p className="font-medium text-muted-foreground md:text-xl">
                            ใช้อีเมลนิสิตจุฬาฯ (@student.chula.ac.th)
                            เพื่อเข้าสู่ระบบ
                        </p>
                    </div>
                </div>
                <p className="text-red-500">{errorMessage}</p>
            </div>
            <form
                action={signInWithGoogle}
                className="flex w-full flex-col items-center justify-center gap-5 lg:place-self-center"
            >
                <Button
                    type="submit"
                    size="lg"
                    variant="outline"
                    className="flex w-full max-w-sm items-center justify-center gap-3 py-6 text-base md:text-lg"
                >
                    <GoogleIcon className="h-5 w-5" />
                    เข้าสู่ระบบด้วย Google
                </Button>
            </form>
        </div>
    );
}
```
Note: this is now a **server component** (no `"use client"`, no react-hook-form) — a plain `<form action>` posting to a server action.

- [ ] **Step 3: Update logout**

Replace `src/app/logout/page.tsx` entirely with:
```tsx
"use client";

import { logout } from "@/server/actions/auth";
import { useEffect } from "react";

export default function Logout() {
    useEffect(() => {
        logout().catch(console.error);
    }, []);

    return null;
}
```

- [ ] **Step 4: Update the onboarding layout guard**

In `src/app/register/onboarding/layout.tsx`, replace the cookie check. The whole file becomes:
```tsx
import StudentFormContextProvider from "@/contexts/form-context";
import Transition from "./template";
import { redirect } from "next/navigation";
import Header from "@/components/register/header";
import { auth } from "@/server/auth";

export default async function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session?.user?.studentId) {
        redirect("/");
    }

    return (
        <article className="flex size-full flex-col gap-16 px-6 py-7 md:gap-24">
            <StudentFormContextProvider>
                <Header />
                <Transition>{children}</Transition>
            </StudentFormContextProvider>
        </article>
    );
}
```

- [ ] **Step 5: Replace the register landing page**

Replace `src/app/register/page.tsx` entirely with:
```tsx
import ESCLogoWithoutText from "@/components/esc/esc-logo-without-text";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { auth } from "@/server/auth";

export default async function Page() {
    const session = await auth();
    const studentId = session?.user?.studentId;

    return (
        <div className="flex size-full flex-col items-center">
            <div className="relative flex size-full min-h-dvh flex-col justify-between gap-16 rounded-2xl p-6 sm:p-8 md:p-12">
                <div className="flex w-full flex-col items-center gap-10 text-center">
                    <ESCLogoWithoutText className="h-14 w-fit fill-primary md:h-16" />
                    <div className="flex flex-col gap-2">
                        <h2 className="text-xl font-semibold sm:text-2xl md:text-3xl">
                            เข้าสู่ระบบ
                        </h2>
                        <h1 className="text-4xl font-bold text-primary sm:text-5xl md:text-6xl">
                            ลงทะเบียนนิสิตใหม่
                        </h1>
                        <p className="flex flex-wrap items-center justify-center gap-2 text-center text-sm font-medium sm:text-base md:text-xl">
                            แบบฟอร์มลงทะเบียนนิสิตใหม่
                            {studentId && (
                                <span>ปีการศึกษา 25{studentId.slice(0, 2)}</span>
                            )}
                        </p>
                    </div>
                </div>
                <div>
                    <Card className="mx-auto max-w-screen-sm">
                        <CardContent className="pt-6 text-center text-muted-foreground">
                            ข้อมูลที่กรอกนับจากนี้จะถูกนำไปใช้ตลอดการมีสถานะเป็นนิสิตคณะวิศวะฯจุฬาฯ
                            โปรดตรวจสอบและยืนยัน
                            ความถูกต้องหลังจากกรอกเสร็จและส่ง
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="size-full py-3 text-base md:text-xl"
                                size="lg"
                                asChild
                            >
                                <Link
                                    href={
                                        studentId
                                            ? "/register/onboarding/1"
                                            : "/"
                                    }
                                >
                                    เริ่มต้น
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                    {studentId && (
                        <div className="pt-4 text-center text-sm text-neutral-500">
                            <Link href="/logout" className="hover:underline">
                                ลงทะเบียนด้วยบัญชีอื่น
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
```

- [ ] **Step 6: Add the error boundary**

Create `src/app/error.tsx`:
```tsx
"use client";

import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
    return (
        <div className="flex min-h-dvh flex-col items-center justify-center gap-6 p-6 text-center">
            <h1 className="text-2xl font-semibold">เกิดข้อผิดพลาดบางอย่าง</h1>
            <p className="text-muted-foreground">
                กรุณาลองใหม่อีกครั้ง หากยังพบปัญหาโปรดติดต่อทีมงาน
            </p>
            <Button onClick={() => reset()}>ลองอีกครั้ง</Button>
        </div>
    );
}
```

- [ ] **Step 7: Verify**

Run: `pnpm typecheck`
Expected: PASS. (`src/server/actions/student.ts` still uses the old gRPC path — that is Task 8.)

- [ ] **Step 8: Commit**

```bash
git add src/app/page.tsx src/components/login/login-box.tsx src/app/logout/page.tsx src/app/register/onboarding/layout.tsx src/app/register/page.tsx src/app/error.tsx
git commit -m "feat: switch login, logout, and route guards to Google auth"
```

---

### Task 8: Rewire onboarding pages, profile, actions, and forms

**Files:**
- Modify: `src/server/actions/student.ts` (full replacement)
- Modify: `src/app/register/onboarding/1/page.tsx`, `.../2/page.tsx`, `.../3/page.tsx`, `.../4/page.tsx`, `.../5/page.tsx` (full replacements)
- Modify: `src/app/profile/page.tsx` (full replacement)
- Modify: import lines only in `src/components/register/1-form.tsx`, `2-form.tsx`, `3-form.tsx`, `4-form.tsx`, `5-form.tsx`, `src/components/profile/header.tsx`
- Modify: two `221` comparisons in `src/components/register/2-form.tsx`

**Interfaces:**
- Consumes: `requireStudent` (Task 6), `upsertStudent` (Task 5), `auth` (Task 6), static data (Task 4), types (Task 3).
- Produces: `updateStudent(student: Student): Promise<void>` server action — same name/signature as today, so form `onSubmit` handlers stay untouched.

- [ ] **Step 1: Replace the student server actions**

Replace `src/server/actions/student.ts` entirely with:
```ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { upsertStudent } from "@/server/db/student";
import type { Student } from "@/server/db/types";

export async function updateStudent(student: Student): Promise<void> {
    const session = await auth();
    const studentId = session?.user?.studentId;
    if (!studentId) {
        redirect("/");
    }

    await upsertStudent(studentId, student);

    revalidatePath("/register/onboarding");
}
```
(The old `loginStudent` and `logoutStudent` actions are deleted — login now goes through `signInWithGoogle`, logout through `logout` in `src/server/actions/auth.ts`. Task 7 already rewired their callers.)

- [ ] **Step 2: Replace the five onboarding pages**

Replace `src/app/register/onboarding/1/page.tsx` entirely with:
```tsx
import FormComponent1 from "@/components/register/1-form";
import { departments } from "@/data";
import { requireStudent } from "@/server/require-student";

export default async function Page() {
    const studentData = await requireStudent();

    return (
        <FormComponent1 studentData={studentData} departments={departments} />
    );
}
```

Replace `src/app/register/onboarding/2/page.tsx` entirely with:
```tsx
import FormComponent2 from "@/components/register/2-form";
import { countries, districts, provinces, religions } from "@/data";
import { requireStudent } from "@/server/require-student";

export default async function Page() {
    const studentData = await requireStudent();

    return (
        <FormComponent2
            studentData={studentData}
            countries={countries}
            provinces={provinces}
            districts={districts}
            religions={religions}
        />
    );
}
```

Replace `src/app/register/onboarding/3/page.tsx` entirely with:
```tsx
import FormComponent3 from "@/components/register/3-form";
import { requireStudent } from "@/server/require-student";

export default async function Page() {
    const studentData = await requireStudent();

    return <FormComponent3 studentData={studentData} />;
}
```

Replace `src/app/register/onboarding/4/page.tsx` entirely with:
```tsx
import FormComponent4 from "@/components/register/4-form";
import { familyMemberStatuses, familyStatuses } from "@/data";
import { requireStudent } from "@/server/require-student";

export default async function Page() {
    const studentData = await requireStudent();

    return (
        <FormComponent4
            studentData={studentData}
            familyStatuses={familyStatuses}
            familyMemberStatuses={familyMemberStatuses}
        />
    );
}
```

Replace `src/app/register/onboarding/5/page.tsx` entirely with:
```tsx
import FormComponent5 from "@/components/register/5-form";
import { requireStudent } from "@/server/require-student";

export default async function Page() {
    const studentData = await requireStudent();

    return <FormComponent5 studentData={studentData} />;
}
```

- [ ] **Step 3: Replace the profile page**

Replace `src/app/profile/page.tsx` entirely with:
```tsx
import Header from "@/components/profile/header";
import { requireStudent } from "@/server/require-student";

export default async function Page() {
    const studentData = await requireStudent();

    return (
        <div className="flex size-full flex-col items-center">
            <div className="relative flex size-full min-h-dvh flex-col gap-8 p-6 sm:p-8 md:p-12">
                <Header studentData={studentData} />
            </div>
        </div>
    );
}
```

- [ ] **Step 4: Swap type imports in the six components**

In each file below, change ONLY the import path — the imported names stay identical:

`src/components/register/1-form.tsx` (currently around line 37–40):
```ts
import { type Department, type Student } from "@/server/db/types";
```

`src/components/register/2-form.tsx` (currently around line 29–34; also add the country-id import):
```ts
import {
    type Country,
    type District,
    type Province,
    type Religion,
    type Student,
} from "@/server/db/types";
import { THAILAND_COUNTRY_ID } from "@/data/countries";
```

`src/components/register/3-form.tsx` (line 28):
```ts
import type { Student } from "@/server/db/types";
```

`src/components/register/4-form.tsx` (around line 44–48 — keep exactly the type names it currently imports, e.g. `FamilyMemberStatus`, `FamilyStatus`, `Student`):
```ts
import {
    type FamilyMemberStatus,
    type FamilyStatus,
    type Student,
} from "@/server/db/types";
```

`src/components/register/5-form.tsx` (line 22):
```ts
import type { Student } from "@/server/db/types";
```

`src/components/profile/header.tsx` (line 6):
```ts
import { type Student } from "@/server/db/types";
```

- [ ] **Step 5: Replace the hardcoded Thailand id in 2-form**

In `src/components/register/2-form.tsx` there are exactly two comparisons using the magic number `221` (around lines 350 and 707):
```tsx
{selectedCountry === 221 && (
```
and
```tsx
{selectedCountry === 221 ? ( // Thailand
```
Replace both `221` with `THAILAND_COUNTRY_ID`:
```tsx
{selectedCountry === THAILAND_COUNTRY_ID && (
```
```tsx
{selectedCountry === THAILAND_COUNTRY_ID ? ( // Thailand
```

- [ ] **Step 6: Verify**

Run: `pnpm typecheck`
Expected: PASS.
Note: `src/lib/oauth2.ts`, `src/server/controller/auth/index.ts`, `src/server/grpc/index.ts`, and `src/server/data/mapper.ts` still exist and still compile against `src/generated/**` — they are now unreferenced by any page and get deleted in Task 9.

- [ ] **Step 7: Commit**

```bash
git add src/server/actions/student.ts src/app/register/onboarding src/app/profile/page.tsx src/components/register src/components/profile/header.tsx
git commit -m "feat: store onboarding and profile data in MongoDB"
```

---

### Task 9: Delete the legacy OIDC/gRPC/Docker world

**Files:**
- Delete: `src/app/oauth2/` (login + consent pages)
- Delete: `src/components/oauth2/` (consent-box, login-box)
- Delete: `src/components/maps/` (dead code)
- Delete: `src/server/api/` (hydra client)
- Delete: `src/server/grpc/`
- Delete: `src/server/controller/`
- Delete: `src/server/context/`
- Delete: `src/server/data/` (gRPC mapping cache)
- Delete: `src/generated/`
- Delete: `src/lib/oauth2.ts`, `src/lib/random.ts`
- Delete: `proto/`
- Delete: `scripts/compile-proto.sh`, `scripts/create-oauth-client.sh`, `scripts/start-oauth-client.sh` (keep `scripts/generate-geo-data.mjs`)
- Delete: `Dockerfile`, `.dockerignore`, `docker-compose.yaml`
- Delete: `.github/workflows/ci.yaml`
- Delete: `bun.lockb`
- Modify: `package.json` (remove legacy deps)
- Modify: `next.config.js` (drop standalone output)

**Interfaces:**
- Consumes: nothing new. Precondition: Tasks 7–8 removed every import of these modules; verify before deleting.

- [ ] **Step 1: Prove the legacy modules are unreferenced**

Run:
```bash
grep -rn "generated\|@grpc\|hydra\|next-runtime-env\|react-google-maps\|lib/oauth2\|lib/random\|server/grpc\|server/controller\|server/data/mapper" src --include="*.ts" --include="*.tsx" -l | grep -v "src/generated\|src/server/grpc\|src/server/controller\|src/server/data\|src/server/api\|src/lib/oauth2.ts\|src/lib/random.ts\|src/components/maps\|src/app/oauth2\|src/components/oauth2"
```
Expected: empty output (no file outside the doomed set references them). If anything prints, fix that reference first — do not delete yet.

- [ ] **Step 2: Delete files**

```bash
git rm -r src/app/oauth2 src/components/oauth2 src/components/maps src/server/api src/server/grpc src/server/controller src/server/context src/server/data src/generated proto
git rm src/lib/oauth2.ts src/lib/random.ts scripts/compile-proto.sh scripts/create-oauth-client.sh scripts/start-oauth-client.sh Dockerfile .dockerignore docker-compose.yaml .github/workflows/ci.yaml bun.lockb
```

- [ ] **Step 3: Remove legacy dependencies**

Run:
```bash
pnpm remove @grpc/grpc-js @ory/hydra-client ts-proto @react-google-maps/api @types/google.maps next-runtime-env
```

- [ ] **Step 4: Simplify next.config.js**

Replace `next.config.js` content with:
```js
/** @type {import("next").NextConfig} */
const config = {
    reactStrictMode: true,
    swcMinify: true,
};

export default config;
```
(`output: "standalone"` was for the Docker image; Vercel does not want it.)

- [ ] **Step 5: Full verification**

Run: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`
Expected: all PASS with no env vars set. If `next lint` asks interactive questions, run it as `pnpm lint -- --no-cache` — it must not be configured interactively; `.eslintrc.cjs` already exists.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor!: remove OIDC provider, gRPC client, and Docker deploy"
```

---

### Task 10: CI workflow and docs

**Files:**
- Modify: `.github/workflows/format.yaml` (full replacement)
- Modify: `README.md` (full replacement)
- Keep unchanged: `.github/workflows/release.yaml`, `cliff.toml`

**Interfaces:**
- Produces: one PR-verification workflow (prettier + lint + typecheck + tests + build). Vercel Git integration (configured in the Vercel dashboard, not in this repo) handles deploys.

- [ ] **Step 1: Replace the checks workflow**

Replace `.github/workflows/format.yaml` entirely with:
```yaml
name: Checks

on:
  push:
    branches:
      - "main"
  pull_request: {}

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  checks:
    name: Format, lint, typecheck, test, build
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Prettier check
        run: pnpm exec prettier . --check

      - name: Lint
        run: pnpm lint

      - name: Typecheck
        run: pnpm typecheck

      - name: Test
        run: pnpm test

      - name: Build
        run: pnpm build
```

- [ ] **Step 2: Replace the README**

Replace `README.md` entirely with:
```markdown
<div>
    <h1 align="center">Intania Registration</h1>
</div>

Student registration and profile app for ESC, Faculty of Engineering,
Chulalongkorn University. Students sign in with their university Google
account (`@student.chula.ac.th`); data is stored in MongoDB Atlas; the app
deploys on Vercel.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind / shadcn-ui
- NextAuth (Auth.js) v5 with Google sign-in, restricted to
  `@student.chula.ac.th` (student ID is derived from the email local part)
- MongoDB Atlas via Mongoose — single `students` collection
- Deployed on Vercel (preview per PR, production on merge to `main`)

## Getting started

1. Copy `.env.example` to `.env` and fill it in:
   - `AUTH_SECRET` — generate with `openssl rand -base64 32`
   - `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — a Google OAuth 2.0 Client ID
     (Web application) from https://console.cloud.google.com/apis/credentials
     with authorized redirect URI
     `http://localhost:3000/api/auth/callback/google` (and
     `https://<production-domain>/api/auth/callback/google` in production)
   - `MONGODB_URI` — a MongoDB Atlas connection string including the
     database name, e.g. `.../intania-registration`
2. Install and run:

```bash
pnpm install
pnpm dev
```

Note: only `@student.chula.ac.th` Google accounts can sign in. To test
locally you need a Chula student account, or temporarily change
`ALLOWED_EMAIL_DOMAIN` in `src/lib/auth-shared.ts` (do not commit that).

## MongoDB Atlas setup (one-time)

1. Create a free (M0) cluster — region Singapore (`ap-southeast-1`) to match
   Vercel's `sin1`.
2. Create a database user, and under Network Access allow `0.0.0.0/0`
   (Vercel functions have no fixed IP).
3. Put the connection string in `MONGODB_URI` (local `.env` and Vercel
   project env vars).

## Reference data

Departments, religions, and family statuses live in `src/data/*.ts` and can
be edited directly. Thai provinces/districts and countries are generated:

```bash
node scripts/generate-geo-data.mjs && pnpm format
```

## Checks

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```
```

- [ ] **Step 3: Format and verify everything**

Run: `pnpm format && pnpm typecheck && pnpm lint && pnpm test && pnpm build`
Expected: all PASS.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/format.yaml README.md
git commit -m "ci: replace docker pipeline with checks workflow, rewrite README"
```
If `pnpm format` touched other files, include them in the commit.

---

### Task 11: Manual E2E verification checklist (needs user-provided credentials)

**Files:** none (verification only)

This task needs real `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` and `MONGODB_URI` values in `.env`. If they are not available, stop and hand the checklist to the user instead of faking results.

- [ ] Start `pnpm dev`, open `http://localhost:3000`.
- [ ] Sign in with a **non-student** Google account → bounced back to `/` with `กรุณาเข้าสู่ระบบด้วยอีเมลนิสิตจุฬาฯ (@student.chula.ac.th)`.
- [ ] Sign in with a student account → lands on `/profile`; a `students` document with the right `studentId` and `email` exists in Atlas.
- [ ] Complete onboarding steps 1–5; after each step the Atlas document gains the step's fields; step 5 redirects to `/register/onboarding/complete`.
- [ ] `/logout` then sign in again → previously entered data is prefilled.
- [ ] `/profile` shows name and student ID.