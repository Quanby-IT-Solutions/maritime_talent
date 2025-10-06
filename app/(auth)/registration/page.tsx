"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
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
  })

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

  const sections = [
    { 
      id: "personal", 
      title: "Personal Information", 
      icon: "👤", 
      component: <PersonalInformation form={form} />,
      description: "Basic personal details and identification"
    },
    { 
      id: "contact", 
      title: "Contact Information", 
      icon: "📧", 
      component: <ContactInformation form={form} />,
      description: "Email, phone, and address information"
    },
    { 
      id: "events", 
      title: "Event Preferences", 
      icon: "📅", 
      component: <EventPreferences form={form} />,
      description: "Select events and dates to attend"
    },
    { 
      id: "emergency", 
      title: "Emergency & Safety", 
      icon: "🛡️", 
      component: <EmergencySafety form={form} />,
      description: "Emergency contact and safety information"
    },
    { 
      id: "additional", 
      title: "Additional Information", 
      icon: "📋", 
      component: <AdditionalInformation form={form} />,
      description: "Additional details and consent"
    }
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-4 max-w-6xl flex-1 flex flex-col gap-6">
        
        {/* Header with Banner */}
        <div className="relative w-full h-48 rounded-lg overflow-hidden group bg-gradient-to-r from-blue-600 to-cyan-600">
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-300"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-2">BEACON 2025</h1>
              <p className="text-xl opacity-90">VISITOR REGISTRATION</p>
            </div>
          </div>
          <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/90 hover:bg-white text-gray-800 border-gray-300"
                title="Back to Home"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <Card className="relative flex-1 flex flex-col p-6 shadow-xl">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl uppercase text-blue-900 dark:text-blue-100">
              BEACON 2025 Visitor Registration
            </CardTitle>
            <div className="w-24 h-1 bg-blue-600 rounded-full"></div>
            <CardDescription className="text-base">
              <div className="text-gray-700 dark:text-gray-300">
                <p className="font-semibold mb-2">
                  Official Registration Form – Conference | Philippine Ships & Boats In-Water Show | Blue Runway Fashion Show
                </p>
                <p>
                  September 29 – October 1, 2025 | SMX Convention Center, MOA Complex, Pasay City
                </p>
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

                {/* Timeline Layout */}
                <div className="space-y-8">
                  {sections.map((section, index) => (
                    <div key={section.id} className="flex gap-6">
                      
                      {/* Timeline Icon and Line */}
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                          {section.icon}
                        </div>
                        {index < sections.length - 1 && (
                          <div className="w-0.5 h-16 bg-blue-200 dark:bg-blue-800 mt-4"></div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-8">
                        <div className="mb-4">
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            {section.title}
                          </h2>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {section.description}
                          </p>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                          {section.component}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Submit Section */}
                <div className="flex gap-6 mt-8">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                      ✓
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="mb-4">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        Complete Registration
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Submit your registration for BEACON 2025
                      </p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                      <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6"
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
                      
                      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                        You will receive a confirmation email after successful registration
                      </p>
                    </div>
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