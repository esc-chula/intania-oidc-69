import ESCLogoWithoutText from "@/components/esc/esc-logo-without-text";
import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/server/actions/auth";

function GoogleIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
            <path
                fill="#4285F4"
                d="M23.52 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81Z"
            />
            <path
                fill="#34A853"
                d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3.01c-1.07.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.72-4.95H1.27v3.11A12 12 0 0 0 12 24Z"
            />
            <path
                fill="#FBBC05"
                d="M5.28 14.28A7.22 7.22 0 0 1 4.9 12c0-.79.14-1.56.38-2.28V6.61H1.27a12 12 0 0 0 0 10.78l4.01-3.11Z"
            />
            <path
                fill="#EA4335"
                d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.97 11.97 0 0 0 12 0 12 12 0 0 0 1.27 6.61l4.01 3.11C6.22 6.88 8.87 4.77 12 4.77Z"
            />
        </svg>
    );
}

export default function LoginBox({
    errorMessage,
}: {
    errorMessage?: string | null;
}) {
    return (
        <div className="relative flex size-full flex-col gap-16 rounded-2xl border-[#F5F5F5] p-12 md:aspect-[614/764] md:border-2 md:bg-card md:shadow-2xl lg:aspect-[1024/460] lg:grid-cols-2 lg:flex-row lg:p-14">
            <div className="flex w-full flex-col justify-between text-center md:text-start">
                <div className="flex flex-col items-center gap-10 md:items-start">
                    <ESCLogoWithoutText className="h-14 w-fit fill-primary md:h-16" />
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-semibold md:text-3xl">
                            เข้าสู่ระบบ
                        </h2>
                        <h1 className="text-5xl font-bold text-primary md:text-6xl">
                            INTANIA
                        </h1>
                        <p className="font-medium text-muted-foreground md:text-xl">
                            ใช้อีเมลนิสิตจุฬาฯ (@student.chula.ac.th)
                            เพื่อเข้าสู่ระบบ
                        </p>
                    </div>
                </div>
                <p className="text-red-500">{errorMessage}</p>
            </div>
            <form
                action={signInWithGoogle}
                className="flex w-full flex-col items-center justify-center gap-5 lg:place-self-center"
            >
                <Button
                    type="submit"
                    size="lg"
                    variant="outline"
                    className="flex w-full max-w-sm items-center justify-center gap-3 py-6 text-base md:text-lg"
                >
                    <GoogleIcon className="h-5 w-5" />
                    เข้าสู่ระบบด้วย Google
                </Button>
            </form>
        </div>
    );
}