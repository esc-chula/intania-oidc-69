import { redirect } from "next/navigation";
import { requireStudent } from "@/server/require-student";

// Landing point after Google sign-in: first-time users (no onboarding
// data yet) go to registration; returning users go to their profile.
export default async function Page() {
    const student = await requireStudent();

    if (!student.firstNameTh) {
        redirect("/register");
    }
    redirect("/profile");
}
