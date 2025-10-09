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
import { Eye, Edit, Save, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { GroupData, GroupMemberData } from "./group-column-def";

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Create updated member object
      const updatedMember: GroupMemberData = {
        ...member,
        full_name: formData.full_name,
        role: formData.role,
        email: formData.email || null,
        contact_number: formData.contact_number || null,
        age: formData.age ? parseInt(String(formData.age)) : null,
        gender: formData.gender || null,
      };

      // Update in Supabase students table
      const supabase = createClient();
      const { error } = await supabase
        .from('students')
        .update({
          full_name: updatedMember.full_name,
          email: updatedMember.email,
          contact_number: updatedMember.contact_number,
          age: updatedMember.age,
          gender: updatedMember.gender,
          course_year: updatedMember.role, // Map role back to course_year
        })
        .eq('student_id', member.member_id);

      if (error) {
        console.error('Error updating student:', error);
        alert('Failed to update student. Please try again.');
        return;
      }

      // Call the update function to refresh the UI
      if (onMemberUpdate) {
        onMemberUpdate(updatedMember, groupId);
      }

      console.log('Member updated successfully:', updatedMember);
      setIsEditing(false);
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

                {/* Health & Fitness - Edit Mode (Read-only display) */}
                {member.health && (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-900">Health & Fitness Declaration (View Only)</h3>
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
                            <img
                              src={member.health.student_signature_url}
                              alt="Student Signature"
                              className="w-full h-20 object-contain bg-white rounded-lg border border-gray-200"
                            />
                          ) : (
                            <p className="text-sm text-muted-foreground">Not provided</p>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Parent/Guardian Signature</p>
                          {member.health.parent_guardian_signature_url ? (
                            <img
                              src={member.health.parent_guardian_signature_url}
                              alt="Parent/Guardian Signature"
                              className="w-full h-20 object-contain bg-white rounded-lg border border-gray-200"
                            />
                          ) : (
                            <p className="text-sm text-muted-foreground">Not provided</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Consents - Edit Mode (Read-only display) */}
                {member.consents && (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-900">Consents & Agreements (View Only)</h3>
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
                    </div>
                  </div>
                )}

                {/* Endorsement - Edit Mode (Read-only display) */}
                {member.endorsement && (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-900">School Endorsement (View Only)</h3>
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
