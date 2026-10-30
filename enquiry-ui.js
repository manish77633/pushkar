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
  const dateInput = form.querySelector('[name="travelDate"]');
  const dateField = form.querySelector('.date-field');
  const dateToggle = form.querySelector('.date-calendar-toggle');
  if (dateInput && dateField && dateToggle) {
    const calendar = document.createElement('div');
    calendar.className = 'date-calendar';
    calendar.id = 'travel-date-calendar';
    calendar.setAttribute('role', 'dialog');
    calendar.setAttribute('aria-label', 'Choose travel date');
    calendar.hidden = true;
    const header = document.createElement('div');
    header.className = 'date-calendar-header';
    const previous = document.createElement('button');
    previous.type = 'button'; previous.className = 'date-calendar-nav date-calendar-previous'; previous.setAttribute('aria-label', 'Previous month');
    const monthLabel = document.createElement('strong');
    monthLabel.className = 'date-calendar-month';
    const next = document.createElement('button');
    next.type = 'button'; next.className = 'date-calendar-nav date-calendar-next'; next.setAttribute('aria-label', 'Next month');
    header.append(previous, monthLabel, next);
    const grid = document.createElement('div');
    grid.className = 'date-calendar-grid';
    calendar.append(header, grid);
    dateField.append(calendar);
    dateToggle.setAttribute('aria-controls', calendar.id);
    const today = new Date();
    const todayIso = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
    const parseDate = value => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
      const [year, month, day] = value.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
    };
    let shownMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const validateDate = () => dateInput.setCustomValidity(dateInput.value && (!parseDate(dateInput.value) || dateInput.value < todayIso) ? 'Please choose a valid travel date from today onwards.' : '');
    const renderCalendar = () => {
      monthLabel.textContent = new Intl.DateTimeFormat('en', {month: 'long', year: 'numeric'}).format(shownMonth);
      previous.disabled = shownMonth.getFullYear() === today.getFullYear() && shownMonth.getMonth() === today.getMonth();
      const cells = [];
      for (const label of ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']) {
        const cell = document.createElement('span'); cell.className = 'date-calendar-weekday'; cell.textContent = label; cells.push(cell);
      }
      for (let i = 0; i < shownMonth.getDay(); i++) cells.push(document.createElement('span'));
      const days = new Date(shownMonth.getFullYear(), shownMonth.getMonth() + 1, 0).getDate();
      for (let day = 1; day <= days; day++) {
        const iso = [shownMonth.getFullYear(), String(shownMonth.getMonth() + 1).padStart(2, '0'), String(day).padStart(2, '0')].join('-');
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'date-calendar-day'; button.textContent = String(day);
        button.setAttribute('aria-label', iso); button.setAttribute('aria-pressed', String(dateInput.value === iso));
        button.disabled = iso < todayIso;
        button.addEventListener('click', () => {
          dateInput.value = iso;
          validateDate();
          dateInput.dispatchEvent(new Event('change', {bubbles: true}));
          closeCalendar();
          dateInput.focus();
        });
        cells.push(button);
      }
      grid.replaceChildren(...cells);
    };
    const closeCalendar = () => { calendar.hidden = true; dateToggle.setAttribute('aria-expanded', 'false'); };
    const openCalendar = () => {
      const selected = parseDate(dateInput.value);
      shownMonth = selected && dateInput.value >= todayIso ? new Date(selected.getFullYear(), selected.getMonth(), 1) : new Date(today.getFullYear(), today.getMonth(), 1);
      renderCalendar();
      calendar.hidden = false;
      dateToggle.setAttribute('aria-expanded', 'true');
    };
    dateToggle.addEventListener('click', () => calendar.hidden ? openCalendar() : closeCalendar());
    dateInput.addEventListener('click', openCalendar);
    dateInput.addEventListener('input', validateDate);
    dateInput.addEventListener('change', validateDate);
    previous.addEventListener('click', () => { shownMonth = new Date(shownMonth.getFullYear(), shownMonth.getMonth() - 1, 1); renderCalendar(); });
    next.addEventListener('click', () => { shownMonth = new Date(shownMonth.getFullYear(), shownMonth.getMonth() + 1, 1); renderCalendar(); });
    document.addEventListener('click', event => { if (!dateField.contains(event.target)) closeCalendar(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !calendar.hidden) { closeCalendar(); dateToggle.focus(); } });
  }
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
      success.setAttribute('aria-labelledby', 'enquiry-success-title');
      success.innerHTML = '<button type="button" class="email-draft-close" aria-label="Close message">×</button><h2 id="enquiry-success-title">Thank you for your enquiry!</h2><p>We have received your message and will reply personally within 24 hours with ideas and details for your journey. In the meantime, you are welcome to explore our <a href="/luxury-tours">luxury tours</a> or check our main website <a href="https://www.indianmoments.com" target="_blank" rel="noopener noreferrer">www.indianmoments.com</a></p>';
      document.body.append(success);
      success.querySelector('button').addEventListener('click', () => success.close());
      success.addEventListener('click', e => { if (e.target === success) success.close(); });
      success.addEventListener('close', () => success.remove());
      success.showModal();
    } catch (error) {
      status.textContent = error.message;
      if (widgetId !== null) window.grecaptcha.reset(widgetId);
      status.setAttribute('tabindex', '-1');
      status.focus();
    } finally { submit.disabled = false; submit.textContent = 'Send enquiry'; }
  });
})();
