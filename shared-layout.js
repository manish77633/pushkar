// The markup for these shared sections lives in /partials/*.html.
(async () => {
  const parts = [
    ['[data-shared-header]', '/partials/navbar.html'],
    ['[data-shared-sidebar]', '/partials/right-sidebar.html'],
    ['[data-shared-footer]', '/partials/footer.html'],
  ];

  try {
    const markup = await Promise.all(parts.map(async ([, url]) => {
      const response = await fetch(`${url}?v=20261030-21`, {cache: 'no-store'});
      if (!response.ok) throw new Error(`${url}: ${response.status}`);
      return response.text();
    }));

    parts.forEach(([selector], index) => {
      const slot = document.querySelector(selector);
      if (slot) slot.outerHTML = markup[index];
    });

    // Initialize page controls after the shared markup exists.
    const script = document.createElement('script');
    script.src = '/script.js?v=20261030-24';
    script.onload = () => {
      const enquiryScript = document.createElement('script');
      enquiryScript.src = '/enquiry-ui.js?v=20261030-25';
      document.body.append(enquiryScript);
    };
    document.body.append(script);
  } catch (error) {
    console.error('Could not load shared site layout:', error);
  }
})();
