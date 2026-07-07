"use server";

import { signIn, signOut } from "@/server/auth";

export async function signInWithGoogle(): Promise<void> {
    await signIn("google", { redirectTo: "/profile" });
}

export async function logout(): Promise<void> {
    await signOut({ redirectTo: "/" });
}