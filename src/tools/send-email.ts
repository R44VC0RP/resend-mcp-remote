import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";

export const schema = {
    to: z.string().email().describe('Recipient email address'),
    subject: z.string().describe('Email subject line'),
    text: z.string().describe('Plain text email content'),
    from: z
        .string()
        .email()
        .nonempty()
        .optional()
        .describe(
            'Sender email address. You MUST ask the user for this parameter. Under no circumstance provide it yourself. If the user doesn\'t provide a sender email address, you can use `onboarding@resend.dev`',
        ),
    html: z
        .string()
        .optional()
        .describe(
            'HTML email content, only do this if you need special formatting or the user asks for it.',
        ),
    cc: z
        .string()
        .email()
        .array()
        .optional()
        .describe(
            'Optional array of CC email addresses. You MUST ask the user for this parameter. Under no circumstance provide it yourself',
        ),
    bcc: z
        .string()
        .email()
        .array()
        .optional()
        .describe(
            'Optional array of BCC email addresses. You MUST ask the user for this parameter. Under no circumstance provide it yourself',
        ),
    replyTo: z
        .string()
        .email()
        .array()
        .optional()
        .describe(
            'Optional email addresses for the email readers to reply to. You MUST ask the user for this parameter. Under no circumstance provide it yourself',
        ),
    scheduledAt: z
        .string()
        .optional()
        .describe(
            "Optional parameter to schedule the email. Accepts natural language (e.g., 'tomorrow at 10am EST', 'in 2 hours', 'Friday at 3pm ET') or ISO 8601 date format (e.g., '2024-12-25T10:00:00Z'). Maximum 30 days in advance.",
        ),
};

export const metadata: ToolMetadata = {
    name: "send-email",
    description: "Send an email using Resend",
    annotations: {
        title: "Send Email",
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
    },
};

function validateScheduledTime(scheduledAt: string): void {
    const now = new Date();
    const maxDays = 30;
    const maxDate = new Date(now.getTime() + (maxDays * 24 * 60 * 60 * 1000));

    // Try to parse as ISO date first
    if (scheduledAt.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/) || scheduledAt.match(/^\d{4}-\d{2}-\d{2}/)) {
        try {
            const scheduledDate = new Date(scheduledAt);
            if (isNaN(scheduledDate.getTime())) {
                throw new Error('Invalid date format');
            }
            if (scheduledDate <= now) {
                throw new Error('Scheduled time must be in the future');
            }
            if (scheduledDate > maxDate) {
                throw new Error(`Scheduled time must be within ${maxDays} days`);
            }
        } catch (error: any) {
            throw new Error(`Invalid scheduled date: ${error.message}`);
        }
    }
    // For natural language, we'll let Resend handle the validation
    // but provide some basic checks
    else {
        const validPatterns = [
            /in \d+ (minute|minutes|hour|hours|day|days)/i,
            /(tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
            /at \d{1,2}(:\d{2})?\s*(am|pm)/i,
        ];
        
        const hasValidPattern = validPatterns.some(pattern => pattern.test(scheduledAt));
        if (!hasValidPattern && scheduledAt.length > 50) {
            console.warn(`Warning: Scheduled time "${scheduledAt}" may not be in a recognized format`);
        }
    }
}

export default async function sendEmail({ from, to, subject, text, html, replyTo, scheduledAt, cc, bcc }: InferSchema<typeof schema>) {
    const requestHeaders = headers();
    const apiKey = requestHeaders["resend-api-key"];
    
    if (!apiKey) {
        throw new Error('API key is required. Please provide resend-api-key header.');
    }

    // Validate scheduled time if provided
    if (scheduledAt) {
        try {
            validateScheduledTime(scheduledAt);
        } catch (error: any) {
            throw new Error(`Scheduling validation failed: ${error.message}`);
        }
    }

    const { Resend } = await import('resend');
    const resend = new Resend(apiKey as string);

    const action = scheduledAt ? 'Scheduling' : 'Sending';
    console.error(`Debug - ${action} email with from: ${from}${scheduledAt ? `, scheduled for: ${scheduledAt}` : ''}`);

    // Explicitly structure the request with all parameters to ensure they're passed correctly
    const emailRequest: {
        to: string;
        subject: string;
        text: string;
        from: string;
        replyTo?: string[];
        html?: string;
        scheduledAt?: string;
        cc?: string[];
        bcc?: string[];
    } = {
        to,
        subject,
        text,
        from: from ?? 'Resend MCP <onboarding@resend.dev>',
    };

    // Add optional parameters conditionally
    if (replyTo) {
        emailRequest.replyTo = replyTo;
    }

    if (html) {
        emailRequest.html = html;
    }

    if (scheduledAt) {
        emailRequest.scheduledAt = scheduledAt;
    }

    if (cc) {
        emailRequest.cc = cc;
    }

    if (bcc) {
        emailRequest.bcc = bcc;
    }

    console.error(`Email request: ${JSON.stringify(emailRequest)}`);

    try {
        const response = await resend.emails.send(emailRequest);

        if (response.error) {
            throw new Error(
                `Email failed to ${scheduledAt ? 'schedule' : 'send'}: ${JSON.stringify(response.error)}`,
            );
        }

        const message = scheduledAt 
            ? `Email scheduled successfully! Email ID: ${response.data?.id}\nScheduled for: ${scheduledAt}\nRecipient: ${to}\nSubject: ${subject}`
            : `Email sent successfully! ${JSON.stringify(response.data)}`;

        return message;
    } catch (error: any) {
        throw new Error(`Failed to ${scheduledAt ? 'schedule' : 'send'} email: ${error.message}`);
    }
}
