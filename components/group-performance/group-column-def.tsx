"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown, Eye, Edit, MoreHorizontal, Save, X, Users, Music } from "lucide-react";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
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
          performance_title: updatedGroup.description,
        } as never)
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
      setEditOpen(false);
    } catch (error) {
      console.error('Error saving group:', error);
      alert('Failed to update group. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditOpen(false); // Close the dialog immediately
    // Reset state after a short delay to avoid the flash
    setTimeout(() => {
      setFormData({
        group_name: group.group_name,
        performance_type: group.performance_type,
        performance_date: group.performance_date || '',
        venue: group.venue || '',
        description: group.description || '',
      });
    }, 200);
  };

  return (
    <>
      <DropdownMenuItem
        className="flex items-center gap-2"
        onSelect={(e) => {
          e.preventDefault();
          setViewOpen(true);
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
        }}
      >
        <Edit className="h-4 w-4" />
        Edit Information
      </DropdownMenuItem>

      {/* View Modal */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="min-w-[55%] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {group.group_name}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 mt-4">
            {/* Group Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Group Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Group Name</p>
                    <p className="text-base font-semibold">{group.group_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Performance Type</p>
                    <Badge variant="secondary">{group.performance_type}</Badge>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Description</p>
                    <p className="text-base leading-relaxed">
                      {group.description || 'No description provided'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Members</p>
                    <p className="text-base font-medium">{group.group_members?.length || 0} members</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Group Members Card */}
            {group.group_members && group.group_members.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Group Members ({group.group_members.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="min-w-[55%] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold">Edit Group Information</DialogTitle>
              <div className="flex gap-2">
                <Button onClick={handleCancel} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="grid gap-6 mt-4">
            {/* Group Information Card - Edit Mode */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Group Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="group_name">Group Name</Label>
                    <Input
                      id="group_name"
                      value={formData.group_name}
                      onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                      placeholder="Enter group name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="performance_type">Performance Type</Label>
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
                  <Label htmlFor="performance_date">Performance Date</Label>
                  <Input
                    id="performance_date"
                    type="datetime-local"
                    value={formData.performance_date}
                    onChange={(e) => setFormData({ ...formData, performance_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="venue">Venue</Label>
                  <Input
                    id="venue"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="Enter venue location"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    placeholder="Describe the performance..."
                  />
                </div>
              </CardContent>
            </Card>
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
