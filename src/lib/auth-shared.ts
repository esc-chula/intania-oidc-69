export const ALLOWED_EMAIL_DOMAIN = "student.chula.ac.th";

export function isAllowedEmail(email: string | null | undefined): boolean {
    if (!email) return false;
    return email.toLowerCase().endsWith(`@${ALLOWED_EMAIL_DOMAIN}`);
}

export function studentIdFromEmail(email: string): string {
    return email.split("@")[0] ?? "";
}
