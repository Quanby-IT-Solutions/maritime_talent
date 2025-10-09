"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { SingleDataTable } from "@/components/single-performance/single-data-table";
import { createColumns } from "@/components/single-performance/single-column-def";
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
import { useSinglePerformances } from "@/hooks/use-single-performances";
import { useRealtimeSingles } from "@/provider/SupabaseRealtimeProvider";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function SinglesPerformancesPage() {
  // Use the hook for enriched data (with student joins)
  const { singles, loading, error, refetch } = useSinglePerformances();
  // Monitor realtime changes to trigger refetch
  const { data: realtimeSingles } = useRealtimeSingles();
  const [searchQuery, setSearchQuery] = useState("");

  // Track previous count to detect actual changes
  const prevCountRef = useRef(realtimeSingles.length);

  // Auto-refetch when realtime singles count changes (detects INSERT/DELETE)
  useEffect(() => {
    const currentCount = realtimeSingles.length;
    const prevCount = prevCountRef.current;

    // Only refetch if count actually changed (not on initial mount)
    if (currentCount !== prevCount && prevCount > 0) {
      console.log(`🔄 Realtime singles changed: ${prevCount} → ${currentCount}, refetching...`);
      refetch();
    }

    prevCountRef.current = currentCount;
  }, [realtimeSingles.length, refetch]);

  // Calculate statistics using useMemo
  const stats = useMemo(() => {
    const total = singles.length;
    const singing = singles.filter(s => s.performance_type === 'Singing').length;
    const dancing = singles.filter(s => s.performance_type === 'Dancing').length;
    const musicalInstrument = singles.filter(s => s.performance_type === 'Musical Instrument').length;
    const spokenWord = singles.filter(s => s.performance_type === 'Spoken Word/Poetry').length;
    const theatrical = singles.filter(s => s.performance_type === 'Theatrical/Drama').length;
    const other = singles.filter(s => s.performance_type === 'Other' || !s.performance_type).length;

    return { total, singing, dancing, musicalInstrument, spokenWord, theatrical, other };
  }, [singles]);

  // Filter singles based on search
  const filteredSingles = singles.filter((single) => {
    const matchesSearch =
      single.performance_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      single.student_name?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Export to CSV
  const exportToCSV = () => {
    try {
      // Prepare CSV data
      const headers = ["Single ID", "Performance Title", "Student Name", "School", "Performance Type", "Duration", "Created Date"];

      const rows = filteredSingles.map(single => [
        single.single_id,
        single.performance_title || "N/A",
        single.student_name || "N/A",
        single.student_school || "N/A",
        single.performance_type || "N/A",
        single.duration || "N/A",
        single.created_at ? new Date(single.created_at).toLocaleDateString() : "N/A"
      ]);

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
      link.setAttribute("download", `Maritime_Talent_Quest_Singles_Performances_${new Date().toISOString().split('T')[0]}.csv`);
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
      doc.text("Singles Performances Report", 148.5, 24, { align: "center" });

      // Add date and statistics
      doc.setFontSize(9);
      doc.setTextColor(220, 220, 220);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 148.5, 30, { align: "center" });

      // Add summary statistics box
      doc.setFillColor(248, 250, 252);
      doc.rect(10, 40, 277, 25, "F");

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");

      const statY = 48;
      doc.text(`Total Singles: ${stats.total}`, 20, statY);
      doc.text(`Singing: ${stats.singing}`, 70, statY);
      doc.text(`Dancing: ${stats.dancing}`, 120, statY);
      doc.text(`Musical: ${stats.musicalInstrument}`, 170, statY);

      doc.text(`Spoken Word: ${stats.spokenWord}`, 20, statY + 8);
      doc.text(`Theatrical: ${stats.theatrical}`, 70, statY + 8);
      doc.text(`Other: ${stats.other}`, 120, statY + 8);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(`Showing ${filteredSingles.length} of ${singles.length} singles`, 20, statY + 16);

      // Prepare table data
      const tableData = filteredSingles.map((single, index) => [
        (index + 1).toString(),
        single.performance_title || "N/A",
        single.student_name || "N/A",
        single.student_school || "N/A",
        single.performance_type || "N/A",
        single.duration || "N/A",
        single.created_at ? new Date(single.created_at).toLocaleDateString() : "N/A"
      ]);

      // Add main table
      autoTable(doc, {
        startY: 70,
        head: [["#", "Performance Title", "Student Name", "School", "Type", "Duration", "Date"]],
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
          1: { cellWidth: 60, fontStyle: "bold" },
          2: { cellWidth: 50 },
          3: { cellWidth: 50 },
          4: { cellWidth: 35 },
          5: { halign: "center", cellWidth: 25 },
          6: { halign: "center", cellWidth: 30 },
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

      // Save PDF
      doc.save(`Maritime_Talent_Quest_Singles_Performances_${new Date().toISOString().split('T')[0]}.pdf`);

      console.log("PDF export successful");
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      alert("Failed to export PDF. Please try again.");
    }
  };

  // Handle single updates - refetch to get latest data
  const handleSingleUpdate = () => {
    refetch();
  };

  return (
    <div className="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Singles Performances</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Maritime Talent Quest - Individual performances and talent showcase
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
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

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-semibold">Error:</p>
              <p className="text-sm">• {error}</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-3 grid-cols-2 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Singles</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Individual performances
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Singing</CardTitle>
            <UserPlus className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.singing}
            </div>
            <p className="text-xs text-muted-foreground">
              Vocal performances
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dancing</CardTitle>
            <UserPlus className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-600">
              {stats.dancing}
            </div>
            <p className="text-xs text-muted-foreground">
              Dance performances
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Musical</CardTitle>
            <UserPlus className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.musicalInstrument}
            </div>
            <p className="text-xs text-muted-foreground">
              Instrumental performances
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Singles Performances with Search and Pagination */}
      <Card>
        <CardHeader>
          <CardTitle>Singles Performances</CardTitle>
          <CardDescription>
            {filteredSingles.length} of {stats.total} singles shown
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Loading singles...</span>
              </div>
            </div>
          ) : (
            <SingleDataTable
              columns={createColumns(handleSingleUpdate)}
              data={filteredSingles}
              searchPlaceholder="Search by performance title or student name..."
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              showFilters={false}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}