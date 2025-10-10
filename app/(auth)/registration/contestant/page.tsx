"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Loader2, CheckCircle2, Download, Mail } from "lucide-react"
import Image from "next/image"
import { Icon } from "@iconify/react"
import Link from "next/link"
import { toast } from "sonner"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useRouter } from "next/navigation"
import { useContestantRegistration } from "@/hooks/use-contestant-registration"

// Import components
import { PersonalInformation } from "@/components/registration/student/PersonalInformation"
import { ContactInformation } from "@/components/registration/student/ContactInformation"
import { EventPreferences } from "@/components/registration/student/EventPreferences"
import { EmergencySafety } from "@/components/registration/student/EmergencySafety"
import { AdditionalInformation } from "@/components/registration/student/AdditionalInformation"
import { PerformerSection } from "@/components/registration/student/PerformerSection"
import { DraftManager } from "@/components/registration/student/DraftManager"
import { SchoolEndorsement } from "@/components/registration/student/SchoolEndorsement"

// Schema for individual performer
const performerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  age: z.string().min(1, "Age is required"),
  gender: z.string().min(1, "Gender is required"),
  school: z.string().min(2, "School name is required"),
  courseYear: z.string().min(1, "Course/Year Level is required"),
  contactNumber: z.string()
    .min(16, "Valid Philippine mobile number is required")
    .regex(/^\+63\s\d{3}\s\d{3}\s\d{4}$/, "Must be in format: +63 XXX XXX XXXX"),
  email: z.string().email("Valid email address is required"),
  
  // C. Requirements (file uploads) - These will be validated on the form submission
  schoolCertification: z.any().optional(),
  schoolIdCopy: z.any().optional(),
  
  // D. Health & Fitness Declaration
  healthDeclaration: z.boolean().refine((val) => val === true, "Health declaration is required"),
  
  // E. Consent & Agreement
  termsAgreement: z.boolean().refine((val) => val === true, "You must agree to the terms and conditions to proceed"),
  informationConsent: z.boolean().refine((val) => val === true, "You must consent to information usage"),
  rulesAgreement: z.boolean().refine((val) => val === true, "You must agree to the event rules"),
  publicityConsent: z.boolean().refine((val) => val === true, "You must consent to publicity"),
  
  // Signature fields
  studentSignature: z.string().min(1, "Student signature is required"),
  signatureDate: z.string().min(1, "Signature date is required"),
  parentGuardianSignature: z.string().optional(),
})

const formSchema = z.object({
  // B. Performance Details (single section)
  performanceType: z.string().min(1, "Type of performance is required"),
  performanceOther: z.string().optional(),
  performanceTitle: z.string().min(1, "Title of piece/performance is required"),
  performanceDuration: z.string()
    .min(1, "Performance duration is required")
    .regex(/^[1-5]$/, "Duration must be between 1-5 minutes"),
  numberOfPerformers: z.string().min(1, "Number of performers is required"),
  
  // School Endorsement (top-level, applies to all performers)
  schoolOfficialName: z.string().optional(),
  schoolOfficialPosition: z.string().optional(),
  
  // Performers (up to 10)
  performers: z.array(performerSchema).min(1, "At least one performer is required").max(10, "Maximum 10 performers allowed"),
})

type FormData = z.infer<typeof formSchema>

export default function RegistrationPage() {
  const [numberOfPerformers, setNumberOfPerformers] = useState(0)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const router = useRouter()
  
  // Use custom hook for registration
  const { isSubmitting, registrationData, submitRegistration, resetRegistration } = useContestantRegistration()

  // Initialize form before any watchers
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      performanceType: "",
      performanceOther: "",
      performanceTitle: "",
      performanceDuration: "",
      numberOfPerformers: "",
      schoolOfficialName: "",
      schoolOfficialPosition: "",
      performers: [],
    },
    mode: 'onChange'
  })

  // Watch for changes in numberOfPerformers and update performers array
  const watchNumberOfPerformers = form.watch('numberOfPerformers')
  
  useEffect(() => {
    const count = parseInt(watchNumberOfPerformers) || 0
    setNumberOfPerformers(count)
    
    // Update performers array to match the selected count
    if (count > 0) {
      const currentPerformers = form.getValues('performers') || []
      const newPerformers = Array.from({ length: count }, (_, index) => {
        // Keep existing performer data if available, otherwise create new
        if (currentPerformers[index]) {
          return currentPerformers[index]
        }
        return {
          fullName: "",
          age: "",
          gender: "",
          school: "",
          courseYear: "",
          contactNumber: "+63",
          email: "",
          healthDeclaration: false,
          termsAgreement: false,
          informationConsent: false,
          rulesAgreement: false,
          publicityConsent: false,
          studentSignature: "",
          signatureDate: "",
          parentGuardianSignature: "",
        }
      })
      
      form.setValue('performers', newPerformers)
    } else {
      // Clear performers array when count is 0
      form.setValue('performers', [])
    }
  }, [watchNumberOfPerformers, form])

  const onSubmit = async (data: FormData) => {
    const result = await submitRegistration(data)
    if (result) {
      setShowSuccessModal(true)
    }
  }

  // Handle invalid submissions: show toast and focus the first error
  const onInvalid = (errors: any) => {
    toast.error("Please fill in all required fields to continue.")

    // Find the first error path and focus it
    const findFirstErrorPath = (errObj: any, path: string[] = []): string | null => {
      if (!errObj || typeof errObj !== 'object') return null
      for (const key of Object.keys(errObj)) {
        const val = errObj[key]
        if (!val) continue
        // FieldError shape usually has 'message' or 'type'
        if (val && (val.message || val.type)) {
          return [...path, key].join('.')
        }
        if (typeof val === 'object') {
          const nested = findFirstErrorPath(val, [...path, key])
          if (nested) return nested
        }
      }
      return null
    }

    const firstPath = findFirstErrorPath(errors)
    if (firstPath) {
      try { form.setFocus(firstPath as any, { shouldSelect: true }) } catch {}
    }
  }

  const handleModalClose = () => {
    setShowSuccessModal(false)
    resetRegistration()
    form.reset()
    setNumberOfPerformers(0)
    router.push('/registration/contestant')
  }

  const downloadQRCode = () => {
    if (registrationData?.qrCodeUrl) {
      const link = document.createElement('a')
      link.href = registrationData.qrCodeUrl
      link.download = `qr-code-${registrationData.leadName.replace(/\s+/g, '-')}.png`
      link.click()
    }
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6 max-w-5xl">
        
        {/* Header Banner */}
        <div className="relative w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-800 mb-6">
          <Image
            src="/images/beacon-reg.png"
            alt="Maritime Talent Quest 2025 Registration"
            width={1600}
            height={300}
            priority
            className="w-full h-auto object-cover"
          />
          <div className="absolute inset-0 flex items-end justify-end p-3 gap-2">
            <ThemeToggle />
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/95 backdrop-blur-sm cursor-pointer hover:bg-white text-gray-700 border-gray-300 shadow-sm hover:shadow-md transition-all dark:bg-gray-800/95 dark:hover:bg-gray-800 dark:text-gray-200 dark:border-gray-600"
                title="Back to Home"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Form Wrapper moved up to contain Card + Performer sections */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="relative">

        {/* Main Registration Card */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          {/* Header Section */}
          <div className="p-8 border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="text-2xl font-bold tracking-wide mb-2 text-gray-900 dark:text-white">
              MARITIME TALENT QUEST 2025 REGISTRATION
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              <div className="space-y-1">
                <p className="font-medium">Official Registration Form - Conference | Performance Competition</p>
                <p className="text-sm">October 23, 2025 | Manila EGC Marine Supply Inc.</p>
                <p className="text-sm">Please complete all required fields below.</p>
              </div>
            </CardDescription>
          </div>

          {/* Content Section */}
          <CardContent className="p-8">
            {/* Info Card */}
            <div className="mb-10">
              <DraftManager />
            </div>

            {/* Loading Overlay */}
            {isSubmitting && (
              <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  <p className="text-sm font-medium">Submitting Registration...</p>
                  <p className="text-xs text-muted-foreground">Please do not close this window</p>
                </div>
              </div>
            )}

            <div className="space-y-10">
              {/* Section 1: Performance Details */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">1</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Details</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Tell us about your talent performance</p>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <ContactInformation form={form} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Message - placed outside main card */}
        {(numberOfPerformers > 10 || (watchNumberOfPerformers && parseInt(watchNumberOfPerformers) > 10)) && (
          <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 dark:bg-red-800 rounded-full w-8 h-8 flex items-center justify-center">
                <Icon icon="mdi:alert" className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="font-semibold text-red-800 dark:text-red-200">Maximum 10 performers allowed</p>
                <p className="text-red-600 dark:text-red-400 text-sm">Please enter a number between 1 and 10.</p>
              </div>
            </div>
          </div>
        )}

        {/* Performer Cards Container - moved outside the main card */}
        {numberOfPerformers > 0 && numberOfPerformers <= 10 && (
          <div className="mt-4 space-y-4">
            {Array.from({ length: numberOfPerformers }, (_, index) => (
              <div key={`performer-${index}`} className="animate-fade-in-scale">
                <PerformerSection
                  form={form}
                  performerIndex={index}
                  performerNumber={index + 1}
                />
              </div>
            ))}
            
            {/* School Endorsement Section - shown once after all performers */}
            <div className="mt-6">
              <SchoolEndorsement form={form} />
            </div>
          </div>
        )}

        {/* Submit Section */}
        {numberOfPerformers > 0 && numberOfPerformers <= 10 && (
          <div className="mt-8 text-center">
            <Button
              type="submit"
              className="w-full max-w-md bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting Registration...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Complete Registration
                </>
              )}
            </Button>
            <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-3">
              You will receive a confirmation email after successful registration
            </p>
          </div>
        )}

          </form>
        </Form>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              Registration Successful!
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {registrationData && (
              <>
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {registrationData.isGroup ? 'Group' : 'Individual'} registration completed for{' '}
                    <span className="font-semibold">{registrationData.leadName}</span>
                  </p>
                  
                  {/* QR Code Display */}
                  <div className="bg-white p-4 rounded-lg border inline-block">
                    <Image
                      src={registrationData.qrCodeUrl}
                      alt="Registration QR Code"
                      width={200}
                      height={200}
                      className="mx-auto"
                    />
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Your unique QR code for event entry
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900 dark:text-blue-200">
                        {registrationData.emailSent ? 'Email Sent!' : 'Email Notification'}
                      </p>
                      <p className="text-blue-700 dark:text-blue-300">
                        {registrationData.emailSent 
                          ? 'Your QR code has been sent to your email address.' 
                          : 'Please save this QR code as backup.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={downloadQRCode}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download QR
                  </Button>
                  <Button
                    onClick={handleModalClose}
                    className="flex-1"
                  >
                    Done
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
