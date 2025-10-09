"use client";

import React, { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Eye, Edit, MoreHorizontal, Loader2, Save, X, User, FileText, Heart, Shield, Award, Music, Trash2, Upload, Pen } from "lucide-react";
import ESignModal from "@/components/reusable/esign-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SelectTrigger, SelectValue, SelectContent, SelectItem, Select } from "@radix-ui/react-select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Zod schema for single performance validation
export const SingleSchema = z.object({
  id: z.string(), // Required for DataTable (UUID)
  single_id: z.string(), // UUID
  performance_title: z.string().min(1, "Performance title is required"),
  student_id: z.string().nullable(), // UUID
  created_at: z.string().nullable(),
  student_name: z.string().nullable(),
  student_school: z.string().nullable(),
  performance_type: z.enum(['Singing', 'Dancing', 'Musical Instrument', 'Spoken Word/Poetry', 'Theatrical/Drama', 'Other']).nullable(),
  duration: z.string().nullable(),
});

// Type for single performance data
export type SingleData = z.infer<typeof SingleSchema>;

// Validation function
export const validateSingleData = (data: unknown): SingleData => {
  return SingleSchema.parse(data);
};

// Safe validation function that returns errors
export const safeParseSingleData = (data: unknown) => {
  return SingleSchema.safeParse(data);
};

// Interface for full performance data
interface SinglePerformanceData {
  single: {
    single_id: string; // UUID
    student_id: string; // UUID
    performance_title: string;
    performance_type: string;
    created_at: string;
  };
  student: {
    student_id: string; // UUID
    full_name: string;
    age: number;
    gender: string;
    school: string;
    course_year: string;
    contact_number: string;
    email: string;
  };
  performance: {
    performance_id: string; // UUID
    performance_type: string;
    title: string;
    duration: string;
    num_performers: number;
  } | null;
  requirements: {
    requirement_id: string; // UUID
    certification_url: string;
    school_id_url: string;
    uploaded_at: string;
  } | null;
  health: {
    declaration_id: string; // UUID
    is_physically_fit: boolean;
    student_signature_url: string;
    parent_guardian_signature_url: string;
    declaration_date: string;
  } | null;
  consents: {
    consent_id: string; // UUID
    info_correct: boolean;
    agree_to_rules: boolean;
    consent_to_publicity: boolean;
    student_signature_url: string;
    parent_guardian_signature_url: string;
    consent_date: string;
  } | null;
  endorsement: {
    endorsement_id: string; // UUID
    school_official_name: string;
    position: string;
    signature_url: string;
    endorsement_date: string;
  } | null;
}

// Single Details Component - Modal dialogs
const SingleDetailsSheet = ({ single, onUpdate }: { single: SingleData; onUpdate?: () => void }) => {
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [data, setData] = useState<SinglePerformanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for editing
  const [formData, setFormData] = useState({
    performance_title: "",
    performance_type: "",
    full_name: "",
    age: 0,
    gender: "",
    school: "",
    course_year: "",
    contact_number: "",
    email: "",
    duration: "",
  });

  // File upload states
  const [files, setFiles] = useState({
    certification: null as File | null,
    school_id: null as File | null,
    health_student_signature: null as File | null,
    health_parent_signature: null as File | null,
    consent_student_signature: null as File | null,
    consent_parent_signature: null as File | null,
    endorsement_signature: null as File | null,
  });

  // Drawn signature states
  const [drawnSignatures, setDrawnSignatures] = useState({
    health_student: null as string | null,
    health_parent: null as string | null,
    consent_student: null as string | null,
    consent_parent: null as string | null,
    endorsement: null as string | null,
  });

  // Signature modal states
  const [signatureModals, setSignatureModals] = useState({
    health_student: false,
    health_parent: false,
    consent_student: false,
    consent_parent: false,
    endorsement: false,
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/single_performance/${single.single_id}`);
      const result = await response.json();

      if (!result.success) {
        setError(result.error || "Failed to fetch data");
        return;
      }

      setData(result.data);

      // Populate form data for edit mode
      setFormData({
        performance_title: result.data.single.performance_title || "",
        performance_type: result.data.single.performance_type || "",
        full_name: result.data.student.full_name || "",
        age: result.data.student.age || 0,
        gender: result.data.student.gender || "",
        school: result.data.student.school || "",
        course_year: result.data.student.course_year || "",
        contact_number: result.data.student.contact_number || "",
        email: result.data.student.email || "",
        duration: result.data.performance?.duration || "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Import Supabase client
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      // Helper to convert dataURL to blob
      const dataURLtoBlob = (dataURL: string): Blob => {
        const arr = dataURL.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
      };

      // Helper to upload file signature
      const uploadFileSignature = async (file: File, path: string): Promise<string | null> => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${data?.student.student_id}-${Date.now()}.${fileExt}`;
        const filePath = `${path}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('attachment')
          .upload(filePath, file, { upsert: true });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          return null;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('attachment')
          .getPublicUrl(filePath);

        return publicUrl;
      };

      // Helper to upload drawn signature
      const uploadDrawnSignature = async (dataURL: string, path: string): Promise<string | null> => {
        const blob = dataURLtoBlob(dataURL);
        const fileName = `${data?.student.student_id}-${Date.now()}.png`;
        const filePath = `${path}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('attachment')
          .upload(filePath, blob, {
            upsert: true,
            contentType: 'image/png'
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          return null;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('attachment')
          .getPublicUrl(filePath);

        return publicUrl;
      };

      // Upload signatures (drawn takes priority)
      let healthStudentUrl = data?.health?.student_signature_url || null;
      let healthParentUrl = data?.health?.parent_guardian_signature_url || null;
      let consentStudentUrl = data?.consents?.student_signature_url || null;
      let consentParentUrl = data?.consents?.parent_guardian_signature_url || null;
      let endorsementUrl = data?.endorsement?.signature_url || null;

      // Health student signature
      if (drawnSignatures.health_student) {
        const url = await uploadDrawnSignature(drawnSignatures.health_student, 'health-signatures/student');
        if (url) healthStudentUrl = url;
      } else if (files.health_student_signature) {
        const url = await uploadFileSignature(files.health_student_signature, 'health-signatures/student');
        if (url) healthStudentUrl = url;
      }

      // Health parent signature
      if (drawnSignatures.health_parent) {
        const url = await uploadDrawnSignature(drawnSignatures.health_parent, 'health-signatures/parent');
        if (url) healthParentUrl = url;
      } else if (files.health_parent_signature) {
        const url = await uploadFileSignature(files.health_parent_signature, 'health-signatures/parent');
        if (url) healthParentUrl = url;
      }

      // Consent student signature
      if (drawnSignatures.consent_student) {
        const url = await uploadDrawnSignature(drawnSignatures.consent_student, 'consents-signatures/student');
        if (url) consentStudentUrl = url;
      } else if (files.consent_student_signature) {
        const url = await uploadFileSignature(files.consent_student_signature, 'consents-signatures/student');
        if (url) consentStudentUrl = url;
      }

      // Consent parent signature
      if (drawnSignatures.consent_parent) {
        const url = await uploadDrawnSignature(drawnSignatures.consent_parent, 'consents-signatures/parent');
        if (url) consentParentUrl = url;
      } else if (files.consent_parent_signature) {
        const url = await uploadFileSignature(files.consent_parent_signature, 'consents-signatures/parent');
        if (url) consentParentUrl = url;
      }

      // Endorsement signature
      if (drawnSignatures.endorsement) {
        const url = await uploadDrawnSignature(drawnSignatures.endorsement, 'endorsement-signatures');
        if (url) endorsementUrl = url;
      } else if (files.endorsement_signature) {
        const url = await uploadFileSignature(files.endorsement_signature, 'endorsement-signatures');
        if (url) endorsementUrl = url;
      }

      // Update signatures in database
      if (data?.health && (drawnSignatures.health_student || files.health_student_signature || drawnSignatures.health_parent || files.health_parent_signature)) {
        await supabase
          .from('health_fitness')
          .update({
            student_signature_url: healthStudentUrl,
            parent_guardian_signature_url: healthParentUrl,
          })
          .eq('student_id', data.student.student_id);
      }

      if (data?.consents && (drawnSignatures.consent_student || files.consent_student_signature || drawnSignatures.consent_parent || files.consent_parent_signature)) {
        await supabase
          .from('consents')
          .update({
            student_signature_url: consentStudentUrl,
            parent_guardian_signature_url: consentParentUrl,
          })
          .eq('student_id', data.student.student_id);
      }

      if (data?.endorsement && (drawnSignatures.endorsement || files.endorsement_signature)) {
        await supabase
          .from('endorsements')
          .update({
            signature_url: endorsementUrl,
          })
          .eq('student_id', data.student.student_id);
      }

      // Update basic info via API
      const response = await fetch(`/api/single_performance/${single.single_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          single: {
            performance_title: formData.performance_title,
            performance_type: formData.performance_type,
          },
          student: {
            full_name: formData.full_name,
            age: formData.age,
            gender: formData.gender,
            school: formData.school,
            course_year: formData.course_year,
            contact_number: formData.contact_number,
            email: formData.email,
          },
          performance: {
            duration: formData.duration,
            performance_type: formData.performance_type,
          },
        }),
      });

      const result = await response.json();

      if (!result.success) {
        alert(`Error: ${result.error || "Failed to update performance"}`);
        return;
      }

      // Reset states
      setFiles({
        certification: null,
        school_id: null,
        health_student_signature: null,
        health_parent_signature: null,
        consent_student_signature: null,
        consent_parent_signature: null,
        endorsement_signature: null,
      });
      setDrawnSignatures({
        health_student: null,
        health_parent: null,
        consent_student: null,
        consent_parent: null,
        endorsement: null,
      });

      alert("Performance updated successfully!");
      setEditOpen(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : "An error occurred"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${single.performance_title}"? This will delete all related data and files permanently.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/single_performance/${single.single_id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!result.success) {
        alert(`Error: ${result.error || "Failed to delete performance"}`);
        return;
      }

      alert("Performance deleted successfully!");
      if (onUpdate) onUpdate();
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : "An error occurred"}`);
    }
  };

  return (
    <>
      <DropdownMenuItem
        className="flex items-center gap-2"
        onSelect={(e) => {
          e.preventDefault();
          setViewOpen(true);
          fetchData();
        }}
      >
        <Eye className="h-4 w-4" />
        View details
      </DropdownMenuItem>

      <DropdownMenuItem
        className="flex items-center gap-2"
        onSelect={(e) => {
          e.preventDefault();
          setEditOpen(true);
          fetchData();
        }}
      >
        <Edit className="h-4 w-4" />
        Edit Information
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem
        className="flex items-center gap-2 text-red-600"
        onSelect={(e) => {
          e.preventDefault();
          handleDelete();
        }}
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </DropdownMenuItem>

      {/* View Modal */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="min-w-[55%] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {data?.single.performance_title || "Performance Details"}
            </DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error || !data ? (
            <Alert variant="destructive">
              <AlertDescription>{error || "No data found"}</AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-6 mt-4">
              {/* Performance Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    Performance Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Performance Title</p>
                      <p className="text-base font-semibold">{data.single.performance_title}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Performance Type</p>
                      <Badge variant="secondary">{data.single.performance_type || "Not specified"}</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Created Date</p>
                      <p className="text-base">
                        {new Date(data.single.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    {data.performance && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Duration</p>
                        <p className="text-base">{data.performance.duration || "Not specified"}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Student Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Student Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Student ID</p>
                      <p className="text-base font-mono">#{data.student.student_id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                      <p className="text-base font-semibold">{data.student.full_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Age</p>
                      <p className="text-base">{data.student.age}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Gender</p>
                      <Badge variant="outline">{data.student.gender}</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p className="text-base break-all">{data.student.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Contact Number</p>
                      <p className="text-base font-mono">{data.student.contact_number}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">School</p>
                      <p className="text-base">{data.student.school}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Course/Year</p>
                      <p className="text-base">{data.student.course_year}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Requirements */}
              {data.requirements && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Certification</p>
                        {data.requirements.certification_url ? (
                          <div className="space-y-2">
                            <img
                              src={data.requirements.certification_url}
                              alt="Certification"
                              className="w-full h-48 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80"
                              onClick={() => window.open(data.requirements?.certification_url, '_blank')}
                            />
                            <a href={data.requirements.certification_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                              Open in new tab
                            </a>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Not uploaded</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">School ID</p>
                        {data.requirements.school_id_url ? (
                          <div className="space-y-2">
                            <img
                              src={data.requirements.school_id_url}
                              alt="School ID"
                              className="w-full h-48 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80"
                              onClick={() => window.open(data.requirements?.school_id_url, '_blank')}
                            />
                            <a href={data.requirements.school_id_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                              Open in new tab
                            </a>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Not uploaded</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Health & Fitness */}
              {data.health && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Health & Fitness Declaration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Physically Fit</p>
                        <Badge variant={data.health.is_physically_fit ? "default" : "destructive"}>
                          {data.health.is_physically_fit ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Student Signature</p>
                        {data.health.student_signature_url ? (
                          <div className="space-y-2">
                            <img
                              src={data.health.student_signature_url}
                              alt="Student Signature"
                              className="w-full h-32 object-contain bg-white rounded-lg border border-gray-200 cursor-pointer hover:opacity-80"
                              onClick={() => window.open(data.health?.student_signature_url, '_blank')}
                            />
                            <a href={data.health.student_signature_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                              View full size
                            </a>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Not provided</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Parent/Guardian Signature</p>
                        {data.health.parent_guardian_signature_url ? (
                          <div className="space-y-2">
                            <img
                              src={data.health.parent_guardian_signature_url}
                              alt="Parent/Guardian Signature"
                              className="w-full h-32 object-contain bg-white rounded-lg border border-gray-200 cursor-pointer hover:opacity-80"
                              onClick={() => window.open(data.health?.parent_guardian_signature_url, '_blank')}
                            />
                            <a href={data.health.parent_guardian_signature_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                              View full size
                            </a>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Not provided</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Consents */}
              {data.consents && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Consents & Agreements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Information Correct</p>
                        <Badge variant={data.consents.info_correct ? "default" : "destructive"}>
                          {data.consents.info_correct ? "Confirmed" : "Not Confirmed"}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Agree to Rules</p>
                        <Badge variant={data.consents.agree_to_rules ? "default" : "destructive"}>
                          {data.consents.agree_to_rules ? "Agreed" : "Not Agreed"}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Consent to Publicity</p>
                        <Badge variant={data.consents.consent_to_publicity ? "default" : "destructive"}>
                          {data.consents.consent_to_publicity ? "Consented" : "Not Consented"}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Student Signature</p>
                        {data.consents.student_signature_url ? (
                          <div className="space-y-2">
                            <img
                              src={data.consents.student_signature_url}
                              alt="Student Signature"
                              className="w-full h-32 object-contain bg-white rounded-lg border border-gray-200 cursor-pointer hover:opacity-80"
                              onClick={() => window.open(data.consents?.student_signature_url, '_blank')}
                            />
                            <a href={data.consents.student_signature_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                              View full size
                            </a>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Not provided</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Parent/Guardian Signature</p>
                        {data.consents.parent_guardian_signature_url ? (
                          <div className="space-y-2">
                            <img
                              src={data.consents.parent_guardian_signature_url}
                              alt="Parent/Guardian Signature"
                              className="w-full h-32 object-contain bg-white rounded-lg border border-gray-200 cursor-pointer hover:opacity-80"
                              onClick={() => window.open(data.consents?.parent_guardian_signature_url, '_blank')}
                            />
                            <a href={data.consents.parent_guardian_signature_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                              View full size
                            </a>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Not provided</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Endorsement */}
              {data.endorsement && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      School Endorsement
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">School Official Name</p>
                        <p className="text-base font-semibold">{data.endorsement.school_official_name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Position</p>
                        <p className="text-base">{data.endorsement.position}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-muted-foreground mb-2">Official Signature</p>
                        {data.endorsement.signature_url ? (
                          <div className="space-y-2">
                            <img
                              src={data.endorsement.signature_url}
                              alt="Official Signature"
                              className="w-full max-w-md h-32 object-contain bg-white rounded-lg border border-gray-200 cursor-pointer hover:opacity-80"
                              onClick={() => window.open(data.endorsement?.signature_url, '_blank')}
                            />
                            <a href={data.endorsement.signature_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                              View full size
                            </a>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Not provided</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="min-w-[55%] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold">Edit Performance</DialogTitle>
              <div className="flex gap-2">
                <Button onClick={() => setEditOpen(false)} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error || !data ? (
            <Alert variant="destructive">
              <AlertDescription>{error || "No data found"}</AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-6 mt-4">
              {/* Performance Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5" />
                    Performance Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="performance_title">Performance Title</Label>
                      <Input
                        id="performance_title"
                        value={formData.performance_title}
                        onChange={(e) => setFormData({ ...formData, performance_title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="performance_type">Performance Type</Label>
                      <Select
                        value={formData.performance_type}
                        onValueChange={(value) => setFormData({ ...formData, performance_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Singing">Singing</SelectItem>
                          <SelectItem value="Dancing">Dancing</SelectItem>
                          <SelectItem value="Musical Instrument">Musical Instrument</SelectItem>
                          <SelectItem value="Spoken Word/Poetry">Spoken Word/Poetry</SelectItem>
                          <SelectItem value="Theatrical/Drama">Theatrical/Drama</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration</Label>
                      <Input
                        id="duration"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        placeholder="e.g., 3-5 minutes"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Student Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Student Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => setFormData({ ...formData, gender: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact_number">Contact Number</Label>
                      <Input
                        id="contact_number"
                        value={formData.contact_number}
                        onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="school">School</Label>
                      <Input
                        id="school"
                        value={formData.school}
                        onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="course_year">Course/Year</Label>
                      <Input
                        id="course_year"
                        value={formData.course_year}
                        onChange={(e) => setFormData({ ...formData, course_year: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Requirements (Editable) */}
              {data.requirements && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="certification">Certification</Label>
                        {data.requirements.certification_url && !files.certification && (
                          <div className="space-y-2 mb-2">
                            <img
                              src={data.requirements.certification_url}
                              alt="Current Certification"
                              className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            />
                            <p className="text-xs text-muted-foreground">Current file</p>
                          </div>
                        )}
                        <Input
                          id="certification"
                          type="file"
                          accept="image/*"
                          onChange={(e) => setFiles({ ...files, certification: e.target.files?.[0] || null })}
                        />
                        {files.certification && (
                          <p className="text-xs text-green-600">New file selected: {files.certification.name}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="school_id">School ID</Label>
                        {data.requirements.school_id_url && !files.school_id && (
                          <div className="space-y-2 mb-2">
                            <img
                              src={data.requirements.school_id_url}
                              alt="Current School ID"
                              className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            />
                            <p className="text-xs text-muted-foreground">Current file</p>
                          </div>
                        )}
                        <Input
                          id="school_id"
                          type="file"
                          accept="image/*"
                          onChange={(e) => setFiles({ ...files, school_id: e.target.files?.[0] || null })}
                        />
                        {files.school_id && (
                          <p className="text-xs text-green-600">New file selected: {files.school_id.name}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Health & Fitness (Editable) */}
              {data.health && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Health & Fitness Declaration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Physically Fit</p>
                        <Badge variant={data.health.is_physically_fit ? "default" : "destructive"}>
                          {data.health.is_physically_fit ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Student Signature</p>
                        {drawnSignatures.health_student || files.health_student_signature ? (
                          <img
                            src={drawnSignatures.health_student || (files.health_student_signature ? URL.createObjectURL(files.health_student_signature) : '')}
                            alt="Student Signature"
                            className="w-full h-20 object-contain bg-white rounded-lg border border-gray-200 mb-2"
                          />
                        ) : data.health.student_signature_url ? (
                          <img
                            src={data.health.student_signature_url}
                            alt="Student Signature"
                            className="w-full h-20 object-contain bg-white rounded-lg border border-gray-200 mb-2"
                          />
                        ) : (
                          <div className="mb-2 h-20 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-sm text-muted-foreground">No signature</p>
                          </div>
                        )}
                        {drawnSignatures.health_student && (
                          <Badge variant="default" className="mb-2">✍️ Signature drawn</Badge>
                        )}
                        {files.health_student_signature && (
                          <Badge variant="default" className="mb-2 bg-green-600">📁 File uploaded</Badge>
                        )}
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setFiles({ ...files, health_student_signature: e.target.files?.[0] || null })}
                              className="text-sm"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              <Upload className="h-3 w-3 inline mr-1" />Upload file
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setSignatureModals({ ...signatureModals, health_student: true })}
                            className="whitespace-nowrap"
                          >
                            <Pen className="h-4 w-4 mr-1" />
                            Draw
                          </Button>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Parent/Guardian Signature</p>
                        {drawnSignatures.health_parent || files.health_parent_signature ? (
                          <img
                            src={drawnSignatures.health_parent || (files.health_parent_signature ? URL.createObjectURL(files.health_parent_signature) : '')}
                            alt="Parent/Guardian Signature"
                            className="w-full h-20 object-contain bg-white rounded-lg border border-gray-200 mb-2"
                          />
                        ) : data.health.parent_guardian_signature_url ? (
                          <img
                            src={data.health.parent_guardian_signature_url}
                            alt="Parent/Guardian Signature"
                            className="w-full h-20 object-contain bg-white rounded-lg border border-gray-200 mb-2"
                          />
                        ) : (
                          <div className="mb-2 h-20 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-sm text-muted-foreground">No signature</p>
                          </div>
                        )}
                        {drawnSignatures.health_parent && (
                          <Badge variant="default" className="mb-2">✍️ Signature drawn</Badge>
                        )}
                        {files.health_parent_signature && (
                          <Badge variant="default" className="mb-2 bg-green-600">📁 File uploaded</Badge>
                        )}
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setFiles({ ...files, health_parent_signature: e.target.files?.[0] || null })}
                              className="text-sm"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              <Upload className="h-3 w-3 inline mr-1" />Upload file
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setSignatureModals({ ...signatureModals, health_parent: true })}
                            className="whitespace-nowrap"
                          >
                            <Pen className="h-4 w-4 mr-1" />
                            Draw
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Consents (Editable) */}
              {data.consents && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Consents & Agreements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Information Correct</p>
                        <Badge variant={data.consents.info_correct ? "default" : "destructive"}>
                          {data.consents.info_correct ? "Confirmed" : "Not Confirmed"}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Agree to Rules</p>
                        <Badge variant={data.consents.agree_to_rules ? "default" : "destructive"}>
                          {data.consents.agree_to_rules ? "Agreed" : "Not Agreed"}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Consent to Publicity</p>
                        <Badge variant={data.consents.consent_to_publicity ? "default" : "destructive"}>
                          {data.consents.consent_to_publicity ? "Consented" : "Not Consented"}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Student Signature</p>
                        {drawnSignatures.consent_student || files.consent_student_signature ? (
                          <img
                            src={drawnSignatures.consent_student || (files.consent_student_signature ? URL.createObjectURL(files.consent_student_signature) : '')}
                            alt="Student Signature"
                            className="w-full h-20 object-contain bg-white rounded-lg border border-gray-200 mb-2"
                          />
                        ) : data.consents.student_signature_url ? (
                          <img
                            src={data.consents.student_signature_url}
                            alt="Student Signature"
                            className="w-full h-20 object-contain bg-white rounded-lg border border-gray-200 mb-2"
                          />
                        ) : (
                          <div className="mb-2 h-20 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-sm text-muted-foreground">No signature</p>
                          </div>
                        )}
                        {drawnSignatures.consent_student && (
                          <Badge variant="default" className="mb-2">✍️ Signature drawn</Badge>
                        )}
                        {files.consent_student_signature && (
                          <Badge variant="default" className="mb-2 bg-green-600">📁 File uploaded</Badge>
                        )}
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setFiles({ ...files, consent_student_signature: e.target.files?.[0] || null })}
                              className="text-sm"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              <Upload className="h-3 w-3 inline mr-1" />Upload file
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setSignatureModals({ ...signatureModals, consent_student: true })}
                            className="whitespace-nowrap"
                          >
                            <Pen className="h-4 w-4 mr-1" />
                            Draw
                          </Button>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Parent/Guardian Signature</p>
                        {drawnSignatures.consent_parent || files.consent_parent_signature ? (
                          <img
                            src={drawnSignatures.consent_parent || (files.consent_parent_signature ? URL.createObjectURL(files.consent_parent_signature) : '')}
                            alt="Parent/Guardian Signature"
                            className="w-full h-20 object-contain bg-white rounded-lg border border-gray-200 mb-2"
                          />
                        ) : data.consents.parent_guardian_signature_url ? (
                          <img
                            src={data.consents.parent_guardian_signature_url}
                            alt="Parent/Guardian Signature"
                            className="w-full h-20 object-contain bg-white rounded-lg border border-gray-200 mb-2"
                          />
                        ) : (
                          <div className="mb-2 h-20 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-sm text-muted-foreground">No signature</p>
                          </div>
                        )}
                        {drawnSignatures.consent_parent && (
                          <Badge variant="default" className="mb-2">✍️ Signature drawn</Badge>
                        )}
                        {files.consent_parent_signature && (
                          <Badge variant="default" className="mb-2 bg-green-600">📁 File uploaded</Badge>
                        )}
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setFiles({ ...files, consent_parent_signature: e.target.files?.[0] || null })}
                              className="text-sm"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              <Upload className="h-3 w-3 inline mr-1" />Upload file
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setSignatureModals({ ...signatureModals, consent_parent: true })}
                            className="whitespace-nowrap"
                          >
                            <Pen className="h-4 w-4 mr-1" />
                            Draw
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Endorsement (Editable) */}
              {data.endorsement && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      School Endorsement
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">School Official Name</p>
                        <p className="text-base font-semibold">{data.endorsement.school_official_name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Position</p>
                        <p className="text-base">{data.endorsement.position}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-muted-foreground mb-2">Official Signature</p>
                        {drawnSignatures.endorsement || files.endorsement_signature ? (
                          <img
                            src={drawnSignatures.endorsement || (files.endorsement_signature ? URL.createObjectURL(files.endorsement_signature) : '')}
                            alt="Official Signature"
                            className="w-full max-w-md h-20 object-contain bg-white rounded-lg border border-gray-200 mb-2"
                          />
                        ) : data.endorsement.signature_url ? (
                          <img
                            src={data.endorsement.signature_url}
                            alt="Official Signature"
                            className="w-full max-w-md h-20 object-contain bg-white rounded-lg border border-gray-200 mb-2"
                          />
                        ) : (
                          <div className="mb-2 h-20 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-sm text-muted-foreground">No signature</p>
                          </div>
                        )}
                        {drawnSignatures.endorsement && (
                          <Badge variant="default" className="mb-2">✍️ Signature drawn</Badge>
                        )}
                        {files.endorsement_signature && (
                          <Badge variant="default" className="mb-2 bg-green-600">📁 File uploaded</Badge>
                        )}
                        <div className="flex gap-2 max-w-md">
                          <div className="flex-1">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setFiles({ ...files, endorsement_signature: e.target.files?.[0] || null })}
                              className="text-sm"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              <Upload className="h-3 w-3 inline mr-1" />Upload file
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setSignatureModals({ ...signatureModals, endorsement: true })}
                            className="whitespace-nowrap"
                          >
                            <Pen className="h-4 w-4 mr-1" />
                            Draw
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Signature Pad Modals */}
      <ESignModal
        open={signatureModals.health_student}
        onOpenChange={(open) => setSignatureModals({ ...signatureModals, health_student: open })}
        onSignatureSave={(sig) => setDrawnSignatures({ ...drawnSignatures, health_student: sig })}
        title="Student Health Signature"
        description="Draw the student's signature for health declaration"
      />

      <ESignModal
        open={signatureModals.health_parent}
        onOpenChange={(open) => setSignatureModals({ ...signatureModals, health_parent: open })}
        onSignatureSave={(sig) => setDrawnSignatures({ ...drawnSignatures, health_parent: sig })}
        title="Parent/Guardian Health Signature"
        description="Draw the parent/guardian's signature for health declaration"
      />

      <ESignModal
        open={signatureModals.consent_student}
        onOpenChange={(open) => setSignatureModals({ ...signatureModals, consent_student: open })}
        onSignatureSave={(sig) => setDrawnSignatures({ ...drawnSignatures, consent_student: sig })}
        title="Student Consent Signature"
        description="Draw the student's signature for consents and agreements"
      />

      <ESignModal
        open={signatureModals.consent_parent}
        onOpenChange={(open) => setSignatureModals({ ...signatureModals, consent_parent: open })}
        onSignatureSave={(sig) => setDrawnSignatures({ ...drawnSignatures, consent_parent: sig })}
        title="Parent/Guardian Consent Signature"
        description="Draw the parent/guardian's signature for consents and agreements"
      />

      <ESignModal
        open={signatureModals.endorsement}
        onOpenChange={(open) => setSignatureModals({ ...signatureModals, endorsement: open })}
        onSignatureSave={(sig) => setDrawnSignatures({ ...drawnSignatures, endorsement: sig })}
        title="School Official Signature"
        description="Draw the school official's signature for endorsement"
      />
    </>
  );
};

export const createColumns = (onUpdate?: (updatedSingle: SingleData) => void): ColumnDef<SingleData>[] => [
  {
    accessorKey: "student_name",
    header: "Name",
    cell: ({ row }) => {
      const studentName = row.getValue("student_name") as string;
      return (
        <div className="text-sm text-left px-2 py-1">
          {studentName || "Not assigned"}
        </div>
      );
    },
    size: 150,
    meta: {
      className: "hidden md:table-cell"
    },
  },
  {
    accessorKey: "performance_title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Performance Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium text-left">{row.getValue("performance_title")}</div>
    ),
    size: 250,
  },
  {
    accessorKey: "performance_type",
    header: "Performance Type",
    cell: ({ row }) => {
      const type = row.getValue("performance_type") as string || 'Other';

      const colorClass =
        type === 'Singing' ? 'bg-blue-100 text-blue-800' :
          type === 'Dancing' ? 'bg-pink-100 text-pink-800' :
            type === 'Musical Instrument' ? 'bg-purple-100 text-purple-800' :
              type === 'Spoken Word/Poetry' ? 'bg-green-100 text-green-800' :
                type === 'Theatrical/Drama' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800';

      return (
        <Badge className={`${colorClass} font-medium`} variant="secondary">
          {type}
        </Badge>
      );
    },
    size: 180,
    meta: {
      className: "hidden md:table-cell"
    },
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }) => {
      const duration = row.getValue("duration") as string;
      return (
        <div className="text-sm text-left px-2 py-1">
          {duration || "N/A"}
        </div>
      );
    },
    size: 100,
    meta: {
      className: "hidden lg:table-cell"
    },
  },
  {
    accessorKey: "student_school",
    header: "School",
    cell: ({ row }) => {
      const school = row.getValue("student_school") as string;
      return (
        <div className="text-sm text-left px-2 py-1">
          {school || "Not assigned"}
        </div>
      );
    },
    size: 150,
    meta: {
      className: "hidden lg:table-cell"
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const single = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <SingleDetailsSheet single={single} />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// Default export for backward compatibility
export const columns = createColumns();
