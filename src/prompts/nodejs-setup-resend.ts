import { type PromptMetadata } from "xmcp";

export const metadata: PromptMetadata = {
  name: "nodejs-setup-resend",
  description: "Provides instructions for setting up the Resend SDK in a Node.js project",
  annotations: {
    title: "Node.js Resend Setup",
  },
};

export default function nodeJsSetupResend() {
  return `
# Setting up Resend in Node.js

To get started with Resend in your Node.js project, follow these steps:

## Installation

Install the Resend SDK using your preferred package manager:

\`\`\`bash
npm install resend
# or
yarn add resend  
# or
pnpm add resend
# or
bun add resend
\`\`\`

## Basic Setup

1. **Get your API key:**
   - Sign up at [resend.com](https://resend.com)
   - Go to your dashboard and create an API key
   - Keep this key secure and never commit it to version control

2. **Initialize Resend in your code:**

\`\`\`javascript
import { Resend } from 'resend';

const resend = new Resend('your-api-key-here');
\`\`\`

3. **Send your first email:**

\`\`\`javascript
async function sendEmail() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: ['user@example.com'],
      subject: 'Hello World',
      text: 'Welcome to Resend!'
    });

    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Email sent:', data);
    }
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

sendEmail();
\`\`\`

## Environment Variables

For production, use environment variables to store your API key:

1. **Create a .env file:**
\`\`\`
RESEND_API_KEY=your-actual-api-key-here
\`\`\`

2. **Use in your code:**
\`\`\`javascript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
\`\`\`

## TypeScript Support

Resend includes TypeScript definitions out of the box. For better type safety:

\`\`\`typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

interface EmailData {
  from: string;
  to: string[];
  subject: string;
  text?: string;
  html?: string;
}

async function sendTypedEmail(emailData: EmailData) {
  const { data, error } = await resend.emails.send(emailData);
  
  if (error) {
    throw new Error(\`Failed to send email: \${JSON.stringify(error)}\`);
  }
  
  return data;
}
\`\`\`

## Next Steps

- Explore the [Resend documentation](https://resend.com/docs) for advanced features
- Set up domain verification for production use
- Consider using email templates for better formatting
- Implement proper error handling and retry logic

Happy sending! 📧
  `;
}