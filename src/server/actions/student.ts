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
