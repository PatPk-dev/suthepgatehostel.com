/**
 * components.js — โหลด Header & Footer จากไฟล์ components/ เข้ามาทุกหน้า
 * แก้ไขที่เดียว มีผลทุกหน้า
 */
(async function loadComponents() {
    // --- Determine current page ---
    const path = window.location.pathname;
    let currentPage = 'index';
    if (path.includes('rooms')) currentPage = 'rooms';
    else if (path.includes('about')) currentPage = 'about';
    else if (path.includes('blog-post')) currentPage = 'blog';
    else if (path.includes('blog')) currentPage = 'blog';
    else if (path.includes('contact')) currentPage = 'contact';

    const isSubPage = currentPage !== 'index'; // non-homepage starts with scrolled navbar

    // --- Load Header ---
    const headerEl = document.getElementById('site-header');
    if (headerEl) {
        try {
            const res = await fetch('/components/header.html');
            const html = await res.text();
            headerEl.innerHTML = html;

            // Set active nav link
            const navLinks = headerEl.querySelectorAll('.nav-links a[data-page]');
            navLinks.forEach(link => {
                if (link.dataset.page === currentPage) {
                    link.classList.add('active');
                }
            });

            // Sub-pages: navbar starts scrolled (solid background)
            const navbar = headerEl.querySelector('.navbar');
            if (isSubPage) {
                if (navbar) navbar.classList.add('scrolled');
            } else {
                // Determine scroll for index
                if (navbar) {
                    const onScroll = () => {
                        if (window.scrollY > 80) navbar.classList.add('scrolled');
                        else navbar.classList.remove('scrolled');
                    };
                    window.addEventListener('scroll', onScroll, { passive: true });
                    onScroll(); // initial check
                }
            }

            // Re-init nav toggle (hamburger menu)
            const toggle = document.getElementById('nav-toggle');
            const navLinksEl = document.getElementById('nav-links');
            if (toggle && navLinksEl) {
                toggle.addEventListener('click', () => {
                    navLinksEl.classList.toggle('active');
                    toggle.classList.toggle('active');
                    toggle.setAttribute('aria-expanded',
                        toggle.getAttribute('aria-expanded') === 'true' ? 'false' : 'true');
                });
            }
        } catch (e) {
            console.error('Failed to load header:', e);
        }
    }

    // --- Load Footer ---
    const footerEl = document.getElementById('site-footer');
    if (footerEl) {
        try {
            const res = await fetch('/components/footer.html');
            const html = await res.text();
            footerEl.innerHTML = html;
        } catch (e) {
            console.error('Failed to load footer:', e);
        }
    }
})();
