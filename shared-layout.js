// Edit these three templates to update every page's shared layout.
const sharedHeader = `<header class="site-header">
      <a class="tagline" href="/pushkar-fair">Experience India’s greatest tribal gathering</a>
      <button class="menu-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu"><span></span><span></span><span></span></button>
      <nav class="mobile-menu" id="mobile-menu" aria-label="Main navigation"><h2>Pushkar Camel Fair</h2><a href="/pushkar-fair">Pushkar Fair</a><a href="/pushkar-fair-dates-2026">Pushkar Fair Dates 2026</a><a href="/photography">Photography</a><a href="/local-people-and-communities">Local people &amp; Communities</a><a href="/pushkar-tours">Pushkar Tours</a><a href="/pushkar-fair-photo-gallery">Pushkar Fair Photo Gallery</a><a href="/contact-us">Contact Us</a><h2>Tours</h2><a href="/glimpses-of-india">Glimpses of India tour</a><a href="/pushkar-fair-and-dev-diwali">Divine Diwali tour</a><a href="/haveli-diwali-and-pushkar-fair">Haveli Diwali tour</a></nav>
    </header>`;

const sharedSidebar = `<aside class="sidebar" aria-label="Explore Pushkar Camel Fair">
 <div class="side-block"><h2>Pushkar Camel Fair</h2><nav><a href="/pushkar-fair">Pushkar Fair</a><a href="/pushkar-fair-dates-2026">Pushkar Fair dates 2026</a><a href="/photography">Photography</a><a href="/local-people-and-communities">Local people &amp; communities</a><a href="/pushkar-tours">Pushkar Tours</a><a href="/pushkar-fair-photo-gallery">Pushkar Fair Photo Gallery</a><a href="/contact-us">Contact Us</a></nav></div>
 <div class="side-block tours"><h2>Tours</h2><h3><a href="/glimpses-of-india">Glimpses of India</a></h3><p>Journey through old Rajasthan in style: stay in a restored 1860s frescoed haveli in Shekhawati, share a family picnic on an Aravalli farm, then discover Jodhpur’s blue lanes and Jaisalmer’s golden fort.</p></div>
 <div class="side-block tours"><h3><a href="/haveli-diwali-and-pushkar-fair">Haveli Diwali Tour</a></h3><p>Celebrate Diwali the way Rajasthan has for generations at Mukunda Haveli, a restored 18th-century mansion in Shekhawati. Continue through Rajasthan’s historic desert cities and experience the spectacular Pushkar Camel Fair.</p></div>
 <div class="side-block tours"><h3><a href="/pushkar-fair-and-dev-diwali">Pushkar Fair &amp; Dev Diwali</a></h3><p>Pushkar Fair and Varanasi’s Dev Deepavali celebrations on one small group journey.</p></div>
 <div class="side-block side-promo"><a href="/pushkar-fair-and-dev-diwali"><img src="assets/varanasi-dev-diwali-luxury-tour.webp" alt="Dev Diwali tour in Varanasi"></a></div>
 </aside>`;

const sharedFooter = `<footer id="contact"><p>Copyright © Indian Moments 2007–2026. All rights reserved. No part of this site may be reproduced without authorisation.</p></footer>`;

document.querySelector('[data-shared-header]')?.insertAdjacentHTML('beforebegin', sharedHeader);
document.querySelector('[data-shared-header]')?.remove();
document.querySelector('[data-shared-sidebar]')?.insertAdjacentHTML('beforebegin', sharedSidebar);
document.querySelector('[data-shared-sidebar]')?.remove();
document.querySelector('[data-shared-footer]')?.insertAdjacentHTML('beforebegin', sharedFooter);
document.querySelector('[data-shared-footer]')?.remove();
