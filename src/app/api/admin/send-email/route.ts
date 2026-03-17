import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { sendResendEmail } from "@/lib/email/resend";

export const runtime = "edge";

/**
 * Send email using Resend API
 * This endpoint sends emails from sales@lihe-preform.com
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { to, subject, html } = body;

    // Validate required fields
    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, html" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const result = await sendResendEmail({
      to,
      subject,
      html,
      from: "Lihe Precision <sales@lihe-preform.com>",
      replyTo: "sales@lihe-preform.com",
    });

    return NextResponse.json({
      success: true,
      messageId: result.id,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send email" },
      { status: 500 }
    );
  }
}
