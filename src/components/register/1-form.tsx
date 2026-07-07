"use client";

import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { useStudentForm } from "@/contexts/form-context";
import Pdpa from "./pdpa";
import { updateStudent } from "@/server/actions/student";
import type { Student } from "@/server/db/types";

const formSchema = z.object({
    pdpa: z.boolean().refine((value) => value, {
        message: "กรุณายอมรับนโยบายการจัดการข้อมูลส่วนบุคคล",
    }),
    cueaDataTransferAgreement: z.boolean().optional(),
});

type Props = {
    studentData: Student;
};

export default function FormComponent1({ studentData }: Props) {
    // STEP
    const { setStep } = useStudentForm();
    useEffect(() => {
        setStep(1);
    }, [setStep]);

    // FORM
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        mode: "onChange",
    });
    useEffect(() => {
        (Object.keys(studentData) as Array<keyof Student>).forEach((key) => {
            if (key in formSchema.shape && studentData[key] != null) {
                if (key in formSchema.shape) {
                    form.setValue(
                        key as keyof z.infer<typeof formSchema>,
                        studentData[key] as never,
                    );
                }
            }
        });
    }, [form, studentData]);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        await updateStudent({
            id: studentData.id,
            cueaDataTransferAgreement: values.cueaDataTransferAgreement,
        });
        router.push("/register/onboarding/2");
    }

    return (
        <Card className="p-6 md:p-8">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col divide-y divide-muted-foreground [&>div]:py-12 [&>section]:py-12"
                >
                    <div className="flex flex-col gap-2 !pt-0">
                        <FormField
                            control={form.control}
                            name="pdpa"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        นโยบายการจัดการข้อมูลส่วนบุคคล
                                    </FormLabel>
                                    <FormLabel className="flex size-full cursor-pointer rounded-xl bg-background p-5">
                                        <div className="flex flex-col gap-4">
                                            <Pdpa />
                                            <div className="flex items-center gap-2">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={
                                                            field.onChange
                                                        }
                                                    />
                                                </FormControl>
                                                ยอมรับ
                                            </div>
                                        </div>
                                    </FormLabel>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <FormField
                            control={form.control}
                            name="cueaDataTransferAgreement"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        สมาคมนิสิตเก่าวิศวกรรมศาสตร์แห่งจุฬาลงกรณ์มหาวิทยาลัย
                                        (สวจ.)
                                    </FormLabel>
                                    <FormLabel className="flex cursor-pointer justify-center gap-2 rounded-xl bg-background p-5 text-muted-foreground">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        ข้าพเจ้ายินยอมให้เมื่อจบการศึกษา
                                        ข้อมูลของข้าพเจ้าจะนำส่งต่อและเป็นสมาชิกของสมาคมนิสิตเก่าวิศวกรรมศาสตร์แห่งจุฬาลงกรณ์มหาวิทยาลัย
                                        (สวจ.)
                                    </FormLabel>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <Button
                        type="submit"
                        className="self-end"
                        size="lg"
                        disabled={loading}
                    >
                        ถัดไป
                    </Button>
                </form>
            </Form>
        </Card>
    );
}
