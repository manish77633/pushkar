(() => {
  const form = document.querySelector('#contact-form');
  if (!form) return;
  form.removeAttribute('data-recipient');
  form.querySelector('.form-actions').innerHTML = '<button type="submit">Send enquiry</button>';
  form.querySelector('.form-note')?.remove();
  form.querySelector('.form-actions').insertAdjacentHTML('beforebegin', '<div class="honeypot" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div><div class="recaptcha-slot"></div>');
  form.insertAdjacentHTML('beforeend', '<p class="form-status" role="status" aria-live="polite"></p>');
  const status = form.querySelector('.form-status');
  const submit = form.querySelector('[type="submit"]');
  const query = new URLSearchParams(location.search);
  let sourcePage = query.get('sourcePage') || query.get('page') || document.title;
  let sourceSection = query.get('sourceSection') || 'General enquiry';
  let sourceUrl = query.get('sourceUrl') || location.href;
  let issuedAt = Date.now();
  let widgetId = null;
  let siteKey = '';
  const config = fetch('/api/enquiry-config').then(response => response.json()).then(data => { siteKey = data.siteKey || ''; }).catch(() => {});
  let recaptchaReady;
  const loadRecaptcha = () => {
    if (window.grecaptcha?.render) return Promise.resolve();
    if (!recaptchaReady) recaptchaReady = new Promise((resolve, reject) => {
      window.onRecaptchaLoaded = resolve;
      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoaded&render=explicit';
      script.onerror = reject;
      document.head.append(script);
    });
    return recaptchaReady;
  };
  const prepareSecurity = async () => {
    await config;
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
    const token = widgetId === null ? '' : window.grecaptcha.getResponse(widgetId);
    if (!token) { status.textContent = 'Please complete the security check.'; return; }
    submit.disabled = true;
    submit.textContent = 'Sending…';
    status.textContent = '';
    const data = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch('/api/enquiry', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({...data, sourcePage, sourceSection, pageUrl: sourceUrl, issuedAt, recaptchaToken: token})});
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || 'Could not send your enquiry. Please try again.');
      form.reset();
      const success = document.createElement('dialog');
      success.className = 'email-draft-dialog';
      success.innerHTML = '<button type="button" class="email-draft-close" aria-label="Close message">×</button><h2>Thank you for your enquiry!</h2><p>Your enquiry has been sent successfully. We will get back to you soon.</p>';
      document.body.append(success);
      success.querySelector('button').addEventListener('click', () => success.close());
      success.addEventListener('click', e => { if (e.target === success) success.close(); });
      success.addEventListener('close', () => success.remove());
      success.showModal();
    } catch (error) {
      status.textContent = `${error.message} Complete the CAPTCHA again before retrying.`;
      if (widgetId !== null) window.grecaptcha.reset(widgetId);
      status.setAttribute('tabindex', '-1');
      status.focus();
    } finally { submit.disabled = false; submit.textContent = 'Send enquiry'; }
  });
})();
