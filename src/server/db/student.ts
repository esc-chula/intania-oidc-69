import mongoose, { Schema } from "mongoose";
import { connectDb } from "./mongoose";
import type { Student } from "./types";

const ref = { _id: false, id: false } as const;

const namedRefSchema = new Schema(
    { id: Number, nameTh: String, nameEn: String, code: String },
    ref,
);
const countryRefSchema = new Schema(
    { id: Number, name: String, code: String },
    ref,
);
const valuedRefSchema = new Schema(
    { id: Number, valueTh: String, valueEn: String },
    ref,
);
const geoRefSchema = new Schema(
    {
        id: Number,
        nameTh: String,
        nameEn: String,
        provinceCode: Number,
        districtCode: Number,
        postalCode: Number,
    },
    ref,
);

const studentSchema = new Schema<Student>(
    {
        studentId: { type: String, required: true, unique: true },
        email: { type: String, required: true },
        emailVerified: Boolean,
        phoneNumber: String,
        phoneNumberVerified: Boolean,
        profilePictureKey: String,
        department: namedRefSchema,
        titleTh: String,
        titleEn: String,
        firstNameTh: String,
        firstNameEn: String,
        familyNameTh: String,
        familyNameEn: String,
        middleNameTh: String,
        middleNameEn: String,
        nicknameTh: String,
        nicknameEn: String,
        preferredPronoun: String,
        nationalId: String,
        nationality: countryRefSchema,
        birthDate: Date,
        religion: namedRefSchema,
        bloodType: String,
        foodLimitations: String,
        drugAllergies: String,
        medicalConditions: String,
        medications: String,
        shirtSize: Number,
        lineId: String,
        facebook: String,
        instagram: String,
        familyStatus: valuedRefSchema,
        parent: String,
        siblingTotal: Number,
        siblingOrder: Number,
        parentPhoneNumber: String,
        parentAddress: String,
        fatherName: String,
        fatherBirthYear: Number,
        fatherStatus: valuedRefSchema,
        motherName: String,
        motherBirthYear: Number,
        motherStatus: valuedRefSchema,
        currentAddressNumber: String,
        currentAddressProvince: geoRefSchema,
        currentAddressDistrict: geoRefSchema,
        currentAddressLatitude: Number,
        currentAddressLongitude: Number,
        currentAddressOther: String,
        hometownAddressNumber: String,
        hometownAddressProvince: geoRefSchema,
        hometownAddressDistrict: geoRefSchema,
        hometownAddressLatitude: Number,
        hometownAddressLongitude: Number,
        hometownAddressOther: String,
        cueaDataTransferAgreement: Boolean,
    },
    { timestamps: true },
);

const StudentModel: mongoose.Model<Student> =
    (mongoose.models.Student as mongoose.Model<Student>) ??
    mongoose.model<Student>("Student", studentSchema);

/** Fields a client payload must never overwrite (same policy as the old
 * gRPC field-mask map, which marked these null/non-editable). */
const PROTECTED_FIELDS = [
    "id",
    "studentId",
    "createdAt",
    "updatedAt",
    "profilePictureKey",
    "emailVerified",
    "phoneNumberVerified",
] as const;

function toPlain(doc: Student & { _id?: unknown; __v?: unknown }): Student {
    const { _id, __v, ...student } = doc;
    return student as Student;
}

export async function getOrCreateStudent(
    studentId: string,
    email: string,
): Promise<Student> {
    await connectDb();
    const doc = await StudentModel.findOneAndUpdate(
        { studentId },
        { $setOnInsert: { studentId, email, emailVerified: true } },
        { upsert: true, new: true },
    ).lean();
    return toPlain(doc);
}

export async function upsertStudent(
    studentId: string,
    data: Student,
): Promise<void> {
    await connectDb();

    const fields: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
        if ((PROTECTED_FIELDS as readonly string[]).includes(key)) continue;
        if (value === undefined) continue;
        fields[key] = value;
    }

    await StudentModel.updateOne(
        { studentId },
        { $set: fields },
        { upsert: true },
    );
}