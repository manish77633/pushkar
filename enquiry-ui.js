(() => {
  const form = document.querySelector('#contact-form');
  if (!form) return;
  form.removeAttribute('data-recipient');
  form.querySelector('.form-actions').innerHTML = '<button type="submit">Send enquiry</button><button type="button" class="whatsapp-enquiry">Send on WhatsApp</button>';
  form.querySelector('.form-note')?.remove();
  form.querySelector('.form-actions').insertAdjacentHTML('beforebegin', '<div class="honeypot" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div><div class="recaptcha-slot"></div>');
  form.insertAdjacentHTML('beforeend', '<p class="form-status" role="status" aria-live="polite"></p>');
  const status = form.querySelector('.form-status');
  const submit = form.querySelector('[type="submit"]');
  form.querySelector('.whatsapp-enquiry').addEventListener('click', () => {
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form));
    const details = [
      'Pushkar Camel Fair enquiry', '',
      `Page: ${sourcePage}`, `Section: ${sourceSection}`, `Page URL: ${sourceUrl}`,
      `Name: ${data.name}`, `Country: ${data.country}`, `Travel date: ${data.travelDate || 'Not provided'}`,
      `Travellers: ${data.travellers || 'Not provided'}`, `Email: ${data.email}`, `Mobile: ${data.mobile}`,
      '', 'Message:', data.message
    ].join('\n');
    const number = /^\d{10,15}$/.test(form.dataset.whatsappNumber || '') ? form.dataset.whatsappNumber : '';
    const shareUrl = number ? `https://wa.me/${number}?text=${encodeURIComponent(details)}` : `https://api.whatsapp.com/send?text=${encodeURIComponent(details)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
    status.textContent = 'WhatsApp opened with your enquiry. Choose a contact and press Send there.';
  });
  const query = new URLSearchParams(location.search);
  let sourcePage = query.get('sourcePage') || query.get('page') || document.title;
  let sourceSection = query.get('sourceSection') || 'General enquiry';
  let sourceUrl = query.get('sourceUrl') || location.href;
  let issuedAt = Date.now();
  let widgetId = null;
  let siteKey = '';
  let captchaEnabled = false;
  const config = fetch('/api/enquiry-config').then(response => response.json()).then(data => { captchaEnabled = data.captchaEnabled === true; siteKey = data.siteKey || ''; }).catch(() => {});
  let recaptchaReady;
  const loadRecaptcha = () => {
    if (window.grecaptcha?.render) return Promise.resolve();
    if (!recaptchaReady) recaptchaReady = (async () => {
      for (const host of ['www.recaptcha.net', 'www.google.com']) {
        try {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            const timer = setTimeout(() => { script.remove(); reject(new Error('CAPTCHA load timed out')); }, 12000);
            window.onRecaptchaLoaded = () => { clearTimeout(timer); resolve(); };
            script.src = `https://${host}/recaptcha/api.js?onload=onRecaptchaLoaded&render=explicit`;
            script.onerror = () => { clearTimeout(timer); script.remove(); reject(new Error('CAPTCHA script blocked')); };
            document.head.append(script);
          });
          return;
        } catch { /* Try the alternate Google endpoint. */ }
      }
      throw new Error('CAPTCHA could not load');
    })();
    return recaptchaReady;
  };
  const prepareSecurity = async () => {
    await config;
    if (!captchaEnabled) return;
    if (!siteKey) { status.textContent = 'Enquiries are temporarily unavailable. Please try again later.'; return; }
    try {
      await loadRecaptcha();
      if (widgetId === null) widgetId = window.grecaptcha.render(form.querySelector('.recaptcha-slot'), {sitekey: siteKey});
      else window.grecaptcha.reset(widgetId);
    } catch { status.textContent = 'Security check could not load. Please refresh and try again.'; }
  };
  prepareSecurity();
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity() || submit.disabled) return;
    const token = captchaEnabled && widgetId !== null ? window.grecaptcha.getResponse(widgetId) : '';
    if (captchaEnabled && !token) { status.textContent = 'Please complete the security check.'; return; }
    submit.disabled = true;
    submit.textContent = 'Sending…';
    status.textContent = '';
    const data = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch('/api/enquiry', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({...data, sourcePage, sourceSection, pageUrl: sourceUrl, issuedAt, recaptchaToken: token})});
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || 'Could not send your enquiry. Please try again.');
      form.reset();
      issuedAt = Date.now();
      if (captchaEnabled && widgetId !== null) window.grecaptcha.reset(widgetId);
      const success = document.createElement('dialog');
      success.className = 'email-draft-dialog';
      success.innerHTML = '<button type="button" class="email-draft-close" aria-label="Close message">×</button><h2>Thank you for your enquiry!</h2><p>Your enquiry has been sent successfully. We will get back to you soon.</p>';
      document.body.append(success);
      success.querySelector('button').addEventListener('click', () => success.close());
      success.addEventListener('click', e => { if (e.target === success) success.close(); });
      success.addEventListener('close', () => success.remove());
      success.showModal();
    } catch (error) {
      status.textContent = `${error.message}${captchaEnabled ? ' Complete the CAPTCHA again before retrying.' : ''}`;
      if (widgetId !== null) window.grecaptcha.reset(widgetId);
      status.setAttribute('tabindex', '-1');
      status.focus();
    } finally { submit.disabled = false; submit.textContent = 'Send enquiry'; }
  });
})();
