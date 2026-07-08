"use client";

import { Card } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { updateStudent } from "@/server/actions/student";
import { useStudentForm } from "@/contexts/form-context";
import BackButton from "./back-button";
import type { Student } from "@/server/db/types";
import { z } from "zod";

const PRESET_RELATIONS = ["บิดา", "มารดา"];
const OTHER_RELATION = "อื่น ๆ";

const formSchema = z.object({
    parentName: z.string().min(1).max(150),
    parent: z.string().min(1, { message: "กรุณาระบุความสัมพันธ์" }).max(100),
    parentPhoneNumber: z.string().regex(/^\d{2,3}-\d{3,4}-\d{3,4}$/),
});

type FormSchema = z.infer<typeof formSchema>;

type Props = {
    studentData: Student;
};

export default function FormComponent5({ studentData }: Props) {
    // STEP
    const { setStep } = useStudentForm();
    useEffect(() => {
        setStep(5);
    }, [setStep]);

    // FORM
    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        mode: "onChange",
    });

    // Drives the relation Select and whether the free-text input is shown.
    const [relationChoice, setRelationChoice] = useState<string>("");

    useEffect(() => {
        if (studentData.parentName != null) {
            form.setValue("parentName", studentData.parentName);
        }
        if (studentData.parentPhoneNumber != null) {
            form.setValue("parentPhoneNumber", studentData.parentPhoneNumber);
        }
        const relation = studentData.parent;
        if (relation != null && relation !== "") {
            setRelationChoice(
                PRESET_RELATIONS.includes(relation) ? relation : OTHER_RELATION,
            );
            form.setValue("parent", relation);
        }
    }, [form, studentData]);

    const router = useRouter();
    const [loading, setLoading] = useState(false);
    async function onSubmit(values: FormSchema) {
        setLoading(true);
        await updateStudent({
            id: studentData.id,
            parentName: values.parentName,
            parent: values.parent,
            parentPhoneNumber: values.parentPhoneNumber,
        });
        router.push("/register/onboarding/complete");
    }

    return (
        <Card className="p-6 md:p-8">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col divide-y divide-muted-foreground [&>div]:py-12 [&>section]:py-12"
                >
                    <section className="flex flex-col gap-4 !pt-0">
                        <p className="text-base font-medium">
                            ผู้ปกครองที่สามารถติดต่อได้
                        </p>
                        <FormField
                            control={form.control}
                            name="parentName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        ชื่อ-นามสกุล ผู้ปกครอง
                                        <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="กรอกชื่อ-นามสกุลผู้ปกครอง"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="parent"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        ความสัมพันธ์กับนิสิต
                                        <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <Select
                                        value={relationChoice}
                                        onValueChange={(value) => {
                                            // Radix fires onValueChange("") to
                                            // "clear" a controlled value whose
                                            // item isn't mounted (dropdown
                                            // closed). Ignore that so the
                                            // prefilled relation isn't wiped.
                                            if (!value) return;
                                            setRelationChoice(value);
                                            field.onChange(
                                                value === OTHER_RELATION
                                                    ? ""
                                                    : value,
                                            );
                                        }}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                {/* Render the label ourselves:
                                                    Radix SelectValue does not
                                                    reliably resolve a value set
                                                    programmatically (prefill) to
                                                    its item text. */}
                                                {relationChoice ? (
                                                    <span>
                                                        {relationChoice}
                                                    </span>
                                                ) : (
                                                    <SelectValue placeholder="เลือกความสัมพันธ์" />
                                                )}
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="บิดา">
                                                บิดา
                                            </SelectItem>
                                            <SelectItem value="มารดา">
                                                มารดา
                                            </SelectItem>
                                            <SelectItem value={OTHER_RELATION}>
                                                {OTHER_RELATION}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {relationChoice === OTHER_RELATION && (
                                        <Input
                                            className="mt-2"
                                            placeholder="ระบุความสัมพันธ์กับนิสิต"
                                            value={field.value ?? ""}
                                            onChange={(e) =>
                                                field.onChange(e.target.value)
                                            }
                                        />
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="parentPhoneNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        เบอร์โทรศัพท์ที่ติดต่อได้
                                        <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="กรอกเบอร์โทรศัพท์ผู้ปกครอง"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        กรอกในรูปแบบ 0XX-XXX-XXXX
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </section>

                    <div className="flex items-center justify-between !border-t-0 !py-0">
                        <BackButton />
                        <Button type="submit" size="lg" disabled={loading}>
                            ถัดไป
                        </Button>
                    </div>
                </form>
            </Form>
        </Card>
    );
}
