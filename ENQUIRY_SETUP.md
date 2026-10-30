# Enquiry setup

Enquiry links open the contact page, where the form uses `/api/enquiry`. A submission succeeds only after Gmail SMTP accepts the message. The email contains the enquiry fields, source page, source section, and page URL.

## Required Vercel environment variables

Copy the placeholder names from `.env.example` into Vercel project settings for Production and Preview. Set `SMTP_HOST=smtp.gmail.com` and `SMTP_PORT=587`.

- `SMTP_USER`: Gmail address used to send notifications.
- `SMTP_PASS`: Gmail App Password, not the normal account password.
- `RECEIVER_EMAIL`: address that receives enquiries.
- `CAPTCHA_ENABLED`: currently defaults to `false` for a temporary bypass. Set to `true` to restore the CAPTCHA check.
- `RECAPTCHA_SITE_KEY`: public Google reCAPTCHA v2 checkbox key, required when CAPTCHA is enabled.
- `RECAPTCHA_SECRET_KEY`: private Google reCAPTCHA v2 checkbox key, required when CAPTCHA is enabled.

Enable two-step verification on the sending Google account, then create an App Password in Google Account security settings. Google may not offer App Passwords for every account type or security configuration.

Create a Google reCAPTCHA v2 checkbox key pair at https://www.google.com/recaptcha/admin/create and add the production hostname. Copy its site and secret keys to Vercel. Redeploy after setting variables.

The API fails closed if required SMTP configuration is missing. No secrets belong in browser code or committed `.env` files. Run `npm test` for local API tests. A live Gmail test requires real credentials and a deployed or locally configured environment; check the received message and Vercel function logs after deployment. Without shared storage, the API has no persistent IP rate limit or duplicate enquiry block. The frontend still prevents double clicks while a submission is in progress, and the backend still checks the honeypot and input validity. When `CAPTCHA_ENABLED=true`, the backend also verifies reCAPTCHA.
