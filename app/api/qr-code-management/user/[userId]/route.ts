import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// GET /api/qr-code-management/user/[userId]
// Returns single user with QR code data
export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = parseInt(params.userId, 10)
    if (isNaN(userId)) {
      return NextResponse.json({ success: false, error: "Invalid userId" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Fetch guest
    const { data: guest, error: guestErr } = await supabase
      .from("guests")
      .select("guest_id, full_name, email, registration_date")
      .eq("guest_id", userId)
      .single()

    if (guestErr) throw guestErr
    if (!guest) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Fetch QR code
    const { data: qr, error: qrErr } = await supabase
      .from("qr_codes")
      .select("qr_code_url, created_at")
      .eq("guest_id", userId)
      .maybeSingle()

    if (qrErr) throw qrErr

    return NextResponse.json({
      success: true,
      user: {
        id: (guest as any).guest_id,
        name: (guest as any).full_name,
        email: (guest as any).email,
        qr: qr ? (qr as any).qr_code_url : null,
        qrCreatedAt: qr ? (qr as any).created_at : null,
      },
    })
  } catch (err) {
    console.error("/api/qr-code-management/user/[userId] GET error", err)
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    )
  }
}
