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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { z } from "zod";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Zod schema for group member validation
export const GroupMemberSchema = z.object({
  member_id: z.number(),
  full_name: z.string().min(1, "Full name is required"),
  role: z.string().min(1, "Role is required"),
  email: z.string().email("Valid email is required").nullable(),
  contact_number: z.string().nullable(),
  age: z.number().min(18, "Minimum age is 18").max(100, "Maximum age is 100").nullable(),
  gender: z.string().nullable(),
});

// Zod schema for group validation
export const GroupSchema = z.object({
  group_id: z.number(),
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
        .update({
          group_name: updatedGroup.group_name,
          performance_title: updatedGroup.description, // Map description to performance_title
          performance_description: updatedGroup.description,
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
    setFormData({
      group_name: group.group_name,
      performance_type: group.performance_type,
      performance_date: group.performance_date || '',
      venue: group.venue || '',
      description: group.description || '',
    });
    setIsEditing(false);
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

      <Sheet open={open} onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) setIsEditing(false);
      }}>
        <SheetContent className="w-full max-w-2xl p-0 flex flex-col h-full">
          <div className="p-6 border-b bg-white">
            <SheetHeader className="text-left">
              <div className="flex items-start justify-between">
                <div>
                  <SheetTitle className="text-2xl font-bold tracking-tight mb-2">
                    {isEditing ? "Edit Group" : group.group_name}
                  </SheetTitle>
                  <SheetDescription className="text-base">
                    Group ID: <span className="font-mono font-semibold text-slate-900">#{group.group_id}</span>
                  </SheetDescription>
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
                    <>
                      <Badge variant="secondary" className="text-xs">
                        {group.performance_type}
                      </Badge>
                      <Button size="sm" onClick={() => setIsEditing(true)} variant="outline">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {isEditing ? (
              <div className="space-y-6">
                {/* Group Information */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Group Information</h3>
                  <div className="bg-slate-50 rounded-lg p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="group_name" className="text-xs font-medium text-slate-500 uppercase tracking-wide">Group Name</Label>
                        <Input
                          id="group_name"
                          value={formData.group_name}
                          onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="performance_type" className="text-xs font-medium text-slate-500 uppercase tracking-wide">Performance Type</Label>
                        <Select value={formData.performance_type} onValueChange={(value) => setFormData({ ...formData, performance_type: value as "Musical" | "Dance" | "Drama" })}>
                          <SelectTrigger className="mt-1">
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
                    <div>
                      <Label htmlFor="performance_date" className="text-xs font-medium text-slate-500 uppercase tracking-wide">Performance Date</Label>
                      <Input
                        id="performance_date"
                        type="datetime-local"
                        value={formData.performance_date}
                        onChange={(e) => setFormData({ ...formData, performance_date: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="venue" className="text-xs font-medium text-slate-500 uppercase tracking-wide">Venue</Label>
                      <Input
                        id="venue"
                        value={formData.venue}
                        onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description" className="text-xs font-medium text-slate-500 uppercase tracking-wide">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Group Information */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Group Information</h3>
                  <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Performance Type</p>
                        <Badge variant="outline" className="text-xs">
                          {group.performance_type}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Members</p>
                        <p className="text-sm font-semibold text-slate-900">
                          {group.group_members?.length || 0} members
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Performance Date</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {group.performance_date
                          ? new Date(group.performance_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                          : "Not scheduled"
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Venue</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {group.venue || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Description</p>
                      <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                        {group.description || "No description provided"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Group Members */}
                {group.group_members && group.group_members.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-4">Group Members</h3>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="space-y-3">
                        {group.group_members.map((member) => (
                          <div key={member.member_id} className="flex items-center justify-between p-3 bg-white rounded border">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                                <Users className="h-4 w-4 text-slate-600" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{member.full_name}</p>
                                <p className="text-xs text-slate-500">{member.role}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {member.gender || "N/A"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export const createColumns = (onUpdate?: (updatedGroup: GroupData) => void): ColumnDef<GroupData>[] => [
  {
    accessorKey: "group_id",
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
        {row.getValue("group_id")}
      </div>
    ),
    size: 80,
  },
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
  },
  {
    accessorKey: "performance_date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Performance Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("performance_date") as string;
      return (
        <div className="text-sm text-left px-2 py-1">
          {date ? new Date(date).toLocaleDateString() : "Not scheduled"}
        </div>
      );
    },
    size: 150,
  },
  {
    accessorKey: "venue",
    header: "Venue",
    cell: ({ row }) => {
      const venue = row.getValue("venue") as string;
      return (
        <div className="max-w-[200px] truncate text-sm">
          {venue || "Not specified"}
        </div>
      );
    },
    size: 200,
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
                navigator.clipboard.writeText(group.group_id.toString())
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
