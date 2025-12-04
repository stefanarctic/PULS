# EmailJS Setup Guide

This guide explains how to set up EmailJS for sending problem suggestions from non-admin users.

## Overview

When non-admin users suggest problems, the application uses EmailJS to send an email to `pulsphysics@gmail.com` with the problem details. Admins can then review and add approved problems to the database.

## Setup Steps

### 1. Create an EmailJS Account

1. Go to [EmailJS](https://www.emailjs.com/)
2. Sign up for a free account (free tier includes 200 emails/month)
3. Verify your email address

### 2. Create an Email Service

1. In the EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider (Gmail recommended)
4. Follow the setup instructions to connect your email account
5. Note down the **Service ID** (e.g., `service_xxxxx`)

### 3. Create an Email Template

1. Go to **Email Templates** in the EmailJS dashboard
2. Click **Create New Template**
3. Use the following template structure:

**Template Name:** Problem Suggestion

**Subject:** `{{subject}}`

**Content (HTML):**
```
{{message_html}}
```

**CRITICAL:** 
- Make sure to select **HTML** as the content type (NOT plain text) - this is usually a toggle or dropdown in the EmailJS editor
- Do NOT wrap `{{message_html}}` in HTML tags - EmailJS will add the `<!DOCTYPE html>`, `<html>`, `<head>`, and `<body>` tags automatically
- Just put `{{message_html}}` directly in the content field
- The template uses `{{message_html}}` for the HTML content
- A plain text fallback (`{{message}}`) is also included for email clients that don't support HTML

**How to set HTML format in EmailJS:**
1. In the Content tab, look for a dropdown or toggle that says "Content Type" or "Format"
2. Select "HTML" (not "Plain Text" or "Text")
3. Some EmailJS versions have this in the Settings tab instead

**Email Parameters (Right Sidebar):**
- **To Email:** `pulsphysics@gmail.com` (or use `{{to_email}}` if you want it dynamic)
- **From Name:** `{{from_name}}` (this will show the user's name)
- **From Email:** `{{from_email}}` (recommended - allows replies to go to the user) OR `pulsphysics@gmail.com` (if you want all emails from admin address)
- **Reply To:** `{{from_email}}` (recommended - so admins can reply directly to the user)

4. Save the template and note down the **Template ID** (e.g., `template_xxxxx`)

### 4. Get Your Public Key

1. Go to **Account** → **General** in the EmailJS dashboard
2. Find your **Public Key** (also called API Key)
3. Copy it

### 5. Configure Environment Variables

Add the following variables to your `.env` file (create it in the root directory if it doesn't exist):

```env
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
```

**Important:** 
- Never commit your `.env` file to version control
- Make sure `.env` is in your `.gitignore` file
- Replace the placeholder values with your actual EmailJS credentials

### 6. Restart Your Development Server

After adding the environment variables, restart your development server:

```bash
npm run dev
```

## Testing

1. Log in as a non-admin user
2. Click the "Add Problem" button (it will show "Suggest a Problem" for non-admins)
3. Fill out the problem form
4. Submit the form
5. Check the email inbox for `pulsphysics@gmail.com` to verify the email was sent

## Troubleshooting

### Email not sending

1. Check browser console for errors
2. Verify all environment variables are set correctly
3. Ensure EmailJS service is active and connected
4. Check EmailJS dashboard for usage limits (free tier: 200 emails/month)

### "EmailJS not configured" error

- Make sure all three environment variables are set:
  - `VITE_EMAILJS_PUBLIC_KEY`
  - `VITE_EMAILJS_SERVICE_ID`
  - `VITE_EMAILJS_TEMPLATE_ID`
- Restart your development server after adding environment variables

### Template variables not working

- Ensure template variables match exactly: `{{subject}}`, `{{from_name}}`, `{{from_email}}`, `{{message}}`
- Check that the template is published (not in draft mode)

## Alternative Solutions

If you prefer not to use EmailJS, you can:

1. **Firebase Cloud Functions**: Set up a Firebase Cloud Function to send emails using Nodemailer or SendGrid
2. **Backend API**: Create a backend API endpoint that handles email sending
3. **Third-party API**: Use services like SendGrid, Mailgun, or AWS SES

For any of these alternatives, you'll need to modify `src/lib/emailService.js` to use the new service instead of EmailJS.

