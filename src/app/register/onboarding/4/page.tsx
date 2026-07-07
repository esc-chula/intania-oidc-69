import FormComponent4 from "@/components/register/4-form";
import { familyMemberStatuses, familyStatuses } from "@/data";
import { requireStudent } from "@/server/require-student";

export default async function Page() {
    const studentData = await requireStudent();

    return (
        <FormComponent4
            studentData={studentData}
            familyStatuses={familyStatuses}
            familyMemberStatuses={familyMemberStatuses}
        />
    );
}