"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Mail } from "lucide-react";
import { IconUsers, IconSearch } from "@tabler/icons-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SendQRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Define user type for the modal
type UserType = "all" | "guest" | "contestant_single" | "contestant_group";

type UserWithQR = {
  id: number;
  name: string;
  email: string;
  type: "guest" | "contestant_single" | "contestant_group";
  qrCodeUrl?: string;
  hasQRCode: boolean;
};

export function SendQRModal({ isOpen, onClose }: SendQRModalProps) {
  const [users, setUsers] = React.useState<UserWithQR[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = React.useState(true);
  const [selectedUsers, setSelectedUsers] = React.useState<UserWithQR[]>([]);
  const [userTypeFilter, setUserTypeFilter] = React.useState<UserType>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const [sendResult, setSendResult] = React.useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Fetch users when modal opens
  React.useEffect(() => {
    if (isOpen) {
      fetchUsers();
      setSelectedUsers([]);
      setSearchQuery("");
      setSendResult(null);
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await fetch("/api/qr-code-management");
      const data = await response.json();

      if (data.success) {
        // Map the API response to match our expected format
        const mappedUsers = data.items.map((item: {
          id: number;
          name: string;
          email: string;
          type: "guest" | "contestant_single" | "contestant_group";
          qr: string | null;
        }) => ({
          id: item.id,
          name: item.name,
          email: item.email,
          type: item.type,
          qrCodeUrl: item.qr, // API returns 'qr', we need 'qrCodeUrl'
          hasQRCode: !!item.qr, // Check if qr exists
        }));
        setUsers(mappedUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Filter users based on type and search query
  const filteredUsers = React.useMemo(() => {
    let filtered = users;

    // Filter by type
    if (userTypeFilter !== "all") {
      filtered = filtered.filter((user) => user.type === userTypeFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [users, userTypeFilter, searchQuery]);

  const handleUserToggle = (user: UserWithQR) => {
    // Don't allow selection of users who don't have QR codes
    if (!user.hasQRCode || !user.qrCodeUrl) return;

    setSelectedUsers((prev) => {
      const isSelected = prev.find(
        (u) => u.id === user.id && u.type === user.type
      );
      if (isSelected) {
        return prev.filter((u) => !(u.id === user.id && u.type === user.type));
      } else {
        return [...prev, user];
      }
    });
  };

  // Select all users (only those with QR codes)
  const handleSelectAll = () => {
    const usersWithQR = filteredUsers.filter(
      (user) => user.hasQRCode && user.qrCodeUrl
    );
    setSelectedUsers(usersWithQR);
  };

  // Clear all selected users
  const handleClearAll = () => {
    setSelectedUsers([]);
  };

  const handleSendEmails = async () => {
    if (selectedUsers.length === 0) return;

    setIsSending(true);
    setSendResult(null);

    try {
      // Prepare recipients data for bulk email sending
      const recipients = selectedUsers.map((user) => ({
        email: user.email,
        name: user.name,
        userId: String(user.id),
        userType: user.type,
        qrCodeUrl: user.qrCodeUrl!,
      }));

      // Send bulk emails via API endpoint
      const response = await fetch("/api/send-qr-emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipients,
          subject: "Your MARITIME TALENT QUEST 2025 QR Code",
          html: "", // This will be generated per recipient in the API
          from: "dummyemail@gmail.com",
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSendResult({
          success: true,
          message: `Successfully sent QR code emails to ${result.results.successfulSends} user(s).`,
        });
      } else {
        setSendResult({
          success: false,
          message: `Failed to send emails: ${result.error || "Unknown error"}`,
        });
      }

      // Close the modal and reset selection after a delay
      setTimeout(() => {
        onClose();
        setSelectedUsers([]);
        setSendResult(null);
      }, 3000);
    } catch (error) {
      console.error("Error sending emails:", error);
      setSendResult({
        success: false,
        message: "An error occurred while sending emails. Please try again.",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-[1200px] !w-[85vw] h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="flex-shrink-0 space-y-3 px-6 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <Mail className="size-5 text-primary" />
            <DialogTitle className="text-xl">Send QR Codes via Email</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Select users who have QR codes and send them their access passes via
            email. Only users with generated QR codes can be selected.
          </DialogDescription>
        </DialogHeader>

        {sendResult && (
          <div
            className={`mx-6 mb-4 p-4 rounded-md ${sendResult.success
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
              }`}
          >
            {sendResult.message}
          </div>
        )}

        <div className="flex-1 px-6 overflow-y-auto">
          <div className="flex gap-6 pb-6 min-h-full">
            {/* Settings Panel - Left Column */}
            <div className="w-[360px] flex-shrink-0 space-y-4">
              {/* User Selection Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <IconUsers className="size-4" />
                    User Selection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Filter by Type */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase">
                      Filter by Type
                    </Label>
                    <Select
                      value={userTypeFilter}
                      onValueChange={(value) =>
                        setUserTypeFilter(value as UserType)
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="All Users" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="guest">Guests</SelectItem>
                        <SelectItem value="contestant_single">
                          Single Contestants
                        </SelectItem>
                        <SelectItem value="contestant_group">
                          Group Contestants
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Select/Clear All Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                      disabled={
                        filteredUsers.filter(
                          (user) => user.hasQRCode && user.qrCodeUrl
                        ).length === 0
                      }
                      className="flex-1"
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearAll}
                      disabled={selectedUsers.length === 0}
                      className="flex-1"
                    >
                      Clear All
                    </Button>
                  </div>

                  {/* Search Users */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase">
                      Search Users
                    </Label>
                    <div className="relative">
                      <Input
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-10 pr-10"
                      />
                      <IconSearch className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    </div>
                  </div>

                  {/* User List */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase">
                      Users ({filteredUsers.length})
                    </Label>
                    <ScrollArea className="h-[280px] border rounded-md">
                      <div className="p-2 space-y-1">
                        {isLoadingUsers ? (
                          <div className="flex items-center justify-center p-8">
                            <Loader2 className="size-4 animate-spin mr-2" />
                            <span className="text-sm text-muted-foreground">
                              Loading users...
                            </span>
                          </div>
                        ) : filteredUsers.length === 0 ? (
                          <div className="text-center p-8 text-sm text-muted-foreground">
                            No users found
                          </div>
                        ) : (
                          filteredUsers.map((user) => {
                            const isSelected = selectedUsers.some(
                              (u) => u.id === user.id && u.type === user.type
                            );
                            const canSelect = user.hasQRCode && user.qrCodeUrl;

                            return (
                              <div
                                key={`${user.type}-${user.id}`}
                                className={`flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors ${!canSelect
                                  ? "opacity-50 cursor-not-allowed"
                                  : "cursor-pointer"
                                  }`}
                                onClick={() =>
                                  canSelect && handleUserToggle(user)
                                }
                              >
                                <Checkbox
                                  checked={isSelected}
                                  disabled={!canSelect}
                                  className="size-4"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium truncate">
                                    {user.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    {user.email}
                                  </div>
                                </div>
                                {canSelect ? (
                                  <Badge variant="secondary" className="text-xs">
                                    Has QR
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive" className="text-xs">
                                    No QR
                                  </Badge>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Preview Panel - Right Column */}
            <div className="flex-1 min-w-0">
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Send className="size-4" />
                    Email Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center bg-gradient-to-br from-muted/30 to-muted/60 rounded-lg p-8 h-[400px] border-2 border-dashed border-muted-foreground/20">
                    <div className="text-center space-y-4">
                      <div className="space-y-2">
                        <Mail className="size-16 mx-auto text-muted-foreground/40" />
                        <p className="text-sm font-medium">
                          QR Code Email Notification
                        </p>
                        <p className="text-xs text-muted-foreground max-w-md">
                          Selected users will receive an email with their QR
                          code attachment
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {selectedUsers.length} users selected
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium text-sm mb-2">
                      Email Content Preview
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      <strong>Subject:</strong> Your MARITIME TALENT QUEST 2025
                      [User Type] Pass
                      <br />
                      <strong>Body:</strong> Personalized email with instructions
                      on how to use the QR code for event access, including
                      specific benefits and reminders based on user type.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 px-6 py-4 border-t">
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-muted-foreground">
              {selectedUsers.length > 0 &&
                `${selectedUsers.length} user${selectedUsers.length > 1 ? "s" : ""
                } will receive QR code emails`}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} disabled={isSending}>
                Cancel
              </Button>
              <Button
                onClick={handleSendEmails}
                disabled={selectedUsers.length === 0 || isSending}
                className="min-w-[140px]"
              >
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 size-4" />
                    Send Emails{" "}
                    {selectedUsers.length > 0 && `(${selectedUsers.length})`}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
