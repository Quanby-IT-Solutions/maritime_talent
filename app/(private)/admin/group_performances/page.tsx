"use client";

import { useState } from "react";
import { GroupDataTable } from "@/components/group-performance/group-data-table";
import { createColumns, GroupData, GroupMemberData } from "@/components/group-performance/group-column-def";
import { useGroupPerformances } from "@/hooks/use-group-performance";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Users,
  CheckCircle,
  RefreshCw,
  Download,
  UserPlus,
  FileDown,
  FileText,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function GroupPerformancesPage() {
  // Use the custom hook
  const {
    groups,
    loading,
    error,
    validationErrors,
    stats,
    refetch,
    updateGroup,
    updateMember,
    deleteGroup,
  } = useGroupPerformances();

  const [searchQuery, setSearchQuery] = useState("");
  const [performanceTypeFilter, setPerformanceTypeFilter] = useState<"all" | "Musical" | "Dance" | "Drama">("all");

  // Export to CSV
  const exportToCSV = () => {
    try {
      // Prepare CSV data
      const headers = ["Group ID", "Group Name", "Performance Type", "Description", "Total Members", "Members"];

      const rows = filteredGroups.map(group => {
        const members = (group.group_members || [])
          .map(m => `${m.full_name} (${m.role})`)
          .join("; ");

        return [
          group.group_id,
          group.group_name,
          group.performance_type,
          group.description || "N/A",
          (group.group_members || []).length.toString(),
          members || "No members"
        ];
      });

      // Create CSV content
      const csvContent = [
        headers.join(","),
        ...rows.map(row =>
          row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        )
      ].join("\n");

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", `Maritime_Talent_Quest_Group_Performances_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("CSV export successful");
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      alert("Failed to export CSV. Please try again.");
    }
  };

  // Export to PDF
  const exportToPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Add header with logo/title
      doc.setFillColor(30, 64, 175);
      doc.rect(0, 0, 297, 30, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("MARITIME TALENT QUEST 2025", 148.5, 12, { align: "center" });

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Group Performances Report", 148.5, 20, { align: "center" });

      doc.setFontSize(8);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 148.5, 26, { align: "center" });

      let currentY = 40;

      // Iterate through each group
      filteredGroups.forEach((group, groupIndex) => {
        const members = group.group_members || [];

        // Check if we need a new page
        if (currentY > 180) {
          doc.addPage();
          currentY = 20;
        }

        // GROUP HEADER (Parent Row)
        doc.setFillColor(30, 64, 175);
        doc.rect(10, currentY, 277, 10, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(`${groupIndex + 1}. ${group.group_name}`, 15, currentY + 7);

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(`${group.performance_type} • ${members.length} Members`, 250, currentY + 7, { align: "right" });

        currentY += 10;

        // MEMBERS TABLE (Child Rows)
        if (members.length > 0) {
          const memberData = members.map((member, idx) => [
            (idx + 1).toString(),
            member.full_name,
            member.role,
            member.age?.toString() || "N/A",
            member.gender || "N/A",
            member.email || "N/A",
            member.contact_number || "N/A",
          ]);

          autoTable(doc, {
            startY: currentY,
            head: [["#", "Name", "Role", "Age", "Gender", "Email", "Contact"]],
            body: memberData,
            theme: "grid",
            headStyles: {
              fillColor: [71, 85, 105],
              textColor: [255, 255, 255],
              fontSize: 8,
              fontStyle: "bold",
              cellPadding: 2,
            },
            styles: {
              fontSize: 8,
              cellPadding: 2,
              lineColor: [200, 200, 200],
              lineWidth: 0.1,
            },
            columnStyles: {
              0: { halign: "center", cellWidth: 10 },
              1: { cellWidth: 45, fontStyle: "bold" },
              2: { cellWidth: 35 },
              3: { halign: "center", cellWidth: 15 },
              4: { halign: "center", cellWidth: 20 },
              5: { cellWidth: 60 },
              6: { cellWidth: 35 },
            },
            margin: { left: 15, right: 10 },
            didDrawPage: () => {
              // Footer
              doc.setFontSize(8);
              doc.setTextColor(100, 100, 100);
              doc.text(
                `Maritime Talent Quest © 2025`,
                10,
                doc.internal.pageSize.height - 10
              );
              doc.text(
                `Page ${doc.internal.pages.length - 1}`,
                148.5,
                doc.internal.pageSize.height - 10,
                { align: "center" }
              );
              doc.text(
                "Confidential",
                doc.internal.pageSize.width - 10,
                doc.internal.pageSize.height - 10,
                { align: "right" }
              );
            },
          });

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          currentY = (doc as any).lastAutoTable.finalY + 8;
        } else {
          // No members
          doc.setTextColor(100, 100, 100);
          doc.setFontSize(9);
          doc.setFont("helvetica", "italic");
          doc.text("No members in this group", 20, currentY + 5);
          currentY += 13;
        }
      });

      // Save PDF
      doc.save(`Maritime_Talent_Quest_Group_Performances_${new Date().toISOString().split('T')[0]}.pdf`);

      console.log("PDF export successful");
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      alert("Failed to export PDF. Please try again.");
    }
  };

  // All data fetching is now handled by the hook

  // Handle group updates - now using the hook
  const handleGroupUpdate = async (updatedGroup: GroupData) => {
    const result = await updateGroup(updatedGroup);
    if (!result.success) {
      console.error('Failed to update group:', result.error);
      alert(`Failed to update group: ${result.error}`);
    }
  };

  // Handle member updates - now using the hook
  const handleMemberUpdate = async (updatedMember: GroupMemberData, groupId: string) => {
    const result = await updateMember(updatedMember, groupId);
    if (!result.success) {
      console.error('Failed to update member:', result.error);
      alert(`Failed to update member: ${result.error}`);
    }
  };

  // Filter groups based on search and performance type
  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      group.group_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.performance_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.venue?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = performanceTypeFilter === "all" || group.performance_type === performanceTypeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Group Performances</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Maritime Talent Quest - Group performances and member management
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="w-full sm:w-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Export Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={exportToPDF} className="cursor-pointer">
                <FileDown className="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToCSV} className="cursor-pointer">
                <FileText className="h-4 w-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Validation Errors Alert */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-semibold">Validation Errors:</p>
              {validationErrors.map((error, index) => (
                <p key={index} className="text-sm">
                  • {error}
                </p>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-3 grid-cols-2 sm:gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Performance groups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Musical</CardTitle>
            <UserPlus className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.musical}
            </div>
            <p className="text-xs text-muted-foreground">
              Musical groups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dance</CardTitle>
            <UserPlus className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-600">
              {stats.dance}
            </div>
            <p className="text-xs text-muted-foreground">
              Dance groups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drama</CardTitle>
            <UserPlus className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.drama}
            </div>
            <p className="text-xs text-muted-foreground">
              Drama groups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.totalMembers}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all groups
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Group Performances with Search, Filter, and Pagination */}
      <Card>
        <CardHeader>
          <CardTitle>Group Performances</CardTitle>
          <CardDescription>
            {filteredGroups.length} of {stats.total} groups shown
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Loading groups...</span>
              </div>
            </div>
          ) : (
            <GroupDataTable
              columns={createColumns(handleGroupUpdate)}
              data={filteredGroups}
              searchPlaceholder="Search by group name, performance type, venue, or description..."
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={performanceTypeFilter}
              onStatusFilterChange={(value) =>
                setPerformanceTypeFilter(value as "all" | "Musical" | "Dance" | "Drama")
              }
              showFilters={true}
              onUpdate={handleGroupUpdate}
              onMemberUpdate={handleMemberUpdate}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
