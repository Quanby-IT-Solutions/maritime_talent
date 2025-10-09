"use client"

import { useState, useEffect, useRef } from "react"
import { IconQrcode, IconSearch, IconLoader2, IconUsers, IconPalette, IconSettings } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import QRCode from "qrcode"

type UserQR = {
  id: number
  name: string
  email: string
  qr: string | null
  qrCreatedAt: string | null
  type: "guest" | "contestant_single" | "contestant_group"
}

type QRGenerationModalProps = {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function QRGenerationModal({ open, onClose, onSuccess }: QRGenerationModalProps) {
  const [users, setUsers] = useState<UserQR[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserQR[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [generating, setGenerating] = useState(false)

  // QR Code customization options
  const [qrStyle, setQrStyle] = useState({
    dotStyle: "rounded" as "rounded" | "square" | "dots",
    dotColor: "#000000",
    cornerStyle: "square" as "square" | "rounded" | "dots",
  })

  // Preview QR Code
  const qrRef = useRef<HTMLDivElement>(null)

  // Fetch all users when modal opens
  useEffect(() => {
    if (open) {
      fetchAllUsers()
    }
  }, [open])

  // Filter users based on search and type
  useEffect(() => {
    let filtered = users

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter((u) => u.type === typeFilter)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query)
      )
    }

    setFilteredUsers(filtered)
  }, [users, searchQuery, typeFilter])

  // Generate preview QR code using qrcode library
  useEffect(() => {
    const generateQR = async () => {
      if (qrRef.current) {
        try {
          const payload = JSON.stringify({ type: "preview", id: 0 })
          const qrDataUrl = await QRCode.toDataURL(payload, {
            width: 250,
            margin: 1,
            color: {
              dark: qrStyle.dotColor,
              light: "#FFFFFF",
            },
          })
          qrRef.current.innerHTML = `<img src="${qrDataUrl}" alt="QR Preview" style="width: 250px; height: 250px;" />`
        } catch (err) {
          console.error("Error generating preview QR:", err)
        }
      }
    }
    generateQR()
  }, [qrStyle])

  const fetchAllUsers = async () => {
    try {
      setLoading(true)
      // Fetch all users without pagination
      const res = await fetch(`/api/qr-code-management?pageSize=1000`)
      const data = await res.json()
      if (data.success) {
        setUsers(data.items || [])
        setFilteredUsers(data.items || [])
      } else {
        toast.error("Failed to load users")
      }
    } catch (err) {
      toast.error("Error loading users")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }


  const createUserKey = (user: UserQR) => `${user.type}-${user.id}`

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredUsers.map(createUserKey)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectOne = (userKey: string, checked: boolean) => {
    const newSet = new Set(selectedIds)
    if (checked) {
      newSet.add(userKey)
    } else {
      newSet.delete(userKey)
    }
    setSelectedIds(newSet)
  }

  const handleClearAll = () => {
    setSelectedIds(new Set())
  }

  const handleGenerate = async () => {
    if (selectedIds.size === 0) {
      toast.error("Please select at least one user")
      return
    }

    try {
      setGenerating(true)
      const items = Array.from(selectedIds).map((userKey) => {
        const u = users.find((x) => createUserKey(x) === userKey)
        return {
          id: u?.id || 0,
          type: (u?.type || "guest") as UserQR["type"],
          name: u?.name,
          manual: true,
        }
      })

      const res = await fetch("/api/qr-code-management/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Generated ${data.results.length} QR code(s)`)
        onSuccess()
        onClose()
      } else {
        toast.error("Failed to generate QR codes")
      }
    } catch (err) {
      toast.error("Error generating QR codes")
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!max-w-[1200px] !w-[85vw] h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="flex-shrink-0 space-y-3 px-6 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <IconQrcode className="size-5 text-primary" />
            <DialogTitle className="text-xl">Generate QR Codes</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Select users and customize QR code appearance. Each user will get a unique QR code.
          </DialogDescription>
        </DialogHeader>

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
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="All Users" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="guest">Guests</SelectItem>
                        <SelectItem value="contestant_single">Single Contestants</SelectItem>
                        <SelectItem value="contestant_group">Group Contestants</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Select/Clear All Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectAll(true)}
                      disabled={filteredUsers.length === 0}
                      className="flex-1"
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearAll}
                      disabled={selectedIds.size === 0}
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

                  {/* Select Users List */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground uppercase">
                      Select Users
                    </Label>
                    <ScrollArea className="h-48 border rounded-md">
                      <div className="space-y-2 p-2">
                        {loading ? (
                          <div className="flex items-center justify-center p-4">
                            <IconLoader2 className="size-4 animate-spin mr-2" />
                            <span className="text-sm text-muted-foreground">Loading users...</span>
                          </div>
                        ) : filteredUsers.length === 0 ? (
                          <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                            No users found
                          </div>
                        ) : (
                          filteredUsers.map((user) => (
                            <label
                              key={createUserKey(user)}
                              className={`flex items-center space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer transition-colors ${user.qr ? "opacity-70" : ""
                                }`}
                            >
                              <Checkbox
                                checked={selectedIds.has(createUserKey(user))}
                                onCheckedChange={(checked) =>
                                  handleSelectOne(createUserKey(user), checked as boolean)
                                }
                                className="size-4"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm font-medium truncate">{user.name}</span>
                                  {user.qr && (
                                    <Badge variant="secondary" className="text-xs shrink-0">
                                      Has QR
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                              </div>
                            </label>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Selected Users Display */}
                  {selectedIds.size > 0 && (
                    <div className="pt-2">
                      <Label className="text-xs font-medium text-muted-foreground uppercase">
                        Selected Users ({selectedIds.size})
                      </Label>
                      <ScrollArea className="h-20 mt-2">
                        <div className="space-y-1 pr-3">
                          {Array.from(selectedIds).map((userKey) => {
                            const user = users.find((u) => createUserKey(u) === userKey)
                            if (!user) return null
                            return (
                              <div
                                key={userKey}
                                className="flex items-center justify-between p-2 bg-muted rounded-md"
                              >
                                <span className="text-xs truncate flex-1">{user.name}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSelectOne(userKey, false)}
                                  className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                >
                                  ×
                                </Button>
                              </div>
                            )
                          })}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Style Customization Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <IconPalette className="size-4" />
                    Style Customization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-48">
                    <div className="space-y-4 pr-3">
                      {/* Dot Style */}
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground uppercase">
                          Dot Style
                        </Label>
                        <Select
                          value={qrStyle.dotStyle}
                          onValueChange={(value: "rounded" | "square" | "dots") =>
                            setQrStyle({ ...qrStyle, dotStyle: value })
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="rounded">Rounded</SelectItem>
                            <SelectItem value="square">Square</SelectItem>
                            <SelectItem value="dots">Dots</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Dot Color */}
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground uppercase">
                          Dot Color
                        </Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="color"
                            value={qrStyle.dotColor}
                            onChange={(e) =>
                              setQrStyle({ ...qrStyle, dotColor: e.target.value })
                            }
                            className="w-12 h-9 p-1 border rounded"
                          />
                          <Input
                            type="text"
                            value={qrStyle.dotColor}
                            onChange={(e) =>
                              setQrStyle({ ...qrStyle, dotColor: e.target.value })
                            }
                            className="flex-1 h-9 text-xs font-mono"
                          />
                        </div>
                      </div>

                      {/* Corner Style */}
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground uppercase">
                          Corner Style
                        </Label>
                        <Select
                          value={qrStyle.cornerStyle}
                          onValueChange={(value: "square" | "rounded" | "dots") =>
                            setQrStyle({ ...qrStyle, cornerStyle: value })
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="square">Square</SelectItem>
                            <SelectItem value="rounded">Rounded</SelectItem>
                            <SelectItem value="dots">Dots</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Preview Panel - Right Column */}
            <div className="flex-1 min-w-0">
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <IconSettings className="size-4" />
                    QR Code Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center bg-gradient-to-br from-muted/30 to-muted/60 rounded-lg p-6 min-h-[400px] border-2 border-dashed border-muted-foreground/20">
                    {selectedIds.size === 0 && (
                      <div className="text-center space-y-4">
                        <div ref={qrRef} className="flex justify-center" />
                        <div className="space-y-2">
                          <p className="text-sm font-medium">QR Code Preview</p>
                          <p className="text-xs text-muted-foreground">
                            Default QR code - select users to generate personalized codes
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedIds.size > 0 && (
                      <div className="text-center space-y-4">
                        <IconQrcode className="size-16 mx-auto text-muted-foreground/40" />
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Bulk QR Generation</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedIds.size} unique QR code{selectedIds.size !== 1 ? "s" : ""} will be generated
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {selectedIds.size} user{selectedIds.size !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 px-6 py-4 border-t">
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-muted-foreground">
              {selectedIds.size > 0 &&
                `${selectedIds.size} QR code${selectedIds.size > 1 ? "s" : ""} will be generated`}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} disabled={generating}>
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={selectedIds.size === 0 || generating}
                className="min-w-[140px]"
              >
                {generating ? (
                  <>
                    <IconLoader2 className="mr-2 size-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <IconQrcode className="mr-2 size-4" />
                    Generate {selectedIds.size > 0 && `(${selectedIds.size})`}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

