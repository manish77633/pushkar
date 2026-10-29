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

// The XD mobile artboards use compact, independently expandable home sections.
const homeMain = document.querySelector('#visitor-guide')?.closest('main');
if (homeMain) {
  const mobileStories = document.createElement('div');
  mobileStories.className = 'mobile-stories';
  const addStory = (title, content, open = false) => {
    const details = document.createElement('details');
    details.className = 'mobile-story';
    details.open = open;
    const summary = document.createElement('summary');
    summary.textContent = title;
    const body = document.createElement('div');
    body.className = 'mobile-story-body';
    body.append(content);
    details.append(summary, body);
    mobileStories.append(details);
  };
  const photoPage = 'photography.html';
  const photoIntro = document.createElement('p');
  photoIntro.innerHTML = 'You are going to find many photographers around the dunes in the camels area at any point of the day. While this can be found annoying, the scene is attractive enough for anyone to capture. Camels are large living… <a href="' + photoPage + '">Read More</a>';
  addStory('Photography', photoIntro, true);
  const survival = homeMain.querySelector('.survival-section');
  if (survival) {
    const list = survival.querySelector('.tips')?.cloneNode(true);
    if (list) addStory('Fair survival guide', list);
  }
  const orientation = homeMain.querySelector('.intro-section');
  if (orientation) {
    const body = document.createElement('div');
    const photo = document.createElement('img');
    photo.src = 'assets/Pushkar site Images copy.webp';
    photo.alt = 'Busy street at Pushkar Fair';
    body.append(photo, orientation.querySelector('p').cloneNode(true));
    addStory('General orientation', body);
  }
  const final = homeMain.querySelector('.final-section');
  if (final) {
    const body = document.createElement('div');
    body.append(final.querySelector('p').cloneNode(true));
    const photos = document.createElement('div');
    photos.className = 'mobile-story-photos';
    for (const src of ['assets/home-hero.png', 'assets/pushkar-camel-fair-event-photo.webp']) {
      const img = document.createElement('img');
      img.src = src;
      img.alt = 'Scenes from Pushkar Fair';
      photos.append(img);
    }
    body.append(photos);
    addStory(final.querySelector('h2').textContent, body, true);
  }
  const enquiry = homeMain.querySelector('.pill-button')?.cloneNode(true);
  if (enquiry) mobileStories.append(enquiry);
  homeMain.querySelector('.page-heading')?.after(mobileStories);
}

