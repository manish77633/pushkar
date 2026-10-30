const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('#mobile-menu');
const siteHeader = document.querySelector('.site-header');
const updateHeader = () => siteHeader.classList.toggle('is-scrolled', window.scrollY > 24);
window.addEventListener('scroll', updateHeader, {passive: true});
updateHeader();
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

document.querySelectorAll('a[href^="/enquiry"], a[href^="/contact-us"]').forEach(link => {
  link.addEventListener('click', () => {
    const destination = new URL(link.href);
    if (destination.pathname === '/enquiry') destination.pathname = '/contact-us';
    if (!destination.searchParams.has('page')) {
      destination.searchParams.set('page', document.body.dataset.pageRoute || 'pushkar-fair');
    }
    const pageName = document.querySelector('main .page-heading h1')?.textContent.trim() || document.title;
    const main = link.closest('main');
    const section = link.closest('section') || [...(main?.children || [])]
      .filter(element => element.tagName === 'SECTION' &&
        (element.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING))
      .at(-1);
    const sectionName = section?.querySelector('h2, h3')?.textContent.trim() || 'General enquiry';
    destination.searchParams.set('sourcePage', pageName);
    destination.searchParams.set('sourceSection', sectionName);
    destination.searchParams.set('sourceUrl', location.href);
    link.href = destination.href;
  });
});

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
