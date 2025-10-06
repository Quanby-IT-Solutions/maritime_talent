"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Eye, Edit, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tables, PerformanceType } from "@/schema/schema";
import { z } from "zod";

// Zod schemas for validation
export const PerformanceSchema = z.object({
  performance_id: z.number(),
  student_id: z.number(),
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
  requirement_id: z.number(),
  student_id: z.number(),
  certification_url: z.string().nullable(),
  school_id_url: z.string().nullable(),
  uploaded_at: z.string().nullable(),
});

export const HealthFitnessSchema = z.object({
  declaration_id: z.number(),
  student_id: z.number(),
  is_physically_fit: z.boolean().nullable(),
  medical_conditions: z.string().nullable(),
  student_signature_url: z.string().nullable(),
  parent_guardian_signature_url: z.string().nullable(),
  declaration_date: z.string().nullable(),
});

export const ConsentsSchema = z.object({
  consent_id: z.number(),
  student_id: z.number(),
  info_correct: z.boolean().nullable(),
  agree_to_rules: z.boolean().nullable(),
  consent_to_publicity: z.boolean().nullable(),
  student_signature_url: z.string().nullable(),
  parent_guardian_signature_url: z.string().nullable(),
  consent_date: z.string().nullable(),
});

export const EndorsementsSchema = z.object({
  endorsement_id: z.number(),
  student_id: z.number(),
  school_official_name: z.string().nullable(),
  position: z.string().nullable(),
  signature_url: z.string().nullable(),
  endorsement_date: z.string().nullable(),
});

export const StudentSchema = z.object({
  student_id: z.number(),
  user_id: z.number().nullable(),
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

export const columns: ColumnDef<TalentData>[] = [
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
            <DropdownMenuItem className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              View details
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit registration
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: 80,
  },
];
