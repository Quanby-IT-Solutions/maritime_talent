"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import { Icon } from "@iconify/react"
import Link from "next/link"

// Import components
import { PersonalInformation } from "./student/PersonalInformation"
import { ContactInformation } from "./student/ContactInformation"
import { EventPreferences } from "./student/EventPreferences"
import { EmergencySafety } from "./student/EmergencySafety"
import { AdditionalInformation } from "./student/AdditionalInformation"
import { DraftManager } from "./student/DraftManager"

const formSchema = z.object({
  // Personal Information
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  age: z.string().min(1, "Age is required").refine((val) => {
    const num = parseInt(val)
    return num >= 16 && num <= 30
  }, "Age must be between 16 and 30"),
  gender: z.string().min(1, "Gender is required"),
  ageBracket: z.string().min(1, "Age bracket is required"),
  school: z.string().min(2, "School name is required"),
  courseYear: z.string().min(1, "Course/Year Level is required"),
  
  // Contact Information
  email: z.string().email("Valid email address is required"),
  contactNumber: z.string().min(10, "Valid contact number is required").regex(/^[0-9+\-\s()]+$/, "Invalid phone number format"),
  landline: z.string().optional(),
  mailingAddress: z.string().optional(),
  
  // Event Preferences
  attendeeType: z.string().min(1, "Attendee type is required"),
  
  // Emergency & Safety
  emergencyContactPerson: z.string().min(2, "Emergency contact person is required"),
  emergencyContactNumber: z.string().min(10, "Emergency contact number is required"),
  specialAssistance: z.string().optional(),
  
  // Additional Information
  hearAboutEvent: z.string().min(1, "Please specify how you heard about the event"),
  hearAboutOthers: z.string().optional(),
  dataPrivacyConsent: z.boolean().refine((val) => val === true, "Data privacy consent is required"),
})

type FormData = z.infer<typeof formSchema>

export default function RegistrationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form before any watchers
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      age: "",
      gender: "",
      ageBracket: "",
      school: "",
      courseYear: "",
      email: "",
      contactNumber: "",
      landline: "",
      mailingAddress: "",
      attendeeType: "",
      emergencyContactPerson: "",
      emergencyContactNumber: "",
      specialAssistance: "",
      hearAboutEvent: "",
      hearAboutOthers: "",
      dataPrivacyConsent: false,
    },
    mode: 'onChange'
  })

  // Refs for measuring container heights per section (dynamic vertical line segments like BEACON)
  const personalRef = useRef<HTMLDivElement>(null)
  const contactRef = useRef<HTMLDivElement>(null)
  const eventsRef = useRef<HTMLDivElement>(null)
  const emergencyRef = useRef<HTMLDivElement>(null)
  const additionalRef = useRef<HTMLDivElement>(null)
  const submitRef = useRef<HTMLDivElement>(null)

  // Vertical line segment counts (approx. each segment ~8px high + gap)
  const [personalLines, setPersonalLines] = useState(6)
  const [contactLines, setContactLines] = useState(6)
  const [eventsLines, setEventsLines] = useState(6)
  const [emergencyLines, setEmergencyLines] = useState(6)
  const [additionalLines, setAdditionalLines] = useState(6)

  // Helper: measure content height and convert to number of line segments like original project
  const calcLines = useCallback((ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return 6
    const content = ref.current.querySelector('.h-fit') as HTMLElement | null
    const target = content ?? ref.current
    const h = target.offsetHeight
    // Each segment (border-l-2 h-2) effectively ~8px height + ~4px gap => ~12px; use 10 for denser look
    return Math.max(6, Math.round(h / 24))
  }, [])

  const recomputeLines = useCallback(() => {
    setPersonalLines(calcLines(personalRef))
    setContactLines(calcLines(contactRef))
    setEventsLines(calcLines(eventsRef))
    setEmergencyLines(calcLines(emergencyRef))
    setAdditionalLines(calcLines(additionalRef))
  }, [calcLines])

  useEffect(() => {
    recomputeLines()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Recompute when form values that likely alter height change
  const watchAll = form.watch()
  useEffect(() => {
    const t = setTimeout(recomputeLines, 120)
    return () => clearTimeout(t)
  }, [watchAll, recomputeLines])

  // Recompute on window resize
  useEffect(() => {
    const handler = () => recomputeLines()
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [recomputeLines])

  // (form already initialized above)

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      // TODO: Implement form submission logic here
      console.log("Form submitted:", data)
      alert("Application submitted successfully!")
    } catch (error) {
      console.error("Submission error:", error)
      alert("Error submitting application. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Icon mapping using iconify (similar style to BEACON project) : Use consistent color classes
  // const iconClasses = "rounded-full bg-c1/30 text-c1 dark:text-white dark:border-white border-2 border-c1 lg:p-2 p-1 lg:h-12 lg:w-12 h-8 w-8 flex items-center justify-center"

  const timelineItems = [
    {
      ref: personalRef,
      lineCount: personalLines,
      title: "Personal Information",
      icon: "mdi:account",
      component: <PersonalInformation form={form} />,
      description: "Basic personal details and identification"
    },
    {
      ref: contactRef,
      lineCount: contactLines,
      title: "Contact Information",
      icon: "mdi:email",
      component: <ContactInformation form={form} />,
      description: "Email, phone, and address information"
    },
    {
      ref: eventsRef,
      lineCount: eventsLines,
      title: "Event Preferences",
      icon: "mdi:calendar-multiple",
      component: <EventPreferences form={form} />,
      description: "Select events and dates to attend"
    },
    {
      ref: emergencyRef,
      lineCount: emergencyLines,
      title: "Emergency & Safety",
      icon: "mdi:shield-check",
      component: <EmergencySafety form={form} />,
      description: "Emergency contact and safety information"
    },
    {
      ref: additionalRef,
      lineCount: additionalLines,
      title: "Additional Information",
      icon: "mdi:information",
      component: <AdditionalInformation form={form} />,
      description: "Additional details and consent"
    }
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#e8f3ff] dark:bg-slate-900">
      <div className="container mx-auto p-4 max-w-6xl flex-1 flex flex-col gap-6">
        
        {/* Header with Banner */}
        <div className="relative w-full h-40 rounded-lg overflow-hidden bg-white border border-gray-200 shadow-sm flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-3xl font-semibold tracking-wide text-black mb-1">STUDENT REGISTRATION</h1>
            <p className="text-sm text-black/70">Application Form</p>
          </div>
        </div>

        {/* Main Content */}
        <Card className="relative flex-1 flex flex-col p-6 shadow-lg border border-gray-200 bg-white">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl uppercase text-black dark:text-gray-100 tracking-wide">
              Student Registration
            </CardTitle>
            <div className="w-24 h-[3px] bg-black dark:bg-gray-200 rounded-full"></div>
            <CardDescription className="text-base">
              <div className="text-black dark:text-gray-300 space-y-1">
                <p className="font-semibold">Official Student Application Form</p>
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

                {/* Dynamic Timeline Layout (mirroring BEACON style) */}
                <div className="space-y-2">
                  {timelineItems.map((item, idx) => (
                    <div
                      key={item.title}
                      ref={item.ref}
                      className="min-h-24 flex flex-row lg:gap-4"
                    >
                      <div className="flex-none flex flex-col items-center justify-start space-y-1 pr-2 pb-1">
                        <Icon
                          icon={item.icon}
                          className="rounded-full bg-gray-100 text-black dark:text-white dark:border-gray-300 border-2 border-black lg:p-2 p-1 lg:h-12 lg:w-12 h-8 w-8"
                          width="24"
                          height="24"
                        />
                        {Array.from({ length: item.lineCount }).map((_, i) => (
                          <span
                            key={i}
                            className={`border-l-2 ${idx === timelineItems.length - 1 ? 'border-transparent' : 'border-black'} h-2`}
                          ></span>
                        ))}
                      </div>
                      <div className="flex-1 flex flex-col lg:mt-3">
                        <h2 className="text-lg font-semibold text-black dark:text-gray-100">{item.title}</h2>
                        <div className="lg:ml-4 py-4 h-fit">
                          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                            {item.component}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Submit Section */}
                {/* Submit Section - timeline style continuation */}
                <div ref={submitRef} className="min-h-24 flex flex-row lg:gap-4 mt-6">
                  <div className="flex-none flex flex-col items-center justify-start space-y-1 pr-2 pb-1 ">
                    <Icon
                      icon="line-md:downloading-loop"
                      className="rounded-full bg-gray-100 text-black dark:text-white dark:border-gray-300 border-2 border-black lg:p-2 p-1 lg:h-12 lg:w-12 h-8 w-8"
                      width="24"
                      height="24"
                    />
                  </div>
                  <div className="flex-1 space-y-4">
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
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}