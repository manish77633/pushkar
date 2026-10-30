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

  // Restrict name input strictly to letters and spaces only
  const nameInput = contactForm.elements.name;
  if (nameInput) {
    nameInput.addEventListener('input', () => {
      nameInput.value = nameInput.value.replace(/[^A-Za-z\s]/g, '');
    });
  }

  // Restrict mobile input to phone characters
  const mobileInput = contactForm.elements.mobile;
  if (mobileInput) {
    mobileInput.addEventListener('input', () => {
      mobileInput.value = mobileInput.value.replace(/[^0-9+\s\-()]/g, '');
    });
  }

  // Attach Page ID from URL query or body route
  const pageField = document.createElement('input');
  pageField.type = 'hidden';
  pageField.name = 'pageId';
  const requestedPage = new URLSearchParams(location.search).get('page') || document.body.dataset.pageRoute || 'pushkar-fair';
  pageField.value = requestedPage;
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
      if (contactForm.elements[field]) contactForm.elements[field].focus();
    };

    // 1. Name Field validation - strictly alphabets and spaces
    if (!/^[A-Za-z\s]{2,80}$/.test(name)) {
      return invalid('name', 'Please enter a name using alphabets only.');
    }

    // 2. Country validation
    if (!/^[A-Za-z\s.'-]{2,80}$/.test(country)) {
      return invalid('country', 'Please enter a valid country name.');
    }

    // 3. Strict Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email) || email.length > 254) {
      return invalid('email', 'Please enter a valid email address (e.g. name@example.com).');
    }

    // 4. Date and travellers validation
    if (data.travelDate && data.travelDate < localToday) {
      return invalid('travelDate', 'Please choose a future travel date.');
    }
    if (!Number.isInteger(Number(data.travellers)) || Number(data.travellers) < 1 || Number(data.travellers) > 50) {
      return invalid('travellers', 'Please enter 1 to 50 travellers.');
    }

    // 5. Mobile Number validation
    if (digits.length < 10 || digits.length > 15 || !/^[+]?[0-9\s\-()]{10,20}$/.test(mobile)) {
      return invalid('mobile', 'Please enter a valid 10 to 15 digit mobile number.');
    }

    if (message.length < 10 || message.length > 1000) {
      return invalid('message', 'Please write a message of 10 to 1000 characters.');
    }

    const body = [
      `Page: ${pageField.value}`,
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

    const subject = `Pushkar Camel Fair enquiry: ${pageField.value}`;
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
const routeAliases = {
  'pushkar-fair-dates-2026': 'programme',
  photography: 'photography-tips',
  'local-people-and-communities': 'culture-and-communities',
  'pushkar-tours': 'luxury-tours',
  'haveli-diwali-and-pushkar-fair': 'tours/haveli-diwali-pushkar-fair/',
  'glimpses-of-india': 'tours/glimpses-of-india/',
  'pushkar-fair-and-dev-diwali': 'tours/pushkar-fair-and-dev-diwali/'
};
const currentRoute = routeAliases[document.body.dataset.pageRoute] || document.body.dataset.pageRoute;
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

// Read More ONLY for mobile screens (<=600px). Desktop ALWAYS displays full copy.
if (window.innerWidth <= 600) {
  document.querySelectorAll('main section').forEach((section, index) => {
    const heading = section.querySelector(':scope > h2');
    const firstContent = heading?.nextElementSibling;
    if (!heading || !firstContent || section.textContent.trim().length < 420 ||
        section.matches('.travel-with-us, .journeys, .tour-paper, .tour-inclusions')) return;

    const content = document.createElement('div');
    content.className = 'mobile-section-content';
    content.id = `mobile-section-${index}`;
    while (heading.nextSibling) content.append(heading.nextSibling);
    section.append(content);
    section.classList.add('mobile-disclosure');

    const title = heading.textContent.trim();
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'mobile-section-heading';
    toggle.setAttribute('aria-controls', content.id);
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = `<span>${title}</span><span class="mobile-section-chevron" aria-hidden="true"></span>`;
    heading.replaceChildren(toggle);

    const more = document.createElement('button');
    more.type = 'button';
    more.className = 'mobile-section-more';
    more.textContent = 'Read More';
    section.append(more);
    const changeState = () => {
      const expanded = content.classList.toggle('expanded');
      toggle.setAttribute('aria-expanded', String(expanded));
      more.textContent = expanded ? 'Read Less' : 'Read More';
    };
    toggle.addEventListener('click', changeState);
    more.addEventListener('click', changeState);
  });

  document.querySelectorAll('main p').forEach((paragraph, index) => {
    if (paragraph.textContent.trim().length < 360 || paragraph.closest('form, .tour-paper, .itinerary, .mobile-disclosure')) return;

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
}
