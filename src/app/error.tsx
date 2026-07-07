"use client";

import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
    return (
        <div className="flex min-h-dvh flex-col items-center justify-center gap-6 p-6 text-center">
            <h1 className="text-2xl font-semibold">เกิดข้อผิดพลาดบางอย่าง</h1>
            <p className="text-muted-foreground">
                กรุณาลองใหม่อีกครั้ง หากยังพบปัญหาโปรดติดต่อทีมงาน
            </p>
            <Button onClick={() => reset()}>ลองอีกครั้ง</Button>
        </div>
    );
}