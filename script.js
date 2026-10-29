const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('#mobile-menu');
const closeMenu = () => {
  menu.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open menu');
};
menuButton.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeMenu();
});
document.addEventListener('click', event => {
  if (menu.classList.contains('open') && !event.target.closest('.site-header')) closeMenu();
});

const contactForm = document.querySelector('#contact-form');
if (contactForm) {
  const status = document.createElement('p');
  status.className = 'form-status';
  status.setAttribute('role', 'status');
  contactForm.append(status);
  const pageField = document.createElement('input');
  pageField.type = 'hidden';
  pageField.name = 'pageId';
  const allowedPages = new Set([
    'pushkar-fair', 'pushkar-fair-2027', 'pushkar-tours',
    'haveli-diwali', 'glimpses-of-india', 'pushkar-dev-diwali'
  ]);
  const requestedPage = new URLSearchParams(location.search).get('page');
  pageField.value = allowedPages.has(requestedPage) ? requestedPage : 'general-enquiry';
  contactForm.append(pageField);
  contactForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;
    const clicked = event.submitter;
    const data = Object.fromEntries(new FormData(contactForm));
    const name = data.name.trim();
    const country = data.country.trim();
    const email = data.email.trim();
    const mobile = data.mobile.trim();
    const message = data.message.trim();
    const digits = mobile.replace(/\D/g, '');
    const today = new Date();
    const localToday = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0')
    ].join('-');
    const invalid = (field, messageText) => {
      status.textContent = messageText;
      contactForm.elements[field].focus();
    };
    if (!/^[A-Za-z ]{2,80}$/.test(name)) return invalid('name', 'Please enter a name using letters and spaces only.');
    if (!/^[A-Za-z .'-]{2,80}$/.test(country)) return invalid('country', 'Please enter a valid country name.');
    if (!contactForm.elements.email.checkValidity() || email.length > 254) return invalid('email', 'Please enter a valid email address.');
    if (data.travelDate < localToday) return invalid('travelDate', 'Please choose a future travel date.');
    if (!Number.isInteger(Number(data.travellers)) || Number(data.travellers) < 1 || Number(data.travellers) > 50) return invalid('travellers', 'Please enter 1 to 50 travellers.');
    if (!/^\+?[0-9 ]+$/.test(mobile) || digits.length < 10 || digits.length > 15) return invalid('mobile', 'Please enter a valid mobile number with 10 to 15 digits.');
    if (message.length < 10 || message.length > 1000) return invalid('message', 'Please write a message of 10 to 1000 characters.');
    const body = [
      `Page: ${data.pageId}`,
      `Name: ${name}`,
      `Country: ${country}`,
      `Date of travel: ${data.travelDate}`,
      `Travellers: ${data.travellers}`,
      `Email: ${email}`,
      `Mobile: ${mobile}`,
      '',
      'Message:',
      message
    ].join('\n');
    if (clicked?.dataset.channel === 'whatsapp') {
      const configuredNumber = contactForm.dataset.whatsappNumber || '';
      const number = /^\d{10,15}$/.test(configuredNumber) ? configuredNumber : '';
      const shareUrl = `https://wa.me/${number}?text=${encodeURIComponent(`Pushkar Camel Fair enquiry\n\n${body}`)}`;
      status.textContent = number
        ? 'WhatsApp chat opened with your enquiry. Please press Send there.'
        : 'WhatsApp opened with your enquiry. Choose a contact and press Send.';
      window.location.href = shareUrl;
      return;
    }
    const subject = `Pushkar Camel Fair enquiry: ${data.pageId}`;
    const mailto = `mailto:${contactForm.dataset.recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.textContent = 'Email draft opened with your details. Please press Send in your mail app. If it did not open, ';
    const copyButton = document.createElement('button');
    copyButton.type = 'button';
    copyButton.className = 'copy-enquiry';
    copyButton.textContent = 'copy enquiry';
    copyButton.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(`To: ${contactForm.dataset.recipient}\nSubject: ${subject}\n\n${body}`);
        status.firstChild.textContent = 'Enquiry copied. Paste it into your email and press Send. ';
      } catch {
        status.firstChild.textContent = 'Copy failed. Please use your mail app to send the enquiry. ';
      }
    });
    status.append(copyButton, '.');
    window.location.href = mailto;
  });
}

const pageLinks = document.querySelectorAll('.sidebar a, .mobile-menu a');
const currentRoute = document.body.dataset.pageRoute;
pageLinks.forEach(link => {
  link.classList.remove('active');
  if (!link.hash && link.getAttribute('href') === `/${currentRoute}`) link.classList.add('active');
});

const sections = [...document.querySelectorAll('[data-nav-section]')];
if (sections.length) {
  const updateActiveSection = () => {
    let current = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= 170) current = section;
    }
    pageLinks.forEach(link => link.classList.toggle('active', link.hash === `#${current.id}`));
  };
  addEventListener('scroll', updateActiveSection, {passive: true});
  updateActiveSection();
}

// Keep long copy readable on content pages without hiding navigation or forms.
document.querySelectorAll('main p').forEach((paragraph, index) => {
  if (paragraph.textContent.trim().length < 360 || paragraph.closest('form, .tour-paper, .itinerary')) return;

  const inCompactLayout = paragraph.parentElement.matches('.schedule-day');
  let container = paragraph.parentElement;
  if (inCompactLayout) {
    container = document.createElement('div');
    container.className = 'read-more-wrap';
    paragraph.before(container);
    container.append(paragraph);
  }

  const id = `read-more-copy-${index}`;
  paragraph.id ||= id;
  paragraph.classList.add('read-more-copy');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'read-more-toggle';
  button.setAttribute('aria-controls', paragraph.id);
  button.setAttribute('aria-expanded', 'false');
  button.innerHTML = 'Read More <span class="read-more-arrow" aria-hidden="true"></span>';
  paragraph.after(button);
  button.addEventListener('click', () => {
    const expanded = paragraph.classList.toggle('expanded');
    button.setAttribute('aria-expanded', String(expanded));
    button.innerHTML = `${expanded ? 'Read Less' : 'Read More'} <span class="read-more-arrow" aria-hidden="true"></span>`;
  });
});

