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
import {
    type Country,
    type District,
    type Province,
    type Religion,
    type Student,
} from "@/server/db/types";
import { THAILAND_COUNTRY_ID } from "@/data/countries";
import { z } from "zod";
import { type BindingMapping } from "@/types/helper";

const formSchema = z.object({
    nationalityId: z.number(),
    nationalId: z.string().length(13),
    religionId: z.number(),
    email: z.string().email().max(60),
    phoneNumber: z
        .string()
        .regex(/^\d{2,3}-\d{3,4}-\d{3,4}$/)
        .max(16),
    lineId: z.string().max(30).optional(),
    facebook: z.string().max(60).optional(),
    currentAddressLatitude: z.number().optional(),
    currentAddressLongitude: z.number().optional(),
    currentAddressProvinceId: z.number(),
    currentAddressDistrictId: z
        .number()
        .min(1, { message: "กรุณาเลือกเขต/อำเภอ" }),
    currentAddressNumber: z.string().min(1).max(60),
    currentAddressOther: z.string().min(1).max(400),
    hometownAddressLongitude: z.number().optional(),
    hometownAddressLatitude: z.number().optional(),
    hometownAddressProvinceId: z.number().optional(),
    hometownAddressDistrictId: z.number().optional(),
    hometownAddressNumber: z.string().max(60).optional(),
    hometownAddressOther: z.string().max(400).optional(),
});

type FormSchema = z.infer<typeof formSchema>;

type Props = {
    studentData: Student;
    countries: Country[];
    provinces: Province[];
    districts: District[];
    religions: Religion[];
};

export default function FormComponent2({
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
    const [selectedCountry, setSelectedCountry] = useState(0);
    const [selectedCurrentProvince, setSelectedCurrentProvince] = useState(0);
    const [selectedHomeProvince, setSelectedHomeProvince] = useState(0);

    const bindingMap: BindingMapping<Student, FormSchema> = useMemo(
        () => ({
            nationality: {
                stateBinding: setSelectedCountry,
                formBinding: {
                    formKey: "nationalityId",
                },
                objectKey: ["id"],
            },
            nationalId: {
                formBinding: {},
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
            currentAddressLatitude: {
                formBinding: {},
            },
            currentAddressLongitude: {
                formBinding: {},
            },
            currentAddressProvince: {
                formBinding: {
                    formKey: "currentAddressProvinceId",
                },
                stateBinding: setSelectedCurrentProvince,
                objectKey: ["id"],
            },
            currentAddressDistrict: {
                formBinding: {
                    formKey: "currentAddressDistrictId",
                },
                objectKey: ["id"],
            },
            currentAddressNumber: {
                formBinding: {},
            },
            currentAddressOther: {
                formBinding: {},
            },
            hometownAddressLatitude: {
                formBinding: {},
            },
            hometownAddressLongitude: {
                formBinding: {},
            },
            hometownAddressProvince: {
                formBinding: {
                    formKey: "hometownAddressProvinceId",
                },
                stateBinding: setSelectedHomeProvince,
                objectKey: ["id"],
            },
            hometownAddressDistrict: {
                formBinding: {
                    formKey: "hometownAddressDistrictId",
                },
                objectKey: ["id"],
            },
            hometownAddressNumber: {
                formBinding: {},
            },
            hometownAddressOther: {
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
            currentAddressProvince: {
                id: values.currentAddressProvinceId,
            },
            currentAddressDistrict: {
                id: values.currentAddressDistrictId,
            },
            ...values,
        };

        if (values.hometownAddressProvinceId) {
            body.hometownAddressProvince = {
                id: values.hometownAddressProvinceId,
            };
        }
        if (values.hometownAddressDistrictId) {
            body.hometownAddressDistrict = {
                id: values.hometownAddressDistrictId,
            };
        }

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
                                            setSelectedCountry(
                                                selectedCountry.id,
                                            );
                                        }}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="เลือกเชื้อชาติ" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {/* Map through nationalities data */}
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
                        {selectedCountry === THAILAND_COUNTRY_ID && (
                            <FormField
                                control={form.control}
                                name="nationalId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            รหัสบัตรประชาชน
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="กรอกรหัสบัตรประชาชน"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            กรอกเฉพาะตัวเลข 13 หลักติดกัน
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

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
                                            {/* Map through relegions data */}
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
                        <FormField
                            control={form.control}
                            name="currentAddressLatitude"
                            render={({ field }) => (
                                <FormItem>
                                    <Input type="hidden" {...field} />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="currentAddressLongitude"
                            render={({ field }) => (
                                <FormItem>
                                    <Input type="hidden" {...field} />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="currentAddressProvinceId"
                            render={({ field }) => (
                                <FormItem className="!pt-0">
                                    <FormLabel>
                                        จังหวัดที่อยู่ปัจจุบัน
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
                                            setSelectedCurrentProvince(
                                                selectedProvinceString.id,
                                            );
                                            // Reset district when province changes
                                            form.setValue(
                                                "currentAddressDistrictId",
                                                0,
                                            ); // ใช้ 0 แทน undefined
                                        }}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="เลือกจังหวัดที่อยู่ปัจจุบัน" />
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
                            name="currentAddressDistrictId"
                            render={({ field }) => (
                                <FormItem className="!pt-0">
                                    <FormLabel>
                                        อำเภอ/เขตที่อยู่ปัจจุบัน
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
                                                <SelectValue placeholder="เลือกเขตที่อยู่ปัจจุบัน" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {districts
                                                .filter((district) => {
                                                    const selectedCurrentProvinceCode =
                                                        provinces.find(
                                                            (province) =>
                                                                province.id ===
                                                                selectedCurrentProvince,
                                                        )?.provinceCode;
                                                    return (
                                                        district.provinceCode ===
                                                        selectedCurrentProvinceCode
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
                            name="currentAddressNumber"
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
                            name="currentAddressOther"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        ที่อยู่ปัจจุบัน
                                        <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="กรอกที่อยู่ปัจจุบัน (หมู่บ้าน/ซอย/ถนน/ตำบล)"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </section>

                    {selectedCountry === THAILAND_COUNTRY_ID ? ( // Thailand
                        <section className="flex flex-col gap-2">
                            <FormField
                                control={form.control}
                                name="hometownAddressLatitude"
                                render={({ field }) => (
                                    <FormItem>
                                        <Input type="hidden" {...field} />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="hometownAddressLongitude"
                                render={({ field }) => (
                                    <FormItem>
                                        <Input type="hidden" {...field} />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="hometownAddressProvinceId"
                                render={({ field }) => (
                                    <FormItem className="!pt-0">
                                        <FormLabel>
                                            จังหวัดที่อยู่ตามบัตรประชาชน
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
                                                    provinces.find(
                                                        (province) =>
                                                            province.nameTh ===
                                                            value,
                                                    );

                                                if (!selectedProvinceString) {
                                                    return;
                                                }

                                                field.onChange(
                                                    selectedProvinceString?.id,
                                                );
                                                setSelectedHomeProvince(
                                                    selectedProvinceString?.id,
                                                );
                                            }}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="เลือกจังหวัดที่อยู่ตามบัตรประชาชน" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {/* Map through provinces data */}
                                                {sortedProvinces.map(
                                                    (province) => (
                                                        <SelectItem
                                                            key={
                                                                province.provinceCode
                                                            }
                                                            value={
                                                                province.nameTh ??
                                                                ""
                                                            }
                                                        >
                                                            {province.nameTh}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="hometownAddressDistrictId"
                                render={({ field }) => (
                                    <FormItem className="!pt-0">
                                        <FormLabel>
                                            เขตที่อยู่ตามบัตรประชาชน
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
                                                field.onChange(
                                                    selectedDistrict?.id,
                                                );
                                            }}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="เลือกเขตที่อยู่ตามบัตรประชาชน" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {districts
                                                    .filter((district) => {
                                                        const selectedHomeProvinceCode =
                                                            provinces.find(
                                                                (province) =>
                                                                    province.id ===
                                                                    selectedHomeProvince,
                                                            )?.provinceCode;
                                                        return (
                                                            district.provinceCode ===
                                                            selectedHomeProvinceCode
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
                                name="hometownAddressNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>เลขที่</FormLabel>
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
                                name="hometownAddressOther"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            ที่อยู่ตามบัตรประชาชน
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="กรอกที่อยู่ตามบัตรประชาชน (หมู่บ้าน/ซอย/ถนน/ตำบล)"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </section>
                    ) : (
                        <FormField
                            control={form.control}
                            name="hometownAddressOther"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>ที่อยู่ตามบัตรประชาชน</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="กรอกที่อยู่ตามบัตรประชาชน"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

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
