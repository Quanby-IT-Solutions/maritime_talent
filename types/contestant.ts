// Contestant Registration Types

export interface PerformerData {
  fullName: string;
  age: string;
  gender: string;
  school: string;
  courseYear: string;
  contactNumber: string;
  email: string;
  schoolCertification?: File;
  schoolIdCopy?: File;
  healthDeclaration: boolean;
  termsAgreement: boolean;
  informationConsent: boolean;
  rulesAgreement: boolean;
  publicityConsent: boolean;
  studentSignature: string;
  signatureDate: string;
  parentGuardianSignature?: string;
  schoolOfficialName?: string;
  schoolOfficialPosition?: string;
}

export interface RegistrationFormData {
  performanceType: string;
  performanceOther?: string;
  performanceTitle: string;
  performanceDuration: string;
  numberOfPerformers: string;
  performers: PerformerData[];
  schoolOfficialName?: string;
  schoolOfficialPosition?: string;
}

export interface RegistrationResult {
  qrCodeUrl: string;
  isGroup: boolean;
  emailSent: boolean;
  leadName: string;
}

export interface PerformerFormData {
  fullName: string;
  age: number;
  gender: string;
  school: string;
  courseYear: string;
  contactNumber: string;
  email: string;
  schoolCertification: File | null;
  schoolIdCopy: File | null;
  healthDeclaration: boolean;
  informationConsent: boolean;
  rulesAgreement: boolean;
  publicityConsent: boolean;
  studentSignature: string;
  signatureDate: string;
  parentGuardianSignature: string | null;
  schoolOfficialName?: string | null;
  schoolOfficialPosition?: string | null;
}

export interface EmailRecipient {
  email: string;
  name: string;
  qrCodeUrl: string;
  userType: string;
}

export interface RegistrationAPIResponse {
  success: boolean;
  message: string;
  data: {
    isGroup: boolean;
    groupId: string | null;
    singleId: string | null;
    qrCodeUrl: string;
    emailSent: boolean;
  };
}

export interface RegistrationAPIError {
  success: false;
  error: string;
}
