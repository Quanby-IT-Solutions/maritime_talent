"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { PerformanceWithStudent } from "@/app/api/talent-details/types";
import { useUpdatePerformance } from "@/hooks/use-talent-details-api";

// Form validation schema
const editPerformanceSchema = z.object({
  performance_type: z.enum([
    "Singing",
    "Dancing",
    "Musical Instrument",
    "Spoken Word/Poetry",
    "Theatrical/Drama",
    "Other",
  ]),
  title: z.string().min(1, "Performance title is required").max(255),
  duration: z.string().optional(),
  num_performers: z.number().min(1, "Must have at least 1 performer").max(50),
});

type EditPerformanceFormData = z.infer<typeof editPerformanceSchema>;

interface EditPerformanceModalProps {
  performance: PerformanceWithStudent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditPerformanceModal({
  performance,
  open,
  onOpenChange,
  onSuccess,
}: EditPerformanceModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updatePerformanceMutation = useUpdatePerformance();

  const form = useForm<EditPerformanceFormData>({
    resolver: zodResolver(editPerformanceSchema),
    defaultValues: {
      performance_type:
        (performance?.performance_type as EditPerformanceFormData["performance_type"]) ||
        "Other",
      title: performance?.title || "",
      duration: performance?.duration || "",
      num_performers: performance?.num_performers || 1,
    },
  });

  // Reset form when performance changes
  useEffect(() => {
    if (performance && open) {
      form.reset({
        performance_type:
          performance.performance_type as EditPerformanceFormData["performance_type"],
        title: performance.title || "",
        duration: performance.duration || "",
        num_performers: performance.num_performers || 1,
      });
    }
  }, [performance, open, form]);

  const onSubmit = async (data: EditPerformanceFormData) => {
    if (!performance) return;

    setIsSubmitting(true);
    try {
      await updatePerformanceMutation.mutateAsync({
        id: performance.performance_id,
        data: {
          ...data,
        },
      });

      toast.success("Performance updated successfully");
      onOpenChange(false);

      // Call onSuccess after a small delay to prevent re-render issues
      setTimeout(() => {
        onSuccess?.();
      }, 100);
    } catch (error) {
      console.error("Failed to update performance:", error);
      toast.error("Failed to update performance");
    } finally {
      setIsSubmitting(false);
    }
  };

  const performanceTypes = [
    "Singing",
    "Dancing",
    "Musical Instrument",
    "Spoken Word/Poetry",
    "Theatrical/Drama",
    "Other",
  ] as const;

  const getPerformanceTypeBadge = (type: string) => {
    switch (type) {
      case "Singing":
        return <Badge variant="default">{type}</Badge>;
      case "Dancing":
        return <Badge variant="secondary">{type}</Badge>;
      case "Musical Instrument":
        return <Badge variant="outline">{type}</Badge>;
      case "Spoken Word/Poetry":
        return <Badge variant="destructive">{type}</Badge>;
      case "Theatrical/Drama":
        return <Badge>{type}</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Performance</DialogTitle>
          <DialogDescription>
            Update the performance details for{" "}
            <strong>{performance?.student.full_name}</strong>
          </DialogDescription>
        </DialogHeader>

        {performance && (
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Current Type:</span>
              {performance.performance_type}
            </div>
            <div className="text-sm text-muted-foreground">
              <strong>Student:</strong> {performance.student.full_name} •{" "}
              {performance.student.school}
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="performance_type"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Performance Type *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select performance type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {performanceTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          <div className="flex items-center gap-2">{type}</div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Performance Title *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter performance title"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 5 minutes"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="num_performers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Performers *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={50}
                        placeholder="1"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 1)
                        }
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update Performance
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
