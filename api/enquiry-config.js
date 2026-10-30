module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({error: 'Method not allowed'});
  const captchaEnabled = process.env.CAPTCHA_ENABLED !== 'false';
  res.status(200).json({captchaEnabled, siteKey: captchaEnabled ? process.env.RECAPTCHA_SITE_KEY || '' : ''});
};
