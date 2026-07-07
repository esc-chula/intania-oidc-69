import FormComponent3 from "@/components/register/3-form";
import { requireStudent } from "@/server/require-student";

export default async function Page() {
    const studentData = await requireStudent();

    return <FormComponent3 studentData={studentData} />;
}
