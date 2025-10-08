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
import { ThemeToggle } from "@/components/ui/theme-toggle"

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
  lastName: z.string().optional(),
  middleName: z.string().optional(),
  suffix: z.string().optional(),
  preferredName: z.string().optional(),
  nationality: z.string().min(1, "Nationality is required"),
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
  const [numberOfPerformers, setNumberOfPerformers] = useState(0)

  // Initialize form before any watchers
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      performanceType: "",
      performanceOther: "",
      performanceTitle: "",
      performanceDuration: "",
      numberOfPerformers: "",
      groupMembers: "",
      performers: [],
      schoolOfficialName: "",
      schoolOfficialPosition: "",
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
          lastName: "",
          middleName: "",
          suffix: "",
          preferredName: "",
          nationality: "",
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
    } else {
      // Clear performers array when count is 0
      form.setValue('performers', [])
    }
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
