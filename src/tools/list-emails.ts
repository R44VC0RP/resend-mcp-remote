import { z } from "zod";
import { type ToolMetadata, type InferSchema } from "xmcp";
import { headers } from "xmcp/headers";

export const schema = {
    limit: z
        .number()
        .min(1)
        .max(100)
        .optional()
        .describe('Number of emails to retrieve (1-100, default: 20)'),
    offset: z
        .number()
        .min(0)
        .optional()
        .describe('Number of emails to skip (for pagination)'),
};

export const metadata: ToolMetadata = {
    name: "list-emails",
    description: "List emails from your Resend account, including sent and scheduled emails",
    annotations: {
        title: "List Emails",
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
    },
};

export default async function listEmails({ limit = 20, offset = 0 }: InferSchema<typeof schema>) {
    const requestHeaders = headers();
    const apiKey = requestHeaders["resend-api-key"];
    
    if (!apiKey) {
        throw new Error('API key is required. Please provide resend-api-key header.');
    }

    const { Resend } = await import('resend');
    const resend = new Resend(apiKey as string);

    console.error(`Debug - Listing emails with limit: ${limit}, offset: ${offset}`);

    try {
        const response = await resend.emails.list({
            limit,
            offset,
        });

        if (response.error) {
            throw new Error(
                `Failed to list emails: ${JSON.stringify(response.error)}`,
            );
        }

        // Format the response to show useful information about emails
        const emailSummary = response.data?.data?.map((email: any) => ({
            id: email.id,
            to: email.to,
            subject: email.subject,
            created_at: email.created_at,
            last_event: email.last_event,
            // Include scheduled info if available
            ...(email.scheduled_at && { scheduled_at: email.scheduled_at }),
        }));

        return `Emails retrieved successfully! Total: ${response.data?.total || 0}\n\nEmails:\n${JSON.stringify(emailSummary, null, 2)}`;
    } catch (error: any) {
        throw new Error(`Failed to list emails: ${error.message}`);
    }
}