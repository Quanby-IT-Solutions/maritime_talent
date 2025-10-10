"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown, Eye, Edit, MoreHorizontal, Save, X } from "lucide-react";
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
import { Tables, PerformanceType } from "@/schema/schema";
import { z } from "zod";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Zod schemas for validation
export const PerformanceSchema = z.object({
  performance_id: z.string(), // Changed from number to string to match DB schema
  student_id: z.string(), // Changed from number to string to match DB schema
  performance_type: z.enum([
    "Singing",
    "Dancing",
    "Musical Instrument",
    "Spoken Word/Poetry",
    "Theatrical/Drama",
    "Other",
  ]),
  title: z.string().nullable(),
  duration: z.string().nullable(),
  num_performers: z.number().nullable(),
  group_members: z.string().nullable(),
  created_at: z.string().nullable(),
});

export const RequirementsSchema = z.object({
  requirement_id: z.string(), // Changed from number to string to match DB schema
  student_id: z.string(), // Changed from number to string to match DB schema
  certification_url: z.string().nullable(),
  school_id_url: z.string().nullable(),
  uploaded_at: z.string().nullable(),
});

export const HealthFitnessSchema = z.object({
  declaration_id: z.string(), // Changed from number to string to match DB schema
  student_id: z.string(), // Changed from number to string to match DB schema
  is_physically_fit: z.boolean().nullable(),
  student_signature_url: z.string().nullable(),
  parent_guardian_signature_url: z.string().nullable(),
  declaration_date: z.string().nullable(),
});

export const ConsentsSchema = z.object({
  consent_id: z.string(), // Changed from number to string to match DB schema
  student_id: z.string(), // Changed from number to string to match DB schema
  info_correct: z.boolean().nullable(),
  agree_to_rules: z.boolean().nullable(),
  consent_to_publicity: z.boolean().nullable(),
  student_signature_url: z.string().nullable(),
  parent_guardian_signature_url: z.string().nullable(),
  consent_date: z.string().nullable(),
});

export const EndorsementsSchema = z.object({
  endorsement_id: z.string(), // Changed from number to string to match DB schema
  student_id: z.string(), // Changed from number to string to match DB schema
  school_official_name: z.string().nullable(),
  position: z.string().nullable(),
  signature_url: z.string().nullable(),
  endorsement_date: z.string().nullable(),
});

export const StudentSchema = z.object({
  student_id: z.string(), // Changed from number to string to match DB schema
  user_id: z.string().nullable(),
  full_name: z.string().min(1, "Full name is required"),
  age: z
    .number()
    .min(16, "Minimum age is 16")
    .max(30, "Maximum age is 30")
    .nullable(),
  gender: z.string().nullable(),
  school: z.string().min(1, "School is required").nullable(),
  course_year: z.string().nullable(),
  contact_number: z
    .string()
    .regex(/^[0-9+\-\s()]+$/, "Invalid phone number format")
    .nullable(),
  email: z.string().email("Valid email is required").nullable(),
  created_at: z.string().nullable(),
});

// Complete talent data schema
export const TalentDataSchema = StudentSchema.extend({
  performances: z.array(PerformanceSchema).optional(),
  requirements: RequirementsSchema.optional(),
  health_fitness: HealthFitnessSchema.optional(),
  consents: ConsentsSchema.optional(),
  endorsements: EndorsementsSchema.optional(),
});

// Type for complete talent data (combining multiple tables)
export type TalentData = z.infer<typeof TalentDataSchema>;

// Validation function
export const validateTalentData = (data: unknown): TalentData => {
  return TalentDataSchema.parse(data);
};

// Safe validation function that returns errors
export const safeParseTalentData = (data: unknown) => {
  return TalentDataSchema.safeParse(data);
};

// Talent Details Component
const TalentDetailsSheet = ({ talent, onUpdate }: { talent: TalentData; onUpdate?: (updatedTalent: TalentData) => void }) => {
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: talent.full_name,
    age: talent.age || '',
    gender: talent.gender || '',
    email: talent.email || '',
    contact_number: talent.contact_number || '',
    school: talent.school || '',
    course_year: talent.course_year || '',
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Create updated talent object
      const updatedTalent: TalentData = {
        student_id: talent.student_id, // Keep original student_id as string
        user_id: talent.user_id,
        full_name: formData.full_name,
        age: formData.age ? parseInt(String(formData.age)) : null,
        gender: formData.gender || null,
        school: talent.school || null,
        course_year: talent.course_year || null,
        contact_number: talent.contact_number || null,
        email: talent.email || null,
        created_at: talent.created_at,
        performances: talent.performances,
        requirements: talent.requirements,
        health_fitness: talent.health_fitness,
        consents: talent.consents,
        endorsements: talent.endorsements,
      };

      // Update in Supabase database
      // Using a type-unsafe approach to bypass strict schema typing during build
      const supabase: any = createClient();
      const updateData: Record<string, any> = {
        full_name: updatedTalent.full_name,
        age: updatedTalent.age,
        gender: updatedTalent.gender,
        email: updatedTalent.email,
        contact_number: updatedTalent.contact_number,
        school: updatedTalent.school,
        course_year: updatedTalent.course_year,
      };
      
      const { error } = await supabase
        .from('students')
        .update(updateData)
        .eq('student_id', talent.student_id);

      if (error) {
        console.error('Error updating student:', error);
        alert('Failed to update student. Please try again.');
        return;
      }

      // Call the update function to refresh the UI
      if (onUpdate) {
        onUpdate(updatedTalent);
      }

      console.log('Student updated successfully:', updatedTalent);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving student:', error);
      alert('Failed to update student. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setOpen(false); // Close the dialog immediately
    // Reset state after a short delay to avoid the flash
    setTimeout(() => {
      setFormData({
        full_name: talent.full_name,
        age: talent.age || '',
        gender: talent.gender || '',
        email: talent.email || '',
        contact_number: talent.contact_number || '',
        school: talent.school || '',
        course_year: talent.course_year || '',
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
          setIsEditing(false); // View mode
        }}
      >
        <Eye className="h-4 w-4" />
        View details
      </DropdownMenuItem>

      <DropdownMenuItem
        className="flex items-center gap-2"
        onSelect={(e) => {
          e.preventDefault();
          setOpen(true);
          setIsEditing(true); // Edit mode
        }}
      >
        <Edit className="h-4 w-4" />
        Edit Information
      </DropdownMenuItem>

      <Dialog open={open} onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) setIsEditing(false);
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between mb-4">
              <div>
                <DialogTitle className="text-2xl font-bold">
                  {isEditing ? "Edit Student Information" : talent.full_name}
                </DialogTitle>
                <DialogDescription className="text-sm mt-1">
                  Student ID: <span className="font-mono font-semibold text-slate-900">#{talent.student_id}</span>
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
                    {talent.gender || "Student"}
                  </Badge>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {isEditing ? (
              // Edit Mode UI
              <div className="space-y-6">
                {/* Personal Information Card - Edit Mode */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-900">Personal Information</h3>
                  </div>
                  <div className="p-4 bg-white space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name" className="text-xs font-medium text-slate-700">Full Name</Label>
                        <Input id="full_name" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} placeholder="Enter full name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="age" className="text-xs font-medium text-slate-700">Age</Label>
                        <Input id="age" type="number" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} placeholder="Enter age" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender" className="text-xs font-medium text-slate-700">Gender</Label>
                      <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                        <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Contact Information Card - Edit Mode */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-900">Contact Information</h3>
                  </div>
                  <div className="p-4 bg-white space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs font-medium text-slate-700">Email Address</Label>
                      <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Enter email address" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact_number" className="text-xs font-medium text-slate-700">Phone Number</Label>
                      <Input id="contact_number" value={formData.contact_number} onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })} placeholder="Enter phone number" />
                    </div>
                  </div>
                </div>

                {/* Academic Information Card - Edit Mode */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-900">Academic Information</h3>
                  </div>
                  <div className="p-4 bg-white space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="school" className="text-xs font-medium text-slate-700">School</Label>
                      <Input id="school" value={formData.school} onChange={(e) => setFormData({ ...formData, school: e.target.value })} placeholder="Enter school name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="course_year" className="text-xs font-medium text-slate-700">Course/Year</Label>
                      <Input id="course_year" value={formData.course_year} onChange={(e) => setFormData({ ...formData, course_year: e.target.value })} placeholder="e.g., BSMT 4th Year" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // View Mode UI
              <div className="space-y-6">
                {/* Personal Information Card */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-900">Personal Information</h3>
                  </div>
                  <div className="p-4 bg-white">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Age</p>
                        <p className="text-base font-medium text-slate-900">{talent.age || "Not provided"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Gender</p>
                        <div>
                          <Badge variant="outline" className="font-medium">
                            {talent.gender || "Not specified"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information Card */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-900">Contact Information</h3>
                  </div>
                  <div className="p-4 bg-white space-y-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Email Address</p>
                      <p className="text-base font-medium text-slate-900 break-all">
                        {talent.email || <span className="text-slate-400">Not provided</span>}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Phone Number</p>
                      <p className="text-base font-medium text-slate-900 font-mono">
                        {talent.contact_number || <span className="text-slate-400">Not provided</span>}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Academic Information Card */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-900">Academic Information</h3>
                  </div>
                  <div className="p-4 bg-white space-y-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">School</p>
                      <p className="text-base font-medium text-slate-900">
                        {talent.school || <span className="text-slate-400">Not provided</span>}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Course/Year</p>
                      <p className="text-base font-medium text-slate-900">
                        {talent.course_year || <span className="text-slate-400">Not provided</span>}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Performances Card */}
                {talent.performances && talent.performances.length > 0 && (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-900">Performances</h3>
                    </div>
                    <div className="p-4 bg-white space-y-3">
                      {talent.performances.map((perf, index) => (
                        <div key={perf.performance_id} className="border border-slate-100 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="secondary" className="font-medium">
                              {perf.performance_type}
                            </Badge>
                            <span className="text-xs text-slate-500">#{perf.performance_id}</span>
                          </div>
                          {perf.title && (
                            <p className="text-sm font-medium text-slate-900 mb-1">{perf.title}</p>
                          )}
                          {perf.duration && (
                            <p className="text-xs text-slate-500">Duration: {perf.duration}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Registration Status Card */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-900">Registration Status</h3>
                  </div>
                  <div className="p-4 bg-white space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Requirements</p>
                        <Badge variant={talent.requirements ? "default" : "destructive"} className="text-xs">
                          {talent.requirements ? "Complete" : "Missing"}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Health Declaration</p>
                        <Badge variant={talent.health_fitness ? "default" : "destructive"} className="text-xs">
                          {talent.health_fitness ? "Complete" : "Missing"}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Consents</p>
                        <Badge variant={talent.consents ? "default" : "destructive"} className="text-xs">
                          {talent.consents ? "Complete" : "Missing"}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Endorsements</p>
                        <Badge variant={talent.endorsements ? "default" : "destructive"} className="text-xs">
                          {talent.endorsements ? "Complete" : "Missing"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Registration Information Card */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-900">Registration Information</h3>
                  </div>
                  <div className="p-4 bg-white space-y-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Student ID</p>
                      <p className="text-base font-medium text-slate-900 font-mono">
                        #{talent.student_id}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Registration Date</p>
                      <p className="text-base font-medium text-slate-900">
                        {talent.created_at
                          ? new Date(talent.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                          : "Not available"
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const createColumns = (onUpdate?: (updatedTalent: TalentData) => void): ColumnDef<TalentData>[] => [
  {
    accessorKey: "student_id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-mono text-sm text-center">
        {row.getValue("student_id")}
      </div>
    ),
    size: 80,
    meta: {
      className: "hidden sm:table-cell"
    },
  },
  {
    accessorKey: "full_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Full Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium text-left">{row.getValue("full_name")}</div>
    ),
    size: 200,
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground lowercase">
        {row.getValue("email") || "Not provided"}
      </div>
    ),
    size: 250,
    meta: {
      className: "hidden lg:table-cell"
    },
  },
  {
    accessorKey: "age",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Age
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const age = row.getValue("age") as number;
      return <div className="text-center">{age || "N/A"}</div>;
    },
    size: 70,
    meta: {
      className: "hidden md:table-cell"
    },
  },
  {
    accessorKey: "gender",
    header: "Gender",
    cell: ({ row }) => {
      const gender = row.getValue("gender") as string;
      return (
        <Badge variant="outline" className="text-xs">
          {gender || "Not specified"}
        </Badge>
      );
    },
    size: 100,
    meta: {
      className: "hidden md:table-cell"
    },
  },
  {
    accessorKey: "school",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          School
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate text-sm">
        {row.getValue("school") || "Not provided"}
      </div>
    ),
    size: 200,
    meta: {
      className: "hidden lg:table-cell"
    },
  },
  {
    accessorKey: "course_year",
    header: "Course/Year",
    cell: ({ row }) => (
      <div className="text-sm">
        {row.getValue("course_year") || "Not specified"}
      </div>
    ),
    size: 150,
    meta: {
      className: "hidden lg:table-cell"
    },
  },
  {
    accessorKey: "contact_number",
    header: "Contact",
    cell: ({ row }) => (
      <div className="text-sm font-mono">
        {row.getValue("contact_number") || "Not provided"}
      </div>
    ),
    size: 140,
    meta: {
      className: "hidden lg:table-cell"
    },
  },
  {
    id: "performances",
    header: "Performances",
    cell: ({ row }) => {
      const performances = row.original.performances || [];
      return (
        <div className="flex flex-wrap gap-1">
          {performances.length > 0 ? (
            performances.slice(0, 2).map((perf, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {perf.performance_type}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">None</span>
          )}
          {performances.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{performances.length - 2}
            </Badge>
          )}
        </div>
      );
    },
    size: 150,
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const hasRequirements = !!row.original.requirements;
      const hasHealthFitness = !!row.original.health_fitness;
      const hasConsents = !!row.original.consents;
      const hasEndorsements = !!row.original.endorsements;

      // Calculate completion status
      const completionItems = [
        hasRequirements,
        hasHealthFitness,
        hasConsents,
        hasEndorsements,
      ];
      const completedCount = completionItems.filter(Boolean).length;
      const isComplete = completedCount === 4;

      return (
        <div className="flex flex-col gap-1">
          <Badge
            variant={
              isComplete
                ? "default"
                : completedCount > 2
                  ? "secondary"
                  : "destructive"
            }
            className="text-xs"
          >
            {isComplete
              ? "Complete"
              : completedCount > 2
                ? "Partial"
                : "Incomplete"}
          </Badge>
          <div className="text-xs text-muted-foreground">
            {completedCount}/4 sections
          </div>
        </div>
      );
    },
    size: 120,
    meta: {
      className: "hidden md:table-cell"
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Registered
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("created_at") as string;
      return (
        <div className="text-sm text-muted-foreground text-center">
          {date ? new Date(date).toLocaleDateString() : "N/A"}
        </div>
      );
    },
    size: 100,
    meta: {
      className: "hidden md:table-cell"
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const talent = row.original;

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
            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard.writeText(talent.student_id.toString())
              }
            >
              Copy student ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <TalentDetailsSheet talent={talent} onUpdate={onUpdate} />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: 80,
  },
];

// Default export for backward compatibility
export const columns = createColumns();
