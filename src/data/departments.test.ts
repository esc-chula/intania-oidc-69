import { describe, expect, it } from "vitest";
import { departments } from "./departments";

// Department ids are persisted in student records (student.department.id) and
// are therefore STABLE KEYS. This list must be append-only: never change,
// reorder, or reuse an existing id. This mapping locks the meaning of each
// existing id (id -> code); changing it here is a deliberate, reviewable act.
// If this test fails after editing departments.ts, you renumbered an existing
// entry and would corrupt already-saved student records.
const LOCKED_ID_TO_CODE: Record<number, string> = {
    0: "-",
    1: "CE",
    2: "EE",
    3: "ME",
    4: "AE",
    5: "IE",
    6: "CHE",
    7: "MN",
    8: "PE",
    9: "ENV",
    10: "SV",
    11: "MT",
    12: "CP",
    13: "CEDT",
    14: "NE",
    15: "NANO",
    16: "ADME",
    17: "ICE",
    18: "AERO",
    19: "AI",
    20: "ChPE",
    21: "SEMI",
};

describe("departments (append-only stable keys)", () => {
    it("keeps every locked id -> code mapping intact", () => {
        for (const [id, code] of Object.entries(LOCKED_ID_TO_CODE)) {
            const dept = departments.find((d) => d.id === Number(id));
            expect(dept, `department id ${id} must still exist`).toBeDefined();
            expect(
                dept?.code,
                `department id ${id} must still map to code ${code}`,
            ).toBe(code);
        }
    });

    it("has unique ids", () => {
        const ids = departments.map((d) => d.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it("has a non-empty nameTh for every department", () => {
        for (const d of departments) {
            expect(
                d.nameTh,
                `department id ${d.id} must have a nameTh`,
            ).toBeTruthy();
        }
    });
});
