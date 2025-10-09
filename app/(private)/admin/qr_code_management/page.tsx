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
import { QRGenerationModal } from "@/components/qr-generation-modal"
import { SendQRModal } from "@/components/send-qr-modal"

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
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const pageSize = 10 // Show 10 items per page
  const [showQRModal, setShowQRModal] = useState(false)
  const [showSendQRModal, setShowSendQRModal] = useState(false)

  const fetchUsers = async (query = "", page = 1) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (query) params.set("q", query)
      params.set("page", page.toString())
      params.set("pageSize", pageSize.toString())

      const res = await fetch(`/api/qr-code-management?${params}`)
      const data = await res.json()
      console.log('Fetched users data:', data)
      if (data.success) {
        setUsers(data.items || [])
        setTotalPages(Math.ceil((data.total || 0) / pageSize))
        setTotalItems(data.total || 0)
        console.log('Updated users state with:', data.items?.length, 'items')
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
    setCurrentPage(1) // Reset to first page when searching
    fetchUsers(searchQuery, 1)
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

  const handleQRModalSuccess = () => {
    // Refresh the user list after successful QR generation
    setTimeout(() => {
      fetchUsers(searchQuery, currentPage)
    }, 500)
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
      console.log('Single QR generation response:', data)
      if (data.success) {
        toast.success(`Generated QR code for ${user.name}`)
        // Force refresh with a small delay to ensure database is updated
        setTimeout(() => {
          fetchUsers(searchQuery, currentPage)
        }, 500)
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
          onClick={() => setShowQRModal(true)}
          size="sm"
          variant="default"
        >
          <IconQrcode />
          Generate QR Code
        </Button>

        <Button
          onClick={() => setShowSendQRModal(true)}
          size="sm"
          variant="outline"
        >
          <IconMail />
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-2 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newPage = Math.max(1, currentPage - 1)
                  setCurrentPage(newPage)
                  fetchUsers(searchQuery, newPage)
                }}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setCurrentPage(pageNum)
                        fetchUsers(searchQuery, pageNum)
                      }}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newPage = Math.min(totalPages, currentPage + 1)
                  setCurrentPage(newPage)
                  fetchUsers(searchQuery, newPage)
                }}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* QR Generation Modal */}
      <QRGenerationModal
        open={showQRModal}
        onClose={() => setShowQRModal(false)}
        onSuccess={handleQRModalSuccess}
      />

      {/* Send QR Modal */}
      <SendQRModal
        isOpen={showSendQRModal}
        onClose={() => {
          setShowSendQRModal(false)
          // Refresh the user list after sending emails
          fetchUsers(searchQuery, currentPage)
        }}
      />
    </div>
  )
}
