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
