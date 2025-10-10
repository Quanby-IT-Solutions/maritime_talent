import { useState, useEffect, useCallback } from 'react';
import { GroupData, GroupMemberData, safeParseGroupData } from '@/components/group-performance/group-column-def';
import { useSupabaseRealtime } from '@/provider/SupabaseRealtimeProvider';

interface UseGroupPerformancesReturn {
  groups: GroupData[];
  loading: boolean;
  error: string | null;
  validationErrors: string[];
  stats: {
    total: number;
    musical: number;
    dance: number;
    drama: number;
    totalMembers: number;
  };
  refetch: () => Promise<void>;
  updateGroup: (group: GroupData) => Promise<{ success: boolean; error?: string }>;
  updateMember: (member: GroupMemberData, groupId: string) => Promise<{ success: boolean; error?: string }>;
  deleteGroup: (groupId: string) => Promise<{ success: boolean; error?: string }>;
}

export function useGroupPerformances(): UseGroupPerformancesReturn {
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    musical: 0,
    dance: 0,
    drama: 0,
    totalMembers: 0,
  });

  // Get realtime groups data from context
  const { groups: realtimeGroups, loading: realtimeLoading } = useSupabaseRealtime();

  // Transform and validate data whenever realtime data changes
  useEffect(() => {
    if (realtimeLoading.groups) {
      setLoading(true);
      return;
    }

    // We still need to fetch full data from API because realtime only gives us basic group data
    // The API enriches it with members and their related data
    fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realtimeGroups, realtimeLoading.groups]);

  const calculateStats = useCallback((groupsData: GroupData[]) => {
    const total = groupsData.length;
    const musical = groupsData.filter(g => g.performance_type === "Musical").length;
    const dance = groupsData.filter(g => g.performance_type === "Dance").length;
    const drama = groupsData.filter(g => g.performance_type === "Drama").length;
    const totalMembers = groupsData.reduce((sum, group) => sum + (group.group_members?.length || 0), 0);

    setStats({ total, musical, dance, drama, totalMembers });
  }, []);

  const transformGroupData = useCallback((rawGroups: any[]): GroupData[] => {
    const transformedData: GroupData[] = rawGroups.map((group: Record<string, unknown>) => {
      // Transform students to group members
      const students = (group.students as Array<Record<string, unknown>>) || [];
      const group_members = students.map((student: Record<string, unknown>) => {
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
          requirements: student.requirements || null,
          health: student.health || null,
          consents: student.consents || null,
          endorsement: student.endorsement || null,
          performance: student.performance || null,
        };
      });

      // Map performance_type from DB
      let performanceType: "Musical" | "Dance" | "Drama" = "Musical";
      if (group.performance_type === "Dancing") {
        performanceType = "Dance";
      } else if (group.performance_type === "Theatrical/Drama") {
        performanceType = "Drama";
      } else if (group.performance_type === "Musical Instrument" || group.performance_type === "Singing") {
        performanceType = "Musical";
      }

      const groupId = String(group.group_id || '');

      return {
        group_id: groupId,
        group_name: String(group.group_name || ""),
        performance_type: performanceType,
        performance_date: null,
        venue: null,
        description: String((group.performance_description || group.performance_title) || ""),
        group_members,
      };
    });

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

    setValidationErrors(errors);
    return validatedData;
  }, []);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/group-performances');
      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Failed to fetch groups');
        setValidationErrors([`API error: ${result.error}`]);
        return;
      }

      console.log('[useGroupPerformances] Fetched groups from API:', result.groups);

      const validatedData = transformGroupData(result.groups || []);
      setGroups(validatedData);
      calculateStats(validatedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setValidationErrors([`Unexpected error: ${errorMessage}`]);
    } finally {
      setLoading(false);
    }
  }, [transformGroupData, calculateStats]);

  const updateGroup = useCallback(async (group: GroupData) => {
    try {
      const response = await fetch('/api/group-performances', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          group_id: group.group_id,
          group_name: group.group_name,
          performance_type: group.performance_type,
          description: group.description,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        return { success: false, error: result.error || 'Failed to update group' };
      }

      // Update local state immediately for optimistic UI
      setGroups(prev => {
        const updated = prev.map(g => g.group_id === group.group_id ? group : g);
        calculateStats(updated);
        return updated;
      });

      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error occurred' 
      };
    }
  }, [calculateStats]);

  const updateMember = useCallback(async (member: GroupMemberData, groupId: string) => {
    try {
      const response = await fetch('/api/group-performances/member', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          member_id: member.member_id,
          group_id: groupId,
          full_name: member.full_name,
          role: member.role,
          email: member.email,
          contact_number: member.contact_number,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        return { success: false, error: result.error || 'Failed to update member' };
      }

      // Update local state immediately for optimistic UI
      setGroups(prev => {
        const updated = prev.map(group => {
          if (group.group_id === groupId) {
            return {
              ...group,
              group_members: group.group_members?.map(m => 
                m.member_id === member.member_id ? member : m
              ) || []
            };
          }
          return group;
        });
        calculateStats(updated);
        return updated;
      });

      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error occurred' 
      };
    }
  }, [calculateStats]);

  const deleteGroup = useCallback(async (groupId: string) => {
    try {
      const response = await fetch(`/api/group-performances?group_id=${groupId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.success) {
        return { success: false, error: result.error || 'Failed to delete group' };
      }

      // Update local state immediately for optimistic UI
      setGroups(prev => {
        const updated = prev.filter(g => g.group_id !== groupId);
        calculateStats(updated);
        return updated;
      });

      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Unknown error occurred' 
      };
    }
  }, [calculateStats]);

  return {
    groups,
    loading,
    error,
    validationErrors,
    stats,
    refetch: fetchGroups,
    updateGroup,
    updateMember,
    deleteGroup,
  };
}
