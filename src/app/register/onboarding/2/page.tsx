import FormComponent2 from "@/components/register/2-form";
import { departments } from "@/data";
import { requireStudent } from "@/server/require-student";

export default async function Page() {
    const studentData = await requireStudent();

    return (
        <FormComponent2 studentData={studentData} departments={departments} />
    );
}
