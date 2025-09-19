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
    schedulingOption: z
        .enum(['natural_language', 'iso_date', 'relative_time'])
        .describe('Choose how to specify the schedule time: natural_language (e.g., "tomorrow at 9am"), iso_date (ISO 8601 format), or relative_time (e.g., "in 2 hours")'),
    scheduleValue: z
        .string()
        .describe('The schedule value based on the chosen option. Examples: "tomorrow at 10am EST", "2024-12-25T10:00:00Z", "in 30 minutes"'),
    timezone: z
        .string()
        .optional()
        .describe('Timezone for the scheduled time (e.g., "America/New_York", "UTC"). Only needed for natural language scheduling.'),
};

export const metadata: ToolMetadata = {
    name: "schedule-email-advanced",
    description: "Schedule an email with advanced scheduling options and validation. Provides better control over timing and timezone handling.",
    annotations: {
        title: "Schedule Email (Advanced)",
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
    },
};

function validateAndFormatSchedule(
    option: 'natural_language' | 'iso_date' | 'relative_time',
    value: string,
    timezone?: string
): string {
    const now = new Date();
    const maxDays = 30;
    const maxDate = new Date(now.getTime() + (maxDays * 24 * 60 * 60 * 1000));

    switch (option) {
        case 'iso_date':
            try {
                const scheduledDate = new Date(value);
                if (isNaN(scheduledDate.getTime())) {
                    throw new Error('Invalid ISO date format');
                }
                if (scheduledDate <= now) {
                    throw new Error('Scheduled time must be in the future');
                }
                if (scheduledDate > maxDate) {
                    throw new Error(`Scheduled time must be within ${maxDays} days`);
                }
                return scheduledDate.toISOString();
            } catch (error: any) {
                throw new Error(`Invalid ISO date: ${error.message}`);
            }

        case 'natural_language':
            // For natural language, we'll pass it through but add timezone if provided
            if (timezone) {
                return `${value} ${timezone}`;
            }
            return value;

        case 'relative_time':
            // Validate relative time format
            const relativePattern = /^in\s+(\d+)\s+(minute|minutes|hour|hours|day|days)$/i;
            if (!relativePattern.test(value)) {
                throw new Error('Relative time must be in format: "in X minutes/hours/days" (e.g., "in 2 hours")');
            }
            return value;

        default:
            throw new Error('Invalid scheduling option');
    }
}

export default async function scheduleEmailAdvanced({
    from,
    to,
    subject,
    text,
    html,
    replyTo,
    cc,
    bcc,
    schedulingOption,
    scheduleValue,
    timezone
}: InferSchema<typeof schema>) {
    const requestHeaders = headers();
    const apiKey = requestHeaders["resend-api-key"];
    
    if (!apiKey) {
        throw new Error('API key is required. Please provide resend-api-key header.');
    }

    // Validate and format the schedule
    let scheduledAt: string;
    try {
        scheduledAt = validateAndFormatSchedule(schedulingOption, scheduleValue, timezone);
    } catch (error: any) {
        throw new Error(`Scheduling validation failed: ${error.message}`);
    }

    const { Resend } = await import('resend');
    const resend = new Resend(apiKey as string);

    console.error(`Debug - Scheduling email with option: ${schedulingOption}, value: ${scheduleValue}, formatted: ${scheduledAt}`);

    // Construct the email request
    const emailRequest: {
        to: string;
        subject: string;
        text: string;
        from: string;
        replyTo?: string[];
        html?: string;
        scheduledAt: string;
        cc?: string[];
        bcc?: string[];
    } = {
        to,
        subject,
        text,
        from: from ?? 'Resend MCP <onboarding@resend.dev>',
        scheduledAt,
    };

    // Add optional parameters conditionally
    if (replyTo) {
        emailRequest.replyTo = replyTo;
    }

    if (html) {
        emailRequest.html = html;
    }

    if (cc) {
        emailRequest.cc = cc;
    }

    if (bcc) {
        emailRequest.bcc = bcc;
    }

    console.error(`Advanced email request: ${JSON.stringify(emailRequest)}`);

    try {
        const response = await resend.emails.send(emailRequest);

        if (response.error) {
            throw new Error(
                `Email failed to schedule: ${JSON.stringify(response.error)}`,
            );
        }

        return `Email scheduled successfully!\nEmail ID: ${response.data?.id}\nScheduled for: ${scheduledAt}\nRecipient: ${to}\nSubject: ${subject}`;
    } catch (error: any) {
        throw new Error(`Failed to schedule email: ${error.message}`);
    }
}