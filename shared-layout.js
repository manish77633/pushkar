// The markup for these shared sections lives in /partials/*.html.
(async () => {
  const parts = [
    ['[data-shared-header]', '/partials/navbar.html'],
    ['[data-shared-sidebar]', '/partials/right-sidebar.html'],
    ['[data-shared-footer]', '/partials/footer.html'],
  ];

  try {
    const markup = await Promise.all(parts.map(async ([, url]) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`${url}: ${response.status}`);
      return response.text();
    }));

    parts.forEach(([selector], index) => {
      const slot = document.querySelector(selector);
      if (slot) slot.outerHTML = markup[index];
    });

    // Initialize page controls after the shared markup exists.
    const script = document.createElement('script');
    script.src = '/script.js';
    document.body.append(script);
  } catch (error) {
    console.error('Could not load shared site layout:', error);
  }
})();
