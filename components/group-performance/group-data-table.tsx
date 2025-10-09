"use client";

import React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronFirst,
  ChevronLast,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  Users,
  MoreHorizontal,
} from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Eye, Edit, Save, X, Pen, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { GroupData, GroupMemberData } from "./group-column-def";
import ESignModal from "@/components/reusable/esign-modal";

// Member Details Sheet Component
const MemberDetailsSheet = ({ member, groupId, onMemberUpdate }: { member: GroupMemberData; groupId: string; onMemberUpdate?: (updatedMember: GroupMemberData, groupId: string) => void }) => {
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: member.full_name,
    role: member.role,
    email: member.email || '',
    contact_number: member.contact_number || '',
    age: member.age || '',
    gender: member.gender || '',
  });

  // Signature file states (for upload)
  const [healthStudentSigFile, setHealthStudentSigFile] = useState<File | null>(null);
  const [healthParentSigFile, setHealthParentSigFile] = useState<File | null>(null);
  const [consentsStudentSigFile, setConsentsStudentSigFile] = useState<File | null>(null);
  const [consentsParentSigFile, setConsentsParentSigFile] = useState<File | null>(null);
  const [endorsementSigFile, setEndorsementSigFile] = useState<File | null>(null);

  // Signature drawn states (from signature pad)
  const [healthStudentSigDrawn, setHealthStudentSigDrawn] = useState<string | null>(null);
  const [healthParentSigDrawn, setHealthParentSigDrawn] = useState<string | null>(null);
  const [consentsStudentSigDrawn, setConsentsStudentSigDrawn] = useState<string | null>(null);
  const [consentsParentSigDrawn, setConsentsParentSigDrawn] = useState<string | null>(null);
  const [endorsementSigDrawn, setEndorsementSigDrawn] = useState<string | null>(null);

  // Signature modal states
  const [healthStudentModalOpen, setHealthStudentModalOpen] = useState(false);
  const [healthParentModalOpen, setHealthParentModalOpen] = useState(false);
  const [consentsStudentModalOpen, setConsentsStudentModalOpen] = useState(false);
  const [consentsParentModalOpen, setConsentsParentModalOpen] = useState(false);
  const [endorsementModalOpen, setEndorsementModalOpen] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const supabase = createClient();

      // Helper function to convert dataURL to blob
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

      // Helper function to upload file signature to Supabase storage
      const uploadSignature = async (file: File, path: string): Promise<string | null> => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${member.member_id}-${Date.now()}.${fileExt}`;
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

      // Helper function to upload drawn signature to Supabase storage
      const uploadDrawnSignature = async (dataURL: string, path: string): Promise<string | null> => {
        const blob = dataURLtoBlob(dataURL);
        const fileName = `${member.member_id}-${Date.now()}.png`;
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

      // Upload signatures (drawn signatures take priority over file uploads)
      let healthStudentSigUrl = member.health?.student_signature_url || null;
      let healthParentSigUrl = member.health?.parent_guardian_signature_url || null;
      let consentsStudentSigUrl = member.consents?.student_signature_url || null;
      let consentsParentSigUrl = member.consents?.parent_guardian_signature_url || null;
      let endorsementSigUrl = member.endorsement?.school_official_signature_url || null;

      // Health Student Signature (drawn takes priority)
      if (healthStudentSigDrawn) {
        const url = await uploadDrawnSignature(healthStudentSigDrawn, 'health-signatures/student');
        if (url) healthStudentSigUrl = url;
      } else if (healthStudentSigFile) {
        const url = await uploadSignature(healthStudentSigFile, 'health-signatures/student');
        if (url) healthStudentSigUrl = url;
      }

      // Health Parent Signature (drawn takes priority)
      if (healthParentSigDrawn) {
        const url = await uploadDrawnSignature(healthParentSigDrawn, 'health-signatures/parent');
        if (url) healthParentSigUrl = url;
      } else if (healthParentSigFile) {
        const url = await uploadSignature(healthParentSigFile, 'health-signatures/parent');
        if (url) healthParentSigUrl = url;
      }

      // Consents Student Signature (drawn takes priority)
      if (consentsStudentSigDrawn) {
        const url = await uploadDrawnSignature(consentsStudentSigDrawn, 'consents-signatures/student');
        if (url) consentsStudentSigUrl = url;
      } else if (consentsStudentSigFile) {
        const url = await uploadSignature(consentsStudentSigFile, 'consents-signatures/student');
        if (url) consentsStudentSigUrl = url;
      }

      // Consents Parent Signature (drawn takes priority)
      if (consentsParentSigDrawn) {
        const url = await uploadDrawnSignature(consentsParentSigDrawn, 'consents-signatures/parent');
        if (url) consentsParentSigUrl = url;
      } else if (consentsParentSigFile) {
        const url = await uploadSignature(consentsParentSigFile, 'consents-signatures/parent');
        if (url) consentsParentSigUrl = url;
      }

      // Endorsement Signature (drawn takes priority)
      if (endorsementSigDrawn) {
        const url = await uploadDrawnSignature(endorsementSigDrawn, 'endorsement-signatures');
        if (url) endorsementSigUrl = url;
      } else if (endorsementSigFile) {
        const url = await uploadSignature(endorsementSigFile, 'endorsement-signatures');
        if (url) endorsementSigUrl = url;
      }

      // Update student basic info
      const { error: studentError } = await supabase
        .from('students')
        .update({
          full_name: formData.full_name,
          email: formData.email || null,
          contact_number: formData.contact_number || null,
          age: formData.age ? parseInt(String(formData.age)) : null,
          gender: formData.gender || null,
          course_year: formData.role,
        })
        .eq('student_id', member.member_id);

      if (studentError) {
        console.error('Error updating student:', studentError);
        alert('Failed to update student. Please try again.');
        return;
      }

      // Update health signatures if member has health data
      if (member.health && (healthStudentSigFile || healthParentSigFile || healthStudentSigDrawn || healthParentSigDrawn)) {
        const { error: healthError } = await supabase
          .from('health_fitness')
          .update({
            student_signature_url: healthStudentSigUrl,
            parent_guardian_signature_url: healthParentSigUrl,
          })
          .eq('student_id', member.member_id);

        if (healthError) {
          console.error('Error updating health signatures:', healthError);
        }
      }

      // Update consents signatures if member has consents data
      if (member.consents && (consentsStudentSigFile || consentsParentSigFile || consentsStudentSigDrawn || consentsParentSigDrawn)) {
        const { error: consentsError } = await supabase
          .from('consents')
          .update({
            student_signature_url: consentsStudentSigUrl,
            parent_guardian_signature_url: consentsParentSigUrl,
          })
          .eq('student_id', member.member_id);

        if (consentsError) {
          console.error('Error updating consents signatures:', consentsError);
        }
      }

      // Update endorsement signature if member has endorsement data
      if (member.endorsement && (endorsementSigFile || endorsementSigDrawn)) {
        const { error: endorsementError } = await supabase
          .from('endorsements')
          .update({
            school_official_signature_url: endorsementSigUrl,
          })
          .eq('student_id', member.member_id);

        if (endorsementError) {
          console.error('Error updating endorsement signature:', endorsementError);
        }
      }

      // Create updated member object
      const updatedMember: GroupMemberData = {
        ...member,
        full_name: formData.full_name,
        role: formData.role,
        email: formData.email || null,
        contact_number: formData.contact_number || null,
        age: formData.age ? parseInt(String(formData.age)) : null,
        gender: formData.gender || null,
        health: member.health ? {
          ...member.health,
          student_signature_url: healthStudentSigUrl,
          parent_guardian_signature_url: healthParentSigUrl,
        } : null,
        consents: member.consents ? {
          ...member.consents,
          student_signature_url: consentsStudentSigUrl,
          parent_guardian_signature_url: consentsParentSigUrl,
        } : null,
        endorsement: member.endorsement ? {
          ...member.endorsement,
          school_official_signature_url: endorsementSigUrl,
        } : null,
      };

      // Call the update function to refresh the UI
      if (onMemberUpdate) {
        onMemberUpdate(updatedMember, groupId);
      }

      // Reset file and drawn signature states
      setHealthStudentSigFile(null);
      setHealthParentSigFile(null);
      setConsentsStudentSigFile(null);
      setConsentsParentSigFile(null);
      setEndorsementSigFile(null);
      setHealthStudentSigDrawn(null);
      setHealthParentSigDrawn(null);
      setConsentsStudentSigDrawn(null);
      setConsentsParentSigDrawn(null);
      setEndorsementSigDrawn(null);

      console.log('Member updated successfully:', updatedMember);
      setIsEditing(false);
      alert('Member updated successfully!');
    } catch (error) {
      console.error('Error saving member:', error);
      alert('Failed to update member. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setOpen(false); // Close the dialog immediately
    // Reset state after a short delay to avoid the flash
    setTimeout(() => {
      setFormData({
        full_name: member.full_name,
        role: member.role,
        email: member.email || '',
        contact_number: member.contact_number || '',
        age: member.age || '',
        gender: member.gender || '',
      });
      // Reset signature file and drawn states
      setHealthStudentSigFile(null);
      setHealthParentSigFile(null);
      setConsentsStudentSigFile(null);
      setConsentsParentSigFile(null);
      setEndorsementSigFile(null);
      setHealthStudentSigDrawn(null);
      setHealthParentSigDrawn(null);
      setConsentsStudentSigDrawn(null);
      setConsentsParentSigDrawn(null);
      setEndorsementSigDrawn(null);
      setIsEditing(false);
    }, 200);
  };

  return (
    <>
      <DropdownMenuItem
        className="flex items-center gap-2"
        onSelect={(e) => {
          e.preventDefault();
          setOpen(true);
          setIsEditing(false);
        }}
      >
        <Eye className="h-4 w-4" />
        View member details
      </DropdownMenuItem>

      <DropdownMenuItem
        className="flex items-center gap-2"
        onSelect={(e) => {
          e.preventDefault();
          setOpen(true);
          setIsEditing(true);
        }}
      >
        <Edit className="h-4 w-4" />
        Edit Information
      </DropdownMenuItem>

      <Dialog open={open} onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) setIsEditing(false);
      }}>
        <DialogContent className="min-w-[55%] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between mb-4">
              <div>
                <DialogTitle className="text-2xl font-bold">
                  {isEditing ? "Edit Member Information" : member.full_name}
                </DialogTitle>
                <DialogDescription className="text-sm mt-1">
                  Member ID: <span className="font-mono font-semibold text-slate-900">#{member.member_id}</span>
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Button size="sm" onClick={handleCancel} variant="outline">
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={isSaving}>
                      <Save className="h-4 w-4 mr-1" />
                      {isSaving ? "Saving..." : "Save"}
                    </Button>
                  </>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    {member.role}
                  </Badge>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {isEditing ? (
              <div className="space-y-6">
                {/* Member Information Card - Edit Mode */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-900">Member Information</h3>
                  </div>
                  <div className="p-4 bg-white space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name" className="text-xs font-medium text-slate-700">Full Name</Label>
                        <Input
                          id="full_name"
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          placeholder="Enter full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role" className="text-xs font-medium text-slate-700">Role</Label>
                        <Input
                          id="role"
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          placeholder="e.g., Lead Vocalist, Dancer"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="age" className="text-xs font-medium text-slate-700">Age</Label>
                        <Input
                          id="age"
                          type="number"
                          value={formData.age}
                          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                          placeholder="Enter age"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender" className="text-xs font-medium text-slate-700">Gender</Label>
                        <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
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
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs font-medium text-slate-700">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact_number" className="text-xs font-medium text-slate-700">Contact Number</Label>
                      <Input
                        id="contact_number"
                        value={formData.contact_number}
                        onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                        placeholder="Enter contact number"
                      />
                    </div>
                  </div>
                </div>

                {/* Requirements Section - Edit Mode (Read-only display) */}
                {member.requirements && (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-900">Requirements (View Only)</h3>
                    </div>
                    <div className="p-4 bg-white space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Certification</p>
                          {member.requirements.certification_url ? (
                            <div className="space-y-2">
                              <img
                                src={member.requirements.certification_url}
                                alt="Certification"
                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                              />
                              <a href={member.requirements.certification_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                                Open in new tab
                              </a>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Not uploaded</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">School ID</p>
                          {member.requirements.school_id_url ? (
                            <div className="space-y-2">
                              <img
                                src={member.requirements.school_id_url}
                                alt="School ID"
                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                              />
                              <a href={member.requirements.school_id_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                                Open in new tab
                              </a>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Not uploaded</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Health & Fitness - Edit Mode */}
                {member.health && (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-900">Health & Fitness Declaration</h3>
                    </div>
                    <div className="p-4 bg-white space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Physically Fit</p>
                          <Badge variant={member.health.is_physically_fit ? "default" : "destructive"}>
                            {member.health.is_physically_fit ? "Yes" : "No"}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Student Signature</p>
                          {healthStudentSigDrawn || healthStudentSigFile ? (
                            <img
                              src={healthStudentSigDrawn || (healthStudentSigFile ? URL.createObjectURL(healthStudentSigFile) : '')}
                              alt="Student Signature"
                              className="w-full h-20 object-contain bg-white rounded-lg border border-gray-200 mb-2"
                            />
                          ) : member.health.student_signature_url ? (
                            <img
                              src={member.health.student_signature_url}
                              alt="Student Signature"
                              className="w-full h-20 object-contain bg-white rounded-lg border border-gray-200 mb-2"
                            />
                          ) : (
                            <div className="mb-2 h-20 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                              <p className="text-sm text-muted-foreground">No signature</p>
                            </div>
                          )}
                          {healthStudentSigDrawn && (
                            <Badge variant="default" className="mb-2">✍️ Signature drawn</Badge>
                          )}
                          {healthStudentSigFile && (
                            <Badge variant="default" className="mb-2 bg-green-600">📁 File uploaded</Badge>
                          )}
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setHealthStudentSigFile(e.target.files?.[0] || null)}
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
                              onClick={() => setHealthStudentModalOpen(true)}
                              className="whitespace-nowrap"
                            >
                              <Pen className="h-4 w-4 mr-1" />
                              Draw
                            </Button>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Parent/Guardian Signature</p>
                          {healthParentSigDrawn || healthParentSigFile ? (
                            <img
                              src={healthParentSigDrawn || (healthParentSigFile ? URL.createObjectURL(healthParentSigFile) : '')}
                              alt="Parent/Guardian Signature"
                              className="w-full h-20 object-contain bg-white rounded-lg border border-gray-200 mb-2"
                            />
                          ) : member.health.parent_guardian_signature_url ? (
                            <img
                              src={member.health.parent_guardian_signature_url}
                              alt="Parent/Guardian Signature"
                              className="w-full h-20 object-contain bg-white rounded-lg border border-gray-200 mb-2"
                            />
                          ) : (
                            <div className="mb-2 h-20 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                              <p className="text-sm text-muted-foreground">No signature</p>
                            </div>
                          )}
                          {healthParentSigDrawn && (
                            <Badge variant="default" className="mb-2">✍️ Signature drawn</Badge>
                          )}
                          {healthParentSigFile && (
                            <Badge variant="default" className="mb-2 bg-green-600">📁 File uploaded</Badge>
                          )}
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setHealthParentSigFile(e.target.files?.[0] || null)}
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
                              onClick={() => setHealthParentModalOpen(true)}
                              className="whitespace-nowrap"
                            >
                              <Pen className="h-4 w-4 mr-1" />
                              Draw
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Consents - Edit Mode */}
                {member.consents && (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-900">Consents & Agreements</h3>
                    </div>
                    <div className="p-4 bg-white space-y-4">
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Information Correct</p>
                          <Badge variant={member.consents.info_correct ? "default" : "destructive"}>
                            {member.consents.info_correct ? "Confirmed" : "Not Confirmed"}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Agree to Rules</p>
                          <Badge variant={member.consents.agree_to_rules ? "default" : "destructive"}>
                            {member.consents.agree_to_rules ? "Agreed" : "Not Agreed"}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Consent to Publicity</p>
                          <Badge variant={member.consents.consent_to_publicity ? "default" : "destructive"}>
                            {member.consents.consent_to_publicity ? "Consented" : "Not Consented"}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Student Signature</p>
                          {consentsStudentSigDrawn || consentsStudentSigFile ? (
                            <img
                              src={consentsStudentSigDrawn || (consentsStudentSigFile ? URL.createObjectURL(consentsStudentSigFile) : '')}
                              alt="Student Signature"
                              className="w-full h-20 object-contain bg-white rounded-lg border border-gray-200 mb-2"
                            />
                          ) : member.consents.student_signature_url ? (
                            <img
                              src={member.consents.student_signature_url}
                              alt="Student Signature"
                              className="w-full h-20 object-contain bg-white rounded-lg border border-gray-200 mb-2"
                            />
                          ) : (
                            <div className="mb-2 h-20 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                              <p className="text-sm text-muted-foreground">No signature</p>
                            </div>
                          )}
                          {consentsStudentSigDrawn && (
                            <Badge variant="default" className="mb-2">✍️ Signature drawn</Badge>
                          )}
                          {consentsStudentSigFile && (
                            <Badge variant="default" className="mb-2 bg-green-600">📁 File uploaded</Badge>
                          )}
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setConsentsStudentSigFile(e.target.files?.[0] || null)}
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
                              onClick={() => setConsentsStudentModalOpen(true)}
                              className="whitespace-nowrap"
                            >
                              <Pen className="h-4 w-4 mr-1" />
                              Draw
                            </Button>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Parent/Guardian Signature</p>
                          {consentsParentSigDrawn || consentsParentSigFile ? (
                            <img
                              src={consentsParentSigDrawn || (consentsParentSigFile ? URL.createObjectURL(consentsParentSigFile) : '')}
                              alt="Parent/Guardian Signature"
                              className="w-full h-20 object-contain bg-white rounded-lg border border-gray-200 mb-2"
                            />
                          ) : member.consents.parent_guardian_signature_url ? (
                            <img
                              src={member.consents.parent_guardian_signature_url}
                              alt="Parent/Guardian Signature"
                              className="w-full h-20 object-contain bg-white rounded-lg border border-gray-200 mb-2"
                            />
                          ) : (
                            <div className="mb-2 h-20 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                              <p className="text-sm text-muted-foreground">No signature</p>
                            </div>
                          )}
                          {consentsParentSigDrawn && (
                            <Badge variant="default" className="mb-2">✍️ Signature drawn</Badge>
                          )}
                          {consentsParentSigFile && (
                            <Badge variant="default" className="mb-2 bg-green-600">📁 File uploaded</Badge>
                          )}
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setConsentsParentSigFile(e.target.files?.[0] || null)}
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
                              onClick={() => setConsentsParentModalOpen(true)}
                              className="whitespace-nowrap"
                            >
                              <Pen className="h-4 w-4 mr-1" />
                              Draw
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Endorsement - Edit Mode */}
                {member.endorsement && (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-900">School Endorsement</h3>
                    </div>
                    <div className="p-4 bg-white space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">School Official Name</p>
                          <p className="text-base font-semibold">{member.endorsement.school_official_name || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Position</p>
                          <Badge variant="outline">{member.endorsement.position || "N/A"}</Badge>
                        </div>
                      </div>
                      <div className="pt-4 border-t">
                        <p className="text-sm font-medium text-muted-foreground mb-2">School Official Signature</p>
                        {endorsementSigDrawn || endorsementSigFile ? (
                          <img
                            src={endorsementSigDrawn || (endorsementSigFile ? URL.createObjectURL(endorsementSigFile) : '')}
                            alt="School Official Signature"
                            className="w-full max-w-md h-20 object-contain bg-white rounded-lg border border-gray-200 mb-2"
                          />
                        ) : member.endorsement.school_official_signature_url ? (
                          <img
                            src={member.endorsement.school_official_signature_url}
                            alt="School Official Signature"
                            className="w-full max-w-md h-20 object-contain bg-white rounded-lg border border-gray-200 mb-2"
                          />
                        ) : (
                          <div className="mb-2 h-20 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-sm text-muted-foreground">No signature</p>
                          </div>
                        )}
                        {endorsementSigDrawn && (
                          <Badge variant="default" className="mb-2">✍️ Signature drawn</Badge>
                        )}
                        {endorsementSigFile && (
                          <Badge variant="default" className="mb-2 bg-green-600">📁 File uploaded</Badge>
                        )}
                        <div className="flex gap-2 max-w-md">
                          <div className="flex-1">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setEndorsementSigFile(e.target.files?.[0] || null)}
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
                            onClick={() => setEndorsementModalOpen(true)}
                            className="whitespace-nowrap"
                          >
                            <Pen className="h-4 w-4 mr-1" />
                            Draw
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Member Information Card - View Mode */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-900">Member Information</h3>
                  </div>
                  <div className="p-4 bg-white space-y-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Role</p>
                        <Badge variant="outline" className="font-medium">
                          {member.role}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Age</p>
                        <p className="text-base font-medium text-slate-900">{member.age || <span className="text-slate-400">Not provided</span>}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Gender</p>
                      <Badge variant="outline" className="font-medium">
                        {member.gender || "Not specified"}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Email</p>
                      <p className="text-base font-medium text-slate-900 break-all">
                        {member.email || <span className="text-slate-400">Not provided</span>}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Contact Number</p>
                      <p className="text-base font-medium text-slate-900 font-mono">
                        {member.contact_number || <span className="text-slate-400">Not provided</span>}
                      </p>
                    </div>
                    {member.school && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">School</p>
                        <p className="text-base font-medium text-slate-900">{member.school}</p>
                      </div>
                    )}
                    {member.course_year && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Course/Year</p>
                        <p className="text-base font-medium text-slate-900">{member.course_year}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Requirements Card */}
                {member.requirements && (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-900">Requirements</h3>
                    </div>
                    <div className="p-4 bg-white space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Certification</p>
                          {member.requirements.certification_url ? (
                            <div className="space-y-2">
                              <img
                                src={member.requirements.certification_url}
                                alt="Certification"
                                className="w-full h-48 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80"
                                onClick={() => window.open(member.requirements?.certification_url, '_blank')}
                              />
                              <a href={member.requirements.certification_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                                Open in new tab
                              </a>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Not uploaded</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">School ID</p>
                          {member.requirements.school_id_url ? (
                            <div className="space-y-2">
                              <img
                                src={member.requirements.school_id_url}
                                alt="School ID"
                                className="w-full h-48 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80"
                                onClick={() => window.open(member.requirements?.school_id_url, '_blank')}
                              />
                              <a href={member.requirements.school_id_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                                Open in new tab
                              </a>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Not uploaded</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Health & Fitness Card */}
                {member.health && (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-900">Health & Fitness Declaration</h3>
                    </div>
                    <div className="p-4 bg-white space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Physically Fit</p>
                          <Badge variant={member.health.is_physically_fit ? "default" : "destructive"}>
                            {member.health.is_physically_fit ? "Yes" : "No"}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Student Signature</p>
                          {member.health.student_signature_url ? (
                            <div className="space-y-2">
                              <img
                                src={member.health.student_signature_url}
                                alt="Student Signature"
                                className="w-full h-32 object-contain bg-white rounded-lg border border-gray-200 cursor-pointer hover:opacity-80"
                                onClick={() => window.open(member.health?.student_signature_url, '_blank')}
                              />
                              <a href={member.health.student_signature_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                                View full size
                              </a>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Not provided</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Parent/Guardian Signature</p>
                          {member.health.parent_guardian_signature_url ? (
                            <div className="space-y-2">
                              <img
                                src={member.health.parent_guardian_signature_url}
                                alt="Parent/Guardian Signature"
                                className="w-full h-32 object-contain bg-white rounded-lg border border-gray-200 cursor-pointer hover:opacity-80"
                                onClick={() => window.open(member.health?.parent_guardian_signature_url, '_blank')}
                              />
                              <a href={member.health.parent_guardian_signature_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                                View full size
                              </a>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Not provided</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Consents Card */}
                {member.consents && (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-900">Consents & Agreements</h3>
                    </div>
                    <div className="p-4 bg-white space-y-4">
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Information Correct</p>
                          <Badge variant={member.consents.info_correct ? "default" : "destructive"}>
                            {member.consents.info_correct ? "Confirmed" : "Not Confirmed"}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Agree to Rules</p>
                          <Badge variant={member.consents.agree_to_rules ? "default" : "destructive"}>
                            {member.consents.agree_to_rules ? "Agreed" : "Not Agreed"}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Consent to Publicity</p>
                          <Badge variant={member.consents.consent_to_publicity ? "default" : "destructive"}>
                            {member.consents.consent_to_publicity ? "Consented" : "Not Consented"}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Student Signature</p>
                          {member.consents.student_signature_url ? (
                            <div className="space-y-2">
                              <img
                                src={member.consents.student_signature_url}
                                alt="Student Signature"
                                className="w-full h-32 object-contain bg-white rounded-lg border border-gray-200 cursor-pointer hover:opacity-80"
                                onClick={() => window.open(member.consents?.student_signature_url, '_blank')}
                              />
                              <a href={member.consents.student_signature_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                                View full size
                              </a>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Not provided</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Parent/Guardian Signature</p>
                          {member.consents.parent_guardian_signature_url ? (
                            <div className="space-y-2">
                              <img
                                src={member.consents.parent_guardian_signature_url}
                                alt="Parent/Guardian Signature"
                                className="w-full h-32 object-contain bg-white rounded-lg border border-gray-200 cursor-pointer hover:opacity-80"
                                onClick={() => window.open(member.consents?.parent_guardian_signature_url, '_blank')}
                              />
                              <a href={member.consents.parent_guardian_signature_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                                View full size
                              </a>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Not provided</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Endorsement Card */}
                {member.endorsement && (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-900">School Endorsement</h3>
                    </div>
                    <div className="p-4 bg-white space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">School Official Name</p>
                          <p className="text-base font-semibold">{member.endorsement.school_official_name || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Position</p>
                          <Badge variant="outline">{member.endorsement.position || "N/A"}</Badge>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Official Signature</p>
                          {member.endorsement.signature_url ? (
                            <div className="space-y-2">
                              <img
                                src={member.endorsement.signature_url}
                                alt="Official Signature"
                                className="w-full h-32 object-contain bg-white rounded-lg border border-gray-200 cursor-pointer hover:opacity-80"
                                onClick={() => window.open(member.endorsement?.signature_url, '_blank')}
                              />
                              <a href={member.endorsement.signature_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                                View full size
                              </a>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Not provided</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Signature Pad Modals */}
      <ESignModal
        open={healthStudentModalOpen}
        onOpenChange={setHealthStudentModalOpen}
        onSignatureSave={(sig) => setHealthStudentSigDrawn(sig)}
        title="Student Health Signature"
        description="Draw the student's signature for health declaration"
      />

      <ESignModal
        open={healthParentModalOpen}
        onOpenChange={setHealthParentModalOpen}
        onSignatureSave={(sig) => setHealthParentSigDrawn(sig)}
        title="Parent/Guardian Health Signature"
        description="Draw the parent/guardian's signature for health declaration"
      />

      <ESignModal
        open={consentsStudentModalOpen}
        onOpenChange={setConsentsStudentModalOpen}
        onSignatureSave={(sig) => setConsentsStudentSigDrawn(sig)}
        title="Student Consent Signature"
        description="Draw the student's signature for consents and agreements"
      />

      <ESignModal
        open={consentsParentModalOpen}
        onOpenChange={setConsentsParentModalOpen}
        onSignatureSave={(sig) => setConsentsParentSigDrawn(sig)}
        title="Parent/Guardian Consent Signature"
        description="Draw the parent/guardian's signature for consents and agreements"
      />

      <ESignModal
        open={endorsementModalOpen}
        onOpenChange={setEndorsementModalOpen}
        onSignatureSave={(sig) => setEndorsementSigDrawn(sig)}
        title="School Official Signature"
        description="Draw the school official's signature for endorsement"
      />
    </>
  );
};

interface GroupDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  searchValue?: string;
  statusFilter?: string;
  onStatusFilterChange?: (value: string) => void;
  showFilters?: boolean;
  onUpdate?: (updatedGroup: GroupData) => void;
  onMemberUpdate?: (updatedMember: GroupMemberData, groupId: string) => void;
}

export function GroupDataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "Search...",
  onSearchChange,
  searchValue = "",
  statusFilter = "all",
  onStatusFilterChange,
  showFilters = true,
  onUpdate,
  onMemberUpdate,
}: GroupDataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  const toggleRowExpansion = (groupId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(groupId)) {
      newExpandedRows.delete(groupId);
    } else {
      newExpandedRows.add(groupId);
    }
    setExpandedRows(newExpandedRows);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-8 w-[300px]"
            />
          </div>
          {showFilters && onStatusFilterChange && (
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Musical">Musical</SelectItem>
                <SelectItem value="Dance">Dance</SelectItem>
                <SelectItem value="Drama">Drama</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                <TableHead className="w-12"></TableHead>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const group = row.original as GroupData;
                const isExpanded = expandedRows.has(group.group_id);

                return (
                  <React.Fragment key={row.id}>
                    {/* Main row */}
                    <TableRow data-state={row.getIsSelected() && "selected"}>
                      <TableCell className="w-12">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRowExpansion(group.group_id)}
                          className="h-6 w-6 p-0"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRightIcon className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Expanded row with members */}
                    {isExpanded && group.group_members && group.group_members.length > 0 && (
                      <TableRow>
                        <TableCell colSpan={columns.length + 1} className="p-0">
                          <div className="bg-slate-50 border-t animate-in slide-in-from-top-2 duration-300 ease-out">
                            <div className="p-4">
                              <h4 className="font-semibold text-sm text-slate-700 mb-3">Group Members</h4>
                              <div className="grid gap-3">
                                {group.group_members.map((member: GroupMemberData, index: number) => (
                                  <div
                                    key={member.member_id}
                                    className="flex items-center justify-between p-3 bg-white rounded border animate-in fade-in-0 slide-in-from-left-2"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                                        <Users className="h-4 w-4 text-slate-600" />
                                      </div>
                                      <div>
                                        <p className="font-medium text-sm">{member.full_name}</p>
                                        <p className="text-xs text-slate-500">{member.role}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuLabel>Member Actions</DropdownMenuLabel>
                                          <DropdownMenuItem
                                            onClick={() =>
                                              navigator.clipboard.writeText(member.member_id.toString())
                                            }
                                          >
                                            Copy member ID
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <MemberDetailsSheet member={member} groupId={group.group_id} onMemberUpdate={onMemberUpdate} />
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} of{" "}
          {table.getCoreRowModel().rows.length} row(s) total.
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronFirst className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronLast className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
