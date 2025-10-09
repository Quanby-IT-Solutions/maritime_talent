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
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);

      try {
        const supabase = createClient();

        // Fetch groups from Supabase
        const { data: groupsData, error: groupsError } = await supabase
          .from('groups')
          .select('*')
          .order('group_id', { ascending: false });

        if (groupsError) {
          console.error('Error fetching groups:', groupsError);
          setValidationErrors([`Database error: ${groupsError.message}`]);
          return;
        }

        console.log('[Groups] Raw groups data from DB:', groupsData);

        // Fetch students for each group via group_members junction table
        const groupsWithMembers = await Promise.all(
          (groupsData || []).map(async (group: Record<string, unknown>) => {
            // First, get the group member relationships
            const { data: groupMembers, error: groupMembersError } = await supabase
              .from('group_members')
              .select('student_id, is_leader')
              .eq('group_id', group.group_id);

            if (groupMembersError) {
              console.error('Error fetching group members for group:', group.group_id, groupMembersError);
              return { ...group, students: [] };
            }

            if (!groupMembers || groupMembers.length === 0) {
              return { ...group, students: [] };
            }

            // Then, fetch the actual student details
            const studentIds = groupMembers.map((gm: { student_id: number }) => gm.student_id);
            const { data: students, error: studentsError } = await supabase
              .from('students')
              .select('student_id, full_name, age, gender, contact_number, email, school, course_year')
              .in('student_id', studentIds);

            if (studentsError) {
              console.error('Error fetching students for group:', group.group_id, studentsError);
              return { ...group, students: [] };
            }

            // Merge student data with is_leader info
            const studentsWithLeaderInfo = (students || []).map((student: { student_id: number;[key: string]: unknown }) => {
              const memberInfo = groupMembers.find((gm: { student_id: number }) => gm.student_id === student.student_id);
              return {
                ...student,
                is_leader: memberInfo?.is_leader || false
              };
            });

            console.log(`[Groups] Group ${group.group_id} students:`, studentsWithLeaderInfo);
            return { ...group, students: studentsWithLeaderInfo };
          })
        );

        console.log('[Groups] Groups with members:', groupsWithMembers);

        // Use the groups with their members
        const dataToUse = groupsWithMembers;

        // Transform database data to match our expected structure
        const transformedData: GroupData[] = dataToUse.map((group: Record<string, unknown>) => {
          // Transform students to group members
          const students = (group.students as Array<Record<string, unknown>>) || [];
          const group_members = students.map((student: Record<string, unknown>) => {
            // Safely parse numeric values with NaN checks
            let studentId: number;
            if (typeof student.student_id === 'number') {
              studentId = student.student_id;
            } else {
              const parsed = parseInt(String(student.student_id || '0'), 10);
              studentId = isNaN(parsed) ? 0 : parsed;
            }

            let groupId: number;
            if (typeof group.group_id === 'number') {
              groupId = group.group_id;
            } else {
              const parsed = parseInt(String(group.group_id || '0'), 10);
              groupId = isNaN(parsed) ? 0 : parsed;
            }

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
              group_id: groupId,
              full_name: String(student.full_name || ""),
              role: String(student.course_year || "Member"),
              email: student.email ? String(student.email) : null,
              contact_number: student.contact_number ? String(student.contact_number) : null,
              age: age,
              gender: student.gender ? String(student.gender) : null,
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

          // Safely parse group_id with NaN check
          let groupId: number;
          if (typeof group.group_id === 'number') {
            groupId = group.group_id;
          } else {
            const parsed = parseInt(String(group.group_id || '0'), 10);
            groupId = isNaN(parsed) ? 0 : parsed;
          }

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
  const handleMemberUpdate = (updatedMember: GroupMemberData, groupId: number) => {
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
