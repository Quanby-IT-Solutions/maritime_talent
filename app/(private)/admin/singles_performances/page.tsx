"use client";

import { useState, useEffect } from "react";
import { SingleDataTable } from "@/components/single-data-table";
import { createColumns, SingleData, safeParseSingleData } from "@/components/single-column-def";
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
import { createClient } from "@/lib/supabase/client";

export default function SinglesPerformancesPage() {
  const [singles, setSingles] = useState<SingleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [performanceTypeFilter, setPerformanceTypeFilter] = useState<"all" | "Singing" | "Dancing" | "Musical Instrument" | "Spoken Word/Poetry" | "Theatrical/Drama" | "Other">("all");
  const [stats, setStats] = useState({
    total: 0,
    singing: 0,
    dancing: 0,
    musicalInstrument: 0,
    spokenWord: 0,
    theatrical: 0,
    other: 0,
  });

  useEffect(() => {
    const fetchSingles = async () => {
      setLoading(true);

      try {
        const supabase = createClient();

        // Fetch singles from Supabase
        const { data: singlesData, error: singlesError } = await supabase
          .from('singles')
          .select('*')
          .order('single_id', { ascending: false });

        if (singlesError) {
          console.error('Error fetching singles:', singlesError);
          setValidationErrors([`Database error: ${singlesError.message}`]);
          return;
        }

        // Fetch students separately and match by sid (single_id)
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('student_id, full_name, school, sid')
          .not('sid', 'is', null);

        if (studentsError) {
          console.error('Error fetching students:', studentsError);
          setValidationErrors([`Database error: ${studentsError.message}`]);
          return;
        }

        // Create a map of single_id to student data
        const studentMap = new Map();
        (studentsData || []).forEach((student: Record<string, unknown>) => {
          if (student.sid) {
            studentMap.set(student.sid, student);
          }
        });

        // Transform database data to match our expected structure
        const transformedData: SingleData[] = (singlesData || []).map((single: Record<string, unknown>) => {
          const singleId = single.single_id as number;
          const studentData = studentMap.get(singleId);

          return {
            id: singleId, // Add id property for DataTable
            single_id: singleId,
            performance_title: single.performance_title as string || "Untitled Performance",
            performance_description: single.performance_description as string || null,
            student_id: single.student_id as number || null,
            created_at: single.created_at as string || null,
            student_name: studentData?.full_name as string || null,
            student_school: studentData?.school as string || null,
          };
        });

        // Validate with Zod and collect errors
        const validatedData: SingleData[] = [];
        const errors: string[] = [];

        transformedData.forEach((item: unknown, index: number) => {
          const result = safeParseSingleData(item);
          if (result.success) {
            validatedData.push(result.data);
          } else {
            errors.push(
              `Single ${index + 1}: ${result.error.issues
                .map((i: { message: string }) => i.message)
                .join(", ")}`
            );
          }
        });

        if (errors.length > 0) {
          setValidationErrors(errors);
        }

        setSingles(validatedData);

        // Calculate statistics
        const total = validatedData.length;
        const singing = validatedData.filter(s => s.performance_title?.toLowerCase().includes('sing')).length;
        const dancing = validatedData.filter(s => s.performance_title?.toLowerCase().includes('danc')).length;
        const musicalInstrument = validatedData.filter(s => s.performance_title?.toLowerCase().includes('instrument')).length;
        const spokenWord = validatedData.filter(s => s.performance_title?.toLowerCase().includes('spoken') || s.performance_title?.toLowerCase().includes('poetry')).length;
        const theatrical = validatedData.filter(s => s.performance_title?.toLowerCase().includes('theatrical') || s.performance_title?.toLowerCase().includes('drama')).length;
        const other = total - singing - dancing - musicalInstrument - spokenWord - theatrical;

        setStats({ total, singing, dancing, musicalInstrument, spokenWord, theatrical, other });
      } catch (error) {
        console.error("Error:", error);
        setValidationErrors([`Unexpected error: ${error instanceof Error ? error.message : String(error)}`]);
      } finally {
        setLoading(false);
      }
    };

    fetchSingles();
  }, []);

  // Handle single updates
  const handleSingleUpdate = (updatedSingle: SingleData) => {
    setSingles(prevSingles => {
      const updatedSingles = prevSingles.map(single =>
        single.id === updatedSingle.id ? updatedSingle : single
      );

      // Recalculate statistics
      const total = updatedSingles.length;
      const singing = updatedSingles.filter(s => s.performance_title?.toLowerCase().includes('sing')).length;
      const dancing = updatedSingles.filter(s => s.performance_title?.toLowerCase().includes('danc')).length;
      const musicalInstrument = updatedSingles.filter(s => s.performance_title?.toLowerCase().includes('instrument')).length;
      const spokenWord = updatedSingles.filter(s => s.performance_title?.toLowerCase().includes('spoken') || s.performance_title?.toLowerCase().includes('poetry')).length;
      const theatrical = updatedSingles.filter(s => s.performance_title?.toLowerCase().includes('theatrical') || s.performance_title?.toLowerCase().includes('drama')).length;
      const other = total - singing - dancing - musicalInstrument - spokenWord - theatrical;

      setStats({ total, singing, dancing, musicalInstrument, spokenWord, theatrical, other });
      return updatedSingles;
    });
  };

  // Filter singles based on search
  const filteredSingles = singles.filter((single) => {
    const matchesSearch =
      single.performance_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      single.performance_description?.toLowerCase().includes(searchQuery.toLowerCase());

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
            onClick={() => window.location.reload()}
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
              searchPlaceholder="Search by performance title or description..."
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