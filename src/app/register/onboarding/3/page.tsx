import FormComponent3 from "@/components/register/3-form";
import { countries, districts, provinces, religions } from "@/data";
import { requireStudent } from "@/server/require-student";

export default async function Page() {
    const studentData = await requireStudent();

    return (
        <FormComponent3
            studentData={studentData}
            countries={countries}
            provinces={provinces}
            districts={districts}
            religions={religions}
        />
    );
}
