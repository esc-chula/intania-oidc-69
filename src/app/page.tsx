import LoginBox from "@/components/login/login-box";
import LoginFooter from "@/components/login/login-footer";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";

const ERROR_MESSAGES: Record<string, string> = {
    AccessDenied: "กรุณาเข้าสู่ระบบด้วยอีเมลนิสิตจุฬาฯ (@student.chula.ac.th)",
};

const DEFAULT_ERROR_MESSAGE =
    "เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง";

export default async function Page({
    searchParams,
}: {
    searchParams: { error?: string };
}) {
    const session = await auth();
    if (session?.user?.studentId) {
        redirect("/profile");
    }

    const errorMessage = searchParams.error
        ? (ERROR_MESSAGES[searchParams.error] ?? DEFAULT_ERROR_MESSAGE)
        : null;

    return (
        <div className="flex size-full flex-col items-center">
            <div className="absolute top-1/2 flex size-full max-w-3xl -translate-y-1/2 flex-col items-center justify-between md:h-auto md:justify-center md:px-32 lg:max-w-6xl">
                <LoginBox errorMessage={errorMessage} />
                <LoginFooter />
            </div>
        </div>
    );
}
