type SendResendEmailParams = {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string | string[];
};

const DEFAULT_FROM = "Lihe Precision <sales@lihe-preform.com>";

function getResendApiKey(): string {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  return apiKey;
}

export async function sendResendEmail({
  to,
  subject,
  html,
  from = DEFAULT_FROM,
  replyTo,
}: SendResendEmailParams): Promise<{ id: string }> {
  const apiKey = getResendApiKey();
  const recipients = Array.isArray(to) ? to : [to];
  const replyToList = replyTo
    ? Array.isArray(replyTo)
      ? replyTo
      : [replyTo]
    : undefined;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: recipients,
      subject,
      html,
      reply_to: replyToList,
    }),
  });

  const bodyText = await response.text();
  let parsedBody: any = null;
  try {
    parsedBody = bodyText ? JSON.parse(bodyText) : null;
  } catch {
    parsedBody = null;
  }

  if (!response.ok) {
    const message =
      parsedBody?.message || parsedBody?.error || `Resend API failed (${response.status})`;
    throw new Error(message);
  }

  if (!parsedBody?.id) {
    throw new Error("Resend API returned no message id");
  }

  return { id: parsedBody.id as string };
}
