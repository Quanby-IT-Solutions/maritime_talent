"use client"

import { useState, useEffect } from "react"
import { IconQrcode, IconMail, IconSearch, IconLoader2, IconChevronDown } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import Image from "next/image"

type UserQR = {
  id: number
  name: string
  email: string
  qr: string | null
  qrCreatedAt: string | null
  type: "guest" | "contestant_single" | "contestant_group"
}

export default function QrCodeManagementPage() {
  const [users, setUsers] = useState<UserQR[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [generating, setGenerating] = useState(false)
  const [sending, setSending] = useState(false)

  const fetchUsers = async (query = "") => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (query) params.set("q", query)
      params.set("pageSize", "100")

      const res = await fetch(`/api/qr-code-management?${params}`)
      const data = await res.json()
      if (data.success) {
        setUsers(data.items || [])
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

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleSearch = () => {
    fetchUsers(searchQuery)
  }

  // Helper to create composite key
  const createUserKey = (user: UserQR) => `${user.type}-${user.id}`

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(users.map(createUserKey)))
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

  const handleGenerateQR = async () => {
    if (selectedIds.size === 0) {
      toast.error("Please select at least one user")
      return
    }

    try {
      setGenerating(true)
      // Build items with type, name, and manual flag
      const items = Array.from(selectedIds).map((userKey) => {
        const u = users.find((x) => createUserKey(x) === userKey)
        console.log('Processing user for bulk QR generation:', {
          userKey,
          user: u,
          id: u?.id,
          type: u?.type,
          name: u?.name
        })
        return {
          id: u?.id || 0,
          type: (u?.type || "guest") as UserQR["type"],
          name: u?.name,
          manual: true
        }
      })

      console.log('Bulk QR generation items:', items)

      const res = await fetch("/api/qr-code-management/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Generated ${data.results.length} QR code(s)`)
        fetchUsers(searchQuery)
        setSelectedIds(new Set())
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

  const handleSendEmail = async () => {
    if (selectedIds.size === 0) {
      toast.error("Please select at least one user")
      return
    }

    const usersWithQR = users.filter((u) => selectedIds.has(createUserKey(u)) && u.qr)
    if (usersWithQR.length === 0) {
      toast.error("Selected users do not have QR codes. Generate QR codes first.")
      return
    }

    try {
      setSending(true)
      const recipients = usersWithQR.map((u) => ({
        email: u.email,
        name: u.name,
        userId: u.id.toString(),
        userType: u.type,
        qrCodeUrl: u.qr!,
      }))

      const res = await fetch("/api/send-qr-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients,
          subject: "Your MARITIME TALENT QUEST 2025 Guest Pass",
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Sent ${data.results.successfulSends} email(s)`)
        setSelectedIds(new Set())
      } else {
        toast.error("Failed to send emails")
      }
    } catch (err) {
      toast.error("Error sending emails")
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  // Generate QR for a single user
  const handleGenerateSingleQR = async (user: UserQR) => {
    try {
      const res = await fetch("/api/qr-code-management/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{
            id: user.id,
            type: user.type,
            name: user.name,
            manual: true
          }]
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Generated QR code for ${user.name}`)
        fetchUsers(searchQuery)
      } else {
        toast.error("Failed to generate QR code")
      }
    } catch (err) {
      toast.error("Error generating QR code")
      console.error(err)
    }
  }

  // Send email to a single user
  const handleSendSingleEmail = async (user: UserQR) => {
    if (!user.qr) {
      toast.error("Generate QR code first")
      return
    }
    try {
      const res = await fetch("/api/send-qr-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients: [{
            email: user.email,
            name: user.name,
            userId: user.id.toString(),
            userType: user.type,
            qrCodeUrl: user.qr,
          }],
          subject: "Your MARITIME TALENT QUEST 2025 Guest Pass",
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Sent email to ${user.name}`)
      } else {
        toast.error("Failed to send email")
      }
    } catch (err) {
      toast.error("Error sending email")
      console.error(err)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—"
    const d = new Date(dateStr)
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const allSelected = users.length > 0 && selectedIds.size === users.length
  const someSelected = selectedIds.size > 0 && selectedIds.size < users.length

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">QR Code Management</h1>
        <p className="text-muted-foreground text-sm">
          View, generate, and manage QR codes for event attendees.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Filter by user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pr-10"
          />
          <IconSearch className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        </div>

        <Button
          onClick={handleGenerateQR}
          disabled={generating || selectedIds.size === 0}
          size="sm"
          variant="default"
        >
          {generating ? <IconLoader2 className="animate-spin" /> : <IconQrcode />}
          Generate QR Code
        </Button>

        <Button
          onClick={handleSendEmail}
          disabled={sending || selectedIds.size === 0}
          size="sm"
          variant="outline"
        >
          {sending ? <IconLoader2 className="animate-spin" /> : <IconMail />}
          Send QR via Email
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline">
              Columns
              <IconChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>User</DropdownMenuItem>
            <DropdownMenuItem>Email</DropdownMenuItem>
            <DropdownMenuItem>QR Code</DropdownMenuItem>
            <DropdownMenuItem>Created At</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected || (someSelected ? "indeterminate" : false)}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  User
                  <IconChevronDown className="size-4" />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  Email
                  <IconChevronDown className="size-4" />
                </div>
              </TableHead>
              <TableHead>QR Code</TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  Created At
                  <IconChevronDown className="size-4" />
                </div>
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <IconLoader2 className="mx-auto animate-spin size-6" />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={`${user.type}-${user.id}`}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(createUserKey(user))}
                      onCheckedChange={(checked) =>
                        handleSelectOne(createUserKey(user), checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    {user.qr ? (
                      <div className="relative size-16 rounded border bg-white">
                        <Image
                          src={user.qr}
                          alt={`QR code for ${user.name}`}
                          width={64}
                          height={64}
                          className="object-contain p-1"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(user.qrCreatedAt)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <IconChevronDown className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleGenerateSingleQR(user)}>
                          <IconQrcode className="size-4 mr-2" />
                          {user.qr ? 'Regenerate QR' : 'Generate QR'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleSendSingleEmail(user)}
                          disabled={!user.qr}
                        >
                          <IconMail className="size-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
