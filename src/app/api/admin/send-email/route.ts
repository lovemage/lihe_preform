import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";

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

    // TODO: Integrate with Resend API
    // For now, this is a placeholder that logs the email
    console.log("=== SENDING EMAIL VIA RESEND ===");
    console.log("From: sales@lihe-preform.com");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("HTML:", html.substring(0, 200) + "...");
    console.log("================================");

    // Example Resend integration (uncomment when ready):
    /*
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Lihe Precision <sales@lihe-preform.com>',
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send email via Resend');
    }

    const result = await response.json();
    return NextResponse.json({
      success: true,
      messageId: result.id
    });
    */

    // Placeholder response
    return NextResponse.json({
      success: true,
      message: "Email queued for sending (Resend integration pending)",
      preview: {
        from: "sales@lihe-preform.com",
        to,
        subject,
      },
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send email" },
      { status: 500 }
    );
  }
}
