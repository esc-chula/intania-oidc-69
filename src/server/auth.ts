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