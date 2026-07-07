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