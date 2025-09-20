export default function nodeJsSetupResend() {
  return `
# Node.js Setup for Resend

This guide will help you set up the Resend SDK in your Node.js project for sending emails and managing contacts.

## Prerequisites

- Node.js version 18 or higher
- A Resend account and API key

## Installation

### Using npm

\`\`\`bash
npm install resend
\`\`\`

### Using yarn

\`\`\`bash
yarn add resend
\`\`\`

### Using pnpm

\`\`\`bash
pnpm add resend
\`\`\`

## Basic Setup

### 1. Initialize the Resend Client

\`\`\`typescript
import { Resend } from 'resend';

// Initialize with your API key
const resend = new Resend('re_xxxxxxxxx'); // Replace with your actual API key
\`\`\`

### 2. Environment Variables (Recommended)

Store your API key securely using environment variables:

\`\`\`.env
RESEND_API_KEY=re_xxxxxxxxx
\`\`\`

\`\`\`typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
\`\`\`

## Quick Start Examples

### Sending a Simple Email

\`\`\`typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: ['delivered@resend.dev'],
      subject: 'Hello from Resend',
      text: 'Hello world!',
    });

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log('Email sent successfully:', data);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

sendEmail();
\`\`\`

### Creating a Contact

\`\`\`typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function createContact() {
  try {
    const { data, error } = await resend.contacts.create({
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      unsubscribed: false,
      audienceId: 'your-audience-id',
    });

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log('Contact created successfully:', data);
  } catch (error) {
    console.error('Error creating contact:', error);
  }
}

createContact();
\`\`\`

### Listing Audiences

\`\`\`typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function listAudiences() {
  try {
    const { data, error } = await resend.audiences.list();

    if (error) {
      console.error('Error:', error);
      return;
    }

    console.log('Audiences:', data);
  } catch (error) {
    console.error('Error listing audiences:', error);
  }
}

listAudiences();
\`\`\`

## TypeScript Support

Resend includes built-in TypeScript support. No additional type definitions are required.

\`\`\`typescript
import { Resend } from 'resend';
import type { CreateEmailOptions } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const emailOptions: CreateEmailOptions = {
  from: 'onboarding@resend.dev',
  to: 'user@example.com',
  subject: 'Typed Email',
  text: 'This email is fully typed!',
};

await resend.emails.send(emailOptions);
\`\`\`

## Error Handling

Always handle errors appropriately:

\`\`\`typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

try {
  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: 'user@example.com',
    subject: 'Test Email',
    text: 'Hello World!',
  });

  if (error) {
    // Handle API errors
    console.error('Resend API Error:', error);
    throw new Error(\`Failed to send email: \${error.message}\`);
  }

  console.log('Email sent successfully:', data);
} catch (error) {
  // Handle network or other errors
  console.error('Network or other error:', error);
}
\`\`\`

## Next Steps

1. Get your API key from [Resend Dashboard](https://resend.com/api-keys)
2. Verify your domain for sending emails
3. Create audiences for managing contacts
4. Explore advanced features like templates and webhooks

For more detailed documentation, visit the [official Resend documentation](https://resend.com/docs).
  `;
}
