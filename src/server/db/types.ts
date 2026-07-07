// Plain replacements for the protobuf-generated student types.
// Shapes must stay compatible with the form components in
// src/components/register/, which were written against the proto types.

export interface Department {
    id: number;
    nameTh?: string | undefined;
    nameEn?: string | undefined;
    code?: string | undefined;
}

export interface Country {
    id: number;
    name?: string | undefined;
    code?: string | undefined;
}

export interface Religion {
    id: number;
    nameTh?: string | undefined;
    nameEn?: string | undefined;
}

export interface FamilyStatus {
    id: number;
    valueTh?: string | undefined;
    valueEn?: string | undefined;
}

export interface FamilyMemberStatus {
    id: number;
    valueTh?: string | undefined;
    valueEn?: string | undefined;
}

export interface Province {
    id: number;
    nameTh?: string | undefined;
    nameEn?: string | undefined;
    provinceCode?: number | undefined;
}

export interface District {
    id: number;
    nameTh?: string | undefined;
    nameEn?: string | undefined;
    provinceCode?: number | undefined;
    districtCode?: number | undefined;
    postalCode?: number | undefined;
}

export interface Student {
    /** Legacy numeric id from the gRPC era. Ignored by the server; kept so
     * form components that submit `id: studentData.id` keep compiling. */
    id?: number | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    profilePictureKey?: string | undefined;
    /** Student related data */
    studentId?: string | undefined;
    department?: Department | undefined;
    /** Personal data 1 */
    titleTh?: string | undefined;
    titleEn?: string | undefined;
    firstNameTh?: string | undefined;
    firstNameEn?: string | undefined;
    familyNameTh?: string | undefined;
    familyNameEn?: string | undefined;
    middleNameTh?: string | undefined;
    middleNameEn?: string | undefined;
    nicknameTh?: string | undefined;
    nicknameEn?: string | undefined;
    preferredPronoun?: string | undefined;
    nationalId?: string | undefined;
    /** Personal data 2 */
    nationality?: Country | undefined;
    birthDate?: Date | undefined;
    religion?: Religion | undefined;
    bloodType?: string | undefined;
    foodLimitations?: string | undefined;
    drugAllergies?: string | undefined;
    medicalConditions?: string | undefined;
    medications?: string | undefined;
    shirtSize?: number | undefined;
    /** Social */
    email?: string | undefined;
    emailVerified?: boolean | undefined;
    phoneNumber?: string | undefined;
    phoneNumberVerified?: boolean | undefined;
    lineId?: string | undefined;
    facebook?: string | undefined;
    instagram?: string | undefined;
    /** Family */
    familyStatus?: FamilyStatus | undefined;
    /** string enum: "Father", "Mother", "Other" */
    parent?: string | undefined;
    siblingTotal?: number | undefined;
    siblingOrder?: number | undefined;
    parentPhoneNumber?: string | undefined;
    parentAddress?: string | undefined;
    /** Father & Mother */
    fatherName?: string | undefined;
    fatherBirthYear?: number | undefined;
    fatherStatus?: FamilyMemberStatus | undefined;
    motherName?: string | undefined;
    motherBirthYear?: number | undefined;
    motherStatus?: FamilyMemberStatus | undefined;
    /** Current address */
    currentAddressNumber?: string | undefined;
    currentAddressProvince?: Province | undefined;
    currentAddressDistrict?: District | undefined;
    currentAddressLatitude?: number | undefined;
    currentAddressLongitude?: number | undefined;
    currentAddressOther?: string | undefined;
    /** Hometown address */
    hometownAddressNumber?: string | undefined;
    hometownAddressProvince?: Province | undefined;
    hometownAddressDistrict?: District | undefined;
    hometownAddressLatitude?: number | undefined;
    hometownAddressLongitude?: number | undefined;
    hometownAddressOther?: string | undefined;
    /** Miscellaneous */
    cueaDataTransferAgreement?: boolean | undefined;
}