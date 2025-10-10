"use client";

import { useState, useMemo, useEffect } from "react";
import {
  useTalentDetails,
  useDeletePerformance,
} from "@/hooks/use-talent-details-api";
import { DataTable } from "@/components/talent-datatables/talent-data-table";
import { createColumns } from "@/components/talent-datatables/talent-column-def";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Users,
  CheckCircle,
  Clock,
  RefreshCw,
  Download,
  GraduationCap,
  Loader2,
  AlertCircle,
} from "lucide-react";
import type { PerformanceWithStudent } from "@/app/api/talent-details/types";
import { EditPerformanceModal } from "@/components/edit-performance-modal";
import { PerformanceInfoModal } from "@/components/performance-info-modal";

export default function TalentsDetailsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [performanceTypeFilter, setPerformanceTypeFilter] =
    useState<string>("all");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Use TanStack Query to fetch talent details
  const {
    data: talentsData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useTalentDetails({
    page: 1,
    limit: 100, // Get more data for server-side filtering
    search: debouncedSearch || undefined,
    performance_type:
      performanceTypeFilter !== "all"
        ? (performanceTypeFilter as
            | "Singing"
            | "Dancing"
            | "Musical Instrument"
            | "Spoken Word/Poetry"
            | "Theatrical/Drama"
            | "Other")
        : undefined,
    sort: "created_at",
    order: "desc",
  });

  // Delete performance mutation
  const deletePerformance = useDeletePerformance();

  // Calculate statistics from fetched data
  const stats = useMemo(() => {
    if (!talentsData?.data) {
      return { total: 0, singing: 0, dancing: 0, other: 0 };
    }

    const performances = talentsData.data;
    const total = performances.length;

    const singing = performances.filter(
      (p: PerformanceWithStudent) => p.performance_type === "Singing"
    ).length;
    const dancing = performances.filter(
      (p: PerformanceWithStudent) => p.performance_type === "Dancing"
    ).length;
    const other = performances.filter(
      (p: PerformanceWithStudent) =>
        p.performance_type !== "Singing" && p.performance_type !== "Dancing"
    ).length;

    return { total, singing, dancing, other };
  }, [talentsData]);

  // Handle refresh
  const handleRefresh = () => {
    refetch();
  };

  // State for modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [infoSheetOpen, setInfoSheetOpen] = useState(false);
  const [selectedPerformance, setSelectedPerformance] =
    useState<PerformanceWithStudent | null>(null);

  // Handle edit performance
  const handleEditPerformance = (performance: PerformanceWithStudent) => {
    setSelectedPerformance(performance);
    setEditModalOpen(true);
  };

  // Handle view details
  const handleViewDetails = (performance: PerformanceWithStudent) => {
    setSelectedPerformance(performance);
    setInfoSheetOpen(true);
  };

  // Handle delete performance
  const handleDeletePerformance = (performanceId: string) => {
    if (confirm("Are you sure you want to delete this performance?")) {
      deletePerformance.mutate(performanceId, {
        onSuccess: () => {
          toast.success("Performance deleted successfully");
        },
        onError: (error) => {
          toast.error(`Failed to delete performance: ${error.message}`);
        },
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Talent Details
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Maritime Talent Quest - Performance registrations with TanStack
            Query
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefetching}
            className="w-full sm:w-auto"
          >
            {isRefetching ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-semibold">Error loading data:</p>
              <p className="text-sm">{error.message}</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-3 grid-cols-2 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Performances
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Registered performances
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Singing</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.singing}
            </div>
            <p className="text-xs text-muted-foreground">
              Singing performances
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dancing</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.dancing}
            </div>
            <p className="text-xs text-muted-foreground">
              Dancing performances
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Others</CardTitle>
            <GraduationCap className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.other}
            </div>
            <p className="text-xs text-muted-foreground">Other performances</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Registrations</CardTitle>
          <CardDescription>
            {talentsData
              ? `${talentsData.data.length} performances loaded`
              : "Loading performances..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading performances...</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center space-y-2">
                <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Failed to load performances
                </p>
                <Button onClick={handleRefresh} variant="outline" size="sm">
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <DataTable
              columns={createColumns(
                handleEditPerformance,
                handleDeletePerformance,
                handleViewDetails
              )}
              data={talentsData?.data || []}
              searchPlaceholder="Search by student name, school, or performance title..."
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={performanceTypeFilter}
              onStatusFilterChange={setPerformanceTypeFilter}
              showFilters={true}
            />
          )}
        </CardContent>
      </Card>

      {/* Edit Performance Modal */}
      <EditPerformanceModal
        performance={selectedPerformance}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSuccess={() => {
          setEditModalOpen(false);
          setSelectedPerformance(null);
          refetch();
        }}
      />

      {/* Performance Info Modal */}
      <PerformanceInfoModal
        performance={selectedPerformance}
        open={infoSheetOpen}
        onOpenChange={setInfoSheetOpen}
      />
    </div>
  );
}
