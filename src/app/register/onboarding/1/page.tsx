import FormComponent1 from "@/components/register/1-form";
import { requireStudent } from "@/server/require-student";

export default async function Page() {
    const studentData = await requireStudent();

    return <FormComponent1 studentData={studentData} />;
}
