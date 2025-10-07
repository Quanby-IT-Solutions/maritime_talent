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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Eye, Edit, Save, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { GroupData, GroupMemberData } from "./group-column-def";

// Member Details Sheet Component
const MemberDetailsSheet = ({ member, groupId, onMemberUpdate }: { member: GroupMemberData; groupId: number; onMemberUpdate?: (updatedMember: GroupMemberData, groupId: number) => void }) => {
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
    setFormData({
      full_name: member.full_name,
      role: member.role,
      email: member.email || '',
      contact_number: member.contact_number || '',
      age: member.age || '',
      gender: member.gender || '',
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
        View member details
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
                    {isEditing ? "Edit Member" : member.full_name}
                  </SheetTitle>
                  <SheetDescription className="text-base">
                    Member ID: <span className="font-mono font-semibold text-slate-900">#{member.member_id}</span>
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
                        {member.role}
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
                {/* Member Information */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Member Information</h3>
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
                        <Label htmlFor="role" className="text-xs font-medium text-slate-500 uppercase tracking-wide">Role</Label>
                        <Input
                          id="role"
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
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
                      <Label htmlFor="contact_number" className="text-xs font-medium text-slate-500 uppercase tracking-wide">Contact Number</Label>
                      <Input
                        id="contact_number"
                        value={formData.contact_number}
                        onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Member Information */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Member Information</h3>
                  <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Role</p>
                        <Badge variant="outline" className="text-xs">
                          {member.role}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Age</p>
                        <p className="text-sm font-semibold text-slate-900">{member.age || "Not provided"}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Gender</p>
                      <Badge variant="outline" className="text-xs">
                        {member.gender || "Not specified"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Email</p>
                      <p className="text-sm font-semibold text-slate-900 break-all">
                        {member.email || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Contact Number</p>
                      <p className="text-sm font-semibold text-slate-900 font-mono">
                        {member.contact_number || "Not provided"}
                      </p>
                    </div>
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
  onMemberUpdate?: (updatedMember: GroupMemberData, groupId: number) => void;
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
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

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

  const toggleRowExpansion = (groupId: number) => {
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
