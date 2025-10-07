"use client"

import { useState } from "react"
import { UseFormReturn } from "react-hook-form"
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
import { FileText, School, CheckCircle, PenTool, X } from "lucide-react"
import ESignModal from "@/components/reusable/esign-modal"

interface AdditionalInformationProps {
  form: UseFormReturn<any>
  performerIndex?: number
  needsParentSignature?: boolean
}

export function AdditionalInformation({ form, performerIndex, needsParentSignature = false }: AdditionalInformationProps) {
  const [studentSignatureModal, setStudentSignatureModal] = useState(false)
  const [parentSignatureModal, setParentSignatureModal] = useState(false)
  
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
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                By checking the boxes below, I hereby declare that:
              </p>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2 ml-4">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  The information provided above is true and correct.
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  I agree to abide by the rules and regulations of the Maritime Talent Quest 2025.
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  I consent to the use of my name, school, photographs, and videos for event documentation and publicity purposes.
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
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
                    <FormLabel className="text-sm font-medium text-gray-900">
                      I declare that the information provided above is true and correct *
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
                    <FormLabel className="text-sm font-medium text-gray-900">
                      I agree to abide by the rules and regulations of the Maritime Talent Quest 2025 *
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
                    <FormLabel className="text-sm font-medium text-gray-900">
                      I consent to the use of my name, school, photographs, and videos for event documentation and publicity purposes *
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
                    <FormControl>
                      <Input 
                        type="date"
                        className="text-sm"
                        {...field} 
                      />
                    </FormControl>
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

      {/* School Endorsement - Only show if this is not a multi-performer context or performerIndex is undefined */}
      {performerIndex === undefined && (
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
                <strong>For School Officials:</strong> We hereby certify that the above student(s) is/are currently enrolled in our institution and is/are endorsed to participate in the Maritime Talent Quest 2025.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="schoolOfficialName"
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
                  name="schoolOfficialPosition"
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

            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <FileText className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-purple-900">School Endorsement Requirements</h4>
                  <div className="text-sm text-purple-800 mt-1 space-y-1">
                    <p>• Official signature and school seal required</p>
                    <p>• Date of endorsement must be provided</p>
                    <p>• School official must be authorized to endorse students</p>
                    <p className="text-xs text-purple-600 mt-2">
                      Physical signatures and school seal can be submitted separately or during event registration.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
    </div>
  )
}