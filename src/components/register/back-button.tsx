"use client";

import { Button } from "@/components/ui/button";
import { useStudentForm } from "@/contexts/form-context";
import { useRouter } from "next/navigation";

export default function BackButton() {
    const { setStep } = useStudentForm();
    const router = useRouter();

    return (
        <Button
            type="button"
            size="lg"
            variant="secondary"
            onClick={() => {
                setStep((prev) => prev - 1);
                router.back();
            }}
        >
            กลับ
        </Button>
    );
}
