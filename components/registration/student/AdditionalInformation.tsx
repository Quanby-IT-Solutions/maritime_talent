"use client"

import { useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { format } from "date-fns"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { FileText, School, CheckCircle, PenTool, X, Trophy, CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import ESignModal from "@/components/reusable/esign-modal"
import { TermsModal } from "@/components/registration/student/terms-modal"
import { MechanicsModal } from "@/components/registration/student/mechanics-modal"

interface AdditionalInformationProps {
  form: UseFormReturn<any>
  performerIndex?: number
  needsParentSignature?: boolean
}

export function AdditionalInformation({ form, performerIndex, needsParentSignature = false }: AdditionalInformationProps) {
  const [studentSignatureModal, setStudentSignatureModal] = useState(false)
  const [parentSignatureModal, setParentSignatureModal] = useState(false)
  const [termsModal, setTermsModal] = useState(false)
  const [mechanicsModal, setMechanicsModal] = useState(false)
  
  // Field name prefix for multi-performer support
  const fieldPrefix = performerIndex !== undefined ? `performers.${performerIndex}` : ""
  const getFieldName = (field: string) => performerIndex !== undefined ? `${fieldPrefix}.${field}` : field
  
  // Get current signature values
  const studentSignature = form.watch(getFieldName("studentSignature"))
  const parentGuardianSignature = form.watch(getFieldName("parentGuardianSignature"))
  return (
    <div className="space-y-8">
      {/* Section E: Consent & Agreement */}
      <Card className="border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
            <CheckCircle className="h-5 w-5" />
            E. Consent & Agreement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-950/30 dark:border-blue-800">
            <div className="space-y-3">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                Maritime Talent Quest 2025 - Registration Agreement
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                By checking the box below, you acknowledge that you have read and agree to all terms and conditions, including:
              </p>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 ml-4">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Declaration of accurate and truthful information
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Agreement to abide by event rules and regulations
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Consent for media usage and event documentation
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Health and safety declarations
                </li>
              </ul>
            </div>
          </div>

          {/* Buttons outside the blue highlight */}
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setTermsModal(true)}
              className="text-gray-700 border-gray-300 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800"
            >
              <FileText className="h-4 w-4 mr-2" />
              View Full Terms & Conditions
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMechanicsModal(true)}
              className="text-gray-700 border-gray-300 hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800"
            >
              <Trophy className="h-4 w-4 mr-2" />
              View Mechanics
            </Button>
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name={getFieldName("termsAgreement")}
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                      I have read and agree to all terms and conditions outlined above for the Maritime Talent Quest 2025 *
                    </FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={getFieldName("informationConsent")}
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                      I certify that all information provided is accurate and truthful *
                    </FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={getFieldName("rulesAgreement")}
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                      I agree to abide by all event rules and regulations *
                    </FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={getFieldName("publicityConsent")}
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-medium text-gray-900 dark:text-white">
                      I consent to the use of my image, video, and performance for event documentation and publicity *
                    </FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Signature Section */}
      <Card className="border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
            <CheckCircle className="h-5 w-5" />
            Signatures
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Student Signature */}
              <FormField
                control={form.control}
                name={getFieldName("studentSignature")}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Student Signature *</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        {studentSignature ? (
                          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <PenTool className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-gray-900 dark:text-white">Signature captured</span>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setStudentSignatureModal(true)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    form.setValue(getFieldName("studentSignature"), "")
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            {studentSignature && (
                              <div className="mt-2">
                                <img 
                                  src={studentSignature} 
                                  alt="Student signature" 
                                  className="max-h-16 border border-gray-200 dark:border-gray-600 rounded"
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full h-12 border-dashed border-2 hover:border-gray-400"
                            onClick={() => setStudentSignatureModal(true)}
                          >
                            <PenTool className="h-4 w-4 mr-2" />
                            Click to Sign
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={getFieldName("signatureDate")}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => {
                            field.onChange(date ? format(date, "yyyy-MM-dd") : "")
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {needsParentSignature && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Parent/Guardian Signature Required (Participant under 18)
                    </p>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name={getFieldName("parentGuardianSignature")}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Parent/Guardian Signature *</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            {parentGuardianSignature ? (
                              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <PenTool className="h-4 w-4 text-green-600" />
                                    <span className="text-sm text-gray-900 dark:text-white">Parent/Guardian signature captured</span>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setParentSignatureModal(true)}
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        form.setValue(getFieldName("parentGuardianSignature"), "")
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                {parentGuardianSignature && (
                                  <div className="mt-2">
                                    <img 
                                      src={parentGuardianSignature} 
                                      alt="Parent/Guardian signature" 
                                      className="max-h-16 border border-gray-200 dark:border-gray-600 rounded"
                                    />
                                  </div>
                                )}
                              </div>
                            ) : (
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full h-12 border-dashed border-2 hover:border-gray-400"
                                onClick={() => setParentSignatureModal(true)}
                              >
                                <PenTool className="h-4 w-4 mr-2" />
                                Parent/Guardian Click to Sign
                              </Button>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* School Endorsement - Show for each performer */}
      <Card className="border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
            <School className="h-5 w-5" />
            F. For School Endorsement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              <strong>For School Officials:</strong> We hereby certify that the above student is currently enrolled in our institution and is endorsed to participate in the Maritime Talent Quest 2025.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={getFieldName("schoolOfficialName")}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Name of School Official</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter name of school official"
                        className="text-sm"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={getFieldName("schoolOfficialPosition")}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Position</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter position/title"
                        className="text-sm"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-950/30 dark:border-blue-800">
            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200">School Endorsement Requirements</h4>
                <div className="text-sm text-blue-800 dark:text-blue-300 mt-1 space-y-1">
                  <p>• Official signature and school seal required</p>
                  <p>• Date of endorsement must be provided</p>
                  <p>• School official must be authorized to endorse students</p>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mt-2">
                    Physical signatures and school seal can be submitted separately or during event registration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Final Submission Note</h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
              Upon submission of this digital form, you will receive further instructions for completing the physical signature requirements and document submission for the Maritime Talent Quest 2025.
            </p>
          </div>
        </div>
      </div>

      {/* Student Signature Modal */}
      <ESignModal
        open={studentSignatureModal}
        onOpenChange={setStudentSignatureModal}
        onSignatureSave={(signature) => {
          form.setValue(getFieldName("studentSignature"), signature)
          setStudentSignatureModal(false)
        }}
        title="Student Electronic Signature"
        description="Please draw your signature in the canvas below. This will serve as your electronic signature for the Maritime Talent Quest 2025 registration."
      />

      {/* Parent/Guardian Signature Modal */}
      <ESignModal
        open={parentSignatureModal}
        onOpenChange={setParentSignatureModal}
        onSignatureSave={(signature) => {
          form.setValue(getFieldName("parentGuardianSignature"), signature)
          setParentSignatureModal(false)
        }}
        title="Parent/Guardian Electronic Signature"
        description="Parent/Guardian: Please draw your signature in the canvas below. This signature confirms your consent for your minor child to participate in the Maritime Talent Quest 2025."
      />

      {/* Terms & Conditions Modal */}
      <TermsModal
        open={termsModal}
        onOpenChange={setTermsModal}
      />

      {/* Mechanics Modal */}
      <MechanicsModal
        open={mechanicsModal}
        onOpenChange={setMechanicsModal}
      />
    </div>
  )
}