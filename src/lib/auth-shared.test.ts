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
