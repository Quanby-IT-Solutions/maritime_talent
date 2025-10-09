"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/talent-datatables/talent-data-table";
import {
  createColumns,
  TalentData,
  safeParseTalentData,
} from "@/components/talent-datatables/talent-column-def";
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
  Clock,
  RefreshCw,
  Download,
  GraduationCap,
} from "lucide-react";

export default function TalentsDetailsPage() {
  const [talents, setTalents] = useState<TalentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "complete" | "partial" | "incomplete"
  >("all");
  const [stats, setStats] = useState({
    total: 0,
    complete: 0,
    partial: 0,
    incomplete: 0,
  });

  useEffect(() => {
    const fetchTalents = async () => {
      setLoading(true);

      try {
        // Mock data with comprehensive registration information
        const mockData = [
          {
            student_id: 1,
            user_id: 1,
            full_name: "Juan Carlos Santos",
            age: 20,
            gender: "Male",
            school: "Maritime Academy of Asia and the Pacific",
            course_year: "3rd Year Marine Engineering",
            contact_number: "+63 912 345 6789",
            email: "juan.santos@email.com",
            created_at: "2024-01-15T08:30:00Z",
            performances: [
              {
                performance_id: 1,
                student_id: 1,
                performance_type: "Singing" as const,
                title: "Sea Shanty Performance",
                duration: "5 minutes",
                num_performers: 1,
                group_members: null,
                created_at: "2024-01-15T08:30:00Z",
              },
            ],
            requirements: {
              requirement_id: 1,
              student_id: 1,
              certification_url: "https://example.com/cert1.pdf",
              school_id_url: "https://example.com/id1.pdf",
              uploaded_at: "2024-01-15T08:30:00Z",
            },
            health_fitness: {
              declaration_id: 1,
              student_id: 1,
              is_physically_fit: true,
              student_signature_url: "https://example.com/sig1.png",
              parent_guardian_signature_url:
                "https://example.com/parent_sig1.png",
              declaration_date: "2024-01-15T08:30:00Z",
            },
            consents: {
              consent_id: 1,
              student_id: 1,
              info_correct: true,
              agree_to_rules: true,
              consent_to_publicity: true,
              student_signature_url: "https://example.com/consent_sig1.png",
              parent_guardian_signature_url:
                "https://example.com/parent_consent1.png",
              consent_date: "2024-01-15T08:30:00Z",
            },
            endorsements: {
              endorsement_id: 1,
              student_id: 1,
              official_name: "Dr. Maria Rodriguez",
              position: "Dean of Marine Engineering",
            },
          },
          {
            student_id: 2,
            user_id: 2,
            full_name: "Maria Isabella Cruz",
            age: 19,
            gender: "Female",
            school: "Philippine Merchant Marine Academy",
            course_year: "2nd Year Marine Transportation",
            contact_number: "+63 917 654 3210",
            email: "maria.cruz@email.com",
            created_at: "2024-01-16T10:15:00Z",
            performances: [
              {
                performance_id: 2,
                student_id: 2,
                performance_type: "Dancing" as const,
                title: "Traditional Filipino Dance",
                duration: "8 minutes",
                num_performers: 4,
                group_members: "Ana, Ben, Carlos",
                created_at: "2024-01-16T10:15:00Z",
              },
            ],
            requirements: {
              requirement_id: 2,
              student_id: 2,
              certification_url: "https://example.com/cert2.pdf",
              school_id_url: null,
              uploaded_at: "2024-01-16T10:15:00Z",
            },
          },
          {
            student_id: 3,
            user_id: 3,
            full_name: "Robert James Wilson",
            age: 22,
            gender: "Male",
            school: "John B. Lacson Foundation Maritime University",
            course_year: "4th Year Marine Engineering",
            contact_number: "+63 909 876 5432",
            email: "robert.wilson@email.com",
            created_at: "2024-01-17T14:45:00Z",
            performances: [],
          },
        ];

        // Validate with Zod and collect errors
        const validatedData: TalentData[] = [];
        const errors: string[] = [];

        mockData.forEach((item, index) => {
          const result = safeParseTalentData(item);
          if (result.success) {
            validatedData.push(result.data);
          } else {
            errors.push(
              `Student ${index + 1}: ${result.error.issues
                .map((i) => i.message)
                .join(", ")}`
            );
          }
        });

        if (errors.length > 0) {
          setValidationErrors(errors);
        }

        setTalents(validatedData);

        // Calculate statistics
        const total = validatedData.length;
        let complete = 0,
          partial = 0,
          incomplete = 0;

        validatedData.forEach((talent) => {
          const sections = [
            !!talent.requirements,
            !!talent.health_fitness,
            !!talent.consents,
            !!talent.endorsements,
          ];
          const completedCount = sections.filter(Boolean).length;

          if (completedCount === 4) complete++;
          else if (completedCount > 1) partial++;
          else incomplete++;
        });

        setStats({ total, complete, partial, incomplete });
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTalents();
  }, []);

  // Handle talent updates
  const handleTalentUpdate = (updatedTalent: TalentData) => {
    setTalents(prevTalents => {
      const updatedTalents = prevTalents.map(talent =>
        talent.student_id === updatedTalent.student_id ? updatedTalent : talent
      );

      // Recalculate statistics
      const total = updatedTalents.length;
      let complete = 0, partial = 0, incomplete = 0;

      updatedTalents.forEach((talent) => {
        const sections = [
          !!talent.requirements,
          !!talent.health_fitness,
          !!talent.consents,
          !!talent.endorsements,
        ];
        const completedCount = sections.filter(Boolean).length;

        if (completedCount === 4) complete++;
        else if (completedCount > 1) partial++;
        else incomplete++;
      });

      setStats({ total, complete, partial, incomplete });
      return updatedTalents;
    });
  };

  // Filter talents based on search and status
  const filteredTalents = talents.filter((talent) => {
    const matchesSearch =
      talent.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      talent.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      talent.school?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (() => {
        const sections = [
          !!talent.requirements,
          !!talent.health_fitness,
          !!talent.consents,
          !!talent.endorsements,
        ];
        const completedCount = sections.filter(Boolean).length;

        if (statusFilter === "complete") return completedCount === 4;
        if (statusFilter === "partial")
          return completedCount > 1 && completedCount < 4;
        if (statusFilter === "incomplete") return completedCount <= 1;

        return true;
      })();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Talent Details</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Maritime Talent Quest - Student registrations with Zod validation
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
              <p className="font-semibold">Zod Validation Errors:</p>
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
            <CardTitle className="text-sm font-medium">Total Talents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Validated registrations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Complete</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.complete}
            </div>
            <p className="text-xs text-muted-foreground">
              All sections completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partial</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.partial}
            </div>
            <p className="text-xs text-muted-foreground">Partially completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incomplete</CardTitle>
            <GraduationCap className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.incomplete}
            </div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Talent Registrations with Search, Filter, and Pagination */}
      <Card>
        <CardHeader>
          <CardTitle>Talent Registrations</CardTitle>
          <CardDescription>
            {filteredTalents.length} of {stats.total} talents shown (validated
            with Zod)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Loading and validating talents...</span>
              </div>
            </div>
          ) : (
            <DataTable
              columns={createColumns(handleTalentUpdate)}
              data={filteredTalents}
              searchPlaceholder="Search by name, email, or school..."
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusFilterChange={(value) =>
                setStatusFilter(
                  value as "all" | "complete" | "partial" | "incomplete"
                )
              }
              showFilters={true}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
