import FormComponent2 from "@/components/register/2-form";
import { countries, districts, provinces, religions } from "@/data";
import { requireStudent } from "@/server/require-student";

export default async function Page() {
    const studentData = await requireStudent();

    return (
        <FormComponent2
            studentData={studentData}
            countries={countries}
            provinces={provinces}
            districts={districts}
            religions={religions}
        />
    );
}
