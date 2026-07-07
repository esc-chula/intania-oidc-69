import type { FamilyMemberStatus, FamilyStatus } from "@/server/db/types";

export const familyStatuses: FamilyStatus[] = [
    { id: 1, valueTh: "อยู่ด้วยกัน", valueEn: "Together" },
    { id: 2, valueTh: "แยกกันอยู่", valueEn: "Separated" },
    { id: 3, valueTh: "หย่าร้าง", valueEn: "Divorced" },
    { id: 4, valueTh: "อื่น ๆ", valueEn: "Other" },
];

export const familyMemberStatuses: FamilyMemberStatus[] = [
    { id: 1, valueTh: "มีชีวิตอยู่", valueEn: "Alive" },
    { id: 2, valueTh: "เสียชีวิต", valueEn: "Deceased" },
    { id: 3, valueTh: "ไม่ทราบ", valueEn: "Unknown" },
];
