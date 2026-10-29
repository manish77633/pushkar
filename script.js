const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('#mobile-menu');
menuButton.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menu.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open menu');
}));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    menu.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  }
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
  pageField.value = new URLSearchParams(location.search).get('page') || location.pathname.split('/').pop() || 'contact';
  contactForm.append(pageField);
  contactForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;
    const clicked = event.submitter;
    if (clicked?.dataset.channel === 'whatsapp') {
      status.textContent = 'WhatsApp recipient number is not set yet. Please use Send on Email.';
      return;
    }
    const button = clicked || contactForm.querySelector('[data-channel="email"]');
    button.disabled = true;
    status.textContent = 'Sending your enquiry…';
    const data = Object.fromEntries(new FormData(contactForm));
    data._subject = `Pushkar Camel Fair enquiry: ${data.pageId}`;
    data._captcha = 'false';
    try {
      const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(contactForm.dataset.recipient)}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (!response.ok || result.success === false || result.success === 'false') throw new Error(result.message || 'Delivery failed');
      status.textContent = 'Enquiry submitted. Thank you!';
      contactForm.reset();
    } catch (error) {
      status.textContent = 'Enquiry could not be sent. Please try again in a moment.';
    } finally {
      button.disabled = false;
    }
  });
}

const pageLinks = document.querySelectorAll('.sidebar a, .mobile-menu a');
const currentFile = location.pathname.split('/').pop() || 'index.html';
pageLinks.forEach(link => {
  link.classList.remove('active');
  if (!link.hash && link.getAttribute('href') === currentFile) link.classList.add('active');
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

