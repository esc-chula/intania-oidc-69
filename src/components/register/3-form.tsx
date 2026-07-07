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
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { updateStudent } from "@/server/actions/student";
import { useStudentForm } from "@/contexts/form-context";
import type { Student } from "@/server/db/types";
import { z } from "zod";

const formSchema = z.object({
    foodLimitations: z.string().max(200).optional(), // comma-sepearated string
    drugAllergies: z.string().max(200).optional(), // comma-sepearated string
    medicalConditions: z.string().max(200).optional(), // comma-sepearated string
    medications: z.string().max(200).optional(), // comma-sepearated string
    bloodType: z.enum(["A", "B", "AB", "O"]),
    shirtSize: z.number(),
});

type FormSchema = z.infer<typeof formSchema>;

type Props = {
    studentData: Student;
};

export default function FormComponent3({ studentData }: Props) {
    // STEP
    const { setStep } = useStudentForm();
    useEffect(() => {
        setStep(3);
    }, [setStep]);

    // FORM
    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        mode: "onChange",
    });
    useEffect(() => {
        (Object.keys(studentData) as Array<keyof Student>).forEach((key) => {
            if (key in formSchema.shape && studentData[key] != null) {
                if (key in formSchema.shape) {
                    form.setValue(
                        key as keyof FormSchema,
                        studentData[key] as never,
                    );
                }
            }
        });
    }, [form, studentData]);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    async function onSubmit(values: FormSchema) {
        setLoading(true);
        await updateStudent({
            id: studentData.id,
            ...values,
        });

        router.push("/register/onboarding/4");
    }

    // HANDLERS
    // TODO: put this in db?
    const shirtSizes = [
        { label: 'S (36")', value: 36 },
        { label: 'M (38")', value: 38 },
        { label: 'L (40")', value: 40 },
        { label: 'XL (42")', value: 42 },
        { label: '2XL (44")', value: 44 },
        { label: '3XL (46")', value: 46 },
        { label: '4XL (48")', value: 48 },
        { label: '5XL (50")', value: 50 },
        { label: '6XL (52")', value: 52 },
    ];

    return (
        <Card className="p-6 md:p-8">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col divide-y divide-muted-foreground [&>div]:py-12 [&>section]:py-12"
                >
                    <FormField
                        control={form.control}
                        name="shirtSize"
                        render={({ field }) => (
                            <FormItem className="!pt-0">
                                <FormLabel>
                                    ไซส์เสื้อ
                                    <span className="text-red-500">*</span>
                                </FormLabel>
                                <Select
                                    value={
                                        field.value
                                            ? field.value.toString()
                                            : ""
                                    }
                                    onValueChange={(value) => {
                                        if (!value) return;
                                        field.onChange(parseInt(value));
                                    }}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="เลือกไซส์เสื้อ" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {shirtSizes.map((size) => (
                                            <SelectItem
                                                key={size.value}
                                                value={size.value.toString()}
                                            >
                                                {size.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <section className="flex flex-col gap-2">
                        <FormField
                            control={form.control}
                            name="bloodType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        กลุ่มเลือด
                                        <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <Select
                                        value={field.value}
                                        onValueChange={(value) => {
                                            if (!value) return;
                                            field.onChange(value);
                                        }}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="เลือกกลุ่มเลือด" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="A">A</SelectItem>
                                            <SelectItem value="B">B</SelectItem>
                                            <SelectItem value="O">O</SelectItem>
                                            <SelectItem value="AB">
                                                AB
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="foodLimitations"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>อาหารที่แพ้</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="กรอกอาหารที่แพ้"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        หากมีหลายรายการ กรุณาคั่นด้วยเครื่องหมาย
                                        ,
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="drugAllergies"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>ยาที่แพ้</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="กรอกยาที่แพ้"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        หากมีหลายรายการ กรุณาคั่นด้วยเครื่องหมาย
                                        ,
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="medicalConditions"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>โรคประจำตัว</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="กรอกโรคประจำตัว"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        หากมีหลายรายการ กรุณาคั่นด้วยเครื่องหมาย
                                        ,
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="medications"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>ยาประจำตัว</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="กรอกยาประจำตัว"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        หากมีหลายรายการ กรุณาคั่นด้วยเครื่องหมาย
                                        ,
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </section>
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
