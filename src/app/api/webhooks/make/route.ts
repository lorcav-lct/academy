import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Log incoming Make.com webhook for debugging
    console.log("Make.com webhook received:", body);

    // Process based on action type
    const { action } = body;

    switch (action) {
      case "sync_order":
        // Handle order sync from Make.com
        break;
      case "send_reminder":
        // Handle reminder trigger from Make.com
        break;
      default:
        console.log("Unknown Make.com action:", action);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Make.com webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
