"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import type { PerformanceWithStudent } from "@/app/api/talent-details/types";

// Helper function to get performance type badge variant
const getPerformanceTypeBadge = (type: string) => {
  switch (type) {
    case "Singing":
      return <Badge variant="default">{type}</Badge>;
    case "Dancing":
      return <Badge variant="secondary">{type}</Badge>;
    case "Musical Instrument":
      return <Badge variant="outline">{type}</Badge>;
    case "Spoken Word/Poetry":
      return <Badge variant="destructive">{type}</Badge>;
    case "Theatrical/Drama":
      return <Badge>{type}</Badge>;
    default:
      return <Badge variant="outline">{type || "Other"}</Badge>;
  }
};

export const createColumns = (
  onEdit?: (performance: PerformanceWithStudent) => void,
  onDelete?: (performanceId: string) => void
): ColumnDef<PerformanceWithStudent>[] => [
  {
    accessorKey: "student.full_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Student Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const student = row.original.student;
      return (
        <div className="font-medium">
          <div>{student.full_name}</div>
          <div className="text-sm text-muted-foreground">
            {student.age} years • {student.gender}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Performance Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div>
          <div className="font-medium">
            {row.getValue("title") || "Untitled"}
          </div>
          <div className="text-sm text-muted-foreground">
            {row.original.duration || "No duration specified"}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "performance_type",
    header: "Type",
    cell: ({ row }) => {
      return getPerformanceTypeBadge(row.getValue("performance_type"));
    },
  },
  {
    accessorKey: "num_performers",
    header: "Performers",
    cell: ({ row }) => {
      const numPerformers = row.getValue("num_performers") as number;
      const groupMembers = row.original.group_members;

      return (
        <div>
          <div className="font-medium">{numPerformers || 1}</div>
          {groupMembers && (
            <div className="text-xs text-muted-foreground">
              Group: {groupMembers}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "student.school",
    header: "School",
    cell: ({ row }) => {
      const student = row.original.student;
      return (
        <div>
          <div className="font-medium text-sm">{student.school}</div>
          <div className="text-xs text-muted-foreground">
            {student.course_year}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "student.email",
    header: "Contact",
    cell: ({ row }) => {
      const student = row.original.student;
      return (
        <div>
          <div className="text-sm">{student.email}</div>
          <div className="text-xs text-muted-foreground">
            {student.contact_number}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "performance_created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Registered
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("performance_created_at") as string;
      return (
        <div className="text-sm">
          {date ? new Date(date).toLocaleDateString() : "N/A"}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const performance = row.original;

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
                navigator.clipboard.writeText(performance.performance_id)
              }
            >
              Copy performance ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit?.(performance)}>
              Edit performance
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete?.(performance.performance_id)}
              className="text-destructive"
            >
              Delete performance
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
