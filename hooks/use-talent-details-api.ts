import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  PerformanceWithStudent,
  CreatePerformance,
  UpdatePerformance,
  PerformanceWithStudentQuery,
  PaginatedPerformances,
} from "@/app/api/talent-details/types";

// Query keys factory
export const talentDetailsKeys = {
  all: ["talent-details"] as const,
  lists: () => [...talentDetailsKeys.all, "list"] as const,
  list: (params?: PerformanceWithStudentQuery) =>
    [...talentDetailsKeys.lists(), params] as const,
  details: () => [...talentDetailsKeys.all, "detail"] as const,
  detail: (id: string) => [...talentDetailsKeys.details(), id] as const,
};

// API response interface
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Fetch talent details with query parameters
export const fetchTalentDetails = async (
  params?: PerformanceWithStudentQuery
): Promise<PaginatedPerformances> => {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.set("page", params.page.toString());
  if (params?.limit) searchParams.set("limit", params.limit.toString());
  if (params?.search) searchParams.set("search", params.search);
  if (params?.performance_type)
    searchParams.set("performance_type", params.performance_type);
  if (params?.school) searchParams.set("school", params.school);
  if (params?.sort) searchParams.set("sort", params.sort);
  if (params?.order) searchParams.set("order", params.order);

  const url = `/api/talent-details${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch talent details: ${response.statusText}`);
  }

  const result: ApiResponse<PaginatedPerformances> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to fetch talent details");
  }

  return result.data;
};

// Fetch single performance by ID
export const fetchPerformanceById = async (
  id: string
): Promise<PerformanceWithStudent> => {
  const response = await fetch(`/api/talent-details/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch performance: ${response.statusText}`);
  }

  const result: ApiResponse<PerformanceWithStudent> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to fetch performance");
  }

  return result.data;
};

// Create new performance
export const createPerformance = async (
  data: CreatePerformance
): Promise<PerformanceWithStudent> => {
  const response = await fetch("/api/talent-details", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create performance: ${response.statusText}`);
  }

  const result: ApiResponse<PerformanceWithStudent> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to create performance");
  }

  return result.data;
};

// Update performance
export const updatePerformance = async (
  id: string,
  data: Partial<UpdatePerformance>
): Promise<PerformanceWithStudent> => {
  const response = await fetch(`/api/talent-details/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update performance: ${response.statusText}`);
  }

  const result: ApiResponse<PerformanceWithStudent> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to update performance");
  }

  return result.data;
};

// Delete performance
export const deletePerformance = async (id: string): Promise<void> => {
  const response = await fetch(`/api/talent-details/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete performance: ${response.statusText}`);
  }

  const result: ApiResponse<null> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to delete performance");
  }
};

// Hook to fetch talent details with query parameters
export const useTalentDetails = (params?: PerformanceWithStudentQuery) => {
  return useQuery({
    queryKey: talentDetailsKeys.list(params),
    queryFn: () => fetchTalentDetails(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
};

// Hook to fetch single performance by ID
export const usePerformanceById = (id: string) => {
  return useQuery({
    queryKey: talentDetailsKeys.detail(id),
    queryFn: () => fetchPerformanceById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to create new performance
export const useCreatePerformance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPerformance,
    onSuccess: (newPerformance) => {
      // Invalidate and refetch talent details lists
      queryClient.invalidateQueries({
        queryKey: talentDetailsKeys.lists(),
      });

      // Optionally add the new performance to existing cache
      queryClient.setQueryData(
        talentDetailsKeys.detail(newPerformance.performance_id),
        newPerformance
      );
    },
    onError: (error) => {
      console.error("Failed to create performance:", error);
    },
  });
};

// Hook to update performance
export const useUpdatePerformance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<UpdatePerformance>;
    }) => updatePerformance(id, data),
    onSuccess: (updatedPerformance, { id }) => {
      // Update the specific performance in cache
      queryClient.setQueryData(
        talentDetailsKeys.detail(id),
        updatedPerformance
      );

      // Invalidate lists to trigger refetch
      queryClient.invalidateQueries({
        queryKey: talentDetailsKeys.lists(),
      });
    },
    onError: (error) => {
      console.error("Failed to update performance:", error);
    },
  });
};

// Hook to delete performance
export const useDeletePerformance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePerformance,
    onSuccess: (_, deletedId) => {
      // Remove the performance from cache
      queryClient.removeQueries({
        queryKey: talentDetailsKeys.detail(deletedId),
      });

      // Invalidate lists to trigger refetch
      queryClient.invalidateQueries({
        queryKey: talentDetailsKeys.lists(),
      });
    },
    onError: (error) => {
      console.error("Failed to delete performance:", error);
    },
  });
};
