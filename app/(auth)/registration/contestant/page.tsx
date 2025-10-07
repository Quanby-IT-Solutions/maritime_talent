"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import { Icon } from "@iconify/react"
import Link from "next/link"
import { toast } from "sonner"

// Import components

import { PersonalInformation } from "@/components/registration/student/PersonalInformation"
import { ContactInformation } from "@/components/registration/student/ContactInformation"
import { EventPreferences } from "@/components/registration/student/EventPreferences"
import { EmergencySafety } from "@/components/registration/student/EmergencySafety"
import { AdditionalInformation } from "@/components/registration/student/AdditionalInformation"
import { SchoolEndorsement } from "@/components/registration/student/SchoolEndorsement"
import { PerformerSection } from "@/components/registration/student/PerformerSection"
import { DraftManager } from "@/components/registration/student/DraftManager"

// Schema for individual performer
const performerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  age: z.string().min(1, "Age is required"),
  gender: z.string().min(1, "Gender is required"),
  school: z.string().min(2, "School name is required"),
  courseYear: z.string().min(1, "Course/Year Level is required"),
  contactNumber: z.string().min(10, "Valid contact number is required").regex(/^[0-9+\-\s()]+$/, "Invalid phone number format"),
  email: z.string().email("Valid email address is required"),
  
  // C. Requirements (file uploads)
  schoolCertification: z.any().optional(),
  schoolIdCopy: z.any().optional(),
  
  // D. Health & Fitness Declaration
  healthDeclaration: z.boolean().refine((val) => val === true, "Health declaration is required"),
  
  // E. Consent & Agreement
  informationConsent: z.boolean().refine((val) => val === true, "Information consent is required"),
  rulesAgreement: z.boolean().refine((val) => val === true, "Rules agreement is required"),
  publicityConsent: z.boolean().refine((val) => val === true, "Publicity consent is required"),
  
  // Signature fields
  studentSignature: z.string().optional(),
  signatureDate: z.string().optional(),
  parentGuardianSignature: z.string().optional(), // Conditional based on age
})

const formSchema = z.object({
  // B. Performance Details (single section)
  performanceType: z.string().min(1, "Type of performance is required"),
  performanceOther: z.string().optional(),
  performanceTitle: z.string().min(1, "Title of piece/performance is required"),
  performanceDuration: z.string().min(1, "Performance duration is required"),
  numberOfPerformers: z.string().min(1, "Number of performers is required"),
  groupMembers: z.string().optional(),
  
  // Performers (up to 10)
  performers: z.array(performerSchema).min(1, "At least one performer is required").max(10, "Maximum 10 performers allowed"),
  
  // F. School Endorsement (single section)
  schoolOfficialName: z.string().optional(),
  schoolOfficialPosition: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export default function RegistrationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [numberOfPerformers, setNumberOfPerformers] = useState(1)

  // Initialize form before any watchers
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      performanceType: "",
      performanceOther: "",
      performanceTitle: "",
      performanceDuration: "",
      numberOfPerformers: "1",
      groupMembers: "",
      performers: [
        {
          fullName: "",
          age: "",
          gender: "",
          school: "",
          courseYear: "",
          contactNumber: "",
          email: "",
          healthDeclaration: false,
          informationConsent: false,
          rulesAgreement: false,
          publicityConsent: false,
          studentSignature: "",
          signatureDate: "",
          parentGuardianSignature: "",
        }
      ],
      schoolOfficialName: "",
      schoolOfficialPosition: "",
    },
    mode: 'onChange'
  })

  // Watch for changes in numberOfPerformers and update performers array
  const watchNumberOfPerformers = form.watch('numberOfPerformers')
  
  useEffect(() => {
    const count = parseInt(watchNumberOfPerformers) || 1
    setNumberOfPerformers(count)
    
    // Update performers array to match the selected count
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
        contactNumber: "",
        email: "",
        healthDeclaration: false,
        informationConsent: false,
        rulesAgreement: false,
        publicityConsent: false,
        studentSignature: "",
        signatureDate: "",
        parentGuardianSignature: "",
      }
    })
    
    form.setValue('performers', newPerformers)
  }, [watchNumberOfPerformers, form])

  // (form already initialized above)

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      // Simulated submission delay for UX feedback (static mode)
      await new Promise(res => setTimeout(res, 800))
      console.log("Form submitted:", data)
      toast.success("Application submitted", {
        description: "Your registration details have been captured.",
      })
    } catch (error) {
      console.error("Submission error:", error)
      toast.error("Submission failed", {
        description: "Something went wrong. Please try again." 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#e8f3ff] dark:bg-slate-900">
      <div className="container mx-auto p-4 max-w-6xl flex-1 flex flex-col gap-6">
        
        {/* Header Banner Replaced with Provided Image */}
        <div className="relative w-full rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-white">
          <Image
            src="https://register.thebeaconexpo.com/images/beacon-reg.png"
            alt="Student Registration Banner"
            width={1600}
            height={400}
            priority
            className="w-full h-auto object-cover"
          />
          <div className="absolute inset-0 flex items-end justify-end p-2 gap-2">
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/90 cursor-pointer hover:bg-white text-gray-800 border-gray-300"
                title="Back"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <Card className="relative flex-1 flex flex-col p-6 shadow-lg border border-gray-200 bg-white">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl uppercase text-black dark:text-gray-100 tracking-wide">
              Maritime Talent Quest 2025
            </CardTitle>
            <div className="w-24 h-[3px] bg-black dark:bg-gray-200 rounded-full"></div>
            <CardDescription className="text-base">
              <div className="text-black dark:text-gray-300 space-y-1">
                <p className="font-semibold">Student Application Form</p>
                <p className="text-sm">Event Date: October 23, 2025 | Organizer: Manila EGC Marine Supply Inc.</p>
                <p className="text-sm">Please complete all required fields below.</p>
              </div>
            </CardDescription>
          </CardHeader>

          <CardContent className="flex-1 p-0">
            {/* Draft Manager */}
            <div className="mb-6">
              <DraftManager />
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
                
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

                <div className="space-y-8">
                  {/* Section B: Performance Details (Always Visible) */}
                  <Card className="border-2 border-blue-100 bg-blue-50/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg text-blue-900">
                        <Icon icon="mdi:music" className="h-5 w-5" />
                        B. Performance Details
                      </CardTitle>
                      <p className="text-sm text-blue-700">Details about your talent performance</p>
                    </CardHeader>
                    <CardContent>
                      <ContactInformation form={form} />
                    </CardContent>
                  </Card>

                  {/* Performer Sections (A, C, D, E for each performer) - Only show if valid number of performers */}
                  {numberOfPerformers > 0 && numberOfPerformers <= 10 && (
                    <>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <p className="text-sm font-medium text-green-900">
                            Showing forms for {numberOfPerformers} performer{numberOfPerformers > 1 ? 's' : ''}
                          </p>
                        </div>
                        <p className="text-sm text-green-700 mt-1">
                          Please complete the information below for each performer.
                        </p>
                      </div>

                      {Array.from({ length: numberOfPerformers }, (_, index) => (
                        <div key={`performer-${index}`}>
                          <PerformerSection 
                            form={form} 
                            performerIndex={index} 
                            performerNumber={index + 1} 
                          />
                        </div>
                      ))}

                      {/* Section F: School Endorsement (Single Section) - Only show when performers are shown */}
                      <Card className="border-2 border-purple-100 bg-purple-50/30">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-lg text-purple-900">
                            <Icon icon="mdi:school" className="h-5 w-5" />
                            F. For School Endorsement
                          </CardTitle>
                          <p className="text-sm text-purple-700">School official endorsement and certification</p>
                        </CardHeader>
                        <CardContent>
                          <SchoolEndorsement form={form} />
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {/* Show message if invalid number of performers */}
                  {(numberOfPerformers > 10 || (watchNumberOfPerformers && parseInt(watchNumberOfPerformers) > 10)) && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <p className="text-sm font-medium text-red-900">
                          Maximum 10 performers allowed
                        </p>
                      </div>
                      <p className="text-sm text-red-700 mt-1">
                        Please enter a number between 1 and 10.
                      </p>
                    </div>
                  )}
                </div>

                {/* Submit Section - Only show when performer sections are visible */}
                {numberOfPerformers > 0 && numberOfPerformers <= 10 && (
                  <div className="mt-8 space-y-4">
                    <Button
                      type="submit"
                      className="w-full bg-black hover:bg-gray-900 text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black"
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting Registration...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Complete Registration
                        </>
                      )}
                    </Button>
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                      You will receive a confirmation email after successful registration
                    </p>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}