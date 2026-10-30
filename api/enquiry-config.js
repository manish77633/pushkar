module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({error: 'Method not allowed'});
  res.status(200).json({siteKey: process.env.RECAPTCHA_SITE_KEY || ''});
};
