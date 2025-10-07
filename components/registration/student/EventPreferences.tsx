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
import { Upload, FileText, X } from "lucide-react"

interface EventPreferencesProps {
  form: UseFormReturn<any>
  performerIndex?: number
}

export function EventPreferences({ form, performerIndex }: EventPreferencesProps) {
  const [schoolCertFile, setSchoolCertFile] = useState<File | null>(null)
  const [schoolIdFile, setSchoolIdFile] = useState<File | null>(null)

  // Field name prefix for multi-performer support
  const fieldPrefix = performerIndex !== undefined ? `performers.${performerIndex}` : ""
  const getFieldName = (field: string) => performerIndex !== undefined ? `${fieldPrefix}.${field}` : field

  const handleFileUpload = (file: File, type: 'schoolCertification' | 'schoolIdCopy') => {
    if (type === 'schoolCertification') {
      setSchoolCertFile(file)
      form.setValue(getFieldName('schoolCertification'), file)
    } else {
      setSchoolIdFile(file)
      form.setValue(getFieldName('schoolIdCopy'), file)
    }
  }

  const removeFile = (type: 'schoolCertification' | 'schoolIdCopy') => {
    if (type === 'schoolCertification') {
      setSchoolCertFile(null)
      form.setValue(getFieldName('schoolCertification'), null)
    } else {
      setSchoolIdFile(null)
      form.setValue(getFieldName('schoolIdCopy'), null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">C. Requirements</h3>
        <p className="text-sm text-gray-600">Please attach the following required documents upon submission:</p>
      </div>

      {/* School Certification */}
      <div className="space-y-4">
        <div>
          <FormLabel className="text-base font-medium">1. Certification from school confirming enrollment *</FormLabel>
          <p className="text-sm text-gray-500 mb-3">Upload an official certification from your school confirming your current enrollment status.</p>
          
          {!schoolCertFile ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">Upload School Certification</p>
                <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
              </div>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file, 'schoolCertification')
                }}
                className="mt-3"
              />
            </div>
          ) : (
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{schoolCertFile.name}</p>
                    <p className="text-xs text-gray-500">{(schoolCertFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeFile('schoolCertification')}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* School ID Copy */}
        <div>
          <FormLabel className="text-base font-medium">2. Copy of valid School ID *</FormLabel>
          <p className="text-sm text-gray-500 mb-3">Upload a clear copy of your current and valid school identification card.</p>
          
          {!schoolIdFile ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">Upload School ID Copy</p>
                <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
              </div>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file, 'schoolIdCopy')
                }}
                className="mt-3"
              />
            </div>
          ) : (
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{schoolIdFile.name}</p>
                    <p className="text-xs text-gray-500">{(schoolIdFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeFile('schoolIdCopy')}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900">Important Note</h4>
            <p className="text-sm text-blue-700 mt-1">
              Both documents are required for your application to be processed. Please ensure all documents are clear and legible.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}