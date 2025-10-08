import { useState } from 'react';
import { toast } from 'sonner';
import type { RegistrationFormData, RegistrationResult } from '@/types/contestant';

export function useContestantRegistration() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationResult | null>(null);

  const buildFormData = (data: RegistrationFormData): FormData => {
    const formData = new FormData();
    
    // Add performance details
    formData.append('performanceType', data.performanceType);
    if (data.performanceOther) {
      formData.append('performanceOther', data.performanceOther);
    }
    formData.append('performanceTitle', data.performanceTitle);
    formData.append('performanceDuration', data.performanceDuration);
    formData.append('numberOfPerformers', data.numberOfPerformers);
    
    // Add school endorsement
    if (data.schoolOfficialName) {
      formData.append('schoolOfficialName', data.schoolOfficialName);
    }
    if (data.schoolOfficialPosition) {
      formData.append('schoolOfficialPosition', data.schoolOfficialPosition);
    }
    
    // Add performers data
    data.performers.forEach((performer, index) => {
      const prefix = `performers[${index}]`;
      
      // Basic info
      formData.append(`${prefix}.fullName`, performer.fullName);
      formData.append(`${prefix}.age`, performer.age);
      formData.append(`${prefix}.gender`, performer.gender);
      formData.append(`${prefix}.school`, performer.school);
      formData.append(`${prefix}.courseYear`, performer.courseYear);
      formData.append(`${prefix}.contactNumber`, performer.contactNumber);
      formData.append(`${prefix}.email`, performer.email);
      
      // Files
      if (performer.schoolCertification) {
        formData.append(`${prefix}.schoolCertification`, performer.schoolCertification);
      }
      if (performer.schoolIdCopy) {
        formData.append(`${prefix}.schoolIdCopy`, performer.schoolIdCopy);
      }
      
      // Consents
      formData.append(`${prefix}.healthDeclaration`, String(performer.healthDeclaration));
      formData.append(`${prefix}.informationConsent`, String(performer.informationConsent));
      formData.append(`${prefix}.rulesAgreement`, String(performer.rulesAgreement));
      formData.append(`${prefix}.publicityConsent`, String(performer.publicityConsent));
      
      // Signatures
      if (performer.studentSignature) {
        formData.append(`${prefix}.studentSignature`, performer.studentSignature);
      }
      if (performer.signatureDate) {
        formData.append(`${prefix}.signatureDate`, performer.signatureDate);
      }
      if (performer.parentGuardianSignature) {
        formData.append(`${prefix}.parentGuardianSignature`, performer.parentGuardianSignature);
      }
    });
    
    return formData;
  };

  const submitRegistration = async (data: RegistrationFormData): Promise<RegistrationResult | null> => {
    setIsSubmitting(true);
    
    try {
      const formData = buildFormData(data);
      
      const response = await fetch('/api/contestant', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Submission failed');
      }

      const registrationResult: RegistrationResult = {
        qrCodeUrl: result.data.qrCodeUrl,
        isGroup: result.data.isGroup,
        emailSent: result.emailSent,
        leadName: data.performers[0]?.fullName || 'Participant'
      };

      setRegistrationData(registrationResult);
      
      toast.success('Registration completed successfully!', {
        description: `QR code has been ${result.emailSent ? 'sent to your email' : 'generated'}`
      });

      return registrationResult;
      
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Submission failed", {
        description: error instanceof Error ? error.message : "Something went wrong. Please try again." 
      });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetRegistration = () => {
    setRegistrationData(null);
  };

  return {
    isSubmitting,
    registrationData,
    submitRegistration,
    resetRegistration,
  };
}
