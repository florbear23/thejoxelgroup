THE JOXEL GROUP - STATIC HTML/CSS/JS COPY
=========================================
Generated from the local WordPress site (thejoxelgroup.local) on 2026-11-19.

HOW TO OPEN
- Double-click index.html (works from the folder, no server needed), or
- upload this whole folder to any static host (Netlify, Cloudflare Pages, GitHub Pages, cPanel, etc.).

WHAT'S INSIDE
- 316 pages (home, services, city pages, blog posts, leaders, archives, tools)
- wp-content/  theme CSS/JS/images + only the uploads actually used by the pages
- wp-includes/ any WordPress core JS/CSS used by the pages
- 404.html     copy of the site's 404 page (dead links in the original point here)
- _crawl-report.json  list of pages/files captured and anything that failed

VERIFIED
- Visible text + tag counts of all 316 pages match the original (0 differences).
- 23,000+ relative links/assets checked; only 2 refs missing, and both are
  also broken in the original site (favicon.ico, a stray contact.html link).

KNOWN LIMITS (cannot be static)
1. Forms / lead capture: the Contact form, Revenue Leakage Calculator report
   and AI Readiness Assessment submit to the WordPress backend
   (/wp-json/joxel/v1/..., /api/leak-report, /wp-admin/admin-ajax.php).
   Those URLs are left as root-relative paths. They only work if the host
   also runs the WordPress backend (or you point them to another endpoint).
   The calculator math itself runs in the browser and works.
2. Google Fonts (Fraunces, Inter, Oswald, Roboto) are still loaded from
   fonts.googleapis.com. They could not be downloaded because the PC had no
   internet DNS when this copy was made. The site looks identical online.
   To self-host them later, re-run the crawler when online.
3. Third-party embeds (YouTube, reCAPTCHA, social icons) still load from
   their own servers.
4. A few theme images (PEOPLE.jpg, Brown-County-tp.png, etc.) are referenced
   by the theme but do not exist on the local site, so they are broken in
   the original too.
