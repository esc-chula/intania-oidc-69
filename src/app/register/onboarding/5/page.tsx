import FormComponent5 from "@/components/register/5-form";
import { familyMemberStatuses, familyStatuses } from "@/data";
import { requireStudent } from "@/server/require-student";

export default async function Page() {
    const studentData = await requireStudent();

    return (
        <FormComponent5
            studentData={studentData}
            familyStatuses={familyStatuses}
            familyMemberStatuses={familyMemberStatuses}
        />
    );
}
