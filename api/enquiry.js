const nodemailer = require('nodemailer');

const clean = (value, max) => typeof value === 'string' ? value.trim().slice(0, max + 1) : '';
const safe = value => value.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({error: 'Method not allowed'});
  const captchaEnabled = process.env.CAPTCHA_ENABLED !== 'false';
  const configured = ['SMTP_USER','SMTP_PASS','RECEIVER_EMAIL', ...(captchaEnabled ? ['RECAPTCHA_SECRET_KEY'] : [])].every(key => process.env[key]);
  if (!configured) return res.status(503).json({error: 'Enquiries are temporarily unavailable. Please try again later.'});
  const origin = req.headers.origin;
  if (origin) {
    try {
      if (new URL(origin).host !== req.headers.host) return res.status(403).json({error: 'Request not allowed.'});
    } catch { return res.status(403).json({error: 'Request not allowed.'}); }
  }
  if (!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] || '')) return res.status(415).json({error: 'JSON required.'});
  if (Number(req.headers['content-length'] || 0) > 20000) return res.status(413).json({error: 'Enquiry is too large.'});
  const body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body) || Buffer.byteLength(JSON.stringify(body)) > 20000) return res.status(400).json({error: 'Invalid enquiry.'});
  if (body.website) return res.status(400).json({error: 'Invalid enquiry.'});
  const name = clean(body.name, 80), country = clean(body.country, 80), email = clean(body.email, 254), mobile = clean(body.mobile, 20);
  const travelDate = clean(body.travelDate, 10), travellers = clean(body.travellers, 2), message = clean(body.message, 1000);
  const sourcePage = clean(body.sourcePage, 120), sourceSection = clean(body.sourceSection, 120), pageUrl = clean(body.pageUrl, 500);
  if (!/^[\p{L} .'-]{2,80}$/u.test(name)) return res.status(400).json({error: 'Please enter a valid name.'});
  if (!/^[\p{L} .'-]{2,80}$/u.test(country)) return res.status(400).json({error: 'Please enter a valid country.'});
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) return res.status(400).json({error: 'Please enter a valid email address.'});
  if (!/^[6-9]\d{9}$/.test(mobile) || /^(\d)\1{9}$/.test(mobile)) return res.status(400).json({error: 'Please enter a valid 10-digit Indian mobile number.'});
  if (message.length < 10 || message.length > 1000) return res.status(400).json({error: 'Please enter a message of 10 to 1000 characters.'});
  if (/[\r\n]/.test(sourcePage + sourceSection)) return res.status(400).json({error: 'Invalid page details.'});
  if (travelDate && (!/^\d{4}-\d{2}-\d{2}$/.test(travelDate) || Number.isNaN(Date.parse(travelDate)) || travelDate < new Date().toISOString().slice(0,10))) return res.status(400).json({error: 'Please choose a valid future travel date.'});
  if (travellers && (!/^\d{1,2}$/.test(travellers) || +travellers < 1 || +travellers > 50)) return res.status(400).json({error: 'Please enter 1 to 50 travellers.'});
  const issuedAt = Number(body.issuedAt);
  if (!Number.isFinite(issuedAt) || Date.now() - issuedAt < 2000 || Date.now() - issuedAt > 3600000) return res.status(400).json({error: 'Please reopen the form and try again.'});
  if (captchaEnabled && (!body.recaptchaToken || typeof body.recaptchaToken !== 'string')) return res.status(400).json({error: 'Please complete the security check.'});
  if (captchaEnabled && body.recaptchaToken.length > 8192) return res.status(400).json({error: 'Security check response is too large. Please try again.'});
  try {
    if (captchaEnabled) {
    const verification = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams({secret: process.env.RECAPTCHA_SECRET_KEY, response: body.recaptchaToken})
    });
    const challenge = verification.ok ? await verification.json() : null;
    if (!challenge?.success) {
      const codes = challenge?.['error-codes'] || [];
      if (codes.includes('invalid-input-secret') || codes.includes('missing-input-secret')) {
        return res.status(503).json({error: 'CAPTCHA setup needs attention. Please contact us directly while we fix it.'});
      }
      if (codes.includes('timeout-or-duplicate')) return res.status(400).json({error: 'CAPTCHA expired. Please complete it again.'});
      return res.status(400).json({error: 'Security check failed. Please try again.'});
    }
    if (challenge.hostname && challenge.hostname !== req.headers.host?.split(':')[0]) return res.status(400).json({error: 'CAPTCHA domain does not match this website.'});
    }
    const details = {Name:name, Country:country, Email:email, Mobile:mobile, 'Travel date':travelDate || 'Not provided', Travellers:travellers || 'Not provided', Page:sourcePage || 'Unknown', Section:sourceSection || 'General enquiry', URL:pageUrl || 'Not provided', Message:message};
    const text = Object.entries(details).map(([key,value]) => `${key}: ${value}`).join('\n');
    const html = `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#321e16"><h1 style="color:#820000">New Pushkar enquiry</h1>${Object.entries(details).map(([key,value]) => `<p><strong>${safe(key)}:</strong><br>${safe(value).replace(/\n/g,'<br>')}</p>`).join('')}</div>`;
    try {
      const smtpUser = process.env.SMTP_USER.trim();
      const indianMomentsMailbox = /@indianmoments\.com$/i.test(smtpUser);
      const host = indianMomentsMailbox && (!process.env.SMTP_HOST || process.env.SMTP_HOST === 'smtp.gmail.com')
        ? 'smtp.rediffmailpro.com' : process.env.SMTP_HOST || 'smtp.gmail.com';
      const port = Number(host === 'smtp.rediffmailpro.com' ? 587 : process.env.SMTP_PORT || 587);
      const transport = nodemailer.createTransport({host, port, secure: port === 465, auth: {user: smtpUser, pass: process.env.SMTP_PASS}, connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000});
      await transport.sendMail({from: smtpUser, to: process.env.RECEIVER_EMAIL, replyTo: email, subject: 'Pushkar Camel Fair enquiry', text, html, disableFileAccess: true, disableUrlAccess: true});
    } catch (error) {
      console.error('Enquiry SMTP delivery failed:', error.code || 'unknown');
      const message = error.code === 'EAUTH' || error.responseCode === 535
        ? 'Email setup needs attention. Please contact us directly while we fix it.'
        : 'Email could not be sent. Please try again shortly.';
      return res.status(502).json({error: message});
    }
    return res.status(200).json({ok: true});
  } catch (error) {
    console.error('Enquiry service failed:', error.message);
    return res.status(503).json({error: 'Enquiries are temporarily unavailable. Please try again later.'});
  }
};
