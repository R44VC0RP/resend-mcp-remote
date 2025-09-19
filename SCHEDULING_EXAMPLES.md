# Email Scheduling Examples

This document provides practical examples of how to use the email scheduling features in the Resend MCP server.

## Quick Start

The easiest way to schedule emails is using the enhanced `send-email` tool with the `scheduledAt` parameter:

```typescript
// Schedule an email for tomorrow morning
{
  "to": "recipient@example.com",
  "subject": "Tomorrow's Meeting",
  "text": "Don't forget about our meeting tomorrow!",
  "scheduledAt": "tomorrow at 9am EST"
}
```

## Natural Language Scheduling

The system accepts various natural language formats:

### Time-based Examples
```javascript
"in 30 minutes"
"in 2 hours"  
"in 3 days"
```

### Day-specific Examples
```javascript
"tomorrow at 10am"
"Monday at 2pm"
"Friday at 5pm EST"
"next Tuesday at 9:30am PST"
```

### Date-specific Examples
```javascript
"December 25th at noon"
"Jan 1st at midnight"
"March 15th at 3pm"
```

## ISO 8601 Format Scheduling

For precise control, use ISO 8601 format:

```javascript
// Specific date and time in UTC
"2024-12-25T10:00:00Z"

// With timezone offset (EST = UTC-5)
"2024-12-25T10:00:00-05:00"

// With timezone offset (PST = UTC-8)  
"2024-12-25T10:00:00-08:00"
```

## Advanced Scheduling Tool

For more control and validation, use `schedule-email-advanced`:

### Natural Language Option
```typescript
{
  "to": "user@example.com",
  "subject": "Scheduled Newsletter",
  "text": "Your weekly newsletter is here!",
  "schedulingOption": "natural_language",
  "scheduleValue": "Friday at 9am",
  "timezone": "America/New_York"
}
```

### ISO Date Option
```typescript
{
  "to": "user@example.com",
  "subject": "Product Launch",
  "text": "Our new product launches today!",
  "schedulingOption": "iso_date",
  "scheduleValue": "2024-12-25T10:00:00Z"
}
```

### Relative Time Option
```typescript
{
  "to": "user@example.com",
  "subject": "Reminder",
  "text": "This is your scheduled reminder.",
  "schedulingOption": "relative_time",
  "scheduleValue": "in 2 hours"
}
```

## Managing Scheduled Emails

### List All Emails (Including Scheduled)
```typescript
// List recent emails
{
  "limit": 10
}

// Paginate through emails
{
  "limit": 20,
  "offset": 40
}
```

The response will include information about scheduled emails, showing their `scheduled_at` timestamp.

## Best Practices

1. **Timezone Awareness**: Always specify timezones for natural language scheduling to avoid confusion
2. **Validation**: The system validates that scheduled times are in the future and within 30 days
3. **Format Consistency**: Choose one scheduling format per application for consistency
4. **Error Handling**: Always handle potential scheduling errors in your code

## Common Scheduling Patterns

### Newsletter Scheduling
```typescript
// Weekly newsletter every Friday at 9am EST
{
  "scheduledAt": "Friday at 9am EST",
  "subject": "Weekly Newsletter - Week of {{date}}",
  // ... other parameters
}
```

### Reminder Emails  
```typescript
// Follow-up reminder in 3 days
{
  "scheduledAt": "in 3 days",
  "subject": "Follow-up: {{original_subject}}",
  // ... other parameters
}
```

### Event Notifications
```typescript
// Event reminder 1 hour before
{
  "scheduledAt": "{{event_time}} - 1 hour", // You'll need to calculate this
  "subject": "Event Starting Soon: {{event_name}}",
  // ... other parameters  
}
```

## Limitations

- Maximum scheduling window: 30 days in advance
- Minimum scheduling time: Must be in the future
- Timezone support: Best with explicit timezone specification
- Natural language parsing: Works well but ISO format is more reliable for edge cases

## Troubleshooting

### Common Errors

**"Scheduled time must be in the future"**
- Check that your scheduled time hasn't already passed
- Consider timezone differences

**"Scheduled time must be within 30 days"**
- Resend limits scheduling to 30 days maximum
- Break long-term campaigns into multiple emails

**"Invalid date format"**
- Verify ISO 8601 format is correct
- Check timezone offset format

**"Warning: Scheduled time may not be in a recognized format"**
- The natural language parser couldn't recognize the format
- Try a simpler format or use ISO 8601