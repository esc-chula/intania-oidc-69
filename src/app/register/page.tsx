import ESCLogoWithoutText from "@/components/esc/esc-logo-without-text";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { auth } from "@/server/auth";

export default async function Page() {
    const session = await auth();
    const studentId = session?.user?.studentId;

    return (
        <div className="flex size-full flex-col items-center">
            <div className="relative flex size-full min-h-dvh flex-col justify-between gap-16 rounded-2xl p-6 sm:p-8 md:p-12">
                <div className="flex w-full flex-col items-center gap-10 text-center">
                    <ESCLogoWithoutText className="h-14 w-fit fill-primary md:h-16" />
                    <div className="flex flex-col gap-2">
                        <h2 className="text-xl font-semibold sm:text-2xl md:text-3xl">
                            เข้าสู่ระบบ
                        </h2>
                        <h1 className="text-4xl font-bold text-primary sm:text-5xl md:text-6xl">
                            ลงทะเบียนนิสิตใหม่
                        </h1>
                        <p className="flex flex-wrap items-center justify-center gap-2 text-center text-sm font-medium sm:text-base md:text-xl">
                            แบบฟอร์มลงทะเบียนนิสิตใหม่
                            {studentId && (
                                <span>
                                    ปีการศึกษา 25{studentId.slice(0, 2)}
                                </span>
                            )}
                        </p>
                    </div>
                </div>
                <div>
                    <Card className="mx-auto max-w-screen-sm">
                        <CardContent className="pt-6 text-center text-muted-foreground">
                            ข้อมูลที่กรอกนับจากนี้จะถูกนำไปใช้ตลอดการมีสถานะเป็นนิสิตคณะวิศวะฯจุฬาฯ
                            โปรดตรวจสอบและยืนยัน
                            ความถูกต้องหลังจากกรอกเสร็จและส่ง
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="size-full py-3 text-base md:text-xl"
                                size="lg"
                                asChild
                            >
                                <Link
                                    href={
                                        studentId
                                            ? "/register/onboarding/1"
                                            : "/"
                                    }
                                >
                                    เริ่มต้น
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                    {studentId && (
                        <div className="pt-4 text-center text-sm text-neutral-500">
                            <Link href="/logout" className="hover:underline">
                                ลงทะเบียนด้วยบัญชีอื่น
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}