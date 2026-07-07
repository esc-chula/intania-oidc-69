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
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { updateStudent } from "@/server/actions/student";
import { useStudentForm } from "@/contexts/form-context";
import type {
    FamilyMemberStatus,
    FamilyStatus,
    Student,
} from "@/server/db/types";
import { type BindingMapping } from "@/types/helper";

const formSchema = z.object({
    fatherName: z.string().max(150),
    fatherBirthYear: z.number(),
    fatherStatusId: z.number().optional(),

    motherName: z.string().max(150),
    motherBirthYear: z.number(),
    motherStatusId: z.number().optional(),

    familyStatusId: z.number(),

    parent: z.enum(["Father", "Mother", "Other"]),
    parentPhoneNumber: z.string().regex(/^\d{2,3}-\d{3,4}-\d{3,4}$/),
    parentAddress: z.string().max(400).optional(),

    siblingTotal: z.number(),
    siblingOrder: z.number(),
});

type FormSchema = z.infer<typeof formSchema>;

type Props = {
    studentData: Student;
    familyStatuses: FamilyStatus[];
    familyMemberStatuses: FamilyMemberStatus[];
};

export default function FormComponent5({
    studentData,
    familyStatuses,
    familyMemberStatuses,
}: Props) {
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

    const bindingMap: BindingMapping<Student, FormSchema> = useMemo(
        () => ({
            fatherName: {
                formBinding: {},
            },
            fatherBirthYear: {
                formBinding: {},
            },
            fatherStatus: {
                formBinding: {
                    formKey: "fatherStatusId",
                },
                objectKey: ["id"],
            },
            motherName: {
                formBinding: {},
            },
            motherBirthYear: {
                formBinding: {},
            },
            motherStatus: {
                formBinding: {
                    formKey: "motherStatusId",
                },
                objectKey: ["id"],
            },
            familyStatus: {
                formBinding: {
                    formKey: "familyStatusId",
                },
                objectKey: ["id"],
            },
            siblingOrder: {
                formBinding: {},
            },
            siblingTotal: {
                formBinding: {},
            },
            parent: {
                formBinding: {},
            },
            parentPhoneNumber: {
                formBinding: {},
            },
        }),
        [],
    );

    useEffect(() => {
        const keys = Object.keys(studentData) as (keyof Student)[];
        keys.forEach((key) => {
            let value = studentData[key];

            if (value === null || value === undefined) {
                return;
            }

            const binding = bindingMap[key];
            if (!binding) {
                return;
            }

            if (typeof value === "object" && !Array.isArray(value)) {
                const ok = binding.objectKey ?? [];
                value = ok.reduce((acc, cur) => acc[cur as never], value);
            }

            if (binding.stateBinding) {
                binding.stateBinding(value);
            }
            if (binding.formBinding) {
                const k =
                    binding.formBinding.formKey ?? (key as keyof FormSchema);
                form.setValue(k, value as never);
            }
        });
    }, [form, studentData, bindingMap]);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    async function onSubmit(values: FormSchema) {
        setLoading(true);

        const body: Student = {
            id: studentData.id,
            familyStatus: {
                id: values.familyStatusId,
            },
            ...values,
        };

        if (values.fatherStatusId) {
            body.fatherStatus = {
                id: values.fatherStatusId,
            };
        }
        if (values.motherStatusId) {
            body.motherStatus = {
                id: values.motherStatusId,
            };
        }

        await updateStudent(body);

        router.push("/register/onboarding/complete");
    }

    return (
        <Card className="p-6 md:p-8">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col divide-y divide-muted-foreground [&>div]:py-12 [&>section]:py-12"
                >
                    <section className="flex flex-col gap-2 !pt-0">
                        <FormField
                            control={form.control}
                            name="fatherName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        ชื่อจริง-นามสกุล บิดา
                                        <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="กรอกชื่อจริง-นามสกุล บิดา"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="fatherBirthYear"
                            render={({ field }) => (
                                <FormItem className="flex flex-col pt-2">
                                    <FormLabel>
                                        ปีเกิดบิดา
                                        <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        "justify-between",
                                                        !field.value &&
                                                            "text-muted-foreground",
                                                    )}
                                                >
                                                    {field.value
                                                        ? field.value
                                                        : "เลือกปีเกิดบิดา"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[200px] p-0">
                                            <Command>
                                                <CommandInput placeholder="เลือกปีเกิดบิดา" />
                                                <CommandEmpty>
                                                    กรุณาติดต่อทีมงาน
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    <CommandList>
                                                        {Array.from(
                                                            { length: 100 },
                                                            (_, i) =>
                                                                new Date().getFullYear() -
                                                                99 +
                                                                i,
                                                        ).map((year) => (
                                                            <CommandItem
                                                                value={year.toString()}
                                                                key={year}
                                                                onSelect={() => {
                                                                    form.setValue(
                                                                        "fatherBirthYear",
                                                                        year,
                                                                    );
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        year ===
                                                                            field.value
                                                                            ? "opacity-100"
                                                                            : "opacity-0",
                                                                    )}
                                                                />
                                                                {year}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandList>
                                                </CommandGroup>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormDescription>
                                        ปีคริสต์ศักราช
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="fatherStatusId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        สถานะบิดา
                                        <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <Select
                                        value={
                                            field.value
                                                ? field.value.toString()
                                                : undefined
                                        }
                                        onValueChange={(value) => {
                                            if (!value) {
                                                return;
                                            }
                                            field.onChange(parseInt(value));
                                        }}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="เลือกสถานะบิดา" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {familyMemberStatuses.map(
                                                (status) => (
                                                    <SelectItem
                                                        value={status.id.toString()}
                                                        key={status.id}
                                                    >
                                                        {status.valueTh}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </section>
                    <section className="flex flex-col gap-2">
                        <FormField
                            control={form.control}
                            name="motherName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        ชื่อจริง-นามสกุล มารดา
                                        <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="กรอกชื่อจริง-นามสกุล มารดา"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="motherBirthYear"
                            render={({ field }) => (
                                <FormItem className="flex flex-col pt-2">
                                    <FormLabel>
                                        ปีเกิดมารดา
                                        <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        "justify-between",
                                                        !field.value &&
                                                            "text-muted-foreground",
                                                    )}
                                                >
                                                    {field.value
                                                        ? field.value
                                                        : "เลือกปีเกิดมารดา"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[200px] p-0">
                                            <Command>
                                                <CommandInput placeholder="เลือกปีเกิดมารดา" />
                                                <CommandEmpty>
                                                    กรุณาติดต่อทีมงาน
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    <CommandList>
                                                        {Array.from(
                                                            { length: 100 },
                                                            (_, i) =>
                                                                new Date().getFullYear() -
                                                                99 +
                                                                i,
                                                        ).map((year) => (
                                                            <CommandItem
                                                                value={year.toString()}
                                                                key={year}
                                                                onSelect={() => {
                                                                    form.setValue(
                                                                        "motherBirthYear",
                                                                        year,
                                                                    );
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        year ===
                                                                            field.value
                                                                            ? "opacity-100"
                                                                            : "opacity-0",
                                                                    )}
                                                                />
                                                                {year}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandList>
                                                </CommandGroup>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormDescription>
                                        ปีคริสต์ศักราช
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="motherStatusId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        สถานะมารดา
                                        <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <Select
                                        value={
                                            field.value
                                                ? field.value.toString()
                                                : undefined
                                        }
                                        onValueChange={(value) => {
                                            if (!value) {
                                                return;
                                            }
                                            field.onChange(parseInt(value));
                                        }}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="เลือกสถานะมารดา" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {familyMemberStatuses.map(
                                                (status) => (
                                                    <SelectItem
                                                        value={status.id.toString()}
                                                        key={status.id}
                                                    >
                                                        {status.valueTh}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </section>
                    <section className="flex flex-col gap-2">
                        <FormField
                            control={form.control}
                            name="familyStatusId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        สถานะครอบครัว
                                        <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <Select
                                        value={
                                            field.value
                                                ? field.value.toString()
                                                : undefined
                                        }
                                        onValueChange={(value) => {
                                            if (!value) {
                                                return;
                                            }
                                            field.onChange(parseInt(value));
                                        }}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="เลือกสถานะครอบครัว" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {familyStatuses.map((status) => (
                                                <SelectItem
                                                    value={status.id.toString()}
                                                    key={status.id}
                                                >
                                                    {status.valueTh}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="siblingTotal"
                            render={({ field }) => {
                                return (
                                    <FormItem>
                                        <FormLabel>
                                            จำนวนพี่น้อง
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="กรอกจำนวนพี่น้อง"
                                                value={field.value}
                                                onChange={(e) => {
                                                    const value = parseInt(
                                                        e.target.value,
                                                    );
                                                    field.onChange(
                                                        isNaN(value)
                                                            ? undefined
                                                            : value,
                                                    );
                                                }}
                                                name={field.name}
                                                disabled={field.disabled}
                                                onBlur={field.onBlur}
                                                ref={field.ref}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            กรอกตัวเลขจำนวนพี่น้องทั้งหมด
                                            (หากมีเพียงคนเดียวให้กรอก 1)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                );
                            }}
                        />
                        <FormField
                            control={form.control}
                            name="siblingOrder"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        ลำดับพี่น้อง
                                        <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="กรอกลำดับพี่น้อง"
                                            value={field.value}
                                            onChange={(e) => {
                                                const value = parseInt(
                                                    e.target.value,
                                                );
                                                field.onChange(
                                                    isNaN(value)
                                                        ? undefined
                                                        : value,
                                                );
                                            }}
                                            name={field.name}
                                            disabled={field.disabled}
                                            onBlur={field.onBlur}
                                            ref={field.ref}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        ลำดับพี่น้องของตัวเอง (1 = เกิดคนแรก)
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </section>
                    <section className="flex flex-col gap-2">
                        <h3 className="font-bold text-neutral-700">
                            ข้อมูลติดต่อฉุกเฉิน
                        </h3>
                        <FormField
                            control={form.control}
                            name="parent"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        ผู้ปกครอง
                                        <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <Select
                                        value={
                                            field.value
                                                ? field.value
                                                : undefined
                                        }
                                        onValueChange={(value) => {
                                            if (!value) {
                                                return;
                                            }
                                            field.onChange(value);
                                        }}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="เลือกผู้ปกครอง" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Father">
                                                บิดา
                                            </SelectItem>
                                            <SelectItem value="Mother">
                                                มารดา
                                            </SelectItem>
                                            <SelectItem value="Other">
                                                อื่น ๆ
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        หรือผู้ที่สามารถติดต่อฉุกเฉินได้
                                    </FormDescription>
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
                                        เบอร์โทรศัพท์ผู้ปกครอง
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
