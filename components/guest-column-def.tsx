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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
                    {isEditing ? "Edit Guest" : guest.full_name}
                  </SheetTitle>
                  <SheetDescription className="text-base">
                    Guest ID: <span className="font-mono font-semibold text-slate-900">#{guest.guest_id}</span>
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
                        {guest.gender || "Guest"}
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
                {/* Personal Information */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Personal Information</h3>
                  <div className="bg-slate-50 rounded-lg p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="full_name" className="text-xs font-medium text-slate-500 uppercase tracking-wide">Full Name</Label>
                        <Input
                          id="full_name"
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="age" className="text-xs font-medium text-slate-500 uppercase tracking-wide">Age</Label>
                        <Input
                          id="age"
                          type="number"
                          value={formData.age}
                          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="gender" className="text-xs font-medium text-slate-500 uppercase tracking-wide">Gender</Label>
                      <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                        <SelectTrigger className="mt-1">
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

                {/* Contact Information */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Contact Information</h3>
                  <div className="bg-slate-50 rounded-lg p-4 space-y-4">
                    <div>
                      <Label htmlFor="email" className="text-xs font-medium text-slate-500 uppercase tracking-wide">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact_number" className="text-xs font-medium text-slate-500 uppercase tracking-wide">Phone</Label>
                      <Input
                        id="contact_number"
                        value={formData.contact_number}
                        onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address" className="text-xs font-medium text-slate-500 uppercase tracking-wide">Address</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* Organization */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Organization</h3>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <Label htmlFor="organization" className="text-xs font-medium text-slate-500 uppercase tracking-wide">Affiliation</Label>
                    <Input
                      id="organization"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      className="mt-1"
                      placeholder="Organization name or 'Individual'"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Personal Information */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Personal Information</h3>
                  <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Age</p>
                        <p className="text-sm font-semibold text-slate-900">{guest.age || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Gender</p>
                        <Badge variant="outline" className="text-xs">
                          {guest.gender || "Not specified"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Contact Information</h3>
                  <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Email</p>
                      <p className="text-sm font-semibold text-slate-900 break-all">
                        {guest.email || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Phone</p>
                      <p className="text-sm font-semibold text-slate-900 font-mono">
                        {guest.contact_number || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Address</p>
                      <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                        {guest.address || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Organization */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Organization</h3>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Affiliation</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {guest.organization || "Individual"}
                    </p>
                  </div>
                </div>

                {/* Registration */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Registration</h3>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Registration Date</p>
                    <p className="text-sm font-semibold text-slate-900">
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
            )}
          </div>
        </SheetContent>
      </Sheet>
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
