"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { CalendarDays, MapPin, Building2, User, Music, FileText, Heart, Shield } from "lucide-react"

const formSchema = z.object({
  // Student Information
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  age: z.string().min(1, "Age is required").refine((val) => {
    const num = parseInt(val)
    return num >= 16 && num <= 30
  }, "Age must be between 16 and 30"),
  gender: z.string().min(1, "Gender is required"),
  school: z.string().min(2, "School name is required"),
  courseYear: z.string().min(1, "Course/Year Level is required"),
  contactNumber: z.string().min(10, "Valid contact number is required").regex(/^[0-9+\-\s()]+$/, "Invalid phone number format"),
  email: z.string().email("Valid email address is required"),
  
  // Performance Details
  performanceType: z.string().min(1, "Performance type is required"),
  otherPerformanceType: z.string().optional(),
  performanceTitle: z.string().min(1, "Performance title is required"),
  duration: z.string().min(1, "Duration is required"),
  numberOfPerformers: z.string().min(1, "Number of performers is required"),
  groupMembers: z.string().optional(),
  
  // Health & Fitness Declaration
  healthDeclaration: z.boolean().refine((val) => val === true, "Health declaration is required"),
  
  // Consent & Agreement
  consentAgreement: z.boolean().refine((val) => val === true, "Consent agreement is required"),
  
  // Additional fields for completeness
  parentGuardianSignature: z.string().optional(),
  schoolOfficialName: z.string().optional(),
  schoolOfficialPosition: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export default function RegistrationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showOtherPerformance, setShowOtherPerformance] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      age: "",
      gender: "",
      school: "",
      courseYear: "",
      contactNumber: "",
      email: "",
      performanceType: "",
      otherPerformanceType: "",
      performanceTitle: "",
      duration: "",
      numberOfPerformers: "1",
      groupMembers: "",
      healthDeclaration: false,
      consentAgreement: false,
      parentGuardianSignature: "",
      schoolOfficialName: "",
      schoolOfficialPosition: "",
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

  const performanceTypes = [
    "Singing",
    "Dancing", 
    "Musical Instrument",
    "Spoken Word/Poetry",
    "Theatrical/Drama",
    "Other"
  ]

  const genderOptions = [
    "Male",
    "Female", 
    "Non-binary",
    "Prefer not to say"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h1 className="text-3xl font-bold text-blue-900 mb-2">Maritime Talent Quest 2025</h1>
            <h2 className="text-xl font-semibold text-blue-700 mb-4">Student Application Form</h2>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                <span><strong>Event Date:</strong> October 23, 2025</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span><strong>Organizer:</strong> Manila EGC Marine Supply Inc.</span>
              </div>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* A. Student Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  A. Student Information
                </CardTitle>
                <CardDescription>
                  Please provide your personal details and contact information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age *</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="25" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {genderOptions.map((gender) => (
                              <SelectItem key={gender} value={gender}>
                                {gender}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="school"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>School *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your school name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="courseYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course/Year Level *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Bachelor of Science in Marine Engineering - 3rd Year" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="contactNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="+63 912 345 6789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your.email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* B. Performance Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  B. Performance Details
                </CardTitle>
                <CardDescription>
                  Tell us about your planned performance for the talent quest.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="performanceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type of Performance *</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value)
                          setShowOtherPerformance(value === "Other")
                        }} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select performance type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {performanceTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {showOtherPerformance && (
                  <FormField
                    control={form.control}
                    name="otherPerformanceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Please specify other performance type</FormLabel>
                        <FormControl>
                          <Input placeholder="Describe your performance type" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="performanceTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title of Piece/Performance *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the title of your performance" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (max 5 mins) *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 3 minutes 30 seconds" {...field} />
                        </FormControl>
                        <FormDescription>
                          Maximum duration allowed is 5 minutes
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="numberOfPerformers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Performers *</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="1" {...field} />
                        </FormControl>
                        <FormDescription>
                          Include yourself in the count
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="groupMembers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Names of Group Members (if applicable)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="List the full names of all group members, one per line"
                          className="min-h-20"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Only fill this if you're performing as a group
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* C. Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  C. Requirements
                </CardTitle>
                <CardDescription>
                  Please ensure you have the following documents ready for submission.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm mt-0.5">1</div>
                    <div>
                      <p className="font-medium text-gray-900">Certification from school confirming enrollment</p>
                      <p className="text-sm text-gray-600">Official document from your institution</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm mt-0.5">2</div>
                    <div>
                      <p className="font-medium text-gray-900">Copy of valid School ID</p>
                      <p className="text-sm text-gray-600">Clear photocopy of your current school identification</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* D. Health & Fitness Declaration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  D. Health & Fitness Declaration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-gray-700 leading-relaxed">
                      I certify that I am physically fit and in good health to participate in the Maritime Talent Quest 2025.
                      I declare that there are no medical conditions or concerns that may hinder my ability to perform safely.
                    </p>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="healthDeclaration"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-medium">
                            I confirm the health and fitness declaration above *
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormMessage />
                </div>
              </CardContent>
            </Card>

            {/* E. Consent & Agreement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  E. Consent & Agreement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-gray-700 leading-relaxed">
                      I hereby declare that the information provided above is true and correct. I agree to abide by the rules and
                      regulations of the Maritime Talent Quest 2025. I consent to the use of my name, school, photographs, and
                      videos for event documentation and publicity purposes.
                    </p>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="consentAgreement"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-medium">
                            I agree to the consent and agreement terms above *
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormMessage />
                </div>
              </CardContent>
            </Card>

            {/* F. Additional Information (Optional) */}
            <Card>
              <CardHeader>
                <CardTitle>F. Additional Information (Optional)</CardTitle>
                <CardDescription>
                  Additional fields for parent/guardian signature (if under 18) and school endorsement.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="parentGuardianSignature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent/Guardian Name (if under 18 years old)</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name of parent or guardian" {...field} />
                      </FormControl>
                      <FormDescription>
                        Required only if you are under 18 years of age
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="schoolOfficialName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>School Official Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Name of endorsing school official" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="schoolOfficialPosition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>School Official Position</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Dean, Registrar, Student Affairs Officer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <Button 
                type="submit" 
                size="lg"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold"
              >
                {isSubmitting ? "Submitting Application..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </Form>

        {/* Footer */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-600">
          <p>
            <strong>Important:</strong> Please ensure all required fields are completed accurately. 
            Incomplete applications may not be processed.
          </p>
          <p className="mt-2">
            For questions or assistance, please contact the organizers at Manila EGC Marine Supply Inc.
          </p>
        </div>
      </div>
    </div>
  )
}