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
import { useEffect, useMemo, useState } from "react";
import { updateStudent } from "@/server/actions/student";
import { useStudentForm } from "@/contexts/form-context";
import BackButton from "./back-button";
import {
    type Country,
    type District,
    type Province,
    type Religion,
    type Student,
} from "@/server/db/types";
import { z } from "zod";
import { type BindingMapping } from "@/types/helper";

const formSchema = z.object({
    nationalityId: z.number(),
    religionId: z.number(),
    email: z.string().email().max(60),
    phoneNumber: z
        .string()
        .regex(/^\d{2,3}-\d{3,4}-\d{3,4}$/)
        .max(16),
    lineId: z.string().max(30).optional(),
    facebook: z.string().max(60).optional(),
    contactAddressProvinceId: z.number(),
    contactAddressDistrictId: z
        .number()
        .min(1, { message: "กรุณาเลือกเขต/อำเภอ" }),
    contactAddressNumber: z.string().min(1).max(60),
    contactAddressOther: z.string().min(1).max(400),
});

type FormSchema = z.infer<typeof formSchema>;

type Props = {
    studentData: Student;
    countries: Country[];
    provinces: Province[];
    districts: District[];
    religions: Religion[];
};

export default function FormComponent3({
    studentData,
    countries,
    provinces,
    districts,
    religions,
}: Props) {
    // STEP
    const { setStep } = useStudentForm();
    useEffect(() => {
        setStep(3);
    }, [setStep]);

    // HANDLERS
    const [selectedContactProvince, setSelectedContactProvince] = useState(0);

    const bindingMap: BindingMapping<Student, FormSchema> = useMemo(
        () => ({
            nationality: {
                formBinding: {
                    formKey: "nationalityId",
                },
                objectKey: ["id"],
            },
            religion: {
                formBinding: {
                    formKey: "religionId",
                },
                objectKey: ["id"],
            },
            email: {
                formBinding: {},
            },
            phoneNumber: {
                formBinding: {},
            },
            facebook: {
                formBinding: {},
            },
            lineId: {
                formBinding: {},
            },
            contactAddressProvince: {
                formBinding: {
                    formKey: "contactAddressProvinceId",
                },
                stateBinding: setSelectedContactProvince,
                objectKey: ["id"],
            },
            contactAddressDistrict: {
                formBinding: {
                    formKey: "contactAddressDistrictId",
                },
                objectKey: ["id"],
            },
            contactAddressNumber: {
                formBinding: {},
            },
            contactAddressOther: {
                formBinding: {},
            },
        }),
        [],
    );

    // FORM
    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        mode: "onChange",
    });
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
            nationality: {
                id: values.nationalityId,
            },
            religion: {
                id: values.religionId,
            },
            contactAddressProvince: {
                id: values.contactAddressProvinceId,
            },
            contactAddressDistrict: {
                id: values.contactAddressDistrictId,
            },
            ...values,
        };

        await updateStudent(body);

        router.push("/register/onboarding/4");
    }

    const sortedProvinces = useMemo(() => {
        if (!provinces) return [];
        const bkk = provinces.find((p) => p.nameTh === "กรุงเทพมหานคร");
        const others = provinces
            .filter((p) => p.nameTh !== "กรุงเทพมหานคร")
            .sort((a, b) =>
                (a.nameTh ?? "").localeCompare(b.nameTh ?? "", "th"),
            );
        return bkk ? [bkk, ...others] : others;
    }, [provinces]);

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
                            name="nationalityId"
                            render={({ field }) => (
                                <FormItem className="!pt-0">
                                    <FormLabel>
                                        เชื้อชาติ
                                        <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <Select
                                        value={
                                            countries.find(
                                                (country) =>
                                                    country.id === field.value,
                                            )?.name ?? undefined
                                        }
                                        onValueChange={(value) => {
                                            const selectedCountry =
                                                countries.find(
                                                    (country) =>
                                                        country.name === value,
                                                );

                                            if (!selectedCountry) {
                                                return;
                                            }

                                            field.onChange(selectedCountry.id);
                                        }}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="เลือกเชื้อชาติ" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {/* thailand first */}
                                            <SelectItem
                                                value={
                                                    countries.find(
                                                        (country) =>
                                                            country.name ===
                                                            "Thailand",
                                                    )?.name ?? "Thailand"
                                                }
                                            >
                                                {
                                                    countries.find(
                                                        (country) =>
                                                            country.name ===
                                                            "Thailand",
                                                    )?.name
                                                }
                                            </SelectItem>

                                            {countries
                                                .filter(
                                                    (nationality) =>
                                                        nationality.name !==
                                                        "Thailand",
                                                )
                                                .map((nationality, index) => (
                                                    <SelectItem
                                                        key={index}
                                                        value={
                                                            nationality.name ??
                                                            ""
                                                        }
                                                    >
                                                        {nationality.name}
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
                            name="religionId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        ศาสนา
                                        <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <Select
                                        value={
                                            religions.find(
                                                (religion) =>
                                                    religion.id === field.value,
                                            )?.nameTh ?? undefined
                                        }
                                        onValueChange={(value) => {
                                            const selectedReligion =
                                                religions.find(
                                                    (religion) =>
                                                        religion.nameTh ===
                                                        value,
                                                );
                                            if (!selectedReligion) {
                                                return;
                                            }
                                            field.onChange(
                                                selectedReligion?.id,
                                            );
                                        }}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="เลือกศาสนา" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {religions.map((religion) => (
                                                <SelectItem
                                                    key={religion.id}
                                                    value={
                                                        religion.nameTh ?? ""
                                                    }
                                                >
                                                    {religion.nameTh}
                                                </SelectItem>
                                            ))}
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
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        อีเมลส่วนตัว
                                        <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="กรอกอีเมลส่วนตัว"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        เบอร์โทรศัพท์ส่วนตัว
                                        <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="กรอกเบอร์โทรศัพท์ส่วนตัว"
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
                        <FormField
                            control={form.control}
                            name="facebook"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Facebook</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="กรอกชื่อโปรไฟล์ Facebook"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="lineId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>LINE ID</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="กรอก LINE ID"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </section>

                    <section className="flex flex-col gap-2">
                        <p className="text-base font-medium">
                            ที่อยู่ที่สามารถติดต่อได้
                        </p>
                        <FormField
                            control={form.control}
                            name="contactAddressProvinceId"
                            render={({ field }) => (
                                <FormItem className="!pt-0">
                                    <FormLabel>
                                        จังหวัด
                                        <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <Select
                                        value={
                                            field.value
                                                ? provinces.find(
                                                      (province) =>
                                                          province.id ===
                                                          field.value,
                                                  )?.nameTh
                                                : undefined
                                        }
                                        onValueChange={(value) => {
                                            const selectedProvinceString =
                                                sortedProvinces.find(
                                                    (province) =>
                                                        province.nameTh ===
                                                        value,
                                                );
                                            if (!selectedProvinceString) {
                                                return;
                                            }
                                            field.onChange(
                                                selectedProvinceString.id,
                                            );
                                            setSelectedContactProvince(
                                                selectedProvinceString.id,
                                            );
                                            // Reset district when province changes
                                            form.setValue(
                                                "contactAddressDistrictId",
                                                0,
                                            );
                                        }}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="เลือกจังหวัด" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {sortedProvinces.map((province) => (
                                                <SelectItem
                                                    key={province.provinceCode}
                                                    value={
                                                        province.nameTh ?? ""
                                                    }
                                                >
                                                    {province.nameTh}
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
                            name="contactAddressDistrictId"
                            render={({ field }) => (
                                <FormItem className="!pt-0">
                                    <FormLabel>
                                        อำเภอ/เขต
                                        <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <Select
                                        value={
                                            field.value
                                                ? districts.find(
                                                      (district) =>
                                                          district.id ===
                                                          field.value,
                                                  )?.nameTh
                                                : undefined
                                        }
                                        onValueChange={(value) => {
                                            const selectedDistrict =
                                                districts.find(
                                                    (district) =>
                                                        district.nameTh ===
                                                        value,
                                                );
                                            if (!selectedDistrict) {
                                                return;
                                            }
                                            field.onChange(selectedDistrict.id);
                                        }}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="เลือกอำเภอ/เขต" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {districts
                                                .filter((district) => {
                                                    const selectedProvinceCode =
                                                        provinces.find(
                                                            (province) =>
                                                                province.id ===
                                                                selectedContactProvince,
                                                        )?.provinceCode;
                                                    return (
                                                        district.provinceCode ===
                                                        selectedProvinceCode
                                                    );
                                                })
                                                .map((district) => (
                                                    <SelectItem
                                                        key={
                                                            district.districtCode
                                                        }
                                                        value={
                                                            district.nameTh ??
                                                            ""
                                                        }
                                                    >
                                                        {district.nameTh}
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
                            name="contactAddressNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        เลขที่
                                        <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="กรอกเลขที่"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="contactAddressOther"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        รายละเอียดที่อยู่
                                        <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="กรอกที่อยู่ (หมู่บ้าน/ซอย/ถนน/ตำบล)"
                                            {...field}
                                        />
                                    </FormControl>
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
