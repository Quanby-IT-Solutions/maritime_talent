import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// GET /api/qr-code-management/users-status
// Returns summary statistics: total users, users with QR, users without QR
export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient()

    // Get total guests count
    const { count: totalGuests, error: guestErr } = await supabase
      .from("guests")
      .select("*", { count: "exact", head: true })

    if (guestErr) throw guestErr

    // Get count of guests with QR codes
    const { data: qrCodes, error: qrErr } = await supabase
      .from("qr_codes")
      .select("guest_id")
      .not("guest_id", "is", null)

    if (qrErr) throw qrErr

    const withQR = qrCodes ? qrCodes.length : 0
    const withoutQR = (totalGuests || 0) - withQR

    return NextResponse.json({
      success: true,
      total: totalGuests || 0,
      withQR,
      withoutQR,
    })
  } catch (err) {
    console.error("/api/qr-code-management/users-status GET error", err)
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    )
  }
}
