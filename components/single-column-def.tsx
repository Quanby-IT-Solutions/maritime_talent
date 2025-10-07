"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { z } from "zod";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// Zod schema for single performance validation
export const SingleSchema = z.object({
  id: z.number(), // Required for DataTable
  single_id: z.number(),
  performance_title: z.string().min(1, "Performance title is required"),
  performance_description: z.string().nullable(),
  student_id: z.number().nullable(),
  created_at: z.string().nullable(),
  student_name: z.string().nullable(),
  student_school: z.string().nullable(),
});

// Type for single performance data
export type SingleData = z.infer<typeof SingleSchema>;

// Type for student details
interface StudentDetails {
  student_id: number;
  full_name: string;
  age: number | null;
  gender: string | null;
  email: string | null;
  contact_number: string | null;
  school: string | null;
  course_year: string | null;
}

// Validation function
export const validateSingleData = (data: unknown): SingleData => {
  return SingleSchema.parse(data);
};

// Safe validation function that returns errors
export const safeParseSingleData = (data: unknown) => {
  return SingleSchema.safeParse(data);
};

// Single Details Component
const SingleDetailsSheet = ({ single, onUpdate }: { single: SingleData; onUpdate?: (updatedSingle: SingleData) => void }) => {
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [studentDetails, setStudentDetails] = useState<StudentDetails | null>(null);
  const [loadingStudent, setLoadingStudent] = useState(false);
  const [formData, setFormData] = useState({
    performance_title: single.performance_title,
    performance_description: single.performance_description || '',
    student_id: single.student_id || '',
  });

  // Fetch student details when sheet opens and student_id is available
  useEffect(() => {
    if (open && single.student_id && !studentDetails) {
      const fetchStudentDetails = async () => {
        setLoadingStudent(true);
        try {
          const supabase = createClient();
          const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('student_id', single.student_id)
            .single();

          if (error) {
            console.error('Error fetching student details:', error);
          } else {
            setStudentDetails(data);
          }
        } catch (error) {
          console.error('Error fetching student:', error);
        } finally {
          setLoadingStudent(false);
        }
      };

      fetchStudentDetails();
    }
  }, [open, single.student_id, studentDetails]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Create updated single object
      const updatedSingle: SingleData = {
        ...single,
        performance_title: formData.performance_title,
        performance_description: formData.performance_description || null,
        student_id: formData.student_id ? parseInt(String(formData.student_id)) : null,
      };

      // Update in Supabase database
      const supabase = createClient();
      const { error } = await supabase
        .from('singles')
        .update({
          performance_title: updatedSingle.performance_title,
          performance_description: updatedSingle.performance_description,
          student_id: updatedSingle.student_id,
        })
        .eq('single_id', single.single_id);

      if (error) {
        console.error('Error updating single:', error);
        alert('Failed to update performance. Please try again.');
        return;
      }

      // Call the update function to refresh the UI
      if (onUpdate) {
        onUpdate(updatedSingle);
      }

      console.log('Performance updated successfully:', updatedSingle);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving performance:', error);
      alert('Failed to update performance. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setOpen(false); // Close the dialog immediately
    // Reset state after a short delay to avoid the flash
    setTimeout(() => {
      setFormData({
        performance_title: single.performance_title,
        performance_description: single.performance_description || '',
        student_id: single.student_id || '',
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
        View details
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between mb-4">
              <div>
                <DialogTitle className="text-2xl font-bold">
                  {isEditing ? "Edit Performance Information" : single.performance_title}
                </DialogTitle>
                <DialogDescription className="text-sm mt-1">
                  Performance ID: <span className="font-mono font-semibold text-slate-900">#{single.single_id}</span>
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
                    Single Performance
                  </Badge>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {isEditing ? (
              <div className="space-y-6">
                {/* Performance Information Card - Edit Mode */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-900">Performance Information</h3>
                  </div>
                  <div className="p-4 bg-white space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="performance_title" className="text-xs font-medium text-slate-700">Performance Title</Label>
                      <Input
                        id="performance_title"
                        value={formData.performance_title}
                        onChange={(e) => setFormData({ ...formData, performance_title: e.target.value })}
                        placeholder="Enter performance title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="performance_description" className="text-xs font-medium text-slate-700">Description</Label>
                      <Textarea
                        id="performance_description"
                        value={formData.performance_description}
                        onChange={(e) => setFormData({ ...formData, performance_description: e.target.value })}
                        rows={4}
                        placeholder="Describe the performance..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="student_id" className="text-xs font-medium text-slate-700">Student ID</Label>
                      <Input
                        id="student_id"
                        type="number"
                        value={formData.student_id}
                        onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                        placeholder="Enter student ID (optional)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Performance Information Card */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-900">Performance Information</h3>
                  </div>
                  <div className="p-4 bg-white space-y-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Performance Title</p>
                      <p className="text-base font-medium text-slate-900">{single.performance_title}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Description</p>
                      <p className="text-base font-medium text-slate-900 leading-relaxed">
                        {single.performance_description || <span className="text-slate-400">No description provided</span>}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Student Information Card */}
                {single.student_id && (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-900">Student Information</h3>
                    </div>
                    <div className="p-4 bg-white space-y-4">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Student ID</p>
                        <p className="text-base font-medium text-slate-900">
                          #{single.student_id}
                        </p>
                      </div>
                      {loadingStudent ? (
                        <div className="flex items-center gap-2 py-4">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900"></div>
                          <span className="text-sm text-slate-500">Loading student details...</span>
                        </div>
                      ) : studentDetails ? (
                        <>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Student Name</p>
                            <p className="text-base font-medium text-slate-900">
                              {studentDetails.full_name || "Not provided"}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Age</p>
                              <p className="text-base font-medium text-slate-900">
                                {studentDetails.age || "Not provided"}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Gender</p>
                              <Badge variant="outline" className="font-medium">
                                {studentDetails.gender || "Not specified"}
                              </Badge>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Email</p>
                            <p className="text-base font-medium text-slate-900 break-all">
                              {studentDetails.email || <span className="text-slate-400">Not provided</span>}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Contact Number</p>
                            <p className="text-base font-medium text-slate-900 font-mono">
                              {studentDetails.contact_number || <span className="text-slate-400">Not provided</span>}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">School</p>
                              <p className="text-base font-medium text-slate-900">
                                {studentDetails.school || <span className="text-slate-400">Not provided</span>}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Course/Year</p>
                              <p className="text-base font-medium text-slate-900">
                                {studentDetails.course_year || <span className="text-slate-400">Not provided</span>}
                              </p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-slate-400 italic">Student details not found</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Registration Information Card */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-900">Registration Information</h3>
                  </div>
                  <div className="p-4 bg-white space-y-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Performance ID</p>
                      <p className="text-base font-medium text-slate-900 font-mono">
                        #{single.single_id}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Created Date</p>
                      <p className="text-base font-medium text-slate-900">
                        {single.created_at
                          ? new Date(single.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                          : "Not available"
                        }
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Performance Type</p>
                      <Badge variant="secondary" className="font-medium">
                        {single.performance_title?.includes('Sing') ? 'Singing' :
                          single.performance_title?.includes('Danc') ? 'Dancing' :
                            single.performance_title?.includes('Instrument') ? 'Musical Instrument' :
                              single.performance_title?.includes('Spoken') || single.performance_title?.includes('Poetry') ? 'Spoken Word/Poetry' :
                                single.performance_title?.includes('Theatrical') || single.performance_title?.includes('Drama') ? 'Theatrical/Drama' :
                                  'Other'}
                      </Badge>
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

export const createColumns = (onUpdate?: (updatedSingle: SingleData) => void): ColumnDef<SingleData>[] => [
  {
    accessorKey: "single_id",
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
      <div className="font-mono text-sm text-left px-2 py-1">
        {row.getValue("single_id")}
      </div>
    ),
    size: 80,
  },
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
    accessorKey: "performance_description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.getValue("performance_description") as string;
      return (
        <div className="max-w-[250px] truncate text-sm text-muted-foreground">
          {description || "No description"}
        </div>
      );
    },
    size: 250,
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
            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard.writeText(single.single_id.toString())
              }
            >
              Copy performance ID
            </DropdownMenuItem>
            {single.student_id && (
              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard.writeText(single.student_id!.toString())
                }
              >
                Copy student ID
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <SingleDetailsSheet single={single} onUpdate={onUpdate} />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: 120,
  },
];

// Default export for backward compatibility
export const columns = createColumns();
