import StudentFormContextProvider from "@/contexts/form-context";
import Transition from "./template";
import { redirect } from "next/navigation";
import Header from "@/components/register/header";
import { auth } from "@/server/auth";

export default async function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session?.user?.studentId) {
        redirect("/");
    }

    return (
        <article className="flex size-full flex-col gap-16 px-6 py-7 md:gap-24">
            <StudentFormContextProvider>
                <Header />
                <Transition>{children}</Transition>
            </StudentFormContextProvider>
        </article>
    );
}
