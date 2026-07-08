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
    /** Parent / emergency contact */
    parentName?: string | undefined;
    /** Relation to the student: "บิดา", "มารดา", or a free-text value */
    parent?: string | undefined;
    parentPhoneNumber?: string | undefined;
    /** Contact address ("ที่อยู่ที่สามารถติดต่อได้") */
    contactAddressNumber?: string | undefined;
    contactAddressProvince?: Province | undefined;
    contactAddressDistrict?: District | undefined;
    contactAddressOther?: string | undefined;
    /** Miscellaneous */
    cueaDataTransferAgreement?: boolean | undefined;
}
