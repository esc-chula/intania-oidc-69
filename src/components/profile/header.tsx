"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProfile } from "@/contexts/profile-context";
import { type Student } from "@/server/db/types";
import { LogOut, User } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
    studentData: Student;
}

const Header: React.FC<HeaderProps> = ({ studentData }) => {
    const { isEditing, setIsEditing } = useProfile();

    const thaiName = [
        studentData.firstNameTh,
        studentData.middleNameTh,
        studentData.familyNameTh,
    ]
        .filter(Boolean)
        .join(" ");
    const englishName = [
        studentData.firstNameEn,
        studentData.middleNameEn,
        studentData.familyNameEn,
    ]
        .filter(Boolean)
        .join(" ");
    const displayName =
        [thaiName, englishName, studentData.studentId ?? ""].find(
            (name) => name !== "",
        ) ?? "";

    return (
        <Card className="p-6">
            <CardContent className="flex size-full flex-col items-center justify-between gap-5 p-0 sm:flex-row sm:items-end">
                <div className="flex h-full w-full items-center gap-4">
                    <div className="aspect-square rounded-full bg-neutral-50 p-5 text-neutral-400">
                        <User size={40} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <h3 className="text-2xl font-semibold text-neutral-800">
                            {displayName}
                        </h3>
                        <h4 className="font-semibold text-primary">
                            {studentData.studentId}
                        </h4>
                    </div>
                </div>
                <div className="flex w-full items-center justify-end gap-4 sm:w-auto">
                    {isEditing ? (
                        <>
                            <Button
                                variant="secondary"
                                onClick={() => setIsEditing(false)}
                            >
                                ยกเลิก
                            </Button>
                            <Button variant="default">บันทึก</Button>
                        </>
                    ) : (
                        <>
                            {/* <Button
                                variant="secondary"
                                onClick={() => setIsEditing(true)}
                            >
                                แก้ไขข้อมูล
                            </Button> */}
                            <Link href="/register/onboarding/1">
                                <Button variant="secondary">แก้ไขข้อมูล</Button>
                            </Link>
                            <Link href="/logout">
                                <Button
                                    variant="default"
                                    className="aspect-square h-auto px-2.5 py-2.5"
                                >
                                    <LogOut size={20} />
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default Header;
