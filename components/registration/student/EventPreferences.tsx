"use client"

import { useState, useRef } from "react"
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
  const [isDragging, setIsDragging] = useState({ cert: false, id: false })
  
  const schoolCertRef = useRef<HTMLInputElement>(null)
  const schoolIdRef = useRef<HTMLInputElement>(null)

  // Field name prefix for multi-performer support
  const fieldPrefix = performerIndex !== undefined ? `performers.${performerIndex}` : ""
  const getFieldName = (field: string) => performerIndex !== undefined ? `${fieldPrefix}.${field}` : field

  const handleFileUpload = (file: File, type: 'schoolCertification' | 'schoolIdCopy') => {
    // Validate file type and size
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
    const maxSize = 10 * 1024 * 1024 // 10MB
    
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload only PDF, JPG, or PNG files.')
      return
    }
    
    if (file.size > maxSize) {
      alert('File size must be less than 10MB.')
      return
    }

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
      if (schoolCertRef.current) schoolCertRef.current.value = ''
    } else {
      setSchoolIdFile(null)
      form.setValue(getFieldName('schoolIdCopy'), null)
      if (schoolIdRef.current) schoolIdRef.current.value = ''
    }
  }

  const handleDragOver = (e: React.DragEvent, type: 'cert' | 'id') => {
    e.preventDefault()
    setIsDragging(prev => ({ ...prev, [type]: true }))
  }

  const handleDragLeave = (e: React.DragEvent, type: 'cert' | 'id') => {
    e.preventDefault()
    setIsDragging(prev => ({ ...prev, [type]: false }))
  }

  const handleDrop = (e: React.DragEvent, type: 'schoolCertification' | 'schoolIdCopy') => {
    e.preventDefault()
    const dragType = type === 'schoolCertification' ? 'cert' : 'id'
    setIsDragging(prev => ({ ...prev, [dragType]: false }))
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0], type)
    }
  }

  const triggerFileInput = (type: 'schoolCertification' | 'schoolIdCopy') => {
    if (type === 'schoolCertification' && schoolCertRef.current) {
      schoolCertRef.current.click()
    } else if (type === 'schoolIdCopy' && schoolIdRef.current) {
      schoolIdRef.current.click()
    }
  }

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">C. Requirements</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Please attach the following required documents upon submission:</p>
      </div>

      {/* School Certification */}
      <div className="space-y-4">
        <div>
          <FormLabel className="text-base font-medium">1. Certification from school confirming enrollment *</FormLabel>
          <p className="text-sm text-gray-500 mb-3">Upload an official certification from your school confirming your current enrollment status.</p>
          
          {!schoolCertFile ? (
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                isDragging.cert 
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              onClick={() => triggerFileInput('schoolCertification')}
              onDragOver={(e) => handleDragOver(e, 'cert')}
              onDragLeave={(e) => handleDragLeave(e, 'cert')}
              onDrop={(e) => handleDrop(e, 'schoolCertification')}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {isDragging.cert ? 'Drop file here' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">PDF, JPG, PNG up to 10MB</p>
              </div>
              <Input
                ref={schoolCertRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file, 'schoolCertification')
                }}
                className="hidden"
              />
            </div>
          ) : (
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{schoolCertFile.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{(schoolCertFile.size / 1024 / 1024).toFixed(2)} MB</p>
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
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                isDragging.id 
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              onClick={() => triggerFileInput('schoolIdCopy')}
              onDragOver={(e) => handleDragOver(e, 'id')}
              onDragLeave={(e) => handleDragLeave(e, 'id')}
              onDrop={(e) => handleDrop(e, 'schoolIdCopy')}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {isDragging.id ? 'Drop file here' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">PDF, JPG, PNG up to 10MB</p>
              </div>
              <Input
                ref={schoolIdRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file, 'schoolIdCopy')
                }}
                className="hidden"
              />
            </div>
          ) : (
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{schoolIdFile.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{(schoolIdFile.size / 1024 / 1024).toFixed(2)} MB</p>
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

      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
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