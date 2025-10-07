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
import { z } from "zod";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Zod schema for guest validation
export const GuestSchema = z.object({
  guest_id: z.number(),
  full_name: z.string().min(1, "Full name is required"),
  age: z
    .number()
    .min(18, "Minimum age is 18")
    .max(100, "Maximum age is 100")
    .nullable(),
  gender: z.string().nullable(),
  contact_number: z
    .string()
    .regex(/^[0-9+\-\s()]+$/, "Invalid phone number format")
    .nullable(),
  email: z.string().email("Valid email is required").nullable(),
  organization: z.string().nullable(),
  address: z.string().nullable(),
  registration_date: z.string().nullable(),
});

// Type for guest data
export type GuestData = z.infer<typeof GuestSchema>;

// Validation function
export const validateGuestData = (data: unknown): GuestData => {
  return GuestSchema.parse(data);
};

// Safe validation function that returns errors
export const safeParseGuestData = (data: unknown) => {
  return GuestSchema.safeParse(data);
};

// Guest Details Component
const GuestDetailsSheet = ({ guest, onUpdate }: { guest: GuestData; onUpdate?: (updatedGuest: GuestData) => void }) => {
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: guest.full_name,
    age: guest.age || '',
    gender: guest.gender || '',
    email: guest.email || '',
    contact_number: guest.contact_number || '',
    address: guest.address || '',
    organization: guest.organization || '',
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Create updated guest object
      const updatedGuest: GuestData = {
        ...guest,
        full_name: formData.full_name,
        age: formData.age ? parseInt(String(formData.age)) : null,
        gender: formData.gender || null,
        email: formData.email || null,
        contact_number: formData.contact_number || null,
        address: formData.address || null,
        organization: formData.organization || null,
      };

      // Update in Supabase database
      const supabase = createClient();
      const { error } = await supabase
        .from('guests')
        .update({
          full_name: updatedGuest.full_name,
          age: updatedGuest.age,
          gender: updatedGuest.gender,
          email: updatedGuest.email,
          contact_number: updatedGuest.contact_number,
          address: updatedGuest.address,
          organization: updatedGuest.organization,
        })
        .eq('guest_id', guest.guest_id);

      if (error) {
        console.error('Error updating guest:', error);
        alert('Failed to update guest. Please try again.');
        return;
      }

      // Call the update function to refresh the UI
      if (onUpdate) {
        onUpdate(updatedGuest);
      }

      console.log('Guest updated successfully:', updatedGuest);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving guest:', error);
      alert('Failed to update guest. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setOpen(false); // Close the dialog immediately
    // Reset state after a short delay to avoid the flash
    setTimeout(() => {
      setFormData({
        full_name: guest.full_name,
        age: guest.age || '',
        gender: guest.gender || '',
        email: guest.email || '',
        contact_number: guest.contact_number || '',
        address: guest.address || '',
        organization: guest.organization || '',
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
                  {isEditing ? "Edit Guest Information" : guest.full_name}
                </DialogTitle>
                <DialogDescription className="text-sm mt-1">
                  Guest ID: <span className="font-mono font-semibold text-slate-900">#{guest.guest_id}</span>
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
                    {guest.gender || "Guest"}
                  </Badge>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {isEditing ? (
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
                        <Input
                          id="full_name"
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          placeholder="Enter full name"
                        />
                      </div>
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
                </div>

                {/* Contact Information Card - Edit Mode */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-900">Contact Information</h3>
                  </div>
                  <div className="p-4 bg-white space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs font-medium text-slate-700">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact_number" className="text-xs font-medium text-slate-700">Phone Number</Label>
                      <Input
                        id="contact_number"
                        value={formData.contact_number}
                        onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-xs font-medium text-slate-700">Address</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        rows={3}
                        placeholder="Enter full address"
                      />
                    </div>
                  </div>
                </div>

                {/* Organization Card - Edit Mode */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-900">Organization</h3>
                  </div>
                  <div className="p-4 bg-white">
                    <div className="space-y-2">
                      <Label htmlFor="organization" className="text-xs font-medium text-slate-700">Affiliation</Label>
                      <Input
                        id="organization"
                        value={formData.organization}
                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                        placeholder="Organization name or 'Individual'"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
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
                        <p className="text-base font-medium text-slate-900">{guest.age || "Not provided"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Gender</p>
                        <div>
                          <Badge variant="outline" className="font-medium">
                            {guest.gender || "Not specified"}
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
                        {guest.email || <span className="text-slate-400">Not provided</span>}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Phone Number</p>
                      <p className="text-base font-medium text-slate-900 font-mono">
                        {guest.contact_number || <span className="text-slate-400">Not provided</span>}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Address</p>
                      <p className="text-base font-medium text-slate-900 leading-relaxed">
                        {guest.address || <span className="text-slate-400">Not provided</span>}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Organization & Registration Card */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-900">Additional Information</h3>
                  </div>
                  <div className="p-4 bg-white space-y-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Organization</p>
                      <p className="text-base font-medium text-slate-900">
                        {guest.organization || "Individual"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Registration Date</p>
                      <p className="text-base font-medium text-slate-900">
                        {guest.registration_date
                          ? new Date(guest.registration_date).toLocaleDateString('en-US', {
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

export const createColumns = (onUpdate?: (updatedGuest: GuestData) => void): ColumnDef<GuestData>[] => [
  {
    accessorKey: "guest_id",
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
        {row.getValue("guest_id")}
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
    cell: ({ row }) => {
      const email = row.getValue("email") as string;
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="lowercase truncate max-w-[200px]">
            {email || "Not provided"}
          </span>
        </div>
      );
    },
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
      return <div className="text-left px-2 py-1">{age || "N/A"}</div>;
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
        <Badge
          variant="outline"
          className={`text-xs ${gender === "Male"
            ? "border-blue-200 text-blue-700 bg-blue-50"
            : gender === "Female"
              ? "border-pink-200 text-pink-700 bg-pink-50"
              : ""
            }`}
        >
          {gender || "Not specified"}
        </Badge>
      );
    },
    size: 100,
  },
  {
    accessorKey: "contact_number",
    header: "Contact",
    cell: ({ row }) => {
      const contact = row.getValue("contact_number") as string;
      return (
        <div className="flex items-center gap-2 text-sm">
          <span className="font-mono">
            {contact || "Not provided"}
          </span>
        </div>
      );
    },
    size: 140,
    meta: {
      className: "hidden lg:table-cell"
    },
  },
  {
    accessorKey: "organization",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Organization
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const organization = row.getValue("organization") as string;
      return (
        <div className="max-w-[200px] truncate text-sm">
          {organization ? (
            <Badge variant="secondary" className="text-xs">
              {organization}
            </Badge>
          ) : (
            <span className="text-muted-foreground">Individual</span>
          )}
        </div>
      );
    },
    size: 200,
    meta: {
      className: "hidden lg:table-cell"
    },
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => {
      const address = row.getValue("address") as string;
      return (
        <div className="flex items-center gap-2 max-w-[250px]">
          <span className="text-sm truncate">
            {address || "Not provided"}
          </span>
        </div>
      );
    },
    size: 250,
    meta: {
      className: "hidden xl:table-cell"
    },
  },
  {
    accessorKey: "registration_date",
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
      const date = row.getValue("registration_date") as string;
      return (
        <div className="text-sm text-muted-foreground text-left">
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
      const guest = row.original;

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
                navigator.clipboard.writeText(guest.guest_id.toString())
              }
            >
              Copy guest ID
            </DropdownMenuItem>
            {guest.email && (
              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard.writeText(guest.email!)
                }
              >
                Copy email
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <GuestDetailsSheet guest={guest} onUpdate={onUpdate} />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: 120,
  },
];

// Default export for backward compatibility
export const columns = createColumns();
