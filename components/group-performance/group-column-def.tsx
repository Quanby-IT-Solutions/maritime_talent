"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown, Eye, Edit, MoreHorizontal, Save, X, Users } from "lucide-react";
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
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Zod schema for group member validation
export const GroupMemberSchema = z.object({
  member_id: z.string(),
  full_name: z.string().min(1, "Full name is required"),
  role: z.string().min(1, "Role is required"),
  email: z.string().email("Valid email is required").nullable(),
  contact_number: z.string().nullable(),
  age: z.union([
    z.number().min(1, "Age must be positive").max(100, "Maximum age is 100"),
    z.null()
  ]).optional(),
  gender: z.string().nullable(),
  school: z.string().nullable().optional(),
  course_year: z.string().nullable().optional(),
  requirements: z.any().nullable().optional(),
  health: z.any().nullable().optional(),
  consents: z.any().nullable().optional(),
  endorsement: z.any().nullable().optional(),
  performance: z.any().nullable().optional(),
});

// Zod schema for group validation
export const GroupSchema = z.object({
  group_id: z.string(),
  group_name: z.string().min(1, "Group name is required"),
  performance_type: z.enum(["Musical", "Dance", "Drama"]),
  performance_date: z.string().nullable(),
  venue: z.string().nullable(),
  description: z.string().nullable(),
  group_members: z.array(GroupMemberSchema).optional(),
});

// Types
export type GroupMemberData = z.infer<typeof GroupMemberSchema>;
export type GroupData = z.infer<typeof GroupSchema>;

// Safe validation function
export const safeParseGroupData = (data: unknown) => {
  return GroupSchema.safeParse(data);
};

export const safeParseGroupMemberData = (data: unknown) => {
  return GroupMemberSchema.safeParse(data);
};

// Group Details Sheet Component
const GroupDetailsSheet = ({ group, onUpdate }: { group: GroupData; onUpdate?: (updatedGroup: GroupData) => void }) => {
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    group_name: group.group_name,
    performance_type: group.performance_type,
    performance_date: group.performance_date || '',
    venue: group.venue || '',
    description: group.description || '',
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Create updated group object
      const updatedGroup: GroupData = {
        ...group,
        group_name: formData.group_name,
        performance_type: formData.performance_type as "Musical" | "Dance" | "Drama",
        performance_date: formData.performance_date || null,
        venue: formData.venue || null,
        description: formData.description || null,
      };

      // Update in Supabase database (using the actual groups table structure)
      const supabase = createClient();
      const { error } = await supabase
        .from('groups')
        // @ts-expect-error - Supabase type inference issue with partial updates
        .update({
          group_name: updatedGroup.group_name,
          performance_title: updatedGroup.description, // Map description to performance_title
        })
        .eq('group_id', group.group_id);

      if (error) {
        console.error('Error updating group:', error);
        alert('Failed to update group. Please try again.');
        return;
      }

      // Call the update function to refresh the UI
      if (onUpdate) {
        onUpdate(updatedGroup);
      }

      console.log('Group updated successfully:', updatedGroup);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving group:', error);
      alert('Failed to update group. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setOpen(false); // Close the dialog immediately
    // Reset state after a short delay to avoid the flash
    setTimeout(() => {
      setFormData({
        group_name: group.group_name,
        performance_type: group.performance_type,
        performance_date: group.performance_date || '',
        venue: group.venue || '',
        description: group.description || '',
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
                  {isEditing ? "Edit Group Information" : group.group_name}
                </DialogTitle>
                <DialogDescription className="text-sm mt-1">
                  Group ID: <span className="font-mono font-semibold text-slate-900">#{group.group_id}</span>
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
                    {group.performance_type}
                  </Badge>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {isEditing ? (
              <div className="space-y-6">
                {/* Group Information Card - Edit Mode */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-900">Group Information</h3>
                  </div>
                  <div className="p-4 bg-white space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="group_name" className="text-xs font-medium text-slate-700">Group Name</Label>
                        <Input
                          id="group_name"
                          value={formData.group_name}
                          onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                          placeholder="Enter group name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="performance_type" className="text-xs font-medium text-slate-700">Performance Type</Label>
                        <Select value={formData.performance_type} onValueChange={(value) => setFormData({ ...formData, performance_type: value as "Musical" | "Dance" | "Drama" })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Musical">Musical</SelectItem>
                            <SelectItem value="Dance">Dance</SelectItem>
                            <SelectItem value="Drama">Drama</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="performance_date" className="text-xs font-medium text-slate-700">Performance Date</Label>
                      <Input
                        id="performance_date"
                        type="datetime-local"
                        value={formData.performance_date}
                        onChange={(e) => setFormData({ ...formData, performance_date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="venue" className="text-xs font-medium text-slate-700">Venue</Label>
                      <Input
                        id="venue"
                        value={formData.venue}
                        onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                        placeholder="Enter venue location"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-xs font-medium text-slate-700">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        placeholder="Describe the performance..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Group Information Card - View Mode */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-900">Group Information</h3>
                  </div>
                  <div className="p-4 bg-white space-y-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Performance Type</p>
                        <Badge variant="outline" className="font-medium">
                          {group.performance_type}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Members</p>
                        <p className="text-base font-medium text-slate-900">
                          {group.group_members?.length || 0} members
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Performance Date</p>
                      <p className="text-base font-medium text-slate-900">
                        {group.performance_date
                          ? new Date(group.performance_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                          : <span className="text-slate-400">Not scheduled</span>
                        }
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Venue</p>
                      <p className="text-base font-medium text-slate-900">
                        {group.venue || <span className="text-slate-400">Not specified</span>}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Description</p>
                      <p className="text-base font-medium text-slate-900 leading-relaxed">
                        {group.description || <span className="text-slate-400">No description provided</span>}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Group Members Card - View Mode */}
                {group.group_members && group.group_members.length > 0 && (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-900">Group Members ({group.group_members.length})</h3>
                    </div>
                    <div className="p-4 bg-white">
                      <div className="space-y-3">
                        {group.group_members.map((member) => (
                          <div key={member.member_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center">
                                <Users className="h-5 w-5 text-slate-600" />
                              </div>
                              <div>
                                <p className="font-medium text-sm text-slate-900">{member.full_name}</p>
                                <p className="text-xs text-slate-500">{member.role}</p>
                              </div>
                            </div>
                            {member.gender && (
                              <Badge variant="outline" className="text-xs font-medium">
                                {member.gender}
                              </Badge>
                            )}
                          </div>
                        ))}
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

export const createColumns = (onUpdate?: (updatedGroup: GroupData) => void): ColumnDef<GroupData>[] => [
  {
    accessorKey: "group_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Group Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium text-left">{row.getValue("group_name")}</div>
    ),
    size: 200,
  },
  {
    accessorKey: "performance_type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("performance_type") as string;
      return (
        <Badge
          variant="outline"
          className={`text-xs ${type === "Musical"
            ? "border-blue-200 text-blue-700 bg-blue-50"
            : type === "Dance"
              ? "border-pink-200 text-pink-700 bg-pink-50"
              : type === "Drama"
                ? "border-purple-200 text-purple-700 bg-purple-50"
                : ""
            }`}
        >
          {type}
        </Badge>
      );
    },
    size: 100,
    meta: {
      className: "hidden md:table-cell"
    },
  },
  {
    accessorKey: "group_members",
    header: "Members",
    cell: ({ row }) => {
      const members = row.getValue("group_members") as GroupMemberData[];
      return (
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{members?.length || 0}</span>
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
      const group = row.original;

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
                navigator.clipboard.writeText(group.group_id)
              }
            >
              Copy group ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <GroupDetailsSheet group={group} onUpdate={onUpdate} />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: 120,
  },
];

// Default export for backward compatibility
export const columns = createColumns();
