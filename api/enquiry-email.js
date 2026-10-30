const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

const row = (label, value) => `<tr>
  <th scope="row" style="width:27%;padding:14px 12px 14px 0;border-bottom:1px solid #ebdfd4;color:#735d52;font:700 14px/1.35 Arial,Helvetica,sans-serif;text-align:left;vertical-align:top;">${escapeHtml(label)}</th>
  <td style="padding:14px 0;border-bottom:1px solid #ebdfd4;color:#29201a;font:400 15px/1.4 Arial,Helvetica,sans-serif;vertical-align:top;overflow-wrap:anywhere;">${value}</td>
</tr>`;

const section = (title, rows) => `<h2 style="margin:0 0 3px;padding:0 0 10px;border-bottom:2px solid #d6a052;color:#8d1710;font:700 13px/1.3 Arial,Helvetica,sans-serif;letter-spacing:1.5px;text-transform:uppercase;">${escapeHtml(title)}</h2>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;margin:0 0 28px;">${rows.join('')}</table>`;

const formatDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value)
  ? new Intl.DateTimeFormat('en-GB', {day:'numeric', month:'long', year:'numeric', timeZone:'UTC'}).format(new Date(`${value}T00:00:00Z`))
  : value;

module.exports = (details, requestHost) => {
  const email = details.Email;
  const emailLink = `<a href="mailto:${encodeURIComponent(email)}" style="color:#9c3d19;text-decoration:underline;">${escapeHtml(email)}</a>`;
  const guestRows = [
    row('Name', escapeHtml(details.Name)),
    row('Country', escapeHtml(details.Country)),
    row('Email', emailLink),
    row('Mobile', escapeHtml(details.Mobile))
  ];
  const journeyRows = [
    row('Travel date', escapeHtml(formatDate(details['Travel date']))),
    row('Travellers', escapeHtml(details.Travellers === 'Not provided' ? details.Travellers : `${details.Travellers} ${details.Travellers === '1' ? 'person' : 'people'}`)),
    row('Page', escapeHtml(details.Page)),
    row('Section', escapeHtml(details.Section))
  ];
  let sourceLink = escapeHtml(details.URL);
  try {
    const url = new URL(details.URL);
    if (['http:', 'https:'].includes(url.protocol) && url.host === requestHost) {
      sourceLink = `<a href="${escapeHtml(url.href)}" style="color:#9c3d19;text-decoration:underline;">Open source page</a> <span style="color:#77665c;">(${escapeHtml(url.host + url.pathname)})</span>`;
    }
  } catch { /* Show the source as plain text when it is not a valid URL. */ }

  return `<!doctype html><html lang="en" dir="ltr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>New Pushkar enquiry</title></head>
<body style="margin:0;padding:0;background:#eee6dd;color:#34251f;font-family:Arial,Helvetica,sans-serif;">
<div lang="en" dir="ltr" style="padding:28px 14px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;"><tr><td align="center">
<table role="presentation" width="660" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:660px;border-collapse:collapse;background:#fffdf9;border:1px solid #e5d6c6;border-radius:16px;overflow:hidden;box-shadow:0 18px 45px rgba(79,25,14,.16);">
<tr><td style="height:6px;background:#cf9140;font-size:1px;line-height:1px;">&nbsp;</td></tr>
<tr><td style="padding:30px 38px 32px;background:#820000;color:#fff;">
  <p style="margin:0;color:#ffd299;font:700 12px/1.3 Arial,Helvetica,sans-serif;letter-spacing:2.6px;">INDIAN MOMENTS</p>
  <h1 style="margin:14px 0 7px;color:#fff;font:400 28px/1.15 Arial,Helvetica,sans-serif;">New Pushkar enquiry</h1>
  <p style="margin:0;color:#f6d6c8;font:400 14px/1.4 Arial,Helvetica,sans-serif;">A new travel request has arrived from your website.</p>
</td></tr>
<tr><td style="padding:30px 38px 28px;">
  ${section('Guest details', guestRows)}
  ${section('Journey details', journeyRows)}
  <h2 style="margin:0 0 14px;padding:0 0 10px;border-bottom:2px solid #d6a052;color:#8d1710;font:700 13px/1.3 Arial,Helvetica,sans-serif;letter-spacing:1.5px;text-transform:uppercase;">Message</h2>
  <div style="padding:17px 19px;border-left:4px solid #d6a052;background:#faf2e7;color:#34251f;font:400 15px/1.5 Arial,Helvetica,sans-serif;overflow-wrap:anywhere;">${escapeHtml(details.Message).replace(/\n/g,'<br>')}</div>
  <p style="margin:26px 0 0;padding-top:17px;border-top:1px solid #ebdfd4;color:#77665c;font:400 12px/1.5 Arial,Helvetica,sans-serif;overflow-wrap:anywhere;">Submitted from: ${sourceLink}</p>
</td></tr>
<tr><td style="padding:18px 38px;background:#f4e8d9;color:#795a49;font:400 12px/1.4 Arial,Helvetica,sans-serif;"><strong style="color:#820000;">Pushkar Camel Fair</strong> &nbsp;|&nbsp; Enquiry notification</td></tr>
</table></td></tr></table></div></body></html>`;
};
