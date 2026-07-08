import type { Department } from "@/server/db/types";

// รายชื่อภาควิชา/หลักสูตร คณะวิศวกรรมศาสตร์ จุฬาฯ — แก้ไขรายการได้ที่ไฟล์นี้
//
// APPEND-ONLY: each `id` is a stable key persisted in student records
// (student.department.id). Only ADD new entries with a fresh id. Never change,
// reorder, or reuse an existing id — doing so silently remaps already-saved
// student records to the wrong department. departments.test.ts locks the
// id -> code mapping to catch accidental renumbering.
export const departments: Department[] = [
    {
        id: 0,
        nameTh: "วิศวกรรมศาสตร์ (ภาครวม)",
        nameEn: "General Engineering",
        code: "-",
    },
    {
        id: 1,
        nameTh: "วิศวกรรมโยธา",
        nameEn: "Civil Engineering",
        code: "CE",
    },
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
        nameTh: "วิศวกรรมยานยนต์",
        nameEn: "Automotive Engineering",
        code: "AE",
    },
    {
        id: 5,
        nameTh: "วิศวกรรมอุตสาหการ",
        nameEn: "Industrial Engineering",
        code: "IE",
    },
    {
        id: 6,
        nameTh: "วิศวกรรมเคมี",
        nameEn: "Chemical Engineering",
        code: "CHE",
    },
    {
        id: 7,
        nameTh: "วิศวกรรมทรัพยากรธรณีและเหมืองแร่",
        nameEn: "Mining and Petroleum Engineering",
        code: "MN",
    },
    {
        id: 8,
        nameTh: "วิศวกรรมปิโตรเลียม",
        nameEn: "Petroleum Engineering",
        code: "PE",
    },
    {
        id: 9,
        nameTh: "วิศวกรรมสิ่งแวดล้อม",
        nameEn: "Environmental Engineering",
        code: "ENV",
    },
    {
        id: 10,
        nameTh: "วิศวกรรมสำรวจ",
        nameEn: "Survey Engineering",
        code: "SV",
    },
    {
        id: 11,
        nameTh: "วิศวกรรมโลหการและวัสดุ",
        nameEn: "Metallurgical and Materials Engineering",
        code: "MT",
    },
    {
        id: 12,
        nameTh: "วิศวกรรมคอมพิวเตอร์",
        nameEn: "Computer Engineering",
        code: "CP",
    },
    {
        id: 13,
        nameTh: "วิศวกรรมคอมพิวเตอร์และเทคโนโลยีดิจิทัล (CEDT)",
        nameEn: "Computer Engineering and Digital Technology",
        code: "CEDT",
    },
    {
        id: 14,
        nameTh: "วิศวกรรมนิวเคลียร์และรังสี",
        nameEn: "Nuclear Engineering",
        code: "NE",
    },
    {
        id: 15,
        nameTh: "วิศวกรรมนาโน (NANO)",
        nameEn: "Nano Engineering",
        code: "NANO",
    },
    {
        id: 16,
        nameTh: "วิศวกรรมการออกแบบและการผลิตยานยนต์ (ADME)",
        nameEn: "Automotive Design and Manufacturing Engineering",
        code: "ADME",
    },
    {
        id: 17,
        nameTh: "วิศวกรรมสารสนเทศและการสื่อสาร (ICE)",
        nameEn: "Information and Communication Engineering",
        code: "ICE",
    },
    {
        id: 18,
        nameTh: "วิศวกรรมอากาศยาน (AERO)",
        nameEn: "Aerospace Engineering",
        code: "AERO",
    },
    {
        id: 19,
        nameTh: "วิศวกรรมหุ่นยนต์และปัญญาประดิษฐ์ (Robotics AI)",
        nameEn: "Robotics and Artificial Intelligence Engineering",
        code: "AI",
    },
    {
        id: 20,
        nameTh: "วิศวกรรมเคมีและกระบวนการ (ChPE)",
        nameEn: "Chemical and Process Engineering",
        code: "ChPE",
    },
    {
        id: 21,
        nameTh: "วิศวกรรมเซมิคอนดักเตอร์ (SEMI)",
        nameEn: "Semiconductor Engineering",
        code: "SEMI",
    },
];
