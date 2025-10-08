"use client";

import { useState, useMemo, useEffect } from "react";
import { SingleDataTable } from "@/components/single-performance/single-data-table";
import { createColumns, SingleData } from "@/components/single-performance/single-column-def";
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
} from "lucide-react";
import { useSinglePerformances } from "@/hooks/use-single-performances";
import { useRealtimeSingles } from "@/provider/SupabaseRealtimeProvider";

export default function SinglesPerformancesPage() {
  const { singles, loading, error, refetch, updateSingle } = useSinglePerformances();
  const { data: realtimeSingles } = useRealtimeSingles();
  const [searchQuery, setSearchQuery] = useState("");
  const [performanceTypeFilter, setPerformanceTypeFilter] = useState<"all" | "Singing" | "Dancing" | "Musical Instrument" | "Spoken Word/Poetry" | "Theatrical/Drama" | "Other">("all");
  const [prevRealtimeLength, setPrevRealtimeLength] = useState(0);

  // Refetch when realtime detects changes in singles table
  useEffect(() => {
    // Only refetch if the length actually changed (not on initial mount)
    if (prevRealtimeLength > 0 && realtimeSingles.length !== prevRealtimeLength) {
      refetch();
    }
    setPrevRealtimeLength(realtimeSingles.length);
  }, [realtimeSingles.length]);

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

  // Handle single updates - just refetch the data
  const handleSingleUpdate = () => {
    refetch();
  };

  // Filter singles based on search
  const filteredSingles = singles.filter((single) => {
    const matchesSearch =
      single.performance_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      single.student_name?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

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
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
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