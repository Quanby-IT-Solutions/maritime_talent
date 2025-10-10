"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  GraduationCap,
  Mail,
  MapPin,
  Music,
  Phone,
  User,
  Users,
  Copy,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import type { PerformanceWithStudent } from "@/app/api/talent-details/types";

interface PerformanceInfoModalProps {
  performance: PerformanceWithStudent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PerformanceInfoModal({
  performance,
  open,
  onOpenChange,
}: PerformanceInfoModalProps) {
  if (!performance) return null;

  const { student } = performance;

  const getPerformanceTypeBadge = (type: string) => {
    switch (type) {
      case "Singing":
        return (
          <Badge variant="default" className="text-xs">
            {type}
          </Badge>
        );
      case "Dancing":
        return (
          <Badge variant="secondary" className="text-xs">
            {type}
          </Badge>
        );
      case "Musical Instrument":
        return (
          <Badge variant="outline" className="text-xs">
            {type}
          </Badge>
        );
      case "Spoken Word/Poetry":
        return (
          <Badge variant="destructive" className="text-xs">
            {type}
          </Badge>
        );
      case "Theatrical/Drama":
        return <Badge className="text-xs">{type}</Badge>;
      default:
        return (
          <Badge variant="outline" className="text-xs">
            {type}
          </Badge>
        );
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[600px] px-4 lg:max-w-[700px] max-h-[90vh] flex flex-col p-0">
        {/* Header */}
        <div className="flex-shrink-0 border-b p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Avatar className="h-12 w-12 sm:h-10 sm:w-10">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {getInitials(student.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="text-lg sm:text-lg font-semibold truncate">
                  {student.full_name}
                </div>
                <div className="text-sm sm:text-sm text-muted-foreground">
                  Performance Details
                </div>
              </div>
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-sm mt-2">
              Comprehensive information about the performance and student
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="space-y-4 sm:space-y-6">
            {/* Performance Information */}
            <Card className="w-full">
              <CardHeader className="pb-3 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-base">
                  <Music className="h-4 w-4 sm:h-4 sm:w-4" />
                  Performance Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  <div>
                    <div className="text-xs font-medium text-muted-foreground">
                      Type
                    </div>
                    <div className="mt-0.5">
                      {getPerformanceTypeBadge(performance.performance_type)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-muted-foreground">
                      Duration
                    </div>
                    <div className="mt-0.5 text-xs sm:text-sm">
                      {performance.duration || "Not specified"}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-muted-foreground">
                    Title
                  </div>
                  <div className="mt-0.5 text-sm font-medium break-words">
                    {performance.title || "Untitled Performance"}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <div className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Performers
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-xs sm:text-sm">
                      <Users className="h-3 w-3" />
                      {performance.num_performers || 1}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Registration ID
                    </div>
                    <div className="mt-1 flex items-center gap-1 sm:gap-2">
                      <code className="text-xs bg-muted px-1 py-0.5 rounded flex-1 sm:flex-none truncate">
                        {performance.performance_id.slice(0, 8)}...
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 sm:h-6 sm:w-6 p-0 flex-shrink-0"
                        onClick={() =>
                          copyToClipboard(
                            performance.performance_id,
                            "Performance ID"
                          )
                        }
                      >
                        <Copy className="h-2 w-2 sm:h-3 sm:w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Registered On
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-xs sm:text-sm">
                    <Calendar className="h-3 w-3" />
                    <span className="break-words">
                      {formatDate(performance.performance_created_at)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Separator className="my-3 sm:my-6" />

            {/* Student Information */}
            <Card className="w-full">
              <CardHeader className="pb-3 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-base">
                  <User className="h-4 w-4 sm:h-4 sm:w-4" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <div className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Full Name
                    </div>
                    <div className="mt-1 text-sm sm:text-base font-medium break-words">
                      {student.full_name}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Age
                    </div>
                    <div className="mt-1 text-xs sm:text-sm">
                      {student.age
                        ? `${student.age} years old`
                        : "Not specified"}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <div className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Gender
                    </div>
                    <div className="mt-1 text-xs sm:text-sm">
                      {student.gender || "Not specified"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-medium text-muted-foreground">
                      Student ID
                    </div>
                    <div className="mt-1 flex items-center gap-1 sm:gap-2">
                      <code className="text-xs bg-muted px-1 py-0.5 rounded flex-1 sm:flex-none truncate">
                        {student.student_id.slice(0, 8)}...
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 sm:h-6 sm:w-6 p-0 flex-shrink-0"
                        onClick={() =>
                          copyToClipboard(student.student_id, "Student ID")
                        }
                      >
                        <Copy className="h-2 w-2 sm:h-3 sm:w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator className="my-2 sm:my-4" />

                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1 sm:mb-2">
                    Contact Information
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-xs sm:text-sm">
                      <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <span className="flex-1 break-words min-w-0">
                        {student.email || "No email provided"}
                      </span>
                      {student.email && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 sm:h-6 sm:w-6 p-0 flex-shrink-0"
                          onClick={() =>
                            copyToClipboard(student.email!, "Email")
                          }
                        >
                          <Copy className="h-2 w-2 sm:h-3 sm:w-3" />
                        </Button>
                      )}
                    </div>
                    <div className="flex items-start gap-2 text-xs sm:text-sm">
                      <Phone className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <span className="flex-1 break-words min-w-0">
                        {student.contact_number || "No contact number provided"}
                      </span>
                      {student.contact_number && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 sm:h-6 sm:w-6 p-0 flex-shrink-0"
                          onClick={() =>
                            copyToClipboard(student.contact_number!, "Phone")
                          }
                        >
                          <Copy className="h-2 w-2 sm:h-3 sm:w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <Separator className="my-3 sm:my-4" />

                <div>
                  <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">
                    Academic Information
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-xs sm:text-sm">
                      <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <span className="break-words">
                        {student.school || "No school specified"}
                      </span>
                    </div>
                    <div className="flex items-start gap-2 text-xs sm:text-sm">
                      <GraduationCap className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <span className="break-words">
                        {student.course_year || "No course/year specified"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Student Registered On
                  </div>
                  <div className="mt-1 flex items-start gap-1 text-xs sm:text-sm">
                    <Calendar className="h-3 w-3 flex-shrink-0 mt-0.5" />
                    <span className="break-words">
                      {formatDate(student.student_created_at)}
                    </span>
                  </div>
                </div>

                {/* Additional IDs if present */}
                {(student.single_id || student.group_id || student.qr_id) && (
                  <>
                    <Separator className="my-3 sm:my-4" />
                    <div>
                      <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">
                        System IDs
                      </div>
                      <div className="space-y-2">
                        {student.single_id && (
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="text-muted-foreground flex-shrink-0">
                              Single ID:
                            </span>
                            <div className="flex items-center gap-1 min-w-0">
                              <code className="bg-muted px-1 py-0.5 rounded text-xs truncate">
                                {student.single_id.slice(0, 8)}...
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 sm:h-5 sm:w-5 p-0 flex-shrink-0"
                                onClick={() =>
                                  copyToClipboard(
                                    student.single_id!,
                                    "Single ID"
                                  )
                                }
                              >
                                <Copy className="h-2 w-2" />
                              </Button>
                            </div>
                          </div>
                        )}
                        {student.group_id && (
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="text-muted-foreground flex-shrink-0">
                              Group ID:
                            </span>
                            <div className="flex items-center gap-1 min-w-0">
                              <code className="bg-muted px-1 py-0.5 rounded text-xs truncate">
                                {student.group_id.slice(0, 8)}...
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 sm:h-5 sm:w-5 p-0 flex-shrink-0"
                                onClick={() =>
                                  copyToClipboard(student.group_id!, "Group ID")
                                }
                              >
                                <Copy className="h-2 w-2" />
                              </Button>
                            </div>
                          </div>
                        )}
                        {student.qr_id && (
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="text-muted-foreground flex-shrink-0">
                              QR ID:
                            </span>
                            <div className="flex items-center gap-1 min-w-0">
                              <code className="bg-muted px-1 py-0.5 rounded text-xs truncate">
                                {student.qr_id.slice(0, 8)}...
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 sm:h-5 sm:w-5 p-0 flex-shrink-0"
                                onClick={() =>
                                  copyToClipboard(student.qr_id!, "QR ID")
                                }
                              >
                                <Copy className="h-2 w-2" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
