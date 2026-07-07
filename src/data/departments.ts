import type { Department } from "@/server/db/types";

// รายชื่อภาควิชา/หลักสูตร คณะวิศวกรรมศาสตร์ จุฬาฯ — แก้ไขรายการได้ที่ไฟล์นี้
export const departments: Department[] = [
    { id: 1, nameTh: "วิศวกรรมโยธา", nameEn: "Civil Engineering", code: "CE" },
    {
        id: 2,
        nameTh: "วิศวกรรมไฟฟ้า",
        nameEn: "Electrical Engineering",
        code: "EE",
    },
    {
        id: 3,
        nameTh: "วิศวกรรมเครื่องกล",
        nameEn: "Mechanical Engineering",
        code: "ME",
    },
    {
        id: 4,
        nameTh: "วิศวกรรมอุตสาหการ",
        nameEn: "Industrial Engineering",
        code: "IE",
    },
    {
        id: 5,
        nameTh: "วิศวกรรมเคมี",
        nameEn: "Chemical Engineering",
        code: "CHE",
    },
    {
        id: 6,
        nameTh: "วิศวกรรมเหมืองแร่และปิโตรเลียม",
        nameEn: "Mining and Petroleum Engineering",
        code: "MN",
    },
    {
        id: 7,
        nameTh: "วิศวกรรมสิ่งแวดล้อม",
        nameEn: "Environmental Engineering",
        code: "ENV",
    },
    {
        id: 8,
        nameTh: "วิศวกรรมสำรวจ",
        nameEn: "Survey Engineering",
        code: "SV",
    },
    {
        id: 9,
        nameTh: "วิศวกรรมโลหการ",
        nameEn: "Metallurgical Engineering",
        code: "MT",
    },
    {
        id: 10,
        nameTh: "วิศวกรรมคอมพิวเตอร์",
        nameEn: "Computer Engineering",
        code: "CP",
    },
    {
        id: 11,
        nameTh: "วิศวกรรมนิวเคลียร์",
        nameEn: "Nuclear Engineering",
        code: "NE",
    },
    {
        id: 12,
        nameTh: "วิศวกรรมแหล่งน้ำ",
        nameEn: "Water Resources Engineering",
        code: "WR",
    },
    {
        id: 13,
        nameTh: "วิศวกรรมคอมพิวเตอร์และเทคโนโลยีดิจิทัล (CEDT)",
        nameEn: "Computer Engineering and Digital Technology",
        code: "CEDT",
    },
    {
        id: 14,
        nameTh: "หลักสูตรนานาชาติ (ISE)",
        nameEn: "International School of Engineering",
        code: "ISE",
    },
];
