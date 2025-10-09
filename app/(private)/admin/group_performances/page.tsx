"use client";

import { useState, useEffect } from "react";
import { GroupDataTable } from "@/components/group-performance/group-data-table";
import { createColumns, GroupData, GroupMemberData, safeParseGroupData } from "@/components/group-performance/group-column-def";
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
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [loading, setLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [performanceTypeFilter, setPerformanceTypeFilter] = useState<"all" | "Musical" | "Dance" | "Drama">("all");
  const [stats, setStats] = useState({
    total: 0,
    musical: 0,
    dance: 0,
    drama: 0,
    totalMembers: 0,
  });

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
      doc.setFillColor(30, 64, 175); // Blue header
      doc.rect(0, 0, 297, 35, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("MARITIME TALENT QUEST 2025", 148.5, 15, { align: "center" });

      doc.setFontSize(14);
      doc.setFont("helvetica", "normal");
      doc.text("Group Performances Report", 148.5, 24, { align: "center" });

      // Add date and statistics
      doc.setFontSize(9);
      doc.setTextColor(220, 220, 220);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 148.5, 30, { align: "center" });

      // Add summary statistics box
      doc.setFillColor(248, 250, 252);
      doc.rect(10, 40, 277, 20, "F");

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");

      const statY = 48;
      doc.text(`Total Groups: ${stats.total}`, 20, statY);
      doc.text(`Musical: ${stats.musical}`, 80, statY);
      doc.text(`Dance: ${stats.dance}`, 130, statY);
      doc.text(`Drama: ${stats.drama}`, 180, statY);
      doc.text(`Total Members: ${stats.totalMembers}`, 230, statY);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(`Showing ${filteredGroups.length} of ${groups.length} groups`, 20, statY + 8);

      // Prepare table data
      const tableData = filteredGroups.map((group, index) => {
        const members = (group.group_members || []);
        const leader = members.find(m => m.role.toLowerCase().includes("leader"));

        return [
          (index + 1).toString(),
          group.group_name,
          group.performance_type,
          members.length.toString(),
          leader?.full_name || "N/A",
          group.description || "No description provided"
        ];
      });

      // Add main table
      autoTable(doc, {
        startY: 65,
        head: [["#", "Group Name", "Type", "Members", "Leader", "Description"]],
        body: tableData,
        theme: "striped",
        headStyles: {
          fillColor: [30, 64, 175],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: "bold",
          halign: "left",
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
          lineColor: [220, 220, 220],
          lineWidth: 0.1,
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        columnStyles: {
          0: { halign: "center", cellWidth: 10 },
          1: { cellWidth: 50, fontStyle: "bold" },
          2: { halign: "center", cellWidth: 25 },
          3: { halign: "center", cellWidth: 20 },
          4: { cellWidth: 40 },
          5: { cellWidth: 70 },
        },
        margin: { left: 10, right: 10 },
        didDrawPage: (data: { pageNumber: number }) => {
          // Footer
          const pageCount = doc.getNumberOfPages();
          const currentPage = data.pageNumber;

          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(
            `Page ${currentPage} of ${pageCount}`,
            148.5,
            doc.internal.pageSize.height - 10,
            { align: "center" }
          );

          doc.text(
            "Maritime Talent Quest © 2025",
            10,
            doc.internal.pageSize.height - 10
          );

          doc.text(
            "Confidential",
            doc.internal.pageSize.width - 10,
            doc.internal.pageSize.height - 10,
            { align: "right" }
          );
        },
      });

      // Add detailed member breakdown on new pages
      filteredGroups.forEach((group) => {
        const members = group.group_members || [];

        if (members.length > 0) {
          doc.addPage();

          // Group header
          doc.setFillColor(30, 64, 175);
          doc.rect(0, 0, 297, 25, "F");

          doc.setTextColor(255, 255, 255);
          doc.setFontSize(16);
          doc.setFont("helvetica", "bold");
          doc.text(group.group_name, 148.5, 12, { align: "center" });

          doc.setFontSize(11);
          doc.setFont("helvetica", "normal");
          doc.text(`${group.performance_type} Performance • ${members.length} Members`, 148.5, 19, { align: "center" });

          // Group details
          doc.setFillColor(248, 250, 252);
          doc.rect(10, 30, 277, 15, "F");

          doc.setTextColor(30, 41, 59);
          doc.setFontSize(9);
          doc.setFont("helvetica", "bold");
          doc.text("Description:", 15, 37);
          doc.setFont("helvetica", "normal");
          doc.text(group.description || "No description provided", 15, 42, {
            maxWidth: 267,
          });

          // Members table
          const memberData = members.map((member, idx) => [
            (idx + 1).toString(),
            member.full_name,
            member.role,
            member.email || "N/A",
            member.contact_number || "N/A",
            member.age?.toString() || "N/A",
            member.gender || "N/A",
          ]);

          autoTable(doc, {
            startY: 50,
            head: [["#", "Full Name", "Role", "Email", "Contact", "Age", "Gender"]],
            body: memberData,
            theme: "grid",
            headStyles: {
              fillColor: [30, 64, 175],
              textColor: [255, 255, 255],
              fontSize: 9,
              fontStyle: "bold",
            },
            styles: {
              fontSize: 8,
              cellPadding: 2.5,
            },
            columnStyles: {
              0: { halign: "center", cellWidth: 10 },
              1: { cellWidth: 45, fontStyle: "bold" },
              2: { cellWidth: 35 },
              3: { cellWidth: 50 },
              4: { cellWidth: 35 },
              5: { halign: "center", cellWidth: 15 },
              6: { halign: "center", cellWidth: 20 },
            },
            margin: { left: 10, right: 10 },
          });
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

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);

      try {
        // Fetch groups from API
        const response = await fetch('/api/group-performances');
        const data = await response.json();

        if (!data.success) {
          console.error('Error fetching groups:', data.error);
          setValidationErrors([`API error: ${data.error}`]);
          return;
        }

        console.log('[Groups] Fetched groups from API:', data.groups);

        // Use the groups with their members
        const dataToUse = data.groups;

        // Transform database data to match our expected structure
        const transformedData: GroupData[] = dataToUse.map((group: Record<string, unknown>) => {
          // Transform students to group members
          const students = (group.students as Array<Record<string, unknown>>) || [];
          const group_members = students.map((student: Record<string, unknown>) => {
            // IDs are UUIDs (strings) in the database
            const studentId = String(student.student_id || '');

            let age: number | null = null;
            if (student.age) {
              if (typeof student.age === 'number') {
                age = student.age;
              } else {
                const parsed = parseInt(String(student.age), 10);
                age = isNaN(parsed) ? null : parsed;
              }
            }

            console.log(`[Groups] Processing member:`, {
              student_id: student.student_id,
              parsed_member_id: studentId,
              age: student.age,
              parsed_age: age,
              full_name: student.full_name
            });

            return {
              member_id: studentId,
              full_name: String(student.full_name || ""),
              role: String(student.course_year || "Member"),
              email: student.email ? String(student.email) : null,
              contact_number: student.contact_number ? String(student.contact_number) : null,
              age: age,
              gender: student.gender ? String(student.gender) : null,
              school: student.school ? String(student.school) : null,
              course_year: student.course_year ? String(student.course_year) : null,
              // Include all detailed data from API
              requirements: student.requirements || null,
              health: student.health || null,
              consents: student.consents || null,
              endorsement: student.endorsement || null,
              performance: student.performance || null,
            };
          });

          // Map performance_type from DB (ensure it matches expected values)
          let performanceType: "Musical" | "Dance" | "Drama" = "Musical";
          if (group.performance_type === "Dancing") {
            performanceType = "Dance";
          } else if (group.performance_type === "Theatrical/Drama") {
            performanceType = "Drama";
          } else if (group.performance_type === "Musical Instrument" || group.performance_type === "Singing") {
            performanceType = "Musical";
          }

          // IDs are UUIDs (strings) in the database
          const groupId = String(group.group_id || '');

          console.log(`[Groups] Transformed group:`, {
            raw_group_id: group.group_id,
            parsed_group_id: groupId,
            group_name: group.group_name,
            members_count: group_members.length
          });

          return {
            group_id: groupId,
            group_name: String(group.group_name || ""),
            performance_type: performanceType,
            performance_date: null, // Not in DB schema
            venue: null, // Not in DB schema  
            description: String((group.performance_description || group.performance_title) || ""),
            group_members,
          };
        });

        console.log('[Groups] Transformed data:', transformedData);

        // Validate with Zod and collect errors
        const validatedData: GroupData[] = [];
        const errors: string[] = [];

        transformedData.forEach((item: unknown, index: number) => {
          const result = safeParseGroupData(item);
          if (result.success) {
            validatedData.push(result.data);
          } else {
            errors.push(
              `Group ${index + 1}: ${result.error.issues
                .map((i: { message: string }) => i.message)
                .join(", ")}`
            );
          }
        });

        if (errors.length > 0) {
          setValidationErrors(errors);
        }

        setGroups(validatedData);

        // Calculate statistics
        const total = validatedData.length;
        const musical = validatedData.filter(g => g.performance_type === "Musical").length;
        const dance = validatedData.filter(g => g.performance_type === "Dance").length;
        const drama = validatedData.filter(g => g.performance_type === "Drama").length;
        const totalMembers = validatedData.reduce((sum, group) => sum + (group.group_members?.length || 0), 0);

        setStats({ total, musical, dance, drama, totalMembers });
      } catch (error) {
        console.error("Error:", error);
        setValidationErrors([`Unexpected error: ${error instanceof Error ? error.message : String(error)}`]);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  // Handle group updates
  const handleGroupUpdate = async (updatedGroup: GroupData) => {
    setGroups(prevGroups => {
      const updatedGroups = prevGroups.map(group =>
        group.group_id === updatedGroup.group_id ? updatedGroup : group
      );

      // Recalculate statistics
      const total = updatedGroups.length;
      const musical = updatedGroups.filter(g => g.performance_type === "Musical").length;
      const dance = updatedGroups.filter(g => g.performance_type === "Dance").length;
      const drama = updatedGroups.filter(g => g.performance_type === "Drama").length;
      const totalMembers = updatedGroups.reduce((sum, group) => sum + (group.group_members?.length || 0), 0);

      setStats({ total, musical, dance, drama, totalMembers });
      return updatedGroups;
    });
  };

  // Handle member updates - update local state like guest list does
  const handleMemberUpdate = (updatedMember: GroupMemberData, groupId: string) => {
    setGroups(prevGroups => {
      const updatedGroups = prevGroups.map(group => {
        if (group.group_id === groupId) {
          // Update the specific member in the group
          const updatedMembers = group.group_members?.map(member =>
            member.member_id === updatedMember.member_id ? updatedMember : member
          ) || [updatedMember];

          return {
            ...group,
            group_members: updatedMembers
          };
        }
        return group;
      });

      // Recalculate statistics
      const total = updatedGroups.length;
      const musical = updatedGroups.filter(g => g.performance_type === "Musical").length;
      const dance = updatedGroups.filter(g => g.performance_type === "Dance").length;
      const drama = updatedGroups.filter(g => g.performance_type === "Drama").length;
      const totalMembers = updatedGroups.reduce((sum, group) => sum + (group.group_members?.length || 0), 0);

      setStats({ total, musical, dance, drama, totalMembers });
      return updatedGroups;
    });
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
            onClick={() => window.location.reload()}
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
