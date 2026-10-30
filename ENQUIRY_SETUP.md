# Enquiry setup

Enquiry links open the contact page, where the form uses `/api/enquiry`. A submission succeeds only after the configured SMTP provider accepts the message. The email contains the enquiry fields, source page, source section, and page URL.

## Required Vercel environment variables

Copy the placeholder names from `.env.example` into Vercel project settings for Production and Preview. For `@indianmoments.com` mailboxes, set `SMTP_HOST=smtp.rediffmailpro.com` and `SMTP_PORT=587`.

- `SMTP_USER`: full Rediffmail Pro mailbox address used to send notifications, such as `tarun@indianmoments.com`.
- `SMTP_PASS`: password for that Rediffmail Pro mailbox. Do not use a Gmail App Password for a Rediffmail Pro mailbox.
- `RECEIVER_EMAIL`: address that receives enquiries.
- `CAPTCHA_ENABLED`: CAPTCHA is enabled by default. Set to `false` only for a temporary bypass.
- `RECAPTCHA_SITE_KEY`: public Google reCAPTCHA v2 checkbox key, required when CAPTCHA is enabled.
- `RECAPTCHA_SECRET_KEY`: private Google reCAPTCHA v2 checkbox key, required when CAPTCHA is enabled.

If using a Gmail mailbox instead, set `SMTP_HOST=smtp.gmail.com` and use a Gmail App Password. For `@indianmoments.com` mailboxes, the API chooses Rediffmail Pro when `SMTP_HOST` is absent or still set to `smtp.gmail.com`.

Create a Google reCAPTCHA v2 checkbox key pair at https://www.google.com/recaptcha/admin/create and add the production hostname. Copy its site and secret keys to Vercel. Redeploy after setting variables.

The API fails closed if required SMTP configuration is missing. No secrets belong in browser code or committed `.env` files. Run `npm test` for local API tests. A live email test requires real credentials and a deployed or locally configured environment; check the received message and Vercel function logs after deployment. Without shared storage, the API has no persistent IP rate limit or duplicate enquiry block. The frontend still prevents double clicks while a submission is in progress, and the backend still checks the honeypot and input validity. By default, the backend also verifies reCAPTCHA.
